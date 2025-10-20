import { Knex } from 'knex';
import { ETableNames } from '../../ETableNames';
import { v4 as uuidv4 } from 'uuid';


export enum ETransactionType {
  DEPOSIT = 'DEPOSIT',         // Depósito/recarga
  WITHDRAWAL = 'WITHDRAWAL',   // Saque
  PAYMENT = 'PAYMENT',         // Pagamento (cliente paga)
  RECEIVED = 'RECEIVED',       // Recebimento (provedor recebe)
  REFUND = 'REFUND',          // Reembolso (cancelamento)
}

export interface ITransaction {
  id: string;
  user_id: string;
  booking_id: string | null;
  type: ETransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  created_at: Date;
}

export interface IWalletBalance {
  user_id: string;
  balance: number;
}

export class WalletProvider {
  constructor(private readonly knex: Knex) { }

  /**
   * Obtém saldo do usuário
   */
  async getBalance(userId: string): Promise<number> {
    try {
      const user = await this.knex(ETableNames.user)
        .where({ id: userId })
        .select('balance')
        .first();

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      return Number(user.balance);
    } catch (error) {
      console.error('Error in WalletProvider.getBalance:', error);
      throw error;
    }
  }

  /**
   * Verifica se usuário tem saldo suficiente
   */
  async hasSufficientBalance(userId: string, amount: number): Promise<boolean> {
    try {
      const balance = await this.getBalance(userId);
      return balance >= amount;
    } catch (error) {
      console.error('Error in WalletProvider.hasSufficientBalance:', error);
      throw error;
    }
  }

  /**
   * Adiciona saldo (depósito)
   */
  async deposit(userId: string, amount: number, description: string): Promise<ITransaction> {
    const trx = await this.knex.transaction();

    try {
      // Buscar saldo atual
      const user = await trx(ETableNames.user)
        .where({ id: userId })
        .select('balance')
        .first()
        .forUpdate(); // Lock pessimista

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const balanceBefore = Number(user.balance);
      const balanceAfter = balanceBefore + amount;

      // Atualizar saldo
      await trx(ETableNames.user)
        .where({ id: userId })
        .update({ balance: balanceAfter });

      // Criar transação
      const transaction = {
        id: this.generateUUID(),
        user_id: userId,
        booking_id: null,
        type: ETransactionType.DEPOSIT,
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description,
      };

      await trx(ETableNames.transaction).insert(transaction);

      await trx.commit();

      return transaction as ITransaction;
    } catch (error) {
      await trx.rollback();
      console.error('Error in WalletProvider.deposit:', error);
      throw error;
    }
  }

  /**
   * Remove saldo (saque)
   */
  async withdraw(userId: string, amount: number, description: string): Promise<ITransaction> {
    const trx = await this.knex.transaction();

    try {
      // Buscar saldo atual
      const user = await trx(ETableNames.user)
        .where({ id: userId })
        .select('balance')
        .first()
        .forUpdate();

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const balanceBefore = Number(user.balance);

      if (balanceBefore < amount) {
        throw new Error('Saldo insuficiente');
      }

      const balanceAfter = balanceBefore - amount;

      await trx(ETableNames.user)
        .where({ id: userId })
        .update({ balance: balanceAfter });

      const transaction = {
        id: this.generateUUID(),
        user_id: userId,
        booking_id: null,
        type: ETransactionType.WITHDRAWAL,
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description,
      };

      await trx(ETableNames.transaction).insert(transaction);

      await trx.commit();

      return transaction as ITransaction;
    } catch (error) {
      await trx.rollback();
      console.error('Error in WalletProvider.withdraw:', error);
      throw error;
    }
  }

  /**
   * Processa pagamento de reserva (cliente → provedor)
   */
  async processBookingPayment(
    customerId: string,
    providerId: string,
    bookingId: string,
    amount: number
  ): Promise<{ customerTransaction: ITransaction; providerTransaction: ITransaction }> {
    const trx = await this.knex.transaction();

    try {
      const customer = await trx(ETableNames.user)
        .where({ id: customerId })
        .select('balance')
        .first()
        .forUpdate();

      if (!customer) {
        throw new Error('Cliente não encontrado');
      }

      const customerBalanceBefore = Number(customer.balance);

      if (customerBalanceBefore < amount) {
        throw new Error('Saldo insuficiente para realizar a reserva');
      }

      const provider = await trx(ETableNames.user)
        .where({ id: providerId })
        .select('balance')
        .first()
        .forUpdate();

      if (!provider) {
        throw new Error('Provedor não encontrado');
      }

      const providerBalanceBefore = Number(provider.balance);

      const customerBalanceAfter = customerBalanceBefore - amount;
      await trx(ETableNames.user)
        .where({ id: customerId })
        .update({ balance: customerBalanceAfter });

      const customerTransaction = {
        id: this.generateUUID(),
        user_id: customerId,
        booking_id: bookingId,
        type: ETransactionType.PAYMENT,
        amount,
        balance_before: customerBalanceBefore,
        balance_after: customerBalanceAfter,
        description: `Pagamento da reserva #${bookingId}`,
      };

      await trx(ETableNames.transaction).insert(customerTransaction);

      const providerBalanceAfter = providerBalanceBefore + amount;
      await trx(ETableNames.user)
        .where({ id: providerId })
        .update({ balance: providerBalanceAfter });

      const providerTransaction = {
        id: this.generateUUID(),
        user_id: providerId,
        booking_id: bookingId,
        type: ETransactionType.RECEIVED,
        amount,
        balance_before: providerBalanceBefore,
        balance_after: providerBalanceAfter,
        description: `Recebimento da reserva #${bookingId}`,
      };

      await trx(ETableNames.transaction).insert(providerTransaction);

      await trx.commit();

      return {
        customerTransaction: customerTransaction as ITransaction,
        providerTransaction: providerTransaction as ITransaction,
      };
    } catch (error) {
      await trx.rollback();
      console.error('Error in WalletProvider.processBookingPayment:', error);
      throw error;
    }
  }

  /**
   * Processa reembolso (cancelamento de reserva)
   */
  async processRefund(
    customerId: string,
    providerId: string,
    bookingId: string,
    amount: number
  ): Promise<{ customerTransaction: ITransaction; providerTransaction: ITransaction }> {
    const trx = await this.knex.transaction();

    try {
      const customer = await trx(ETableNames.user)
        .where({ id: customerId })
        .select('balance')
        .first()
        .forUpdate();

      if (!customer) {
        throw new Error('Cliente não encontrado');
      }

      const customerBalanceBefore = Number(customer.balance);

      const provider = await trx(ETableNames.user)
        .where({ id: providerId })
        .select('balance')
        .first()
        .forUpdate();

      if (!provider) {
        throw new Error('Provedor não encontrado');
      }

      const providerBalanceBefore = Number(provider.balance);

      if (providerBalanceBefore < amount) {
        throw new Error('Provedor não tem saldo suficiente para reembolso');
      }

      const providerBalanceAfter = providerBalanceBefore - amount;
      await trx(ETableNames.user)
        .where({ id: providerId })
        .update({ balance: providerBalanceAfter });

      const providerTransaction = {
        id: this.generateUUID(),
        user_id: providerId,
        booking_id: bookingId,
        type: ETransactionType.REFUND,
        amount,
        balance_before: providerBalanceBefore,
        balance_after: providerBalanceAfter,
        description: `Reembolso da reserva cancelada #${bookingId}`,
      };

      await trx(ETableNames.transaction).insert(providerTransaction);

      const customerBalanceAfter = customerBalanceBefore + amount;
      await trx(ETableNames.user)
        .where({ id: customerId })
        .update({ balance: customerBalanceAfter });

      const customerTransaction = {
        id: this.generateUUID(),
        user_id: customerId,
        booking_id: bookingId,
        type: ETransactionType.REFUND,
        amount,
        balance_before: customerBalanceBefore,
        balance_after: customerBalanceAfter,
        description: `Reembolso da reserva cancelada #${bookingId}`,
      };

      await trx(ETableNames.transaction).insert(customerTransaction);

      await trx.commit();

      return {
        customerTransaction: customerTransaction as ITransaction,
        providerTransaction: providerTransaction as ITransaction,
      };
    } catch (error) {
      await trx.rollback();
      console.error('Error in WalletProvider.processRefund:', error);
      throw error;
    }
  }

  /**
   * Obtém histórico de transações
   */
  async getTransactions(
    userId: string,
    filters?: {
      type?: ETransactionType;
      limit?: number;
      offset?: number;
    }
  ): Promise<ITransaction[]> {
    try {
      let query = this.knex(ETableNames.transaction)
        .where({ user_id: userId })
        .select('*');

      if (filters?.type) {
        query = query.where({ type: filters.type });
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.offset(filters.offset);
      }

      query = query.orderBy('created_at', 'desc');

      const transactions = await query;
      return transactions as ITransaction[];
    } catch (error) {
      console.error('Error in WalletProvider.getTransactions:', error);
      throw error;
    }
  }

  /**
   * Conta total de transações
   */
  async countTransactions(
    userId: string,
    type?: ETransactionType
  ): Promise<number> {
    try {
      let query = this.knex(ETableNames.transaction)
        .where({ user_id: userId })
        .count('* as total');

      if (type) {
        query = query.where({ type });
      }

      const [result] = await query;
      return Number(result.total);
    } catch (error) {
      console.error('Error in WalletProvider.countTransactions:', error);
      throw error;
    }
  }

  /**
   * Gera UUID
   */
  private generateUUID(): string {
    return uuidv4();
  }
}
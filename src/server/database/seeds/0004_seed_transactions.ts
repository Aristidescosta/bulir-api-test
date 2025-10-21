/* eslint-disable quotes */
// seeds/0004_seed_transactions.ts
import type { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { ETableNames } from '../ETableNames';
import { ETransactionType, ITransaction } from '../providers/Wallet';

export async function seed(knex: Knex): Promise<void> {
  console.log('💰 Inserindo transações...');

  // Buscar dados existentes
  const customers = await knex(ETableNames.user)
    .where('type', 'CUSTOMER')
    .select('id', 'balance', 'name');

  const providers = await knex(ETableNames.user)
    .where('type', 'PROVIDER')
    .select('id', 'balance', 'name');

  const bookings = await knex(ETableNames.bookings)
    .select('id', 'customer_id', 'provider_id', 'total_price', 'status');

  if (!customers.length || !providers.length) {
    console.log('⚠️ Dados insuficientes: verifique se os seeds de usuários foram executados.');
    return;
  }

  const transactions: ITransaction[] = [];
  const now = new Date();

  // ========== TRANSAÇÕES DE DEPÓSITO ==========
  console.log('💳 Adicionando depósitos...');

  const depositAmounts = [10000.00, 15000.00, 20000.00, 25000.00, 30000.00];

  customers.forEach((customer, index) => {
    const amount = depositAmounts[index % depositAmounts.length];
    const balanceBefore = 0;
    const balanceAfter = amount;

    transactions.push({
      id: uuidv4(),
      user_id: customer.id,
      booking_id: null,
      type: ETransactionType.DEPOSIT,
      amount: amount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      description: `Depósito inicial via ${['Cartão', 'MB Way', 'Transferência', 'PayPal'][index % 4]}`,
      created_at: new Date(now.getTime() - (index * 24 * 60 * 60 * 1000)) // Dias diferentes
    });
  });

  // ========== TRANSAÇÕES DE PAGAMENTO ==========
  console.log('💸 Adicionando pagamentos...');

  bookings
    .filter(booking => booking.status !== 'CANCELLED')
    .forEach((booking, index) => {
      const customer = customers.find(c => c.id === booking.customer_id);
      if (customer) {
        const balanceBefore = customer.balance;
        const balanceAfter = Number((balanceBefore - booking.total_price).toFixed(2));

        transactions.push({
          id: uuidv4(),
          user_id: customer.id,
          booking_id: booking.id,
          type: ETransactionType.PAYMENT,
          amount: -booking.total_price,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          description: `Pagamento pelo serviço agendado`,
          created_at: new Date(now.getTime() - ((index + 5) * 24 * 60 * 60 * 1000))
        });
      }
    });

  // ========== TRANSAÇÕES DE RECEBIMENTO ==========
  console.log('🤑 Adicionando recebimentos...');

  bookings
    .filter(booking => booking.status === 'COMPLETED' || booking.status === 'CONFIRMED')
    .forEach((booking, index) => {
      const provider = providers.find(p => p.id === booking.provider_id);
      if (provider) {
        const platformFee = Number((booking.total_price * 0.15).toFixed(2)); // 15% taxa da plataforma
        const providerAmount = Number((booking.total_price - platformFee).toFixed(2));
        const balanceBefore = provider.balance;
        const balanceAfter = Number((balanceBefore + providerAmount).toFixed(2));

        transactions.push({
          id: uuidv4(),
          user_id: provider.id,
          booking_id: booking.id,
          type: ETransactionType.RECEIVED,
          amount: providerAmount,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          description: `Recebimento pelo serviço prestado (taxa: €${platformFee})`,
          created_at: new Date(now.getTime() - ((index + 3) * 24 * 60 * 60 * 1000))
        });
      }
    });

  // ========== TRANSAÇÕES DE SAQUE ==========
  console.log('🏦 Adicionando saques...');

  providers.forEach((provider, index) => {
    if (provider.balance > 5000) {
      const withdrawalAmount = Number((provider.balance * 0.3).toFixed(2)); // 30% do saldo
      const balanceBefore = provider.balance;
      const balanceAfter = Number((balanceBefore - withdrawalAmount).toFixed(2));

      transactions.push({
        id: uuidv4(),
        user_id: provider.id,
        booking_id: null,
        type: ETransactionType.WITHDRAWAL,
        amount: -withdrawalAmount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: `Saque para conta bancária`,
        created_at: new Date(now.getTime() - ((index + 2) * 24 * 60 * 60 * 1000))
      });
    }
  });

  // ========== TRANSAÇÕES DE REEMBOLSO ==========
  console.log('🔄 Adicionando reembolsos...');

  const cancelledBookings = bookings.filter(booking => booking.status === 'CANCELLED');

  cancelledBookings.forEach((booking, index) => {
    const customer = customers.find(c => c.id === booking.customer_id);
    if (customer) {
      const balanceBefore = customer.balance;
      const balanceAfter = Number((balanceBefore + booking.total_price).toFixed(2));

      transactions.push({
        id: uuidv4(),
        user_id: customer.id,
        booking_id: booking.id,
        type: ETransactionType.REFUND,
        amount: booking.total_price,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: `Reembolso de reserva cancelada`,
        created_at: new Date(now.getTime() - ((index + 1) * 24 * 60 * 60 * 1000))
      });
    }
  });

  // ========== INSERIR TRANSAÇÕES ==========
  if (transactions.length > 0) {
    await knex(ETableNames.transaction).insert(transactions);

    // Atualizar saldos dos usuários baseado nas transações
    console.log('🔄 Atualizando saldos dos usuários...');

    for (const transaction of transactions) {
      await knex(ETableNames.user)
        .where('id', transaction.user_id)
        .update('balance', transaction.balance_after);
    }

    console.log(`✅ ${transactions.length} transações inseridas com sucesso!`);
    console.log('\n📊 Resumo das transações:');
    console.log(`   💰 Depósitos: ${transactions.filter(t => t.type === ETransactionType.DEPOSIT).length}`);
    console.log(`   💸 Pagamentos: ${transactions.filter(t => t.type === ETransactionType.PAYMENT).length}`);
    console.log(`   🤑 Recebimentos: ${transactions.filter(t => t.type === ETransactionType.RECEIVED).length}`);
    console.log(`   🏦 Saques: ${transactions.filter(t => t.type === ETransactionType.WITHDRAWAL).length}`);
    console.log(`   🔄 Reembolsos: ${transactions.filter(t => t.type === ETransactionType.REFUND).length}`);
  } else {
    console.log('⚠️ Nenhuma transação foi gerada.');
  }
}
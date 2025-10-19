/* eslint-disable @typescript-eslint/no-explicit-any */
import { Knex } from 'knex';
import { EServiceStatus, ICreateServiceDTO, IService, IServiceFilters, IServiceWithProvider, IUpdateServiceDTO } from '../../../../types/service';
import { ETableNames } from '../../ETableNames';
import { v4 as uuidv4 } from 'uuid';

export class ServiceProvider {
  constructor(private readonly knex: Knex) { }

  /**
   * Cria um novo serviço
   */
  async create(data: ICreateServiceDTO): Promise<IService> {
    try {

      const provider = await this.knex(ETableNames.user)
        .where({ id: data.provider_id })
        .first();

      if (!provider) {
        throw new Error('Provedor não encontrado');
      }

      if (provider.type !== 'PROVIDER') {
        throw new Error('Apenas usuários do tipo PROVIDER podem criar serviços');
      }

      if (provider.status !== 'ACTIVE') {
        throw new Error('Provedor não está ativo');
      }

      const serviceData = {
        id: uuidv4(),
        provider_id: data.provider_id,
        name: data.name,
        description: data.description,
        category: data.category,
        duration: data.duration,
        price: data.price,
        status: EServiceStatus.ACTIVE,
      };

      const [insertedService] = await this.knex(ETableNames.service)
        .insert(serviceData)
        .returning('*');

      return insertedService as IService;
    } catch (error) {
      console.error('Error in ServiceProvider.create:', error);
      throw error;
    }
  };

  /**
   * Lista serviços com informações do provedor
   */
  async findAllWithProvider(filters?: IServiceFilters): Promise<IServiceWithProvider[]> {
    try {
      let query = this.knex(ETableNames.service)
        .select(
          `${ETableNames.service}.*`,
          `${ETableNames.user}.name as provider_name`,
          `${ETableNames.user}.email as provider_email`,
          `${ETableNames.user}.phone as provider_phone`
        )
        .leftJoin(
          ETableNames.user,
          `${ETableNames.service}.provider_id`,
          `${ETableNames.user}.id`
        );

      // Aplicar filtros (mesma lógica do findAll)
      if (filters?.provider_id) {
        query = query.where(`${ETableNames.service}.provider_id`, filters.provider_id);
      }

      if (filters?.category) {
        query = query.where(`${ETableNames.service}.category`, filters.category);
      }

      if (filters?.status) {
        query = query.where(`${ETableNames.service}.status`, filters.status);
      }

      if (filters?.min_price !== undefined) {
        query = query.where(`${ETableNames.service}.price`, '>=', filters.min_price);
      }

      if (filters?.max_price !== undefined) {
        query = query.where(`${ETableNames.service}.price`, '<=', filters.max_price);
      }

      if (filters?.search) {
        query = query.where((builder) => {
          builder
            .where(`${ETableNames.service}.name`, 'like', `%${filters.search}%`)
            .orWhere(`${ETableNames.service}.description`, 'like', `%${filters.search}%`);
        });
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.offset(filters.offset);
      }

      query = query.orderBy(`${ETableNames.service}.created_at`, 'desc');

      const services = await query;
      return services as IServiceWithProvider[];
    } catch (error) {
      console.error('Error in ServiceProvider.findAllWithProvider:', error);
      throw error;
    }
  };

  /**
   * Conta total de serviços com filtros
   */
  async count(filters?: Omit<IServiceFilters, 'limit' | 'offset'>): Promise<number> {
    try {
      let query = this.knex(ETableNames.service).count('* as total');

      if (filters?.provider_id) {
        query = query.where(`${ETableNames.service}.provider_id`, filters.provider_id);
      }

      if (filters?.category) {
        query = query.where(`${ETableNames.service}.category`, filters.category);
      }

      if (filters?.status) {
        query = query.where(`${ETableNames.service}.status`, filters.status);
      }

      if (filters?.min_price !== undefined) {
        query = query.where('price', '>=', filters.min_price);
      }

      if (filters?.max_price !== undefined) {
        query = query.where('price', '<=', filters.max_price);
      }

      if (filters?.search) {
        query = query.where((builder) => {
          builder
            .where('name', 'like', `%${filters.search}%`)
            .orWhere('description', 'like', `%${filters.search}%`);
        });
      }

      const [result] = await query;
      const total = typeof result === 'string'
        ? Number(result)
        : Number((result as any).total);
      return total;
    } catch (error) {
      console.error('Error in ServiceProvider.count:', error);
      throw error;
    }
  };

  /**
   * Busca serviço por ID com informações do provedor
   */
  async findByIdWithProvider(id: string): Promise<IServiceWithProvider | null> {
    try {
      const service = await this.knex(ETableNames.service)
        .select(
          `${ETableNames.service}.*`,
          `${ETableNames.user}.name as provider_name`,
          `${ETableNames.user}.email as provider_email`,
          `${ETableNames.user}.phone as provider_phone`
        )
        .leftJoin(
          ETableNames.user,
          `${ETableNames.service}.provider_id`,
          `${ETableNames.user}.id`
        )
        .where(`${ETableNames.service}.id`, id)
        .first();

      return service || null;
    } catch (error) {
      console.error('Error in ServiceProvider.findByIdWithProvider:', error);
      throw error;
    }
  };

  /**
   * Verifica se serviço pertence a um provedor
   */
  async belongsToProvider(serviceId: string, providerId: string): Promise<boolean> {
    try {
      const service = await this.knex(ETableNames.service)
        .where({ id: serviceId, provider_id: providerId } as any)
        .first();

      return !!service;
    } catch (error) {
      console.error('Error in ServiceProvider.belongsToProvider:', error);
      throw error;
    }
  };

  /**
   * Atualiza serviço
   */
  async update(id: string, data: IUpdateServiceDTO): Promise<IService> {
    try {
      // Verificar se serviço existe
      const service = await this.findById(id);
      if (!service) {
        throw new Error('Serviço não encontrado');
      }

      const updateData: any = {
        updated_at: this.knex.fn.now(),
      };

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.duration_minutes !== undefined) {
        updateData.duration_minutes = data.duration_minutes;
      }
      if (data.price !== undefined) updateData.price = data.price;
      if (data.status !== undefined) updateData.status = data.status;

      const [updatedService] = await this.knex(ETableNames.service)
        .where({ id })
        .update(updateData)
        .returning('*');

      return updatedService as IService;
    } catch (error) {
      console.error('Error in ServiceProvider.update:', error);
      throw error;
    }
  };

  /**
   * Busca serviço por ID
   */
  async findById(id: string): Promise<IService | null> {
    try {
      const service = await this.knex<IService>(ETableNames.service)
        .where({ id })
        .first();

      return service || null;
    } catch (error) {
      console.error('Error in ServiceProvider.findById:', error);
      throw error;
    }
  };

  /**
   * Deleta serviço (soft delete - inativa)
   */
  async delete(id: string): Promise<IService> {
    try {
      return await this.updateStatus(id, EServiceStatus.INACTIVE);
    } catch (error) {
      console.error('Error in ServiceProvider.delete:', error);
      throw error;
    }
  };

  /**
   * Atualiza status do serviço
   */
  async updateStatus(id: string, status: EServiceStatus): Promise<IService> {
    try {
      const [updatedService] = await this.knex(ETableNames.service)
        .where({ id })
        .update({
          status,
          updated_at: this.knex.fn.now(),
        } as any)
        .returning('*');

      if (!updatedService) {
        throw new Error('Serviço não encontrado');
      }

      return updatedService as IService;
    } catch (error) {
      console.error('Error in ServiceProvider.updateStatus:', error);
      throw error;
    }
  }
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Knex } from 'knex';
import { EServiceStatus, ICreateServiceDTO, IService, IServiceFilters, IServiceWithProvider } from '../../../../types/service';
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
      console.log('QUERY: ', `${ETableNames.user}.name as provider_name`);

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
  }
}
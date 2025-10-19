import { Knex } from 'knex';
import { EServiceStatus, ICreateServiceDTO, IService } from '../../../../types/service';
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
  }
}
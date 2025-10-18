import { TService } from '../../models/Services';

declare module 'knex/types/tables' {
  interface Tables {
    service: TService
  }
}
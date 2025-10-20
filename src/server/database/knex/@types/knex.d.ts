import { IBookingWithDetails } from '../../../../types/booking';
import { IUser } from '../../../../types/user';
import { TService } from '../../models/Services';
import { ITransaction } from '../../providers/Wallet';

declare module 'knex/types/tables' {
  interface Tables {
    service: TService
    users: IUser
    transaction: ITransaction
    booking: IBookingWithDetails
  }
}
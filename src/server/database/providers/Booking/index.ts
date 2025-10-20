/* eslint-disable @typescript-eslint/no-explicit-any */
import { Knex } from 'knex';
import { ServiceProvider } from '../Services';
import { UserProvider } from '../User';
import { EBookingStatus, ECancelledBy, IAvailabilityCheck, IBooking, IBookingFilters, IBookingWithDetails, ICancelBookingDTO, ICreateBookingDTO } from '../../../../types/booking';
import { ETableNames } from '../../ETableNames';
import { v4 as uuid } from 'uuid';
import { WalletProvider } from '../Balance';

export class BookingProvider {
  private readonly serviceProvider: ServiceProvider;
  private readonly userProvider: UserProvider;

  constructor(private readonly knex: Knex) {
    this.serviceProvider = new ServiceProvider(knex);
    this.userProvider = new UserProvider(knex);
  }

  /**
   * Cria uma nova reserva
   */
  async create(data: ICreateBookingDTO): Promise<IBooking> {
    const trx = await this.knex.transaction();
    try {
      const service = await this.serviceProvider.findById(data.service_id);
      if (!service) {
        throw new Error('Serviço não encontrado');
      }

      if (service.status !== 'ACTIVE') {
        throw new Error('Serviço não está ativo');
      }

      const customer = await this.userProvider.findById(data.customer_id);
      if (!customer) {
        throw new Error('Cliente não encontrado');
      }

      if (customer.type !== 'CUSTOMER') {
        throw new Error('Apenas clientes podem fazer reservas');
      }

      if (customer.status !== 'ACTIVE') {
        throw new Error('Cliente não está ativo');
      }

      const end_time = this.calculateEndTime(
        data.start_time,
        service.duration
      );

      if (!this.isFutureDateTime(data.booking_date, data.start_time)) {
        throw new Error('Data e hora devem ser futuras');
      }

      // Validar horário mínimo de antecedência (ex: 2 horas)
      const minAdvanceHours = 2;
      if (!this.hasMinimumAdvance(data.booking_date, data.start_time, minAdvanceHours)) {
        throw new Error(`Reserva deve ser feita com pelo menos ${minAdvanceHours} horas de antecedência`);
      }

      // Verificar disponibilidade (sem conflitos)
      const isAvailable = await this.checkAvailability({
        date: data.booking_date,
        start_time: data.start_time,
        duration_minutes: service.duration,
        provider_id: service.provider_id,
      });

      const walletProvider = new WalletProvider(this.knex);
      const hasSufficientBalance = await walletProvider.hasSufficientBalance(
        data.customer_id,
        service.price
      );

      if (!hasSufficientBalance) {
        throw new Error('Saldo insuficiente para realizar a reserva');
      }

      if (!isAvailable) {
        throw new Error('Horário não disponível para este serviço');
      }

      const bookingData = {
        id: uuid(),
        service_id: data.service_id,
        customer_id: data.customer_id,
        provider_id: service.provider_id,
        booking_date: data.booking_date,
        start_time: data.start_time,
        end_time,
        status: EBookingStatus.CONFIRMED,
        total_price: service.price,
        cancellation_reason: null,
        cancelled_by: null,
        cancelled_at: null,
      };

      const [insertedBooking] = await this.knex(ETableNames.bookings)
        .insert(bookingData)
        .returning('*');

      await walletProvider.processBookingPayment(
        data.customer_id,
        service.provider_id,
        bookingData.id,
        service.price
      );

      await trx.commit();

      return insertedBooking as IBooking;
    } catch (error) {
      console.error('Error in BookingProvider.create:', error);
      throw error;
    }
  }

  /**
   * Calcula horário de término
   */
  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }

  /**
   * Verifica se data/hora é futura
   */
  private isFutureDateTime(date: Date, time: string): boolean {
    const [hours, minutes] = time.split(':').map(Number);
    const bookingDateTime = new Date(date);
    bookingDateTime.setHours(hours, minutes, 0, 0);
    return bookingDateTime > new Date();
  }

  /**
   * Verifica antecedência mínima
   */
  private hasMinimumAdvance(date: Date, time: string, minHours: number): boolean {
    const [hours, minutes] = time.split(':').map(Number);
    const bookingDateTime = new Date(date);
    bookingDateTime.setHours(hours, minutes, 0, 0);
    const now = new Date();
    const diffMs = bookingDateTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours >= minHours;
  };

  /**
   * Verifica disponibilidade de horário
   */
  async checkAvailability(data: IAvailabilityCheck): Promise<boolean> {
    try {
      const end_time = this.calculateEndTime(
        data.start_time,
        data.duration_minutes
      );

      let query = this.knex(ETableNames.bookings)
        .where({
          provider_id: data.provider_id,
          booking_date: data.date,
        })
        .whereIn('status', [EBookingStatus.PENDING, EBookingStatus.CONFIRMED])
        .where((builder) => {
          // Verifica sobreposição de horários
          builder
            // Novo horário começa durante uma reserva existente
            .where((b) => {
              b.where('start_time', '<=', data.start_time)
                .where('end_time', '>', data.start_time);
            })
            // Novo horário termina durante uma reserva existente
            .orWhere((b) => {
              b.where('start_time', '<', end_time)
                .where('end_time', '>=', end_time);
            })
            // Novo horário engloba uma reserva existente
            .orWhere((b) => {
              b.where('start_time', '>=', data.start_time)
                .where('end_time', '<=', end_time);
            });
        });

      if (data.exclude_booking_id) {
        query = query.whereNot('id', data.exclude_booking_id);
      }

      const conflictingBookings = await query;
      return conflictingBookings.length === 0;
    } catch (error) {
      console.error('Error in BookingProvider.checkAvailability:', error);
      throw error;
    }
  };

  /**
  * Lista reservas com detalhes
  */
  async findAllWithDetails(filters?: IBookingFilters): Promise<IBookingWithDetails[]> {
    try {
      let query = this.knex(ETableNames.bookings)
        .select(
          `${ETableNames.bookings}.*`,

          `${ETableNames.service}.id as service_id`,
          `${ETableNames.service}.name as service_name`,
          `${ETableNames.service}.category as service_category`,

          'customer.id as customer_id',
          'customer.name as customer_name',

          'provider.id as provider_id',
          'provider.name as provider_name',
        )
        .leftJoin(
          ETableNames.service,
          `${ETableNames.bookings}.service_id`,
          `${ETableNames.service}.id`
        )
        .leftJoin(
          `${ETableNames.user} as customer`,
          `${ETableNames.bookings}.customer_id`,
          'customer.id'
        )
        .leftJoin(
          `${ETableNames.user} as provider`,
          `${ETableNames.bookings}.provider_id`,
          'provider.id'
        );

      if (filters?.customer_id)
        query = query.where(`${ETableNames.bookings}.customer_id`, filters.customer_id);
      if (filters?.provider_id)
        query = query.where(`${ETableNames.bookings}.provider_id`, filters.provider_id);
      if (filters?.service_id)
        query = query.where(`${ETableNames.bookings}.service_id`, filters.service_id);
      if (filters?.status)
        query = query.where(`${ETableNames.bookings}.status`, filters.status);
      if (filters?.date_from)
        query = query.where(`${ETableNames.bookings}.booking_date`, '>=', filters.date_from);
      if (filters?.date_to)
        query = query.where(`${ETableNames.bookings}.booking_date`, '<=', filters.date_to);
      if (filters?.limit)
        query = query.limit(filters.limit);
      if (filters?.offset)
        query = query.offset(filters.offset);

      query = query
        .orderBy(`${ETableNames.bookings}.booking_date`, 'desc')
        .orderBy(`${ETableNames.bookings}.start_time`, 'desc');

      const rows = await query;

      const bookings: IBookingWithDetails[] = rows.map((b: any) => ({
        id: b.id,
        booking_date: b.booking_date,
        start_time: b.start_time,
        end_time: b.end_time,
        status: b.status,
        total_price: b.total_price,
        cancellation_reason: b.cancellation_reason,
        cancelled_by: b.cancelled_by,
        cancelled_at: b.cancelled_at,
        created_at: b.created_at,
        updated_at: b.updated_at,

        service: {
          id: b.service_id,
          name: b.service_name,
          category: b.service_category,
        },
        provider: {
          id: b.provider_id,
          name: b.provider_name,
        },
        customer: {
          id: b.customer_id,
          name: b.customer_name,
        },
      }));

      return bookings;
    } catch (error) {
      console.error('Error in BookingProvider.findAllWithDetails:', error);
      throw error;
    }
  }

  /**
   * Conta reservas com filtros
   */
  async count(filters?: Omit<IBookingFilters, 'limit' | 'offset'>): Promise<number> {
    try {
      let query = this.knex(ETableNames.bookings).count('* as total');

      if (filters?.customer_id) {
        query = query.where({ customer_id: filters.customer_id });
      }

      if (filters?.provider_id) {
        query = query.where({ provider_id: filters.provider_id });
      }

      if (filters?.service_id) {
        query = query.where({ service_id: filters.service_id });
      }

      if (filters?.status) {
        query = query.where({ status: filters.status });
      }

      if (filters?.date_from) {
        query = query.where('booking_date', '>=', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.where('booking_date', '<=', filters.date_to);
      }

      const [result] = await query;
      return Number(result.total);
    } catch (error) {
      console.error('Error in BookingProvider.count:', error);
      throw error;
    }
  };

  /**
   * Busca reserva com todos os detalhes
   */
  async findByIdWithDetails(id: string): Promise<IBookingWithDetails | null> {
    try {
      const booking = await this.knex(ETableNames.bookings)
        .select(
          `${ETableNames.bookings}.*`,
          `${ETableNames.service}.name as service_name`,
          `${ETableNames.service}.description as service_description`,
          `${ETableNames.service}.category as service_category`,
          'customer.name as customer_name',
          'customer.email as customer_email',
          'customer.phone as customer_phone',
          'provider.name as provider_name',
          'provider.email as provider_email',
          'provider.phone as provider_phone'
        )
        .leftJoin(
          ETableNames.service,
          `${ETableNames.bookings}.service_id`,
          `${ETableNames.service}.id`
        )
        .leftJoin(
          `${ETableNames.user} as customer`,
          `${ETableNames.bookings}.customer_id`,
          'customer.id'
        )
        .leftJoin(
          `${ETableNames.user} as provider`,
          `${ETableNames.bookings}.provider_id`,
          'provider.id'
        )
        .where(`${ETableNames.bookings}.id`, id)
        .first();

      const bookingWithDetails: IBookingWithDetails = {
        id: booking.id,
        booking_date: booking.booking_date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        status: booking.status,
        total_price: booking.total_price,
        cancellation_reason: booking.cancellation_reason,
        cancelled_by: booking.cancelled_by,
        cancelled_at: booking.cancelled_at,
        created_at: booking.created_at,
        updated_at: booking.updated_at,

        service: {
          id: booking.service_id,
          name: booking.service_name,
          category: booking.service_category,
        },
        provider: {
          id: booking.provider_id,
          name: booking.provider_name,
        },
        customer: {
          id: booking.customer_id,
          name: booking.customer_name,
        },
      };

      return bookingWithDetails || null;
    } catch (error) {
      console.error('Error in BookingProvider.findByIdWithDetails:', error);
      throw error;
    }
  };

  /**
   * Verifica se reserva pertence a um provedor
   */
  async belongsToProvider(bookingId: string, providerId: string): Promise<boolean> {
    try {
      const booking = await this.knex(ETableNames.bookings)
        .where({ id: bookingId, provider_id: providerId })
        .first();

      return !!booking;
    } catch (error) {
      console.error('Error in BookingProvider.belongsToProvider:', error);
      throw error;
    }
  };

  /**
   * Completa uma reserva
   */
  async complete(id: string): Promise<IBooking> {
    try {
      const booking = await this.findById(id);
      if (!booking) {
        throw new Error('Reserva não encontrada');
      }

      if (booking.status !== EBookingStatus.CONFIRMED) {
        throw new Error('Apenas reservas confirmadas podem ser completadas');
      }

      const [completedBooking] = await this.knex(ETableNames.bookings)
        .where({ id })
        .update({
          status: EBookingStatus.COMPLETED,
          updated_at: this.knex.fn.now(),
        })
        .returning('*');

      return completedBooking as IBooking;
    } catch (error) {
      console.error('Error in BookingProvider.complete:', error);
      throw error;
    }
  };

  /**
   * Busca reserva por ID
   */
  async findById(id: string): Promise<IBooking | null> {
    try {
      const booking = await this.knex(ETableNames.bookings)
        .where({ id })
        .first();

      return booking || null;
    } catch (error) {
      console.error('Error in BookingProvider.findById:', error);
      throw error;
    }
  }
  async cancel(id: string, data: ICancelBookingDTO): Promise<IBooking> {
    try {
      const booking = await this.findById(id);
      if (!booking) {
        throw new Error('Reserva não encontrada');
      }

      if (![EBookingStatus.PENDING, EBookingStatus.CONFIRMED].includes(booking.status)) {
        throw new Error('Apenas reservas pendentes ou confirmadas podem ser canceladas');
      }

      const minCancellationHours = 24;
      if (data.cancelled_by === ECancelledBy.CUSTOMER) {
        if (!this.canCancelBooking(booking.booking_date, booking.start_time, minCancellationHours)) {
          throw new Error(`Cancelamento deve ser feito com pelo menos ${minCancellationHours} horas de antecedência`);
        }
      }

      const [cancelledBooking] = await this.knex(ETableNames.bookings)
        .where({ id })
        .update({
          status: EBookingStatus.CANCELLED,
          cancelled_by: data.cancelled_by,
          cancellation_reason: data.cancellation_reason || null,
          cancelled_at: new Date(),
          updated_at: this.knex.fn.now(),
        })
        .returning('*');

      return cancelledBooking as IBooking;
    } catch (error) {
      console.error('Error in BookingProvider.cancel:', error);
      throw error;
    }
  };
  /**
   * Verifica se pode cancelar com antecedência mínima
   */
  private canCancelBooking(date: Date, time: string, minHours: number): boolean {
    return this.hasMinimumAdvance(date, time, minHours);
  };

  /**
   * Verifica se reserva pertence a um cliente
   */
  async belongsToCustomer(bookingId: string, customerId: string): Promise<boolean> {
    try {
      const booking = await this.knex(ETableNames.bookings)
        .where({ id: bookingId, customer_id: customerId })
        .first();

      return !!booking;
    } catch (error) {
      console.error('Error in BookingProvider.belongsToCustomer:', error);
      throw error;
    }
  }
}
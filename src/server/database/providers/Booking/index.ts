import { Knex } from 'knex';
import { ServiceProvider } from '../Services';
import { UserProvider } from '../User';
import { EBookingStatus, IAvailabilityCheck, IBooking, ICreateBookingDTO } from '../../../../types/booking';
import { ETableNames } from '../../ETableNames';
import { v4 as uuid } from 'uuid';

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
  }
}
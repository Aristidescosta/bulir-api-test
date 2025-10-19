import * as yup from 'yup';
import { EBookingStatus } from '../../../types/booking';

// CREATE BOOKING
export const createBookingSchema = yup.object({
  service_id: yup
    .string()
    .required('ID do serviço é obrigatório')
    .length(36, 'ID do serviço deve ser um UUID válido'),

  booking_date: yup
    .date()
    .required('Data da reserva é obrigatória')
    .min(new Date(), 'Data deve ser futura'),

  start_time: yup
    .string()
    .required('Horário de início é obrigatório')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
});

// CANCEL BOOKING
export const cancelBookingSchema = yup.object({
  cancellation_reason: yup
    .string()
    .min(10, 'Motivo deve ter no mínimo 10 caracteres')
    .max(500, 'Motivo deve ter no máximo 500 caracteres')
    .optional(),
});

// GET ALL BOOKINGS
export const getAllBookingsSchema = yup.object({
  status: yup
    .string()
    .oneOf(Object.values(EBookingStatus), 'Status inválido')
    .optional(),

  date_from: yup
    .date()
    .optional(),

  date_to: yup
    .date()
    .optional()
    .when('date_from', (date_from, schema) => {
      return date_from
        ? schema.min(date_from, 'Data final deve ser maior que a inicial')
        : schema;
    }),

  page: yup
    .number()
    .integer()
    .positive()
    .default(1),

  limit: yup
    .number()
    .integer()
    .positive()
    .max(100)
    .default(10),
});

// CHECK AVAILABILITY
export const checkAvailabilitySchema = yup.object({
  service_id: yup
    .string()
    .required('ID do serviço é obrigatório')
    .length(36, 'ID do serviço deve ser um UUID válido'),

  booking_date: yup
    .date()
    .required('Data é obrigatória')
    .min(new Date(), 'Data deve ser futura'),

  start_time: yup
    .string()
    .required('Horário é obrigatório')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
});
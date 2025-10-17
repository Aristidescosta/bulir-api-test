import * as yup from 'yup';

export const queryValidation = yup.object({
  page: yup
    .number()
    .integer('Página deve ser um número inteiro')
    .positive('Página deve ser maior que zero')
    .default(1)
    .typeError('Página deve ser um número'),
  limit: yup
    .number()
    .integer('Limite deve ser um número inteiro')
    .positive('Limite deve ser maior que zero')
    .max(100, 'Limite máximo é 100 registros por página')
    .default(10)
    .typeError('Limite deve ser um número'),
  filter: yup
    .string()
    .trim()
    .max(100, 'Filtro deve ter no máximo 100 caracteres')
    .optional(),
});

export type TQueryParams = yup.InferType<typeof queryValidation>;

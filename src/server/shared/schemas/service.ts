import * as yup from 'yup';
import { EServiceCategory } from '../../../types/service';

export const createServiceSchema = yup.object({
  name: yup.string().required().min(3).max(100).trim(),
  description: yup.string().required().min(10).max(1000).trim(),
  category: yup
    .string()
    .required()
    .oneOf(Object.values(EServiceCategory)),
  duration: yup
    .number()
    .required()
    .integer()
    .min(15)
    .max(480),
  price: yup
    .number()
    .required()
    .min(0)
    .max(999999.99)
    .test('decimal', 'Preço deve ter no máximo 2 casas decimais',
      (value) => /^\d+(\.\d{1,2})?$/.test(String(value))
    ),
});

export const updateServiceSchema = yup.object({
  name: yup.string().min(3).max(100).trim(),
  description: yup.string().min(10).max(1000).trim(),
  category: yup.string().oneOf(Object.values(EServiceCategory)),
  duration: yup.number().integer().min(15).max(480),
  price: yup.number().min(0).max(999999.99),
  status: yup.string().oneOf(['ACTIVE', 'INACTIVE']),
});

export type IUpdateService = yup.InferType<typeof updateServiceSchema>;

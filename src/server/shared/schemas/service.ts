import * as yup from 'yup';

export const bodyValidation = yup.object({
  name: yup
    .string()
    .required('Nome do serviço é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  description: yup
    .string()
    .required('Descrição é obrigatória')
    .min(10, 'Descrição deve ter no mínimo 10 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .trim(),
});

export type IService = yup.InferType<typeof bodyValidation>;

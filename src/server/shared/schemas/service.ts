import * as yup from 'yup';

export const bodyValidation = yup.object({
  name: yup
    .string()
    .required('Nome do serviço é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  
});

// Gera o tipo TypeScript automaticamente
export type IService = yup.InferType<typeof bodyValidation>;

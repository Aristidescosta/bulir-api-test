import * as yup from 'yup';

const ALLOWED_CATEGORIES = [
  'BELEZA',
  'SAUDE',
  'EDUCACAO',
  'TECNOLOGIA',
  'CONSULTORIA',
  'MANUTENCAO',
  'EVENTOS',
  'OUTROS'
];

const PERMITTED_STATUS = ['ACTIVE', 'INACTIVE', 'PENDING'];

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
  category: yup
    .string()
    .required('Categoria é obrigatória')
    .oneOf(ALLOWED_CATEGORIES, `Categoria deve ser uma das: ${ALLOWED_CATEGORIES.join(', ')}`)
    .uppercase(),
  duration: yup
    .number()
    .required('Duração é obrigatória')
    .integer('Duração deve ser um número inteiro')
    .positive('Duração deve ser maior que zero')
    .min(15, 'Duração mínima é de 15 minutos')
    .max(480, 'Duração máxima é de 8 horas (480 minutos)')
    .typeError('Duração deve ser um número'),
  price: yup
    .number()
    .required('Preço é obrigatório')
    .min(0, 'Preço não pode ser negativo')
    .max(999999.99, 'Preço máximo é 999.999,99')
    .test(
      'decimal-places',
      'Preço deve ter no máximo 2 casas decimais',
      (value) => {
        if (value === undefined || value === null) return true;
        return /^\d+(\.\d{1,2})?$/.test(value.toString());
      }
    )
    .typeError('Preço deve ser um número'),
  provider_id: yup
    .string()
    .required('ID do provedor é obrigatório')
    .uuid('ID do provedor deve ser um UUID válido'),
  status: yup
    .string()
    .oneOf(PERMITTED_STATUS, `Status deve ser: ${PERMITTED_STATUS.join(' ou ')}`)
    .uppercase()
    .default('ACTIVE')
});

export type IService = yup.InferType<typeof bodyValidation>;

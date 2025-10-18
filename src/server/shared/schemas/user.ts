import * as yup from 'yup';
import { EUserType } from '../../../types/user';

export const createUserSchema = yup.object({
  name: yup
    .string()
    .required('Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(150, 'Nome deve ter no máximo 150 caracteres')
    .trim(),

  email: yup
    .string()
    .required('Email é obrigatório')
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .lowercase()
    .trim(),

  nif: yup
    .string()
    .required('NIF é obrigatório')
    .transform((val: string) => (val || '').replace(/\s+/g, '').toUpperCase())
    .required('NIF é obrigatório')
    .test('format-angola', 'NIF inválido para Angola', (value) => {
      if (!value) return false;
      const tenDigits = /^\d{10}$/;                     // ex: 5419011735
      const fourteenPattern = /^\d{9}[A-Z]{2}\d{3}$/;  // ex: 006401917LA041
      return tenDigits.test(value) || fourteenPattern.test(value);
    }),
  password: yup
    .string()
    .required('Senha é obrigatória')
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha deve conter letra maiúscula, minúscula e número'
    ),

  phone: yup
    .string()
    .matches(/^\+?[1-9]\d{1,14}$/, 'Telefone inválido')
    .nullable(),

  type: yup
    .string()
    .oneOf(Object.values(EUserType), 'Tipo de usuário inválido')
    .required('Tipo de usuário é obrigatório'),
});

export type ICreateUser = yup.InferType<typeof createUserSchema>;
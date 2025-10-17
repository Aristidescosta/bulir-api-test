import * as yup from 'yup';

export const paramValidation = yup.object({
  id: yup
    .string()
    .uuid('ID deve ser um UUID válido')
    .optional(),
});

export type TParamProp = yup.InferType<typeof paramValidation>;

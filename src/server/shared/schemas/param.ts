import * as yup from 'yup';

export const paramValidation = yup.object({
  id: yup
    .string()
    .required()
    .uuid('ID deve ser um UUID válido')
});

export type TParamProp = yup.InferType<typeof paramValidation>;

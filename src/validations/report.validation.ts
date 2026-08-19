import Joi from 'joi';

export const rentalReportQuerySchema = Joi.object({
  month: Joi.string()
    .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
    .required()
    .messages({
      'string.pattern.base': 'month must use YYYY-MM format.',
      'any.required': 'month is required and must use YYYY-MM format.',
    }),
  vehicle_id: Joi.number().integer().positive().optional(),
});

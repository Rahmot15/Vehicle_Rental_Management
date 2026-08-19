import Joi from 'joi';

export const rentalIdParamsSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const rentalListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  vehicle_id: Joi.number().integer().positive().optional(),
  status: Joi.string().valid('booked', 'ongoing', 'completed', 'cancelled').optional(),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional(),
})
  .custom((value, helpers) => {
    if (value.start_date && value.end_date && value.start_date > value.end_date) {
      return helpers.error('any.invalid');
    }

    return value;
  }, 'date range validation')
  .messages({
    'any.invalid': 'end_date must be on or after start_date.',
  });

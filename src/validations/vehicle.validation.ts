import Joi from 'joi';

const vehicleFields = {
  name: Joi.string().trim().max(255),
  plate_number: Joi.string().trim().uppercase().max(100),
  category: Joi.string().trim().max(100),
  daily_rate: Joi.number().positive().precision(2),
};

export const createVehicleSchema = Joi.object({
  name: vehicleFields.name.required(),
  plate_number: vehicleFields.plate_number.required(),
  category: vehicleFields.category.required(),
  daily_rate: vehicleFields.daily_rate.required(),
});

export const updateVehicleSchema = Joi.object(vehicleFields);

export const vehicleIdParamsSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const vehicleListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  category: Joi.string().trim().max(100).optional(),
  search: Joi.string().trim().max(255).allow('').optional(),
});

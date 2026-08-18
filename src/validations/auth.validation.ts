import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(8).max(72).required(),
});

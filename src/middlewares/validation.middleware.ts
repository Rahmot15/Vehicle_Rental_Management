import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ObjectSchema } from 'joi';
import type { ApiResponse } from '../types/api.types';

export function validateBody(schema: ObjectSchema): RequestHandler {
  return (req: Request, res: Response<ApiResponse<never>>, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      res.status(400).json({
        success: false,
        message: error.details.map((detail) => detail.message).join(', '),
      });
      return;
    }

    req.body = value;
    next();
  };
}

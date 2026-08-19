import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { unlink } from 'fs/promises';
import path from 'path';
import type { ObjectSchema } from 'joi';
import config from '../config';
import type { ApiResponse } from '../types/api.types';

type RequestProperty = 'body' | 'params' | 'query';

function validateRequestProperty(property: RequestProperty, schema: ObjectSchema): RequestHandler {
  return (req: Request, res: Response<ApiResponse<never>>, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const removeInvalidUpload = req.file
        ? unlink(path.join(config.uploadPath, req.file.filename)).catch(() => undefined)
        : Promise.resolve();

      void removeInvalidUpload.then(() => {
        res.status(400).json({
          success: false,
          message: error.details.map((detail) => detail.message).join(', '),
        });
      });
      return;
    }

    if (property === 'query') {
      res.locals.validatedQuery = value;
    } else {
      (req as unknown as Record<RequestProperty, unknown>)[property] = value;
    }

    next();
  };
}

export function validateBody(schema: ObjectSchema): RequestHandler {
  return validateRequestProperty('body', schema);
}

export function validateParams(schema: ObjectSchema): RequestHandler {
  return validateRequestProperty('params', schema);
}

export function validateQuery(schema: ObjectSchema): RequestHandler {
  return validateRequestProperty('query', schema);
}

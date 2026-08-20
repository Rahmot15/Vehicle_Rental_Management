import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { unlink } from 'fs/promises';
import path from 'path';
import type { ObjectSchema } from 'joi';
import { AppError } from '../errors/app-error';
import config from '../config';

type RequestProperty = 'body' | 'params' | 'query';

function validateRequestProperty(property: RequestProperty, schema: ObjectSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const removeInvalidUpload = req.file
        ? unlink(path.join(config.uploadPath, req.file.filename)).catch(() => undefined)
        : Promise.resolve();

      void removeInvalidUpload.then(() => {
        next(new AppError(400, error.details.map((detail) => detail.message).join(', ')));
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

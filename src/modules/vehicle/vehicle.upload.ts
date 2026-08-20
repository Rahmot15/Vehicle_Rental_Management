import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { unlink } from 'fs/promises';
import path from 'path';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import multer from 'multer';
import config from '../../config';
import { AppError } from '../../errors/app-error';

const allowedImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

mkdirSync(config.uploadPath, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: config.uploadPath,
    filename: (_req, file, callback) => {
      callback(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedImageMimeTypes.has(file.mimetype)) {
      callback(new Error('Only JPEG, PNG, and WEBP images are allowed.'));
      return;
    }

    callback(null, true);
  },
});

export const uploadVehiclePhoto: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  upload.single('photo')(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      next(
        new AppError(
          400,
          error.code === 'LIMIT_FILE_SIZE'
            ? 'Vehicle photo must not exceed 5 MB.'
            : 'Invalid vehicle photo upload.',
        ),
      );
      return;
    }

    if (error) {
      next(
        new AppError(400, error instanceof Error ? error.message : 'Vehicle photo upload failed.'),
      );
      return;
    }

    next();
  });
};

export function getUploadedPhotoPath(file?: Express.Multer.File): string | undefined {
  return file ? `/uploads/${file.filename}` : undefined;
}

export async function removeUploadedPhoto(photoPath: string): Promise<void> {
  try {
    await unlink(path.join(config.uploadPath, path.basename(photoPath)));
  } catch (error: unknown) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
      throw error;
    }
  }
}

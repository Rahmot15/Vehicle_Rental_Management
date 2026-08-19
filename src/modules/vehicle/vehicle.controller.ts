import type { RequestHandler, Response } from 'express';
import type { ApiResponse } from '../../types/api.types';
import type { VehicleService } from './vehicle.service';
import type {
  CreateVehicleInput,
  UpdateVehicleInput,
  Vehicle,
  VehicleListQuery,
  VehicleListResponse,
} from './vehicle.types';
import { getUploadedPhotoPath, removeUploadedPhoto } from './vehicle.upload';

export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  create: RequestHandler = async (req, res): Promise<void> => {
    const requestBody = req.body as CreateVehicleInput;
    const response = res as Response<ApiResponse<Vehicle>>;
    const photoPath = getUploadedPhotoPath(req.file);

    try {
      const vehicle = await this.vehicleService.createVehicle(requestBody, photoPath ?? null);

      if (vehicle === 'plate_number_conflict') {
        if (photoPath) {
          await removeUploadedPhoto(photoPath);
        }

        response.status(409).json({
          success: false,
          message: 'A vehicle with this plate number already exists.',
        });
        return;
      }

      response.status(201).json({
        success: true,
        message: 'Vehicle created successfully.',
        data: vehicle,
      });
    } catch (error) {
      if (photoPath) {
        await removeUploadedPhoto(photoPath);
      }

      throw error;
    }
  };

  getAll: RequestHandler = async (_req, res): Promise<void> => {
    const query = res.locals.validatedQuery as VehicleListQuery;
    const response = res as Response<ApiResponse<VehicleListResponse>>;
    const result = await this.vehicleService.getVehicles(query);

    response.status(200).json({
      success: true,
      message: 'Vehicles retrieved successfully.',
      data: result,
    });
  };

  getById: RequestHandler = async (req, res): Promise<void> => {
    const response = res as Response<ApiResponse<Vehicle>>;
    const vehicle = await this.vehicleService.getVehicle(Number(req.params.id));

    if (!vehicle) {
      response.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
      return;
    }

    response.status(200).json({
      success: true,
      message: 'Vehicle retrieved successfully.',
      data: vehicle,
    });
  };

  update: RequestHandler = async (req, res): Promise<void> => {
    const requestBody = req.body as UpdateVehicleInput;
    const response = res as Response<ApiResponse<Vehicle>>;
    const photoPath = getUploadedPhotoPath(req.file);

    if (Object.keys(requestBody).length === 0 && !photoPath) {
      response.status(400).json({
        success: false,
        message: 'Provide at least one vehicle field or a photo to update.',
      });
      return;
    }

    try {
      const result = await this.vehicleService.updateVehicle(
        Number(req.params.id),
        requestBody,
        photoPath,
      );

      if (result.type === 'not_found') {
        if (photoPath) {
          await removeUploadedPhoto(photoPath);
        }

        response.status(404).json({
          success: false,
          message: 'Vehicle not found.',
        });
        return;
      }

      if (result.type === 'plate_number_conflict') {
        if (photoPath) {
          await removeUploadedPhoto(photoPath);
        }

        response.status(409).json({
          success: false,
          message: 'A vehicle with this plate number already exists.',
        });
        return;
      }

      if (photoPath && result.previousPhotoPath) {
        await removeUploadedPhoto(result.previousPhotoPath);
      }

      response.status(200).json({
        success: true,
        message: 'Vehicle updated successfully.',
        data: result.vehicle,
      });
    } catch (error) {
      if (photoPath) {
        await removeUploadedPhoto(photoPath);
      }

      throw error;
    }
  };

  remove: RequestHandler = async (req, res): Promise<void> => {
    const response = res as Response<ApiResponse<Vehicle>>;
    const vehicle = await this.vehicleService.deleteVehicle(Number(req.params.id));

    if (!vehicle) {
      response.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
      return;
    }

    response.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully.',
      data: vehicle,
    });
  };
}

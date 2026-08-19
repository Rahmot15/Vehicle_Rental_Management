import type { RequestHandler, Response } from 'express';
import type { ApiResponse } from '../../types/api.types';
import type { RentalService } from './rental.service';
import type {
  CreateRentalInput,
  Rental,
  RentalListQuery,
  RentalListResponse,
  UpdateRentalInput,
} from './rental.types';

export class RentalController {
  constructor(private readonly rentalService: RentalService) {}

  getAll: RequestHandler = async (_req, res): Promise<void> => {
    const query = res.locals.validatedQuery as RentalListQuery;
    const response = res as Response<ApiResponse<RentalListResponse>>;
    const result = await this.rentalService.getRentals(query);

    response.status(200).json({
      success: true,
      message: 'Rentals retrieved successfully.',
      data: result,
    });
  };

  getById: RequestHandler = async (req, res): Promise<void> => {
    const response = res as Response<ApiResponse<Rental>>;
    const rental = await this.rentalService.getRental(Number(req.params.id));

    if (!rental) {
      response.status(404).json({
        success: false,
        message: 'Rental not found.',
      });
      return;
    }

    response.status(200).json({
      success: true,
      message: 'Rental retrieved successfully.',
      data: rental,
    });
  };

  create: RequestHandler = async (req, res): Promise<void> => {
    const requestBody = req.body as CreateRentalInput;
    const response = res as Response<ApiResponse<Rental>>;
    const result = await this.rentalService.createRental(requestBody);

    if (result.type === 'vehicle_not_found') {
      response.status(404).json({
        success: false,
        message: 'Vehicle not found or has been deleted.',
      });
      return;
    }

    if (result.type === 'date_conflict') {
      response.status(409).json({
        success: false,
        message: 'This vehicle already has an active rental overlapping the requested dates.',
      });
      return;
    }

    response.status(201).json({
      success: true,
      message: 'Rental created successfully.',
      data: result.rental,
    });
  };

  update: RequestHandler = async (req, res): Promise<void> => {
    const requestBody = req.body as UpdateRentalInput;
    const response = res as Response<ApiResponse<Rental>>;
    const result = await this.rentalService.updateRental(Number(req.params.id), requestBody);

    if (result.type === 'not_found') {
      response.status(404).json({ success: false, message: 'Rental not found.' });
      return;
    }

    if (result.type === 'invalid_date_range') {
      response.status(400).json({
        success: false,
        message: 'end_date must be on or after start_date.',
      });
      return;
    }

    if (result.type === 'vehicle_not_found') {
      response.status(404).json({
        success: false,
        message: 'Vehicle not found or has been deleted.',
      });
      return;
    }

    if (result.type === 'date_conflict') {
      response.status(409).json({
        success: false,
        message: 'This vehicle already has an active rental overlapping the requested dates.',
      });
      return;
    }

    response.status(200).json({
      success: true,
      message:
        requestBody.status === 'cancelled'
          ? 'Rental cancelled successfully.'
          : 'Rental updated successfully.',
      data: result.rental,
    });
  };

  remove: RequestHandler = async (req, res): Promise<void> => {
    const response = res as Response<ApiResponse<Rental>>;
    const rental = await this.rentalService.deleteRental(Number(req.params.id));

    if (!rental) {
      response.status(404).json({ success: false, message: 'Rental not found.' });
      return;
    }

    response.status(200).json({
      success: true,
      message: 'Rental deleted successfully.',
      data: rental,
    });
  };
}

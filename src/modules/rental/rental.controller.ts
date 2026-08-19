import type { RequestHandler, Response } from 'express';
import type { ApiResponse } from '../../types/api.types';
import type { RentalService } from './rental.service';
import type {
  CreateRentalInput,
  Rental,
  RentalListQuery,
  RentalListResponse,
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
}

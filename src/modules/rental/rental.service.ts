import type { VehicleRepository } from '../vehicle/vehicle.repository';
import type { RentalRepository } from './rental.repository';
import type {
  CreateRentalInput,
  CreateRentalResult,
  Rental,
  RentalListQuery,
  RentalListResponse,
  RentalRow,
  UpdateRentalInput,
  UpdateRentalResult,
} from './rental.types';

export class RentalService {
  constructor(
    private readonly rentalRepository: RentalRepository,
    private readonly vehicleRepository: VehicleRepository,
  ) {}

  async getRental(id: number): Promise<Rental | undefined> {
    const rental = await this.rentalRepository.findById(id);
    return rental ? this.toRental(rental) : undefined;
  }

  async getRentals(query: RentalListQuery): Promise<RentalListResponse> {
    const { rentals, total } = await this.rentalRepository.findAll(query);

    return {
      rentals: rentals.map((rental) => this.toRental(rental)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        total_pages: Math.ceil(total / query.limit),
      },
    };
  }

  async createRental(input: CreateRentalInput): Promise<CreateRentalResult> {
    return this.rentalRepository.runInTransaction(async (transaction) => {
      const vehicle = await this.vehicleRepository.findActiveByIdForUpdate(
        input.vehicle_id,
        transaction,
      );

      if (!vehicle) {
        return { type: 'vehicle_not_found' };
      }

      const conflictingRental = await this.rentalRepository.findActiveRentalOverlap(
        input.vehicle_id,
        input.start_date,
        input.end_date,
        undefined,
        transaction,
      );

      if (conflictingRental) {
        return { type: 'date_conflict' };
      }

      const totalAmount =
        Number(vehicle.daily_rate) * this.getInclusiveDayCount(input.start_date, input.end_date);
      const rental = await this.rentalRepository.createInTransaction(
        {
          ...input,
          total_amount: totalAmount,
          status: 'booked',
        },
        transaction,
      );

      return { type: 'success', rental: this.toRental(rental) };
    });
  }

  async updateRental(id: number, input: UpdateRentalInput): Promise<UpdateRentalResult> {
    const existingRental = await this.rentalRepository.findById(id);

    if (!existingRental) {
      return { type: 'not_found' };
    }

    const vehicleId = input.vehicle_id ?? existingRental.vehicle_id;
    const startDate = input.start_date ?? existingRental.start_date;
    const endDate = input.end_date ?? existingRental.end_date;
    const status = input.status ?? existingRental.status;

    if (endDate < startDate) {
      return { type: 'invalid_date_range' };
    }

    const vehicleOrDateChanged =
      vehicleId !== existingRental.vehicle_id ||
      startDate !== existingRental.start_date ||
      endDate !== existingRental.end_date;
    const isActiveRental = status === 'booked' || status === 'ongoing';
    const wasActiveRental =
      existingRental.status === 'booked' || existingRental.status === 'ongoing';
    const requiresVehicleLookup =
      vehicleOrDateChanged ||
      input.vehicle_id !== undefined ||
      (isActiveRental && !wasActiveRental);

    let vehicleDailyRate: number | undefined;

    if (requiresVehicleLookup) {
      const vehicle = await this.vehicleRepository.findById(vehicleId);

      if (!vehicle) {
        return { type: 'vehicle_not_found' };
      }

      vehicleDailyRate = Number(vehicle.daily_rate);
    }

    if (isActiveRental) {
      const conflictingRental = await this.rentalRepository.findActiveRentalOverlap(
        vehicleId,
        startDate,
        endDate,
        id,
      );

      if (conflictingRental) {
        return { type: 'date_conflict' };
      }
    }

    const rental = await this.rentalRepository.update(id, {
      ...input,
      ...(vehicleOrDateChanged
        ? {
            total_amount: (vehicleDailyRate ?? 0) * this.getInclusiveDayCount(startDate, endDate),
          }
        : {}),
    });

    if (!rental) {
      return { type: 'not_found' };
    }

    return { type: 'success', rental: this.toRental(rental) };
  }

  async deleteRental(id: number): Promise<Rental | undefined> {
    const rental = await this.rentalRepository.delete(id);
    return rental ? this.toRental(rental) : undefined;
  }

  private getInclusiveDayCount(startDate: string, endDate: string): number {
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    const start = Date.UTC(startYear, startMonth - 1, startDay);
    const end = Date.UTC(endYear, endMonth - 1, endDay);

    return Math.floor((end - start) / 86_400_000) + 1;
  }

  private toRental(rental: RentalRow): Rental {
    return {
      ...rental,
      total_amount: Number(rental.total_amount),
    };
  }
}

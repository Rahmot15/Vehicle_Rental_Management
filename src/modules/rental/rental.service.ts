import type { VehicleRepository } from '../vehicle/vehicle.repository';
import type { RentalRepository } from './rental.repository';
import type {
  CreateRentalInput,
  CreateRentalResult,
  Rental,
  RentalListQuery,
  RentalListResponse,
  RentalRow,
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
    const vehicle = await this.vehicleRepository.findById(input.vehicle_id);

    if (!vehicle) {
      return { type: 'vehicle_not_found' };
    }

    const hasDateConflict = await this.rentalRepository.hasActiveRentalOverlap(
      input.vehicle_id,
      input.start_date,
      input.end_date,
    );

    if (hasDateConflict) {
      return { type: 'date_conflict' };
    }

    const totalAmount =
      Number(vehicle.daily_rate) * this.getInclusiveDayCount(input.start_date, input.end_date);
    const rental = await this.rentalRepository.create({
      ...input,
      total_amount: totalAmount,
      status: 'booked',
    });

    return { type: 'success', rental: this.toRental(rental) };
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

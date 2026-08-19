import type { RentalRepository } from './rental.repository';
import type { Rental, RentalListQuery, RentalListResponse, RentalRow } from './rental.types';

export class RentalService {
  constructor(private readonly rentalRepository: RentalRepository) {}

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

  private toRental(rental: RentalRow): Rental {
    return {
      ...rental,
      total_amount: Number(rental.total_amount),
    };
  }
}

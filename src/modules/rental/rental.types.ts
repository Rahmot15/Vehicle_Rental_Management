export const rentalStatuses = ['booked', 'ongoing', 'completed', 'cancelled'] as const;

export type RentalStatus = (typeof rentalStatuses)[number];

export interface RentalRow {
  id: number;
  vehicle_id: number;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  total_amount: string | number;
  status: RentalStatus;
  created_at: Date;
  updated_at: Date;
}

export interface Rental extends Omit<RentalRow, 'total_amount'> {
  total_amount: number;
}

export interface RentalListQuery {
  page: number;
  limit: number;
  vehicle_id?: number;
  status?: RentalStatus;
  start_date?: Date;
  end_date?: Date;
}

export interface RentalListResponse {
  rentals: Rental[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

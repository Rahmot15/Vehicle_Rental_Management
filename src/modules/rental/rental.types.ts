export const rentalStatuses = ['booked', 'ongoing', 'completed', 'cancelled'] as const;
export const activeRentalStatuses = ['booked', 'ongoing'] as const;

export type RentalStatus = (typeof rentalStatuses)[number];
export type ActiveRentalStatus = (typeof activeRentalStatuses)[number];

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

export interface CreateRentalInput {
  vehicle_id: number;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
}

export interface CreateRentalRecord extends CreateRentalInput {
  total_amount: number;
  status: 'booked';
}

export type CreateRentalResult =
  { type: 'success'; rental: Rental } | { type: 'vehicle_not_found' } | { type: 'date_conflict' };

export interface UpdateRentalInput {
  vehicle_id?: number;
  customer_name?: string;
  customer_phone?: string;
  start_date?: string;
  end_date?: string;
  status?: RentalStatus;
}

export type UpdateRentalResult =
  | { type: 'success'; rental: Rental }
  | { type: 'not_found' }
  | { type: 'invalid_date_range' }
  | { type: 'vehicle_not_found' }
  | { type: 'date_conflict' };

export interface VehicleRow {
  id: number;
  name: string;
  plate_number: string;
  category: string;
  // PostgreSQL returns NUMERIC values as strings, while Knex accepts numbers for inserts/updates.
  daily_rate: string | number;
  photo_path: string | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Vehicle {
  id: number;
  name: string;
  plate_number: string;
  category: string;
  daily_rate: number;
  photo_path: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateVehicleInput {
  name: string;
  plate_number: string;
  category: string;
  daily_rate: number;
}

export interface UpdateVehicleInput {
  name?: string;
  plate_number?: string;
  category?: string;
  daily_rate?: number;
}

export interface VehicleListQuery {
  page: number;
  limit: number;
  category?: string;
  search?: string;
}

export interface VehicleListResponse {
  vehicles: Vehicle[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export type VehicleUpdateResult =
  | { type: 'success'; vehicle: Vehicle; previousPhotoPath: string | null }
  | { type: 'not_found' }
  | { type: 'plate_number_conflict' };

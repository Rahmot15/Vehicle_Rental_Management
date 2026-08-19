import type { VehicleRepository } from './vehicle.repository';
import type {
  CreateVehicleInput,
  UpdateVehicleInput,
  Vehicle,
  VehicleListQuery,
  VehicleListResponse,
  VehicleRow,
  VehicleUpdateResult,
} from './vehicle.types';

export class VehicleService {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async createVehicle(
    input: CreateVehicleInput,
    photoPath: string | null,
  ): Promise<Vehicle | 'plate_number_conflict'> {
    const existingVehicle = await this.vehicleRepository.findByPlateNumber(input.plate_number);

    if (existingVehicle) {
      return 'plate_number_conflict';
    }

    const vehicle = await this.vehicleRepository.create({ ...input, photo_path: photoPath });
    return this.toVehicle(vehicle);
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const vehicle = await this.vehicleRepository.findById(id);
    return vehicle ? this.toVehicle(vehicle) : undefined;
  }

  async getVehicles(query: VehicleListQuery): Promise<VehicleListResponse> {
    const { vehicles, total } = await this.vehicleRepository.findAll(query);

    return {
      vehicles: vehicles.map((vehicle) => this.toVehicle(vehicle)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        total_pages: Math.ceil(total / query.limit),
      },
    };
  }

  async updateVehicle(
    id: number,
    input: UpdateVehicleInput,
    photoPath?: string,
  ): Promise<VehicleUpdateResult> {
    const existingVehicle = await this.vehicleRepository.findById(id);

    if (!existingVehicle) {
      return { type: 'not_found' };
    }

    if (input.plate_number && input.plate_number !== existingVehicle.plate_number) {
      const vehicleWithPlate = await this.vehicleRepository.findByPlateNumber(input.plate_number);

      if (vehicleWithPlate) {
        return { type: 'plate_number_conflict' };
      }
    }

    const vehicle = await this.vehicleRepository.update(id, {
      ...input,
      ...(photoPath ? { photo_path: photoPath } : {}),
    });

    if (!vehicle) {
      return { type: 'not_found' };
    }

    return {
      type: 'success',
      vehicle: this.toVehicle(vehicle),
      previousPhotoPath: existingVehicle.photo_path,
    };
  }

  async deleteVehicle(id: number): Promise<Vehicle | undefined> {
    const vehicle = await this.vehicleRepository.softDelete(id);
    return vehicle ? this.toVehicle(vehicle) : undefined;
  }

  private toVehicle(vehicle: VehicleRow): Vehicle {
    return {
      id: vehicle.id,
      name: vehicle.name,
      plate_number: vehicle.plate_number,
      category: vehicle.category,
      daily_rate: Number(vehicle.daily_rate),
      photo_path: vehicle.photo_path,
      created_at: vehicle.created_at,
      updated_at: vehicle.updated_at,
    };
  }
}

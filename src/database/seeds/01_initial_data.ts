import bcrypt from 'bcrypt';
import type { Knex } from 'knex';

const seededVehicles = [
  {
    name: 'Toyota Axio',
    plate_number: 'DHA-11-1234',
    category: 'Sedan',
    daily_rate: 3500,
  },
  {
    name: 'Honda Vezel',
    plate_number: 'DHA-11-5678',
    category: 'SUV',
    daily_rate: 5500,
  },
  {
    name: 'Toyota Hiace',
    plate_number: 'DHA-11-9012',
    category: 'Microbus',
    daily_rate: 7000,
  },
] as const;

function getVehicleId(vehicleIds: Map<string, number>, plateNumber: string): number {
  const vehicleId = vehicleIds.get(plateNumber);

  if (!vehicleId) {
    throw new Error(`Seeded vehicle not found: ${plateNumber}`);
  }

  return vehicleId;
}

export async function seed(knex: Knex): Promise<void> {
  const passwordHash = await bcrypt.hash('Admin@12345', 12);

  await knex.transaction(async (trx) => {
    await trx('staff')
      .insert({
        email: 'admin@vehiclerental.com',
        password_hash: passwordHash,
        name: 'System Administrator',
      })
      .onConflict('email')
      .ignore();

    await trx('vehicles').insert(seededVehicles).onConflict('plate_number').ignore();

    const vehicles = await trx<{ id: number; plate_number: string }>('vehicles').select(
      'id',
      'plate_number',
    );
    const vehicleIds = new Map(vehicles.map((vehicle) => [vehicle.plate_number, vehicle.id]));

    const seededRentals = [
      {
        vehicle_id: getVehicleId(vehicleIds, 'DHA-11-1234'),
        customer_name: 'Nusrat Jahan',
        customer_phone: '01710000001',
        start_date: '2026-07-29',
        end_date: '2026-08-03',
        total_amount: 21000,
        status: 'completed',
      },
      {
        vehicle_id: getVehicleId(vehicleIds, 'DHA-11-5678'),
        customer_name: 'Arif Hossain',
        customer_phone: '01710000002',
        start_date: '2026-08-10',
        end_date: '2026-08-13',
        total_amount: 22000,
        status: 'completed',
      },
      {
        vehicle_id: getVehicleId(vehicleIds, 'DHA-11-1234'),
        customer_name: 'Mim Akter',
        customer_phone: '01710000003',
        start_date: '2026-08-20',
        end_date: '2026-08-21',
        total_amount: 7000,
        status: 'booked',
      },
      {
        vehicle_id: getVehicleId(vehicleIds, 'DHA-11-9012'),
        customer_name: 'Tanvir Rahman',
        customer_phone: '01710000004',
        start_date: '2026-08-24',
        end_date: '2026-08-24',
        total_amount: 7000,
        status: 'cancelled',
      },
    ];

    for (const rental of seededRentals) {
      const existingRental = await trx('rentals')
        .where({
          vehicle_id: rental.vehicle_id,
          customer_phone: rental.customer_phone,
          start_date: rental.start_date,
          end_date: rental.end_date,
        })
        .first('id');

      if (!existingRental) {
        await trx('rentals').insert(rental);
      }
    }
  });
}

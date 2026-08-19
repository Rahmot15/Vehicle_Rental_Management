import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../../middlewares/validation.middleware';
import {
  createRentalSchema,
  rentalIdParamsSchema,
  rentalListQuerySchema,
} from '../../validations/rental.validation';
import { RentalController } from './rental.controller';
import { RentalRepository } from './rental.repository';
import { RentalService } from './rental.service';
import { VehicleRepository } from '../vehicle/vehicle.repository';

const rentalRouter = Router();
const rentalRepository = new RentalRepository();
const vehicleRepository = new VehicleRepository();
const rentalService = new RentalService(rentalRepository, vehicleRepository);
const rentalController = new RentalController(rentalService);

rentalRouter.use(authenticate);

rentalRouter.get('/', validateQuery(rentalListQuerySchema), rentalController.getAll);
rentalRouter.post('/', validateBody(createRentalSchema), rentalController.create);
rentalRouter.get('/:id', validateParams(rentalIdParamsSchema), rentalController.getById);

export default rentalRouter;

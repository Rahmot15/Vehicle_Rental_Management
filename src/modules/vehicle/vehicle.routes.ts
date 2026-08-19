import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../../middlewares/validation.middleware';
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleIdParamsSchema,
  vehicleListQuerySchema,
} from '../../validations/vehicle.validation';
import { VehicleController } from './vehicle.controller';
import { VehicleRepository } from './vehicle.repository';
import { VehicleService } from './vehicle.service';
import { uploadVehiclePhoto } from './vehicle.upload';

const vehicleRouter = Router();
const vehicleRepository = new VehicleRepository();
const vehicleService = new VehicleService(vehicleRepository);
const vehicleController = new VehicleController(vehicleService);

vehicleRouter.use(authenticate);

vehicleRouter.get('/', validateQuery(vehicleListQuerySchema), vehicleController.getAll);

vehicleRouter.post(
  '/',
  uploadVehiclePhoto,
  validateBody(createVehicleSchema),
  vehicleController.create,
);

vehicleRouter.get('/:id', validateParams(vehicleIdParamsSchema), vehicleController.getById);

vehicleRouter.put(
  '/:id',
  uploadVehiclePhoto,
  validateParams(vehicleIdParamsSchema),
  validateBody(updateVehicleSchema),
  vehicleController.update,
);

vehicleRouter.delete('/:id', validateParams(vehicleIdParamsSchema), vehicleController.remove);

export default vehicleRouter;

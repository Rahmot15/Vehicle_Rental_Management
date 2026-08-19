import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { validateParams, validateQuery } from '../../middlewares/validation.middleware';
import { rentalIdParamsSchema, rentalListQuerySchema } from '../../validations/rental.validation';
import { RentalController } from './rental.controller';
import { RentalRepository } from './rental.repository';
import { RentalService } from './rental.service';

const rentalRouter = Router();
const rentalRepository = new RentalRepository();
const rentalService = new RentalService(rentalRepository);
const rentalController = new RentalController(rentalService);

rentalRouter.use(authenticate);

rentalRouter.get('/', validateQuery(rentalListQuerySchema), rentalController.getAll);
rentalRouter.get('/:id', validateParams(rentalIdParamsSchema), rentalController.getById);

export default rentalRouter;

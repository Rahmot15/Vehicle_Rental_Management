import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { validateQuery } from '../../middlewares/validation.middleware';
import { rentalReportQuerySchema } from '../../validations/report.validation';
import { ReportController } from './report.controller';
import { ReportRepository } from './report.repository';
import { ReportService } from './report.service';

const reportRouter = Router();
const reportRepository = new ReportRepository();
const reportService = new ReportService(reportRepository);
const reportController = new ReportController(reportService);

reportRouter.use(authenticate);
reportRouter.get('/rentals', validateQuery(rentalReportQuerySchema), reportController.getRentals);

export default reportRouter;

import cors from 'cors';
import express, { type Application, type Request, type Response } from 'express';
import config from './config';
import authRouter from './modules/auth/auth.routes';
import rentalRouter from './modules/rental/rental.routes';
import reportRouter from './modules/report/report.routes';
import vehicleRouter from './modules/vehicle/vehicle.routes';

const app: Application = express();

// parsers
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(config.uploadPath));

// application routes
app.use('/auth', authRouter);
app.use('/vehicles', vehicleRouter);
app.use('/rentals', rentalRouter);
app.use('/reports', reportRouter);

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Vehicle Rental Management API is running.',
  });
});

export default app;

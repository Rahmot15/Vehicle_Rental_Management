import cors from 'cors';
import express, { type Application, type Request, type Response } from 'express';
import config from './config';

const app: Application = express();

// parsers
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(config.uploadPath));

// application routes
// app.use('/api/v1', router);

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Vehicle Rental Management API is running.',
  });
});

export default app;

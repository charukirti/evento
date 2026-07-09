import express from 'express';
import { env } from './config/env';
import cookieParser from 'cookie-parser';
import {
  errorHandler,
  notFoundHandler,
} from './middleware/error-handler.middleware';
import authRouter from './modules/auth/auth.routes';

const app = express();
const PORT = env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.send('Hello, World!');
});

app.use('/api/auth', authRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

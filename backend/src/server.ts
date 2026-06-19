import express, {type Express} from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import apiRouter from "./routes/api_router.js";

const PORT = 3000;
const app: Express = express();

const allowedOrigins: string[] = process.env.CORS_ORIGIN?.split(',') || [];
app.use(cookieParser());
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express.json());

app.use('/api', apiRouter);

app.listen(PORT,
    () => console.log(`Server running on port ${PORT}.`)
);
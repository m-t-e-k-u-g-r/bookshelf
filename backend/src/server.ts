import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';

const PORT: string = process.env.PORT || '5500';
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
}));
app.use(express.json());

app.listen(PORT,
    () => console.log(`Server running on port ${PORT}.`)
);
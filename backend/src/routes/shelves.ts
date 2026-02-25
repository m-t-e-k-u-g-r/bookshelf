import express from "express";
import { DataManager } from "../lib/dataManager.js";

const router = express.Router();

router.route('/')
    .get(async (req: any, res: any) => {
        const data = await DataManager.getShelves();
        res.status(200).send(data);
    });

export default router;
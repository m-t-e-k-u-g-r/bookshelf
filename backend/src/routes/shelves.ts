import express from "express";
import { DataManager } from "../lib/dataManager.js";

const router = express.Router();

router.route('/')
    .get(async (req: any, res: any) => {
        const data = await DataManager.getShelves();
        res.status(200).send(data);
    })
    .post(async (req: any, res: any) => {
        const data = await DataManager.getShelves();
        const isbn: string = req.body.isbn;
        const selectedShelves: string[] = req.body.shelves;
        if (isbn == undefined || selectedShelves == undefined) return res.status(400).json({error: 'Invalid request body'});

        for (const shelfName in data) {
            const shelf = data[shelfName];
            const isCurrentlyInShelf = shelf.includes(isbn);
            const shouldBeInShelf = selectedShelves.includes(shelfName);

            if (shouldBeInShelf && !isCurrentlyInShelf) {
                shelf.push(isbn);
            } else if (!shouldBeInShelf && isCurrentlyInShelf) {
                data[shelfName] = shelf.filter((i: string) => i !== isbn);
            }
        }
        await DataManager.saveShelves(data);
        res.sendStatus(201);
    })

export default router;
import express from "express";
import { DataManager } from "../lib/dataManager.js";

const router = express.Router();

router.route('/')
    .get(async (req: any, res: any) => {
        // #swagger.tags = ['Shelves']
        const data = await DataManager.getShelves();
        res.status(200).send(data);
    })
    .post(async (req: any, res: any) => {
        // #swagger.tags = ['Shelves']
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
    .put(async (req: any, res: any) => {
        // #swagger.tags = ['Shelves']
        const data = await DataManager.getShelves();
        const shelf: string = req.body.shelf;
        const newShelfName: string = req.body.shelfName;
        if (shelf == null || newShelfName == null) return res.status(400).json({error: 'Invalid request body'});
        if (!(shelf in data)) return res.status(404).json({error: `Shelf '${shelf}' not found`});
        try {
            data[newShelfName] = data[shelf];
            delete data[shelf];
        } catch (e) {
            return res.sendStatus(500);
        }
        await DataManager.saveShelves(data);
        res.sendStatus(200);
    });

router.route('/:shelfName')
    .post(async (req: any, res: any) => {
        // #swagger.tags = ['Shelves']
        const data = await DataManager.getShelves();
        const name: string | null = req.params.shelfName?.trim() || null;
        if (name == null) return res.status(400).json({error: 'Invalid shelf name'});
        if (name in data) return res.status(409).json({error: `Shelf '${name}' already exists.`});
        data[name] = [];
        await DataManager.saveShelves(data);
        res.status(201).send(`Shelf '${name}' created.`);
    })
    .delete(async (req: any, res: any) => {
        // #swagger.tags = ['Shelves']
        const data = await DataManager.getShelves();
        const name: string | null = req.params.shelfName?.trim() || null;
        if (name == null) return res.status(400).json({error: 'Invalid shelf name'});
        delete data[name];
        await DataManager.saveShelves(data);
        res.sendStatus(204);
    });

export default router;
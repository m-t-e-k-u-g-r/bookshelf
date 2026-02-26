import express from "express";
import { type Request, type Response } from "express";
import {DataManager, type ISBNList} from "../lib/dataManager.js";
import { type Shelves } from "../lib/dataManager.js";

const router = express.Router();

router.route('/')
    .get(async (req: Request, res: Response) => {
        // #swagger.tags = ['Shelves']
        const shelves: Shelves = await DataManager.getShelves();
        res.status(200).send(shelves);
    })
    .post(async (req: Request, res: Response) => {
        // #swagger.tags = ['Shelves']
        const shelves: Shelves = await DataManager.getShelves();
        const isbn: string = req.body.isbn;
        const selectedShelves: string[] = req.body.shelves;
        if (isbn == undefined || selectedShelves == undefined) return res.status(400).json({error: 'Invalid request body'});

        for (const shelfName in shelves) {
            const shelf: ISBNList = shelves[shelfName] || [];
            const isCurrentlyInShelf = shelf.includes(isbn);
            const shouldBeInShelf = selectedShelves.includes(shelfName);

            if (shouldBeInShelf && !isCurrentlyInShelf) {
                shelf.push(isbn);
            } else if (!shouldBeInShelf && isCurrentlyInShelf) {
                shelves[shelfName] = shelf.filter((i: string) => i !== isbn);
            }
        }
        await DataManager.saveShelves(shelves);
        res.sendStatus(201);
    })
    .put(async (req: Request, res: Response) => {
        // #swagger.tags = ['Shelves']
        const shelves: Shelves = await DataManager.getShelves();
        const shelf: string = req.body.shelf;
        const oldShelf: ISBNList | undefined = shelves[shelf];
        const newShelfName: string = req.body.shelfName;
        if (shelf == null || newShelfName == null) return res.status(400).json({error: 'Invalid request body'});
        if (!(shelf in shelves) || oldShelf === undefined) {
            return res.status(404).json({error: `Shelf '${shelf}' not found`});
        }
        try {
            shelves[newShelfName] = oldShelf;
            delete shelves[shelf];
        } catch (e) {
            return res.sendStatus(500);
        }
        await DataManager.saveShelves(shelves);
        res.sendStatus(200);
    });

router.route('/:shelfName')
    .post(async (req: Request, res: Response) => {
        // #swagger.tags = ['Shelves']
        const shelves: Shelves = await DataManager.getShelves();
        const name: string | null = (req.params.shelfName as string)?.trim() || null;
        if (name == null) return res.status(400).json({error: 'Invalid shelf name'});
        if (name in shelves) return res.status(409).json({error: `Shelf '${name}' already exists.`});
        shelves[name] = [];
        await DataManager.saveShelves(shelves);
        res.status(201).send(`Shelf '${name}' created.`);
    })
    .delete(async (req: Request, res: Response) => {
        // #swagger.tags = ['Shelves']
        const shelves: Shelves = await DataManager.getShelves();
        const name: string | null = (req.params.shelfName as string)?.trim() || null;
        if (name == null) return res.status(400).json({error: 'Invalid shelf name'});
        delete shelves[name];
        await DataManager.saveShelves(shelves);
        res.sendStatus(204);
    });

export default router;
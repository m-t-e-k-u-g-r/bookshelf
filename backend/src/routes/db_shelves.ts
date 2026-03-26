import express from 'express';
import { type Router, type Request, type Response } from "express";
import {DbDataManager as db, type BookInShelf, type SidebarData} from '../lib/dbDataManager.js';
import {cleanIsbn} from "../lib/utils.js";

const router: Router = express.Router();

router.route('/')
    .get(async (req: Request, res: Response) => {
        // #swagger.tags = ['DB Shelves']
        const userId = req.body.userId;
        if (typeof userId !== "number") return res.status(400).json({error: 'Invalid user ID'});
        try {
            const shelves: BookInShelf[] = await db.getShelvesWithBooks(userId);
            return res.status(200).send(shelves);
        } catch (e) {
            return res.status(500).json({error: 'Failed to get shelves with books'});
        }
    })
    .post(async (req: Request, res: Response) => {
        // #swagger.tags = ['DB Shelves']
        const userId = req.body.userId;
        if (typeof userId !== "number") return res.status(400).json({error: 'Invalid user ID'});
        const isbn: string = req.body.isbn;
        const selectedShelvesId: string[] = req.body.shelves;
        if (isbn == undefined || selectedShelvesId == undefined) return res.status(400).json({error: 'Invalid request body'});

        try {
            await db.editShelvesOfBook(isbn, selectedShelvesId, userId);
            return res.sendStatus(201);
        } catch (e) {
            return res.status(500).json({error: 'Failed to edit shelves of book'});
        }
    })
    .put(async (req: Request, res: Response) => {
        // #swagger.tags = ['DB Shelves']
        const userId = req.body.userId;
        if (typeof userId !== "number") return res.status(400).json({error: 'Invalid user ID'});
        const oldShelfName: string = req.body.oldShelfName;
        const newShelfName: string = req.body.newShelfName;
        if (oldShelfName == undefined || newShelfName == undefined) return res.status(400).json({error: 'Invalid request body'});

        try {
            await db.updateShelfName(oldShelfName, newShelfName, userId);
            return res.sendStatus(200);
        } catch (e) {
            return res.status(500).json({error: 'Failed to update shelf name'});
        }
    });

router.route('/sidebar').get(async (req: Request, res: Response) => {
    // #swagger.tags = ['DB Shelves']
    const userId = req.body.userId;
    if (typeof userId !== "number") return res.status(400).json({error: 'Invalid user ID'});
    try {
        const response: SidebarData[] = await db.getSidebarData(userId);
        return res.status(200).send(response);
    } catch (e) {
        return res.status(500).json({error: 'Failed to get sidebar data'});
    }
});

router.route('/names').get(async (req: Request, res: Response) => {
    // #swagger.tags = ['DB Shelves']
    const userId = req.body.userId;
    if (typeof userId !== "number") return res.status(400).json({error: 'Invalid user ID'});
    try {
        const response: string[] = await db.getShelfNames(userId);
        return res.status(200).send(response);
    }  catch (e) {
        return res.status(500).json({error: 'Failed to get shelf names'});
    }
});

router.route('/b/:isbn').get(async (req: Request, res: Response) => {
    // #swagger.tags = ['DB Shelves']
    const userId = req.body.userId;
    if (typeof userId !== "number") return res.status(400).json({error: 'Invalid user ID'});
    const isbn = req.params.isbn;
    if (typeof isbn !== 'string') return res.status(400).json({error: 'Invalid ISBN'});
    try {
        const response: string[] | undefined = await db.getShelvesOfBook(cleanIsbn(isbn), userId);
        if (response == undefined) return res.status(404).json({error: 'Book not found'});
        return res.status(200).send(response);
    } catch (e) {
        return res.status(500).json({error: `Failed to get shelves of book ${isbn}`});
    }
});

router.route('/:shelfName')
    .get(async (req: Request, res: Response) => {
        // #swagger.tags = ['DB Shelves']
        const userId = req.body.userId;
        if (typeof userId !== "number") return res.status(400).json({error: 'Invalid user ID'});
        const shelfName = req.params.shelfName;
        if (typeof shelfName !== 'string') return res.status(400).json({error: 'Invalid shelf name'});
        try {
            const response: BookInShelf[] = await db.getBooksByShelf(shelfName, userId);
            return res.status(200).send(response);
        } catch (e) {
            return res.status(500).json({error: `Failed to get books in shelf ${shelfName}`});
        }
    })
    .post(async (req: Request, res: Response) => {
        // #swagger.tags = ['DB Shelves']
        const userId = req.body.userId;
        if (typeof userId !== "number") return res.status(400).json({error: 'Invalid user ID'});
        const shelfName = req.params.shelfName;
        if (typeof shelfName !== 'string' || shelfName == '') return res.status(400).json({error: 'Invalid shelf name'});
        try {
            await db.addShelf(shelfName, userId);
            return res.status(201).json({ message: `Shelf '${shelfName}' created.` });
        } catch (e) {
            return res.status(500).json({error: 'Failed to create shelf'});
        }
    })
    .delete(async (req: Request, res: Response) => {
        // #swagger.tags = ['DB Shelves']
        const userId = req.body.userId;
        if (typeof userId !== "number") return res.status(400).json({error: 'Invalid user ID'});
        const shelfName = req.params.shelfName;
        if (typeof shelfName !== 'string') return res.status(400).json({error: 'Invalid shelf name'});
        try {
            await db.deleteShelf(shelfName, userId);
            return res.sendStatus(204);
        } catch (e) {
            return res.status(500).json({error: 'Failed to delete shelf'});
        }
    });

export default router;
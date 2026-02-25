import express from 'express';
import type { Book } from '../lib/utils.js';
import {DataManager} from "../lib/dataManager.js";

enum SortBy {
    TITLE = 'title',
    AUTHOR = 'author',
    ISBN = 'isbn',
    PUBLISH_DATE = 'publish_date'
}
enum SortOrder {
    ASC = 'asc',
    DESC = 'desc'
}

const router = express.Router();

function sort(data: Book[], sortBy: SortBy, order: SortOrder): Book[] {
    return [...data].sort((a: any, b: any) => {
        const valA = String(a[sortBy] || '');
        const valB = String(b[sortBy] || '');
        if (order === SortOrder.ASC) {
            return valA.localeCompare(valB);
        } else {
            return valB.localeCompare(valA);
        }
    });
}

router.route('/')
    .get(async (req: any, res: any) => {
        let { sortBy, order, hide } = req.query;
        const data = await DataManager.getBooks();

        if (!Object.values(SortBy).includes(sortBy as SortBy)) {
            sortBy = SortBy.TITLE;
        }
        if (!Object.values(SortOrder).includes(order as SortOrder)) {
            order = SortOrder.ASC;
        }
        const sortedData = sort(data, sortBy, order);

        const hiddenAttributes: string[] | undefined = hide?.split(',').map((f: any) => f.trim());
        if (hiddenAttributes !== undefined) {
            for (const attribute of hiddenAttributes) {
                sortedData.forEach((book: any) => delete book[attribute]);
            }
        }

        res.status(200).send(sortedData);
    });

export default router;
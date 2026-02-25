import swaggerAutogen from 'swagger-autogen';

const doc: object = {
    info: {
        title: 'Bookshelf'
    },
    tags: [
        {
            name: 'Books'
        },
        {
            name: 'Shelves'
        }
    ],
    host: 'localhost:5500',
    schemes: [
        "http"
    ],
    components: {
        parameters: {
            SortByParam: {
                name: "sortBy",
                in: "query",
                required: false,
                description: "Field used for sorting",
                schema: {
                    type: "string",
                    enum: ["title", "author", "isbn", "publish_date"],
                    default: "title"
                }
            },
            OrderParam: {
                name: "order",
                in: "query",
                required: false,
                description: "Order of sorting",
                schema: {
                    type: "string",
                    enum: ["asc", "desc"],
                    default: "asc"
                }
            }
        }
    }
};

const outputfile: string = './swagger.json';
const routes: string[] = ['../server.ts'];

swaggerAutogen({openapi: '3.0.0'})(outputfile, routes, doc);
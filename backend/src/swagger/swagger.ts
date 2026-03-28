import swaggerAutogen from 'swagger-autogen';

const doc: object = {
    info: {
        title: 'Bookshelf'
    },
    tags: [
        {
            name: 'Auth'
        },
        {
            name: 'DB Books'
        },
        {
            name: 'DB Shelves'
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
            },
            ISBNParam: {
                name: "isbn",
                in: "body",
                required: true,
                description: "ISBNs of added books",
                schema: {
                    type: "array",
                    items: {
                        type: "string"
                    },
                    example: {
                        isbns: [
                            "9780140449136",
                            "9783038580171",
                            "9780486821955"
                        ]
                    }
                }
            }
        }
    }
};

const outputfile: string = './swagger.json';
const routes: string[] = ['../server.js'];

swaggerAutogen({openapi: '3.0.0'})(outputfile, routes, doc);
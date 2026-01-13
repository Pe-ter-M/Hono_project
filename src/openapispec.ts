export const openapiSpec = {
    openapi: '3.0.0',
    info: {
        title: 'Transactions API',
        version: '1.0.0',
        description: 'API for managing transactions'
    },
    tags: [
        {
            name: 'transactions',
            description: 'Transaction management endpoints'
        },
    ],
    paths: {
        '/transactions': {
            get: {
                tags: ['transactions'],
                summary: 'Get all transactions',
                description: 'Retrieve a list of all transactions with optional filtering',
                responses: {
                    '200': {
                        description: 'List of transactions',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string' },
                                            amount: { type: 'number' },
                                            date: { type: 'string', format: 'date-time' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ['transactions'],
                summary: 'Create a new transaction',
                description: 'Create a new transaction record',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['amount', 'description'],
                                properties: {
                                    amount: { type: 'number', example: 100.50 },
                                    description: { type: 'string', example: 'Grocery shopping' },
                                    category: { type: 'string', example: 'food' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Transaction created successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/transactions/{id}': {
            get: {
                tags: ['transactions'],
                summary: 'Get transaction by ID',
                description: 'Retrieve a specific transaction by its unique identifier',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        description: 'Transaction ID',
                        schema: {
                            type: 'string',
                            example: 'txn_12345'
                        }
                    }
                ],
                responses: {
                    '200': {
                        description: 'Transaction details',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        amount: { type: 'number' },
                                        description: { type: 'string' },
                                        createdAt: { type: 'string', format: 'date-time' }
                                    }
                                }
                            }
                        }
                    },
                    '404': {
                        description: 'Transaction not found',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        error: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            put: {
                tags: ['transactions'],
                summary: 'Update transaction',
                description: 'Update an existing transaction',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    amount: { type: 'number' },
                                    description: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Transaction updated' }
                }
            },
            delete: {
                tags: ['transactions'],
                summary: 'Delete transaction',
                description: 'Delete a transaction by ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    '204': { description: 'Transaction deleted successfully' }
                }
            }
        },
    }};
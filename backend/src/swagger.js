const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Distributor Analytics API',
            version: '1.0.0',
            description: 'API for course project: distributor analytics'
        },
        servers: [{ url: process.env.API_URL || 'http://localhost:4000' }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string' }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        token: { type: 'string' },
                        user: { $ref: '#/components/schemas/User' }
                    }
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['email', 'password', 'name', 'role'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string' },
                        name: { type: 'string' },
                        role: { type: 'string', enum: ['Admin', 'Analyst'] }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        email: { type: 'string', format: 'email' },
                        name: { type: 'string' },
                        role: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                Product: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        category_id: { type: 'integer' },
                        price: { type: 'number' },
                        cost_price: { type: 'number' },
                        stock: { type: 'integer' },
                        unit: { type: 'string' },
                        barcode: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                ProductCreate: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string' },
                        category_id: { type: 'integer' },
                        price: { type: 'number' },
                        cost_price: { type: 'number' },
                        stock: { type: 'integer' },
                        unit: { type: 'string' },
                        barcode: { type: 'string' }
                    }
                },
                ProductUpdate: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        category_id: { type: 'integer' },
                        price: { type: 'number' },
                        cost_price: { type: 'number' },
                        stock: { type: 'integer' },
                        unit: { type: 'string' },
                        barcode: { type: 'string' }
                    }
                },
                Category: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                FinancialIndicator: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        year: { type: 'integer' },
                        revenue: { type: 'number' },
                        profit: { type: 'number' },
                        assets: { type: 'number' },
                        profitability: { type: 'number' },
                        liquidity: { type: 'number' },
                        asset_turnover: { type: 'number' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                Report: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        type: { type: 'string' },
                        path: { type: 'string' },
                        meta: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                FactorAnalysisRequest: {
                    type: 'object',
                    required: ['fixedAssets', 'assetTurnover'],
                    properties: {
                        fixedAssets: { type: 'number' },
                        assetTurnover: { type: 'number' }
                    }
                },
                FactorAnalysisResult: {
                    type: 'object',
                    properties: {
                        fixedAssets: { type: 'number' },
                        assetTurnover: { type: 'number' },
                        result: { type: 'number' }
                    }
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    // include route JSDoc as well as controllers for richer docs
    apis: ['./src/routes/*.js', './src/controllers/*.js']
};

module.exports = swaggerJSDoc(options);

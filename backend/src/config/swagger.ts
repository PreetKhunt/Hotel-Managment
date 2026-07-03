import swaggerJsdoc from 'swagger-jsdoc';
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Hospitality Hub Hotel Management System API',
      version: '1.0.0',
      description: 'API documentation for Hospitality Hub Backend',
      contact: {
        name: 'API Support',
        url: 'https://hospitalityhub.com',
      },
    },
    servers: [
      {
        url: `/api/v1`,
        description: 'API Server',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Location of JSDoc comments
};

export const swaggerSpec = swaggerJsdoc(options);

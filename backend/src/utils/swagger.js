/**
 * @fileoverview Swagger API Documentation Configuration
 *
 * Configures the Swagger/OpenAPI specification for the HouseHold Budgeting API.
 * Defines metadata, security schemes, and route scanning paths.
 *
 * @module utils/swagger
 * @requires swagger-jsdoc
 */

import swaggerJsdoc from 'swagger-jsdoc';


const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HouseHold Budgeting API',
      version: '1.0.0',
      description: 'API documentation for HouseHold Budgeting application',
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

export const specs = swaggerJsdoc(options);

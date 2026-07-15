const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./openapi');

const swaggerRouter = express.Router();

swaggerRouter.get('/api-docs.json', (req, res) => {
	res.status(200).json(openapi);
});

swaggerRouter.use(
	'/api-docs',
	swaggerUi.serve,
	swaggerUi.setup(openapi, {
		explorer: true,
		customSiteTitle: 'Warid Initiative API',
		swaggerOptions: {
			persistAuthorization: true,
			displayRequestDuration: true,
		},
	})
);

module.exports = swaggerRouter;

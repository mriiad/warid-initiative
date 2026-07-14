const request = require('supertest');
const { buildApp } = require('./support/testApp');

const app = buildApp();

describe('Swagger documentation', () => {
	it('serves a valid OpenAPI document for every registered API route', async () => {
		const response = await request(app).get('/api-docs.json');

		expect(response.status).toBe(200);
		expect(response.body.openapi).toBe('3.0.3');
		expect(response.body.info.title).toBe('Warid Initiative API');
		expect(Object.keys(response.body.paths)).toHaveLength(38);
		const operationCount = Object.values(response.body.paths).reduce(
			(total, path) =>
				total +
				Object.keys(path).filter((key) =>
					['get', 'post', 'put', 'patch', 'delete'].includes(key)
				).length,
			0
		);
		expect(operationCount).toBe(41);
		expect(response.body.components.securitySchemes.bearerAuth).toEqual(
			expect.objectContaining({ type: 'http', scheme: 'bearer' })
		);
	});

	it('serves the interactive Swagger UI', async () => {
		const response = await request(app).get('/api-docs/');

		expect(response.status).toBe(200);
		expect(response.headers['content-type']).toContain('text/html');
		expect(response.text).toContain('Swagger UI');
	});
});

const crypto = require('crypto');

const pinoHttp = require('pino-http');

const { logger } = require('../utils/logger');

/**
 * One structured line per request, and a request id that ties every log line
 * from a single request together -- including the error handler's.
 *
 * The id is taken from an inbound X-Request-Id when a proxy already set one,
 * so a trace survives across hops, and is echoed back on the response so a
 * user reporting a failure can quote something findable.
 */
const requestLogger = () =>
	pinoHttp({
		logger,

		genReqId: (req, res) => {
			const existing = req.headers['x-request-id'];
			const id = existing || crypto.randomUUID();
			res.setHeader('X-Request-Id', id);
			return id;
		},

		// A 500 is an incident; a 404 or a rejected login is routine traffic
		// and shouldn't page anyone.
		customLogLevel: (req, res, err) => {
			if (err || res.statusCode >= 500) {
				return 'error';
			}
			if (res.statusCode >= 400) {
				return 'warn';
			}
			return 'info';
		},

		customSuccessMessage: (req, res) =>
			`${req.method} ${req.url} ${res.statusCode}`,
		customErrorMessage: (req, res, err) =>
			`${req.method} ${req.url} failed: ${err.message}`,

		// pino-http's defaults log every request header. Narrow that to what is
		// useful operationally -- the full set carries the Authorization bearer
		// and any cookies, and this app's tokens are long-lived enough that a
		// leaked log line is a live credential.
		serializers: {
			req: (req) => ({
				id: req.id,
				method: req.method,
				url: req.url,
				remoteAddress: req.remoteAddress,
			}),
			res: (res) => ({ statusCode: res.statusCode }),
		},
	});

module.exports = { requestLogger };

/**
 * Serves the *built* SPA through the same security headers app.js uses.
 *
 * Production serves the frontend from Express (app.js does express.static on
 * extranet/build), so this is the real serving path -- a Content-Security-
 * Policy that blocks a stylesheet or an image only shows up here. Neither the
 * Vite dev server nor `vite preview` sends Express's headers at all.
 *
 * Run it directly (`node e2e/backend/support/spaServer.js`) to serve on
 * SPA_PORT, default 4300; extranet/playwright.production.config.ts starts it
 * that way.
 */
const express = require('express');
const path = require('path');

const { securityHeaders } = require('../../../src/middleware/security-headers');

const BUILD_DIR = path.join(__dirname, '../../../extranet/build');

function buildSpaServer() {
	const app = express();
	app.use(securityHeaders());
	app.use(express.static(BUILD_DIR));
	// Express 5 requires wildcard route params to be named; '/*splat' matches
	// the same paths app.js falls back on.
	app.get('/*splat', (req, res) => {
		res.sendFile(path.join(BUILD_DIR, 'index.html'));
	});
	return app;
}

if (require.main === module) {
	const port = parseInt(process.env.SPA_PORT, 10) || 4300;
	buildSpaServer().listen(port, () => {
		console.log(`SPA served with security headers on http://localhost:${port}`);
	});
}

module.exports = { buildSpaServer, BUILD_DIR };

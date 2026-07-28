const helmet = require('helmet');

const config = require('../utils/config');

/**
 * Security headers for the app, which serves the built SPA itself.
 *
 * The Content-Security-Policy is written out rather than left on helmet's
 * defaults. Those would mostly *work* here -- they already allow `data:`
 * images and inline styles -- but they are looser than this app needs, and
 * one directive is actively wrong for the current deployment:
 *
 *  - `upgrade-insecure-requests` is in helmet's default policy and rewrites
 *    subresource requests to https://. Until TLS is terminated in front of
 *    the app, that turns working asset loads into failed ones.
 *  - the default `style-src` and `font-src` end in a blanket `https:`, which
 *    permits stylesheets and fonts from *any* HTTPS origin. This frontend
 *    loads exactly one external origin, so it is named instead.
 *  - `frame-ancestors` defaults to `'self'`; nothing here is meant to be
 *    framed at all.
 *
 * What the policy has to keep allowing, each verified against the real
 * production bundle by extranet/e2e-production:
 *
 *  - `data:` in `img-src`, for the event QR codes (QRCode.toDataURL) and the
 *    base64 event photos rendered by EventCard.
 *  - fonts.cdnfonts.com as both a style and a font origin -- index.html loads
 *    it with a <link rel="stylesheet">.
 *  - `'unsafe-inline'` in `style-src`, because MUI/emotion inject their styles
 *    as inline <style> elements at runtime. That weakens CSS-injection
 *    protection specifically; scripts stay locked to 'self', which is where
 *    the meaningful XSS protection is.
 */
const FONT_CDN = 'https://fonts.cdnfonts.com';

const securityHeaders = () =>
	helmet({
		contentSecurityPolicy: {
			useDefaults: false,
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: ["'self'"],
				styleSrc: ["'self'", "'unsafe-inline'", FONT_CDN],
				fontSrc: ["'self'", FONT_CDN, 'data:'],
				imgSrc: ["'self'", 'data:'],
				// The API is same-origin -- Express serves the SPA.
				connectSrc: ["'self'"],
				objectSrc: ["'none'"],
				baseUri: ["'self'"],
				formAction: ["'self'"],
				frameAncestors: ["'none'"],
			},
		},
		// helmet sends HSTS by default. It only means anything over TLS, and
		// sending it while the deployment still answers on plain HTTP pins
		// browsers to a scheme the server doesn't serve -- for a year. Opt in
		// once TLS is terminated in front.
		strictTransportSecurity: config.security.hstsEnabled
			? { maxAge: 31536000, includeSubDomains: true }
			: false,
	});

module.exports = { securityHeaders, FONT_CDN };

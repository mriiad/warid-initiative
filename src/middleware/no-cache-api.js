/**
 * Stops the browser from HTTP-caching API JSON responses.
 *
 * Express enables weak ETags by default (`app.set('etag', 'weak')` is the
 * out-of-the-box setting) -- every res.json()/res.send() call gets one, with
 * no opt-in required. Nothing here ever disabled it, so every GET endpoint
 * has been conditionally-cacheable since day one: a repeat request for the
 * same URL (React Query's refetchOnWindowFocus, a second visit to the same
 * page, ...) gets answered 304 with an empty body if the ETag still
 * matches.
 *
 * Confirmed harmless *today* by loading a real page in Chromium and reading
 * `fetch`'s/XHR's own status: the browser's HTTP cache resolves the 304
 * itself and hands JS a 200 with the cached body, both for `fetch()` and for
 * `XMLHttpRequest` (what axios's browser adapter actually issues) -- axios
 * never sees the 304 on the wire. But that's the browser's cache being
 * involved at all that's the real problem: React Query already owns
 * freshness for this app (staleTime, invalidateQueries), and a browser-level
 * HTTP cache sitting underneath it is a second, uncoordinated cache that can
 * silently serve a fully-cached response --  serving it from disk without
 * even asking the server -- for a GET React Query believes it just
 * invalidated and refetched. Disabling it here removes that whole class of
 * disagreement, not just the visible 304s.
 *
 * `Cache-Control: no-store` alone is sufficient (nothing gets stored, so
 * there's nothing to validate against on a later request); `etag: false` is
 * added for the same reason on top, since it directly removes the mechanism
 * that produces the 304 in the first place.
 */
const noCacheApi = () => (req, res, next) => {
	res.set('Cache-Control', 'no-store');
	next();
};

module.exports = { noCacheApi };

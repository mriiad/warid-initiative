/**
 * Vendor chunk grouping for the production build.
 *
 * Kept out of vite.config.ts so the grouping rules can be unit tested: getting
 * them wrong does not fail the build, it ships a bundle that throws at runtime.
 *
 * The one invariant that matters is that **every module of a package lands in
 * exactly one chunk**. When a package is split across two chunks those chunks
 * import each other, and an ES module cycle leaves one side's bindings still
 * uninitialised while the other is executing -- the page renders nothing and
 * the console shows a bare "Cannot read properties of undefined". Grouping is
 * therefore keyed off the resolved package name and never off a substring of
 * the module path.
 */

const NODE_MODULES = 'node_modules/';

/**
 * Resolve the npm package a module id belongs to, or null for first-party
 * source. Reads the *last* node_modules segment so nested and pnpm-style
 * layouts (node_modules/.pnpm/react@19/node_modules/react/index.js) resolve to
 * the package actually being bundled rather than the one hosting it.
 */
export const getPackageName = (id: string): string | null => {
	const normalized = id.replace(/\\/g, '/');
	const marker = normalized.lastIndexOf(NODE_MODULES);
	if (marker === -1) {
		return null;
	}

	const [scopeOrName, nameInScope] = normalized
		.slice(marker + NODE_MODULES.length)
		.split('/');
	if (!scopeOrName) {
		return null;
	}

	return scopeOrName.startsWith('@') && nameInScope
		? `${scopeOrName}/${nameInScope}`
		: scopeOrName;
};

/**
 * Route screens are already split via React.lazy() in App.tsx. What remained
 * oversized was the shared vendor bundle -- react, react-router, MUI/emotion,
 * framer-motion and the date libraries are all pulled in on first paint -- so
 * it is split by library group as well to keep any single chunk under the
 * 500kB warning threshold. react-phone-number-input drags in
 * libphonenumber-js's country metadata, which is sizeable enough to deserve
 * its own chunk rather than bloating the generic bucket.
 */
const CHUNK_BY_PACKAGE: Record<string, string> = {
	'framer-motion': 'vendor-motion',
	'date-fns': 'vendor-date',
	dayjs: 'vendor-date',
	'react-router': 'vendor-router',
	'react-router-dom': 'vendor-router',
	'react-phone-number-input': 'vendor-phone',
	'libphonenumber-js': 'vendor-phone',
	react: 'vendor-react',
	'react-dom': 'vendor-react',
	scheduler: 'vendor-react',
};

const CHUNK_BY_SCOPE: Record<string, string> = {
	'@mui': 'vendor-mui',
	'@emotion': 'vendor-mui',
};

/** The chunk a package belongs to. Anything unlisted shares the catch-all. */
export const getVendorChunk = (packageName: string): string => {
	const scope = packageName.split('/')[0];
	return CHUNK_BY_PACKAGE[packageName] ?? CHUNK_BY_SCOPE[scope] ?? 'vendor';
};

/** manualChunks callback: undefined leaves first-party source where it is. */
export const resolveManualChunk = (id: string): string | undefined => {
	const packageName = getPackageName(id);
	return packageName ? getVendorChunk(packageName) : undefined;
};

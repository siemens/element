/**
 * Version redirect handler for Element documentation
 *
 * This script handles redirects for standard links that don't include
 * a version prefix (v*, preview, or latest). When such URLs are detected,
 * users are automatically redirected to the /latest/ version.
 */

(function() {
  'use strict';

  const hostname = window.location.hostname;

  // This is not very robust, but should be sufficient for our needs.
  const isPagesSubpath = hostname.endsWith('github.io');

  // Only run on the main documentation site
  if (hostname !== 'element.siemens.io' && !isPagesSubpath) {
    return false;
  }

  // Don't redirect if we're already in a versioned path
  const versionedPaths = [
    '/latest/',
    '/preview/',
    '/v'  // covers /v1/, /v2/, etc.
  ];

  let exception = false;

  const fullPath = window.location.pathname;

  const pathPrefix = isPagesSubpath && fullPath.split('/').length > 2 ? fullPath.split('/')[1] : undefined;
  const path = pathPrefix ? '/' + fullPath.split('/').slice(2).join('/') : fullPath;

  for (const versionPath of versionedPaths) {
    if (path.startsWith(versionPath)) {
      exception = true;
    }
  }

  if (!exception) {
    const search = window.location.search;
    const hash = window.location.hash;

    // Construct the new URL with /latest/ prefix
    let newPath = (pathPrefix ? '/' + pathPrefix : '') + '/latest' + path;

    // Ensure we don't double up slashes
    newPath = newPath.replace(/\/+/g, '/');

    const newUrl = newPath + search + hash;

    // Use replace to avoid adding to browser history
    window.location.replace(newUrl);
  }
})();

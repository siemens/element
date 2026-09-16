/**
 * Version Selector for Siemens Element Documentation
 *
 * This script implements a version switcher that:
 * - Fetches versions.json from the root of the domain
 * - Supports absolute version URLs
 * - Preserves current page path when switching versions
 * - If that page is missing in the target version, falls back to the version
 *   root (S3/CloudFront returns 403 for missing keys)
 * - Opens the version menu on click (not hover)
 * - Gracefully degrades if versions.json is not found (no errors, just no selector)
 *
 * If versions.json is not available (404), the page loads normally without the version selector.
 * No errors are thrown to ensure documentation remains accessible.
 *
 * Based on MkDocs Material's version selector implementation
 * https://github.com/squidfunk/mkdocs-material
 */

(function () {
  'use strict';

  /**
   * Get the base URL of the site (root domain)
   */
  function getBaseURL() {
    const location = window.location;
    return `${location.protocol}//${location.host}`;
  }

  /**
   * Get current version from URL path
   * Only recognizes versions that exist in versions.json
   * Returns empty string if at root (no version in path)
   */
  function getCurrentVersion(versions) {
    const path = window.location.pathname;

    // If we don't have versions yet, try to extract from path
    if (!versions) {
      const match = path.match(/\/([^/]+)\//);
      return match ? match[1] : '';
    }

    // Check if any known version is in the path
    for (const version of versions) {
      if (version.version && path.includes(`/${version.version}/`)) {
        return version.version;
      }
    }

    // No version found in path, assume root-level version
    return '';
  }

  /**
   * Get current page path relative to version
   */
  function getCurrentPagePath(currentVersion) {
    const path = window.location.pathname;

    // If no version (root-level), return the full path
    if (!currentVersion || currentVersion === '') {
      return path.substring(1); // Remove leading slash
    }

    // Find version in path and get everything after it
    const versionIndex = path.indexOf(`/${currentVersion}/`);
    if (versionIndex !== -1) {
      return path.substring(versionIndex + currentVersion.length + 2);
    }

    return '';
  }

  /**
   * Build version URL with current page path
   * Supports versions at root (empty string), in subdirectories, or absolute URLs
   */
  function buildVersionURL(version, currentVersion, preservePath = true) {
    // If version is an absolute URL, return as-is
    if (
      version.startsWith('http://') ||
      version.startsWith('https://') ||
      version.startsWith('//')
    ) {
      return version;
    }

    const baseURL = getBaseURL();
    const pagePath = preservePath ? getCurrentPagePath(currentVersion) : '';

    // If version is empty string or "/", host at root
    if (!version || version === '/' || version === '') {
      return `${baseURL}/${pagePath}`;
    }

    return `${baseURL}/${version}/${pagePath}`;
  }

  /**
   * Restrict navigation to http(s) URLs. Rejects javascript: and other schemes
   * that could otherwise be assigned to href/location.
   */
  function toHttpHref(url) {
    try {
      const parsed = new URL(url, window.location.origin);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return `${window.location.origin}/`;
      }
      return encodeURI(parsed.href);
    } catch {
      return `${window.location.origin}/`;
    }
  }

  /**
   * True when the URL exists. Missing versioned docs objects are served as 403
   * by S3/CloudFront (not 404), so only HTTP 2xx counts as a hit.
   */
  async function urlExists(url) {
    try {
      const head = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      if (head.status !== 405 && head.status !== 501) {
        return head.ok;
      }

      const get = await fetch(url, { method: 'GET', redirect: 'follow' });
      return get.ok;
    } catch {
      return false;
    }
  }

  /**
   * Keep the current page when it exists in the target version, otherwise the
   * version root.
   */
  async function resolveExistingUrl(preferredUrl, fallbackUrl) {
    if (preferredUrl === fallbackUrl || (await urlExists(preferredUrl))) {
      return preferredUrl;
    }

    return fallbackUrl;
  }

  const pendingResolves = new WeakMap();
  const linkVersions = new WeakMap();
  const resolvedLinks = new WeakSet();

  /**
   * Point a version link at an existing page in that version.
   * Rewriting href also covers open-in-new-tab after the check completes.
   */
  function resolveVersionLink(link, currentVersion) {
    if (resolvedLinks.has(link)) {
      return Promise.resolve(link.href);
    }

    const pending = pendingResolves.get(link);
    if (pending) {
      return pending;
    }

    const version = linkVersions.get(link) ?? '';
    const preferredUrl = toHttpHref(buildVersionURL(version, currentVersion, true));
    const fallbackUrl = toHttpHref(buildVersionURL(version, currentVersion, false));
    const resolve = resolveExistingUrl(preferredUrl, fallbackUrl)
      .then(url => {
        const safeUrl = toHttpHref(url);
        link.href = safeUrl;
        resolvedLinks.add(link);
        pendingResolves.delete(link);
        return safeUrl;
      })
      .catch(() => {
        link.href = fallbackUrl;
        resolvedLinks.add(link);
        pendingResolves.delete(link);
        return fallbackUrl;
      });

    pendingResolves.set(link, resolve);
    return resolve;
  }

  /**
   * Render version selector with DOM APIs (no innerHTML).
   */
  function renderVersionSelector(versions, currentVersion) {
    const current = versions.find(v => v.version === currentVersion) || versions[0];
    const visibleVersions = versions.filter(v => !v.hidden);

    const root = document.createElement('div');
    root.className = 'md-version';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'md-version__current';
    button.setAttribute('aria-label', 'Select version');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-controls', 'md-version-list');
    button.textContent = current.title;
    root.appendChild(button);

    const list = document.createElement('ul');
    list.id = 'md-version-list';
    list.className = 'md-version__list';

    for (const version of visibleVersions) {
      const item = document.createElement('li');
      item.className = 'md-version__item';

      const link = document.createElement('a');
      link.className = 'md-version__link';
      link.href = toHttpHref(buildVersionURL(version.version, currentVersion));
      link.textContent = version.title;
      linkVersions.set(link, version.version);

      item.appendChild(link);
      list.appendChild(item);
    }

    root.appendChild(list);
    return root;
  }

  /**
   * Open/close the version menu on click (Material CSS uses hover).
   * Version links are rewritten to an existing page when the current path is
   * missing in the target version.
   */
  function bindVersionSelector(versionEl, currentVersion) {
    const button = versionEl.querySelector('.md-version__current');
    if (!button) {
      return;
    }

    const setOpen = open => {
      versionEl.classList.toggle('md-version--open', open);
      button.setAttribute('aria-expanded', String(open));
    };

    const isOpen = () => versionEl.classList.contains('md-version--open');

    button.addEventListener('click', () => {
      setOpen(!isOpen());
    });

    document.addEventListener('click', event => {
      if (isOpen() && !versionEl.contains(event.target)) {
        setOpen(false);
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && isOpen()) {
        setOpen(false);
        button.focus();
      }
    });

    const navigateToResolved = (link, openInNewTab) => {
      resolveVersionLink(link, currentVersion).then(url => {
        const safeUrl = toHttpHref(url);
        if (openInNewTab) {
          window.open(safeUrl, '_blank', 'noopener');
        } else {
          window.location.assign(safeUrl);
        }
      });
    };

    versionEl.addEventListener('click', event => {
      const link = event.target.closest('a.md-version__link');
      if (!link || event.defaultPrevented || event.button !== 0) {
        return;
      }

      // href already points at a live page; let the browser handle navigation,
      // including modifier-key / new-tab clicks.
      if (resolvedLinks.has(link)) {
        return;
      }

      event.preventDefault();
      navigateToResolved(link, event.metaKey || event.ctrlKey || event.shiftKey);
    });

    versionEl.addEventListener('auxclick', event => {
      const link = event.target.closest('a.md-version__link');
      if (!link || event.button !== 1 || resolvedLinks.has(link)) {
        return;
      }

      event.preventDefault();
      navigateToResolved(link, true);
    });

    versionEl.querySelectorAll('a.md-version__link').forEach(link => {
      if ((linkVersions.get(link) ?? '') === currentVersion) {
        resolvedLinks.add(link);
        return;
      }

      resolveVersionLink(link, currentVersion);
    });
  }

  /**
   * Initialize version selector
   */
  function initVersionSelector() {
    const baseURL = getBaseURL();
    const versionsURL = `${baseURL}/versions.json`;

    fetch(versionsURL)
      .then(response => {
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error(`Failed to fetch versions.json: ${response.status}`);
        }
        return response.json();
      })
      .then(versions => {
        if (!versions) {
          return;
        }

        if (!Array.isArray(versions) || versions.length === 0) {
          console.warn('[Version Selector] versions.json is empty or invalid');
          return;
        }

        // Get current version after we have the versions list
        const currentVersion = getCurrentVersion(versions);

        // Find the .md-header element
        const header = document.querySelector('.md-header');
        if (!header) {
          console.warn('[Version Selector] .md-header element not found');
          return;
        }

        const versionEl = renderVersionSelector(versions, currentVersion);
        const topicWrapper = document.createElement('div');
        topicWrapper.className = 'md-header__topic';
        topicWrapper.appendChild(versionEl);
        header.appendChild(topicWrapper);
        bindVersionSelector(versionEl, currentVersion);
      })
      .catch(error => {
        console.error('[Version Selector] Failed to load:', error.message);
      });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVersionSelector);
  } else {
    initVersionSelector();
  }
})();

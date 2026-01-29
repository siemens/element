/**
 * Version Selector for Siemens Element Documentation
 *
 * This script implements a version switcher that:
 * - Fetches versions.json from the root of the domain
 * - Supports absolute version URLs
 * - Preserves current page path when switching versions
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
   * Render version selector HTML
   */
  function renderVersionSelector(versions, currentVersion) {
    const current = versions.find(v => v.version === currentVersion) || versions[0];
    const visibleVersions = versions.filter(v => !v.hidden);

    const html = `<div class="md-version"><button class="md-version__current" aria-label="Select version">${current.title}</button><ul class="md-version__list">${visibleVersions.map(version => `<li class="md-version__item"><a href="${buildVersionURL(version.version, currentVersion)}" class="md-version__link">${version.title}</a></li>`).join('')}</ul></div>`;

    return html;
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

        // Create .md-header__topic wrapper with version selector inside
        const html = renderVersionSelector(versions, currentVersion);
        const topicWrapper = document.createElement('div');
        topicWrapper.className = 'md-header__topic';
        topicWrapper.innerHTML = html;

        // Append to .md-header
        header.appendChild(topicWrapper);
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

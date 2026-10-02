// Adds a "View as Markdown" button next to the existing "Edit this page" button
const addMarkdownViewButton = () => {
  const editButton = document.querySelector('a.md-content__button[rel="edit"]');
  if (!editButton) {
    return;
  }

  const match = editButton.href.match(/\/docs\/(.+)$/);
  if (!match) {
    return;
  }

  const docPath = match[1];
  const slug = docPath.replace(/\.md$/, '').replace(/(^|\/)(index|README)$/i, '');
  const suffix = slug ? `${slug}/` : '';
  const pathname = window.location.pathname;
  if (suffix && !pathname.endsWith(suffix)) {
    return;
  }

  const basePath = pathname.slice(0, pathname.length - suffix.length);

  const markdownButton = document.createElement('a');
  markdownButton.href = `${basePath}source/docs/${docPath}`;
  markdownButton.title = 'View as Markdown';
  markdownButton.className = 'md-content__button md-icon';
  markdownButton.innerHTML =
    '<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M275.33 64H128.19C110.44 64 96 78.35 96 96v320c0 17.65 14.44 32 32.19 32h255.62c17.75 0 32.19-14.35 32.19-32V203.2c0-4.28-1.71-8.38-4.75-11.38L286.58 68.62c-3-2.96-7.04-4.62-11.25-4.62M288 115.02 365.9 192H288zM383.81 416H128.19c-.07 0-.13-.01-.16-.01-.02 0-.03 0-.03.01l-.03-319.92c.04-.06.11-.08.22-.08H256v112c0 8.84 7.16 16 16 16h112l.02 191.92c-.04.06-.11.08-.22.08Z"/>' +
    '</svg>';
  editButton.insertAdjacentElement('afterend', markdownButton);
};

let didChange = false;
const isLoopback = hostname =>
  hostname === 'localhost' || hostname === '[::1]' || /^127(?:\.\d{1,3}){3}$/.test(hostname);
const getTheme = () =>
  document.body.getAttribute('data-md-color-scheme') === 'dark' ? 'dark' : 'light';
const getPreviewUrl = iframe => {
  const source = iframe.getAttribute('data-src');
  if (!source || !URL.canParse(source, document.baseURI)) {
    return;
  }

  // Resolving first allows deployed docs to use paths relative to the current page.
  const url = new URL(source, document.baseURI);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  const sameOrigin = url.origin === window.location.origin;
  const localDevelopment =
    window.location.protocol === 'http:' &&
    url.protocol === 'http:' &&
    isLoopback(window.location.hostname) &&
    isLoopback(url.hostname);
  if (!sameOrigin && !localDevelopment) {
    return;
  }

  const queryStart = url.hash.indexOf('?');
  const route = queryStart === -1 ? url.hash.slice(1) : url.hash.slice(1, queryStart);
  if (route !== '/viewer/editor') {
    return;
  }

  const parameters = new URLSearchParams(queryStart === -1 ? '' : url.hash.slice(queryStart + 1));
  parameters.set('theme', getTheme());
  url.hash = `${route}?${parameters}`;

  const previewUrl = url.href;
  if (!previewUrl.startsWith('http://') && !previewUrl.startsWith('https://')) {
    return;
  }
  return previewUrl;
};
// Components initialized in a hidden iframe can measure a 0x0 container and
// miss its first resize notification. Load previews only once their tab is visible.
// **Important:** Since MapLibre GL JS skips its first `ResizeObserver` callback and defaults its
// canvas to 400x300 (see https://github.com/maplibre/maplibre-gl-js/issues/8277).
const isRendered = iframe => !iframe.closest('[role="tabpanel"][hidden]');
const loadComponentPreviews = ({ force = false } = {}) => {
  for (const iframe of document.getElementsByClassName('component-preview')) {
    if (!isRendered(iframe) || (iframe.src && !force)) {
      continue;
    }
    const previewUrl = getPreviewUrl(iframe);
    if (!previewUrl) {
      continue;
    }
    iframe.src = previewUrl;
    iframe.style.opacity = '';
  }
};
const componentPreviewThemeObserver = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'data-md-color-scheme') {
      didChange = true;
      loadComponentPreviews({ force: true });
    }
  });
});

window.addEventListener('DOMContentLoaded', addMarkdownViewButton);

window.addEventListener('load', () => {
  componentPreviewThemeObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-md-color-scheme']
  });
  setTimeout(() => {
    if (!didChange) {
      loadComponentPreviews();
    }
  });
});

(function () {
  function changeTabs(target) {
    const parent = target.parentNode;
    const grandparent = parent.parentNode;

    // Remove all current selected tabs
    parent
      .querySelectorAll('[aria-selected="true"]')
      .forEach(t => t.setAttribute('aria-selected', false));

    // Set this tab as selected
    target.setAttribute('aria-selected', true);

    // Hide all tab panels
    grandparent.querySelectorAll('[role="tabpanel"]').forEach(p => p.setAttribute('hidden', true));

    // Show the selected panel
    const activeTab = document.getElementById(target.getAttribute('aria-controls'));
    if (!activeTab) {
      return;
    }
    activeTab.removeAttribute('hidden');

    // Previews in this panel were skipped while it was hidden, load them now
    loadComponentPreviews();

    // work around Safari layout bugs: force a re-flow
    const iframes = activeTab.querySelectorAll('iframe');
    for (const iframe of iframes) {
      iframe.style['padding-right'] = '1px';
      iframe.clientWidth;
      iframe.style['padding-right'] = null;
    }
  }

  function tabClick(event) {
    changeTabs(event.target);
  }

  // Add a click event handler to each tab
  const tabs = document.querySelectorAll('[role="tab"]');
  tabs.forEach(tab => tab.addEventListener('click', tabClick));

  function onHashChange() {
    const hash = window.location.hash;
    if (!hash) {
      return;
    }
    let element = document.getElementById(hash.substring(1));
    if (!element) {
      return;
    }

    // find the tab section
    let tabName = null;
    while (!tabName && element.parentNode && !element.classList.contains('md-content')) {
      if (element.tagName === 'SECTION' && element.getAttribute('role') === 'tabpanel') {
        tabName = element.getAttribute('id');
      }
      element = element.parentNode;
    }
    if (!tabName) {
      return;
    }

    // get the tab, select
    var tab = document.querySelector('[role="tab"][aria-controls="' + tabName + '"]');
    if (tab) {
      changeTabs(tab);
    }
  }

  window.addEventListener('hashchange', onHashChange);
  onHashChange();

  document.querySelectorAll('.collapsible-container').forEach(container => {
    const handleToggle = () => {
      if (event.target.closest('.collapsible-body') || event.target.closest('a')) return;
      const isCollapsed = container.getAttribute('data-collapsed') === 'true';
      container.setAttribute('data-collapsed', isCollapsed ? 'false' : 'true');
    };
    container.addEventListener('click', event => {
      const cellText = document.getSelection();
      if (cellText.type === 'Range') return;
      handleToggle();
    });

    const toggle = container.querySelector('.toggle-icon');

    if (toggle) {
      toggle.addEventListener('keydown', event => {
        if (event.key !== 'Enter') return;
        handleToggle();
      });
    }
  });
})();

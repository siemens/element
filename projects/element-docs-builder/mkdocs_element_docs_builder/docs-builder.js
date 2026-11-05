(function () {
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

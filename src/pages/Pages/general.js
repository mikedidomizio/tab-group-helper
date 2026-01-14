const getQueryParams = () => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  return Object.fromEntries(urlSearchParams.entries());
};

window.onload = () => {
  const params = getQueryParams();

  // Installed
  if (params.installed !== undefined) {
    document.querySelectorAll('.installed').forEach((el) => {
      el.classList.remove('installed');
    });
  }

  // New Version
  if (params.newVersion !== undefined) {
    document.querySelectorAll('.' + params.newVersion).forEach((el) => {
      el.classList.remove(params.newVersion);
    });

    document
      .querySelectorAll('.whats-new')
      .forEach((el) => el.classList.remove('whats-new'));
  }
};

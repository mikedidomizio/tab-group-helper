const getQueryParams = () => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  return Object.fromEntries(urlSearchParams.entries());
};

const currentVersion = chrome.runtime.getManifest().version;

window.onload = () => {
  const params = getQueryParams();

  if (params.installed !== undefined) {
    const installedDOMElements = document.querySelectorAll('.installed');

    for (let el of installedDOMElements) {
      el.classList.remove('installed');
    }
  }

  if (params.newVersion !== undefined) {
    document.querySelectorAll('.' + params.newVersion).forEach((el) => {
      el.classList.remove(params.newVersion);
    });

    document
      .querySelectorAll('.whats-new')
      .forEach((el) => el.classList.remove('whats-new'));
  }
};

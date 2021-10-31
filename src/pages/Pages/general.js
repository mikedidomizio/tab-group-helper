const getQueryParams = () => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  return Object.fromEntries(urlSearchParams.entries());
};

window.onload = () => {
  const params = getQueryParams();

  if (params.installed !== undefined) {
    const installedDOMElements = document.querySelectorAll('.installed');

    for (let el of installedDOMElements) {
      el.classList.remove('installed');
    }
  }
};

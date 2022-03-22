const render = (form) => (path, value) => {
  const urlInput = form.querySelector('#url-input');

  if (value === 'invalid') {
    urlInput.classList.add('is-invalid');
  }

  if (value === 'valid') {
    urlInput.classList.remove('is-invalid');
    form.reset();
    urlInput.focus();
  }
};

export default render;

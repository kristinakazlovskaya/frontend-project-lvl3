import onChange from 'on-change';

const watch = (state, form) => onChange(state, (path, value) => {
  const urlInput = form.querySelector('#url-input');

  if (form.nextElementSibling) {
    form.nextElementSibling.remove();
  }

  if (value === 'invalid') {
    urlInput.classList.add('is-invalid');

    const p = document.createElement('p');
    p.classList.add('feedback', 'm-0', 'position-absolute', 'small', 'text-danger');
    p.textContent = state.form.error;
    form.after(p);
  }

  if (value === 'valid') {
    urlInput.classList.remove('is-invalid');
    form.reset();
    urlInput.focus();
  }
});

export default watch;

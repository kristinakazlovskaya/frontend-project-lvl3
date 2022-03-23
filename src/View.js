import onChange from 'on-change';

const watch = (state, form) => onChange(state, (path, value) => {
  const urlInput = form.querySelector('#url-input');

  if (form.nextElementSibling) {
    form.nextElementSibling.remove();
  }

  const feedback = document.createElement('p');
  feedback.classList.add('feedback', 'm-0', 'position-absolute', 'small');

  if (value.length === 0) {
    urlInput.classList.remove('is-invalid');

    feedback.classList.add('text-success');
    feedback.textContent = 'RSS успешно загружен';
    form.after(feedback);

    form.reset();
    urlInput.focus();
  } else {
    urlInput.classList.add('is-invalid');

    feedback.classList.add('text-danger');
    [feedback.textContent] = state.form.errors;
    form.after(feedback);
  }
});

export default watch;

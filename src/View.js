import onChange from 'on-change';

const watch = (state, form) => onChange(state, (path, value) => {
  const urlInput = form.querySelector('#url-input');

  if (form.nextElementSibling) {
    form.nextElementSibling.remove();
  }

  const feedback = document.createElement('p');
  feedback.classList.add('feedback', 'm-0', 'position-absolute', 'small');

  if (state.form.state === 'valid') {
    urlInput.classList.remove('is-invalid');

    feedback.classList.add('text-success');

    form.reset();
    urlInput.focus();
  } else {
    urlInput.classList.add('is-invalid');

    feedback.classList.add('text-danger');
  }

  [feedback.textContent] = value;
  form.after(feedback);
});

export default watch;

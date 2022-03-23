import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

import * as yup from 'yup';
import watch from './View';

const schema = yup.string().url();

const app = () => {
  const state = {
    form: {
      feeds: [],
      state: '',
      error: '',
    },
  };

  const form = document.querySelector('form');

  const watchedState = watch(state, form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const urlInputValue = formData.get('url');

    schema.validate(urlInputValue)
      .then(() => {
        if (state.form.feeds.includes(urlInputValue)) {
          state.form.error = 'RSS уже существует';
          watchedState.form.state = 'invalid';
        } else {
          state.form.feeds.push(urlInputValue);
          watchedState.form.state = 'valid';
        }
      })
      .catch(() => {
        state.form.error = 'Ссылка должна быть валидным URL';
        watchedState.form.state = 'invalid';
      });
  });
};

app();

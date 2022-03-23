import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

import * as yup from 'yup';
import watch from './View';

const schema = yup.string().url();

const app = () => {
  const state = {
    form: {
      feeds: [],
      errors: [],
      state: '',
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
          state.form.state = 'invalid';
          watchedState.form.errors = ['RSS уже существует'];
        } else {
          state.form.state = 'valid';
          state.form.feeds.push(urlInputValue);
          watchedState.form.errors = [];
        }
      })
      .catch(() => {
        state.form.state = 'invalid';
        watchedState.form.errors = ['Ссылка должна быть валидным URL'];
      });
  });
};

app();

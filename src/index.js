import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

import * as yup from 'yup';
import onChange from 'on-change';
import render from './View';

const schema = yup.string().url();

const app = () => {
  const state = {
    form: {
      feeds: [],
      state: '',
    },
  };

  const form = document.querySelector('form');

  const watchedState = onChange(state, render(form));

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const urlInputValue = formData.get('url');

    schema.validate(urlInputValue)
      .then(() => {
        if (state.form.feeds.includes(urlInputValue)) {
          watchedState.form.state = 'invalid';
        } else {
          state.form.feeds.push(urlInputValue);
          watchedState.form.state = 'valid';
        }
      })
      .catch(() => {
        watchedState.form.state = 'invalid';
      });
  });
};

app();

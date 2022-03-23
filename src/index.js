import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

import * as yup from 'yup';
import i18next from 'i18next';
import watch from './View';

const schema = yup.string().url();

const app = () => {
  const state = {
    form: {
      feedback: [],
      state: '',
    },
    feeds: [],
  };

  const i18nInstance = i18next.createInstance();

  i18nInstance.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru: {
        translation: {
          form: {
            feedback: {
              validUrl: 'RSS успешно загружен',
              unvalidUrl: 'Ссылка должна быть валидным URL',
              existingFeed: 'RSS уже существует',
            },
          },
        },
      },
    },
  })
    .then(() => {
      const form = document.querySelector('form');

      const watchedState = watch(state, form);

      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const urlInputValue = formData.get('url');

        schema.validate(urlInputValue)
          .then(() => {
            if (state.feeds.includes(urlInputValue)) {
              state.form.state = 'invalid';
              watchedState.form.feedback = [i18nInstance.t('form.feedback.existingFeed')];
            } else {
              state.form.state = 'valid';
              state.feeds.push(urlInputValue);
              watchedState.form.feedback = [i18nInstance.t('form.feedback.validUrl')];
            }
          })
          .catch(() => {
            state.form.state = 'invalid';
            watchedState.form.feedback = [i18nInstance.t('form.feedback.unvalidUrl')];
          });
      });
    });
};

app();

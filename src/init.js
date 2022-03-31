import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import watch from './view.js';
import parseRss from './parser.js';
import { postsClickHandler, modalClickHandler } from './handlers.js';
import {
  isRss,
  getRssLink,
  processParsedRss,
  updateFeeds,
} from './utils.js';

const schema = yup.string().url();

const app = () => {
  const state = {
    form: {
      feedback: [],
      valid: true,
      processState: 'filling',
    },
    feeds: [],
    posts: [],
    openedPosts: [],
    currentPost: '',
    modalState: false,
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
              validRss: 'RSS успешно загружен',
              invalidUrl: 'Ссылка должна быть валидным URL',
              existingRss: 'RSS уже существует',
              networkError: 'Ошибка сети',
              invalidRss: 'Ресурс не содержит валидный RSS',
            },
          },
          posts: {
            postBtn: 'Просмотр',
            postsHeading: 'Посты',
          },
          feeds: {
            feedsHeading: 'Фиды',
          },
        },
      },
    },
  });

  const form = document.querySelector('form');

  const watchedState = watch(form, state, i18nInstance);

  const updateWatchedState = (key, value) => {
    watchedState[key] = value;
  };

  const posts = document.querySelector('.posts');
  posts.addEventListener('click', (e) => postsClickHandler(e, state, watchedState, updateWatchedState));

  const modal = document.querySelector('.modal');
  modal.addEventListener('click', (e) => modalClickHandler(e, updateWatchedState));

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    watchedState.form.processState = 'sending';

    const formData = new FormData(form);
    const urlInputValue = formData.get('url');
    let timer;

    schema.validate(urlInputValue)
      .then(() => {
        axios.get(getRssLink(urlInputValue))
          .then((response) => {
            if (response.status === 200) {
              watchedState.form.processState = 'sent';

              const parsedRss = parseRss(response.data.contents);
              isRss(parsedRss);
              processParsedRss(state, parsedRss, urlInputValue);

              state.form.valid = true;
              watchedState.form.feedback = [i18nInstance.t('form.feedback.validRss')];

              clearTimeout(timer);
              timer = updateFeeds(state, watchedState);
            } else {
              throw new Error('Network Error');
            }
          })
          .catch((e) => {
            state.form.valid = false;
            watchedState.form.processState = 'error';

            if (e.message === 'Network Error') {
              watchedState.form.feedback = [i18nInstance.t('form.feedback.networkError')];
            } else if (e.message === 'Invalid RSS') {
              watchedState.form.feedback = [i18nInstance.t('form.feedback.invalidRss')];
            } else if (e.message === 'Existing RSS') {
              watchedState.form.feedback = [i18nInstance.t('form.feedback.existingRss')];
            }
          });
      })
      .catch(() => {
        state.form.valid = false;
        watchedState.form.processState = 'error';
        watchedState.form.feedback = [i18nInstance.t('form.feedback.invalidUrl')];
      });
  });
};

export default app;

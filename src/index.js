import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

import * as yup from 'yup';
import i18next from 'i18next';
import uniqueId from 'lodash/uniqueId.js';
import axios from 'axios';
import watch from './View';

const schema = yup.string().url();

i18next.init({
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
        },
      },
    },
  },
});

const state = {
  form: {
    feedback: [],
    state: '',
  },
  feeds: [],
  posts: [],
};

const watchedState = watch(state);

const isUniqueFeed = (title, desc) => {
  const existingFeed = state.feeds.find((f) => f.title === title && f.description === desc);
  return !existingFeed;
};

const isRss = (dom) => {
  const rssEl = dom.querySelector('rss');

  if (rssEl === null) {
    throw new Error('Invalid RSS');
  }
};

const parseRss = (str) => new window.DOMParser().parseFromString(str, 'text/xml');

const processParsedRss = (rss) => {
  const feedTitleEl = rss.querySelector('title');
  const feedDescEl = rss.querySelector('description');
  const feedId = uniqueId();

  if (isUniqueFeed(feedTitleEl.innerHTML, feedDescEl.innerHTML)) {
    state.feeds.push({
      title: feedTitleEl.innerHTML,
      description: feedDescEl.innerHTML,
      id: feedId,
    });
  } else {
    throw new Error('Existing RSS');
  }

  const items = rss.querySelectorAll('item');

  items.forEach((item) => {
    const postTitleEl = item.querySelector('title');
    const postDescEl = item.querySelector('description');
    const postLinkEl = item.querySelector('link');

    state.posts.push({
      title: postTitleEl.innerHTML,
      description: postDescEl.innerHTML,
      link: postLinkEl.innerHTML,
      feedId,
    });
  });
};

const app = () => {
  const form = document.querySelector('form');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const urlInputValue = formData.get('url');

    schema.validate(urlInputValue)
      .then(() => {
        axios.get(`https://allorigins.hexlet.app/raw?disableCache=true&url=${urlInputValue}`)
          .then((response) => {
            if (response.status === 200) {
              return response.data;
            }

            throw new Error('Network Error');
          })
          .then((data) => parseRss(data))
          .then((parsedRss) => {
            isRss(parsedRss);
            return parsedRss;
          })
          .then((parsedRss) => processParsedRss(parsedRss))
          .then(() => {
            state.form.state = 'valid';
            watchedState.form.feedback = [i18next.t('form.feedback.validRss')];
          })
          .catch((e) => {
            state.form.state = 'invalid';

            if (e.message === 'Network Error') {
              watchedState.form.feedback = [i18next.t('form.feedback.networkError')];
            } else if (e.message === 'Invalid RSS') {
              watchedState.form.feedback = [i18next.t('form.feedback.invalidRss')];
            } else if (e.message === 'Existing RSS') {
              watchedState.form.feedback = [i18next.t('form.feedback.existingRss')];
            }
          });
      })
      .catch(() => {
        state.form.state = 'invalid';
        watchedState.form.feedback = [i18next.t('form.feedback.invalidUrl')];
      });
  });
};

app();

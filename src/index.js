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
            unvalidUrl: 'Ссылка должна быть валидным URL',
            existingRss: 'RSS уже существует',
            networkError: 'Ошибка сети',
            unvalidRss: 'Ресурс не содержит валидный RSS',
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

const parseRss = (str) => new window.DOMParser().parseFromString(str, 'text/xml');

const processParsedRss = (rss) => {
  const feedTitleEl = rss.querySelector('title');

  if (!feedTitleEl) {
    throw new Error('Unvalid RSS');
  }

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

const getRssFeed = (url) => {
  axios.get(`https://allorigins.hexlet.app/raw?disableCache=true&url=${url}`)
    .then((response) => response.data)
    .then((data) => parseRss(data))
    .catch(() => {
      state.form.state = 'unvalid';
      watchedState.form.feedback = [i18next.t('form.feedback.networkError')];
    })
    .then((parsedRss) => processParsedRss(parsedRss))
    .then(() => {
      state.form.state = 'valid';
      watchedState.form.feedback = [i18next.t('form.feedback.validRss')];
    })
    .catch((e) => {
      if (e.message === 'Existing RSS') {
        state.form.state = 'invalid';
        watchedState.form.feedback = [i18next.t('form.feedback.existingRss')];
      }

      if (e.message === 'Unvalid RSS') {
        state.form.state = 'unvalid';
        watchedState.form.feedback = [i18next.t('form.feedback.unvalidRss')];
      }
    });
};

const app = () => {
  const form = document.querySelector('form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const urlInputValue = formData.get('url');

    schema.validate(urlInputValue)
      .then(() => getRssFeed(urlInputValue))
      .catch(() => {
        state.form.state = 'invalid';
        watchedState.form.feedback = [i18next.t('form.feedback.unvalidUrl')];
      });
  });
};

app();

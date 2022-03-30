import * as yup from 'yup';
import i18next from 'i18next';
import _ from 'lodash';
import axios from 'axios';
import watch from './view';

let timer;

const schema = yup.string().url();

const isUniqueFeed = (state, title, desc) => {
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

const updateFeed = (state, watchedState) => {
  state.feeds.forEach((feed) => {
    axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(feed.url)}`)
      .then((response) => {
        const parsedRss = parseRss(response.data.contents);

        const items = parsedRss.querySelectorAll('item');
        const posts = [];

        items.forEach((item) => {
          const postTitleEl = item.querySelector('title');
          const postDescEl = item.querySelector('description');
          const postLinkEl = item.querySelector('link');

          posts.push({
            title: postTitleEl.innerHTML,
            description: postDescEl.innerHTML,
            link: postLinkEl.innerHTML,
            feedId: feed.id,
            id: _.uniqueId(),
          });
        });

        const newPosts = _.differenceBy(posts, state.posts, 'title', 'description');
        if (newPosts.length > 0) {
          watchedState.posts.unshift(...newPosts);
        }
      })
      .catch(() => console.log('Error'));
  });

  timer = setTimeout(() => updateFeed(state, watchedState), 5000);
};

const processParsedRss = (state, rss, url) => {
  const feedTitleEl = rss.querySelector('title');
  const feedDescEl = rss.querySelector('description');
  const feedId = _.uniqueId('feed_');

  if (isUniqueFeed(state, feedTitleEl.innerHTML, feedDescEl.innerHTML)) {
    state.feeds.push({
      title: feedTitleEl.innerHTML,
      description: feedDescEl.innerHTML,
      id: feedId,
      url,
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
      id: _.uniqueId(),
    });
  });
};

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
          },
        },
      },
    },
  });

  const form = document.querySelector('form');

  const watchedState = watch(form, state, i18nInstance);

  const posts = document.querySelector('.posts');

  posts.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const link = e.target.previousElementSibling;
      const postId = link.dataset.id;

      if (!state.openedPosts.includes(postId)) {
        watchedState.openedPosts.push(postId);
      }

      watchedState.modalState = true;
      watchedState.currentPost = postId;
    }
  });

  const modal = document.querySelector('.modal');
  modal.addEventListener('click', (e) => {
    if (e.target.dataset.bsDismiss === 'modal') {
      watchedState.modalState = false;
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    watchedState.form.processState = 'sending';

    const formData = new FormData(form);
    const urlInputValue = formData.get('url');

    schema.validate(urlInputValue)
      .then(() => {
        axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(urlInputValue)}`)
          .then((response) => {
            if (response.status === 200) {
              watchedState.form.processState = 'sent';
              return response.data;
            }

            throw new Error('Network Error');
          })
          .then((data) => parseRss(data.contents))
          .then((parsedRss) => {
            isRss(parsedRss);
            return parsedRss;
          })
          .then((parsedRss) => processParsedRss(state, parsedRss, urlInputValue))
          .then(() => {
            state.form.valid = true;
            watchedState.form.feedback = [i18nInstance.t('form.feedback.validRss')];
          })
          .then(() => {
            clearTimeout(timer);
            updateFeed(state, watchedState);
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

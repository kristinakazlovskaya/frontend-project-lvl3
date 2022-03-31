import _ from 'lodash';
import axios from 'axios';
import parseRss from './parser.js';

export const isUniqueFeed = (state, title, desc) => {
  const existingFeed = state.feeds.find((f) => f.title === title && f.description === desc);
  return !existingFeed;
};

export const isRss = (dom) => {
  const rssEl = dom.querySelector('rss');

  if (rssEl === null) {
    throw new Error('Invalid RSS');
  }
};

export const getRssLink = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;

export const addNewPosts = (rssString, feed, state, watchedState) => {
  const parsedRss = parseRss(rssString);

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
};

export const processParsedRss = (state, rss, url) => {
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

export const updateFeeds = (state, watchedState) => {
  state.feeds.forEach((feed) => {
    axios.get(getRssLink(feed.url))
      .then((response) => {
        addNewPosts(response.data.contents, feed, state, watchedState);
      })
      .catch(() => console.log('Error'));
  });

  return setTimeout(() => updateFeeds(state, watchedState), 5000);
};

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

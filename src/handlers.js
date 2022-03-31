export const postsClickHandler = (e, state, watchedState, updateWatchedState) => {
  if (e.target.tagName === 'BUTTON') {
    const link = e.target.previousElementSibling;
    const postId = link.dataset.id;

    if (!state.openedPosts.includes(postId)) {
      watchedState.openedPosts.push(postId);
    }

    updateWatchedState('modalState', true);
    updateWatchedState('currentPost', postId);
  }
};

export const modalClickHandler = (e, updateWatchedState) => {
  if (e.target.dataset.bsDismiss === 'modal') {
    updateWatchedState('modalState', false);
  }
};

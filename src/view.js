import onChange from 'on-change';

const renderContainer = (heading) => {
  const sectionHtml = `<div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4">${heading}</h2>
      </div>
      <ul class="list-group border-0 rounded-0"></ul>
    </div>`;

  return sectionHtml;
};

const renderPost = (state, post, i18nInstance) => {
  const postEl = document.createElement('li');
  postEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

  const postLinkEl = document.createElement('a');
  postLinkEl.href = post.link;
  postLinkEl.target = '_blank';
  postLinkEl.dataset.id = post.id;
  postLinkEl.textContent = post.title;

  if (state.openedPosts.includes(post.id)) {
    postLinkEl.classList.add('fw-normal', 'link-secondary');
  } else {
    postLinkEl.classList.add('fw-bold');
  }

  const postBtnEl = document.createElement('button');
  postBtnEl.type = 'button';
  postBtnEl.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  postBtnEl.textContent = i18nInstance.t('posts.postBtn');
  postBtnEl.dataset.bsTarget = '#modal';
  postBtnEl.dataset.bsToggle = 'modal';

  postEl.append(postLinkEl, postBtnEl);

  return postEl;
};

const renderAllPosts = (state, i18nInstance) => {
  const postsWrapper = document.querySelector('.posts');
  postsWrapper.innerHTML = '';

  if (state.posts.length === 0) {
    return;
  }

  postsWrapper.innerHTML = renderContainer(i18nInstance.t('posts.postsHeading'));

  const postsList = postsWrapper.querySelector('ul');

  state.posts.forEach((post) => {
    postsList.append(renderPost(state, post, i18nInstance));
  });
};

const renderFeed = (feed) => {
  const feedEl = document.createElement('li');
  feedEl.classList.add('list-group-item', 'border-0', 'rounded-0');

  const feedHeadingEl = document.createElement('h3');
  feedHeadingEl.classList.add('h6', 'm-0');
  feedHeadingEl.textContent = feed.title;

  const feedDescEl = document.createElement('p');
  feedDescEl.classList.add('m-0', 'small', 'text-black-50');
  feedDescEl.textContent = feed.description;

  feedEl.append(feedHeadingEl, feedDescEl);

  return feedEl;
};

const renderAllFeeds = (state, i18nInstance) => {
  const feedsWrapper = document.querySelector('.feeds');
  feedsWrapper.innerHTML = '';

  if (state.feeds.length === 0) {
    return;
  }

  feedsWrapper.innerHTML = renderContainer(i18nInstance.t('feeds.feedsHeading'));

  const feedsList = feedsWrapper.querySelector('ul');

  state.feeds.forEach((feed) => {
    feedsList.append(renderFeed(feed));
  });
};

const handleProcessState = (input, btn, processState) => {
  switch (processState) {
    case 'sent':
      input.removeAttribute('readOnly');
      btn.removeAttribute('disabled');
      break;

    case 'error':
      input.removeAttribute('readOnly');
      btn.removeAttribute('disabled');
      break;

    case 'sending':
      input.setAttribute('readOnly', true);
      btn.setAttribute('disabled', true);
      break;

    case 'filling':
      input.removeAttribute('readOnly');
      btn.removeAttribute('disabled');
      break;

    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

const watch = (form, state, i18nInstance) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.processState': {
      const urlInput = form.elements.url;
      const submitBtn = form.elements.submit;
      handleProcessState(urlInput, submitBtn, value);
      break;
    }

    case 'form.feedback': {
      const urlInput = form.elements.url;
      const existingFeedbackEl = document.querySelector('.feedback');

      if (existingFeedbackEl) {
        existingFeedbackEl.remove();
      }

      const feedbackEl = document.createElement('p');
      feedbackEl.classList.add('feedback', 'm-0', 'position-absolute', 'small');

      if (state.form.valid === true) {
        urlInput.classList.remove('is-invalid');

        feedbackEl.classList.add('text-success');

        urlInput.value = '';
        urlInput.focus();
      } else {
        urlInput.classList.add('is-invalid');

        feedbackEl.classList.add('text-danger');
      }

      [feedbackEl.textContent] = value;
      form.parentElement.append(feedbackEl);

      renderAllFeeds(state, i18nInstance);
      renderAllPosts(state, i18nInstance);
      break;
    }

    case 'posts': {
      const feedbackEl = document.querySelector('.feedback');
      [feedbackEl.textContent] = state.form.feedback;

      renderAllFeeds(state, i18nInstance);
      renderAllPosts(state, i18nInstance);
      break;
    }

    case 'openedPosts': {
      value.forEach((id) => {
        const postLinkEl = document.querySelector(`a[data-id="${id}"]`);
        postLinkEl.classList.remove('fw-bold');
        postLinkEl.classList.add('fw-normal', 'link-secondary');
      });
      break;
    }

    case 'currentPost': {
      const id = value;
      const currentPost = state.posts.find((post) => post.id === id);

      const modalTitleEl = document.querySelector('.modal-title');
      const modalBodyEl = document.querySelector('.modal-body');
      const modalLinkEl = document.querySelector('.full-article');

      modalTitleEl.textContent = currentPost.title;
      modalBodyEl.textContent = currentPost.description;
      modalLinkEl.href = currentPost.link;
      break;
    }

    case 'modalState': {
      const modal = document.querySelector('.modal');

      if (value === true) {
        modal.removeAttribute('aria-hidden');
        modal.setAttribute('aria-modal', true);
        modal.style.display = 'block';
        modal.classList.add('show');
      }

      if (value === false) {
        modal.removeAttribute('aria-modal');
        modal.setAttribute('aria-hidden', true);
        modal.classList.remove('show');
        modal.style.display = 'none';
      }
      break;
    }

    default:
      throw new Error(`Unknown path: ${path}`);
  }
});

export default watch;

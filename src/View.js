import onChange from 'on-change';

const renderSectionHtml = (heading) => {
  const sectionHtml = `<div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4">${heading}</h2>
      </div>
      <ul class="list-group border-0 rounded-0"></ul>
    </div>`;
  return sectionHtml;
};

const renderPosts = (state, i18nInstance) => {
  const postsEl = document.querySelector('.posts');
  postsEl.innerHTML = '';

  if (state.posts.length !== 0) {
    const postsHtml = renderSectionHtml('Посты');

    postsEl.innerHTML = postsHtml;

    const postsUl = postsEl.querySelector('ul');

    state.posts.forEach((post) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

      const liLink = document.createElement('a');
      liLink.href = post.link;
      liLink.target = '_blank';
      liLink.dataset.id = post.id;
      liLink.innerHTML = post.title;

      if (state.openedPosts.includes(post.id)) {
        liLink.classList.add('fw-normal', 'link-secondary');
      } else {
        liLink.classList.add('fw-bold');
      }

      const liBtn = document.createElement('button');
      liBtn.type = 'button';
      liBtn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      liBtn.innerHTML = i18nInstance.t('posts.postBtn');
      liBtn.dataset.bsTarget = '#modal';
      liBtn.dataset.bsToggle = 'modal';

      li.append(liLink, liBtn);
      postsUl.append(li);
    });
  }
};

const renderFeeds = (state) => {
  const feedsEl = document.querySelector('.feeds');
  feedsEl.innerHTML = '';

  if (state.feeds.length !== 0) {
    const feedsHtml = renderSectionHtml('Фиды');

    feedsEl.innerHTML = feedsHtml;

    const feedsUl = feedsEl.querySelector('ul');

    state.feeds.forEach((feed) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'border-0', 'rounded-0');

      const liHeading = document.createElement('h3');
      liHeading.classList.add('h6', 'm-0');
      liHeading.innerHTML = feed.title;

      const liDesc = document.createElement('p');
      liDesc.classList.add('m-0', 'small', 'text-black-50');
      liDesc.innerHTML = feed.description;

      li.append(liHeading, liDesc);
      feedsUl.append(li);
    });
  }
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
      input.setAttribute('readOnly', null);
      btn.setAttribute('disabled', null);
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
  if (path === 'form.processState') {
    const urlInput = form.elements.url;
    const btn = form.elements.submit;
    handleProcessState(urlInput, btn, value);
  }

  if (path === 'form.feedback') {
    const urlInput = form.elements.url;
    const existingFeedback = document.querySelector('.feedback');

    if (existingFeedback) {
      existingFeedback.remove();
    }

    const feedback = document.createElement('p');
    feedback.classList.add('feedback', 'm-0', 'position-absolute', 'small');

    if (state.form.valid === true) {
      urlInput.classList.remove('is-invalid');

      feedback.classList.add('text-success');

      urlInput.value = '';
      urlInput.focus();
    } else {
      urlInput.classList.add('is-invalid');

      feedback.classList.add('text-danger');
    }

    [feedback.textContent] = value;
    form.parentElement.append(feedback);

    renderFeeds(state);
    renderPosts(state, i18nInstance);
  }

  if (path === 'posts') {
    const feedback = document.querySelector('.feedback');
    [feedback.textContent] = state.form.feedback;

    renderFeeds(state);
    renderPosts(state, i18nInstance);
  }

  if (path === 'openedPosts') {
    value.forEach((id) => {
      const link = document.querySelector(`a[data-id="${id}"]`);
      link.classList.remove('fw-bold');
      link.classList.add('fw-normal', 'link-secondary');
    });
  }

  if (path === 'currentPost') {
    const id = value;
    const currentPost = state.posts.find((post) => post.id === id);

    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');
    const modalLink = document.querySelector('.full-article');
    modalTitle.textContent = currentPost.title;
    modalBody.textContent = currentPost.description;
    modalLink.href = currentPost.link;
  }

  if (path === 'modalState') {
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
  }
});

export default watch;

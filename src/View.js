import onChange from 'on-change';
import { t } from 'i18next';

const renderSectionHtml = (heading) => {
  const sectionHtml = `<div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4">${heading}</h2>
      </div>
      <ul class="list-group border-0 rounded-0"></ul>
    </div>`;
  return sectionHtml;
};

const renderPosts = (state) => {
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
      liLink.classList.add('fw-bold');
      liLink.innerHTML = post.title;

      const liBtn = document.createElement('button');
      liBtn.type = 'button';
      liBtn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      liBtn.innerHTML = t('posts.postBtn');

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

const watch = (state) => onChange(state, (path, value) => {
  const form = document.querySelector('form');
  const urlInput = form.querySelector('#url-input');
  const existingFeedback = document.querySelector('.feedback');

  const feedback = document.createElement('p');
  feedback.classList.add('feedback', 'm-0', 'position-absolute', 'small');

  if (path === 'form.feedback') {
    if (existingFeedback) {
      existingFeedback.remove();
    }

    if (state.form.state === 'valid') {
      urlInput.classList.remove('is-invalid');

      feedback.classList.add('text-success');

      form.reset();
      urlInput.focus();
    } else {
      urlInput.classList.add('is-invalid');

      feedback.classList.add('text-danger');
    }

    [feedback.textContent] = value;
    form.parentElement.append(feedback);

    renderFeeds(state);
    renderPosts(state);
  }

  if (path === 'posts') {
    [feedback.textContent] = state.form.feedback;

    renderFeeds(state);
    renderPosts(state);
  }
});

export default watch;

/* Gestion locale des brouillons : ces articles restent dans le navigateur utilisé. */
const STORAGE_KEY = 'elodie-martin-carnet-v1';
const form = document.querySelector('#article-form');
const list = document.querySelector('#article-list');
const status = document.querySelector('#editor-status');
const cancelButton = document.querySelector('#cancel-edit');
const fields = {
  id: document.querySelector('#article-id'),
  title: document.querySelector('#article-title'),
  category: document.querySelector('#article-category'),
  minutes: document.querySelector('#article-minutes'),
  summary: document.querySelector('#article-summary'),
  content: document.querySelector('#article-content')
};

function loadArticles() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(data) ? data.filter((item) => item && typeof item.title === 'string') : [];
  } catch {
    return [];
  }
}

function saveArticles(articles) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
    return true;
  } catch {
    status.textContent = 'Impossible d’enregistrer : le stockage du navigateur est indisponible ou plein.';
    return false;
  }
}

function renderArticles() {
  const articles = loadArticles();
  list.replaceChildren();
  if (!articles.length) {
    const empty = document.createElement('p');
    empty.className = 'editor-empty';
    empty.textContent = 'Aucun article enregistré pour le moment.';
    list.append(empty);
    return;
  }
  articles.forEach((article) => {
    const row = document.createElement('article');
    row.className = 'editor-item';
    const info = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = article.title;
    const meta = document.createElement('p');
    meta.textContent = `${article.category} · ${article.minutes} min`;
    info.append(title, meta);
    const actions = document.createElement('div');
    actions.className = 'editor-item-actions';
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.textContent = 'Modifier';
    edit.addEventListener('click', () => editArticle(article.id));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Supprimer';
    remove.addEventListener('click', () => deleteArticle(article.id));
    actions.append(edit, remove);
    row.append(info, actions);
    list.append(row);
  });
}

function resetForm() {
  form.reset();
  fields.id.value = '';
  fields.minutes.value = '4';
  cancelButton.hidden = true;
  document.querySelector('#form-title').textContent = 'Rédiger un article';
}

function editArticle(id) {
  const article = loadArticles().find((item) => item.id === id);
  if (!article) return;
  fields.id.value = article.id;
  fields.title.value = article.title;
  fields.category.value = article.category;
  fields.minutes.value = article.minutes;
  fields.summary.value = article.summary;
  fields.content.value = article.content;
  cancelButton.hidden = false;
  document.querySelector('#form-title').textContent = 'Modifier l’article';
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  fields.title.focus();
}

function deleteArticle(id) {
  const article = loadArticles().find((item) => item.id === id);
  if (!article || !window.confirm(`Supprimer « ${article.title} » de ce navigateur ?`)) return;
  if (saveArticles(loadArticles().filter((item) => item.id !== id))) {
    status.textContent = 'Article supprimé de ce navigateur.';
    renderArticles();
    if (fields.id.value === id) resetForm();
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const articles = loadArticles();
  const id = fields.id.value || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const article = {
    id,
    title: fields.title.value.trim(),
    category: fields.category.value,
    minutes: Number(fields.minutes.value),
    summary: fields.summary.value.trim(),
    content: fields.content.value.trim(),
    updatedAt: new Date().toISOString()
  };
  const updated = fields.id.value ? articles.map((item) => item.id === id ? article : item) : [article, ...articles];
  if (!saveArticles(updated)) return;
  status.textContent = 'Article enregistré sur cet appareil.';
  resetForm();
  renderArticles();
});

cancelButton.addEventListener('click', () => {
  resetForm();
  status.textContent = 'Modification annulée.';
});

renderArticles();

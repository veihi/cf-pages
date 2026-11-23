import { startParticles } from './particles.js';

let cleanup = () => {};
function initPage() {
  cleanup();
  document.documentElement.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  const canvas = document.getElementById('particle-canvas');
  const disposeParticles = canvas ? startParticles(canvas) : () => {};
  cleanup = () => { observer.disconnect(); disposeParticles(); };
}

document.addEventListener('click', event => {
  const filter = event.target.closest('[data-filter]');
  if (!filter) return;
  const value = filter.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(button => {
    const selected = button === filter;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  let visible = 0;
  document.querySelectorAll('.post-row[data-category]').forEach(row => {
    row.hidden = value !== 'all' && !row.dataset.category.split(' ').includes(value);
    if (!row.hidden) { visible++; row.classList.add('is-visible'); }
  });
  const empty = document.getElementById('filter-empty');
  if (empty) empty.hidden = visible > 0;
});
document.addEventListener('music:navigation', initPage);
initPage();

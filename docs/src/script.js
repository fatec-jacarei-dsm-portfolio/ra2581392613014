import { portfolioData } from './data/index.js';
import { SVG_SQL, SVG_BOOK, SVG_CHECK, SVG_CICD, SVG_EDUCATION, SVG_CERTIFICATE, SVG_EMAIL, SVG_LINKEDIN, SVG_GITHUB } from './icons.js';

const INLINE_BADGE_ICONS = {
  sql: SVG_SQL,
  book: SVG_BOOK,
  check: SVG_CHECK,
  cicd: SVG_CICD
};

function badgeIconHtml(icon) {
  return INLINE_BADGE_ICONS[icon]
    || `<img class="badge-icon" src="${icon}" alt="" aria-hidden="true" loading="lazy" />`;
}

function socialLinksHtml(contact, { icons = false } = {}) {
  const links = [
    { href: contact.github, label: 'GitHub', icon: SVG_GITHUB, external: true },
    { href: contact.linkedin, label: 'LinkedIn', icon: SVG_LINKEDIN, external: true },
    { href: `mailto:${contact.email}`, label: 'E-mail', icon: SVG_EMAIL, external: false }
  ];

  return links.map(l => {
    const target = l.external ? ' target="_blank" rel="noopener"' : '';
    const content = icons ? l.icon : l.label;
    return `<li><a href="${l.href}"${target} aria-label="${l.label}"${icons ? ` title="${l.label}"` : ''}>${content}</a></li>`;
  }).join('');
}

function renderHero(data) {
  const roleEl = document.getElementById('hero-role');
  const taglineEl = document.getElementById('hero-tagline');
  const socialsEl = document.getElementById('hero-socials');
  const avatarEl = document.querySelector('.hero-avatar');

  if (roleEl) roleEl.textContent = data.profile.title;
  if (taglineEl) taglineEl.textContent = data.profile.tagline;

  if (avatarEl) {
    if (data.profile.avatarUrl) {
      avatarEl.innerHTML = `<img class="hero-avatar-img" src="${data.profile.avatarUrl}" alt="Foto de perfil de ${data.profile.name}" />`;
    }
  }

  if (socialsEl) {
    socialsEl.innerHTML = socialLinksHtml(data.contact);
  }
}

function renderAbout(data) {
  const el = document.getElementById('about-content');
  if (!el) return;

  const aboutHtml = data.profile.about.map(p => `<p>${p}</p>`).join('');
  const objectives = data.profile.objectives;
  const objectivesHtml = objectives ? `
    <div class="card objectives-card">
      <h3 class="objectives-title">${objectives.title}</h3>
      <ul class="objectives-list" role="list">
        ${objectives.items.map(item => `<li><span class="prompt" aria-hidden="true">&rsaquo;</span> ${item}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  el.innerHTML = `
    <div class="about-text">${aboutHtml}</div>
    ${objectivesHtml}
  `;
}

function formatTags(technologies) {
  const max = 5;
  const shown = technologies.slice(0, max);
  const rest = technologies.length - max;
  let html = shown.map(t => `#${t}`).join(' ');
  if (rest > 0) html += ` <span class="tag-count">+${rest}</span>`;
  return html;
}

function renderProjectCards(container, projects) {
  container.innerHTML = projects.map(p => {
    const link = p.demoUrl || p.repoUrl || '#';
    const target = (p.demoUrl || p.repoUrl) ? ' target="_blank" rel="noopener"' : '';
    const thumb = p.imageUrl
      ? `<img class="project-card-thumb" src="${p.imageUrl}" alt="Preview de ${p.name}" loading="lazy" />`
      : `<div class="project-card-thumb-placeholder"><span>&lt;/&gt;</span></div>`;
    return `
      <a class="project-card reveal" href="${link}"${target} aria-label="Ver projeto ${p.name}">
        ${thumb}
        <div class="project-card-body">
          <h3 class="project-card-title">${p.name}</h3>
          <p class="project-card-desc">${p.description}</p>
          <hr class="project-card-divider" />
          <div class="project-card-footer">
            <span class="project-card-tags">${formatTags(p.technologies)}</span>
            <span class="project-card-arrow" aria-hidden="true">&rarr;</span>
          </div>
        </div>
      </a>`;
  }).join('');
}

function renderProjects(data) {
  const el = document.getElementById('projects-grid');
  if (!el) return;

  renderProjectCards(el, data.projects);

  const filtersEl = document.getElementById('project-filters');
  if (!filtersEl) return;

  filtersEl.addEventListener('click', e => {
    const btn = e.target.closest('.pill');
    if (!btn) return;

    filtersEl.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    const filtered = filter === 'todos'
      ? data.projects
      : data.projects.filter(p => p.category === filter);

    renderProjectCards(el, filtered);
    observeReveals();
  });
}

function renderTimeline(items, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = items.map(item => `
    <li class="timeline-item reveal">
      <span class="timeline-dot" aria-hidden="true"></span>
      <span class="timeline-period">${item.period}</span>
      <h3 class="timeline-title">${item.course}</h3>
      <p class="timeline-org">${item.institution}</p>
    </li>
  `).join('');
}

function renderSkills(data) {
  const el = document.getElementById('skills-grid');
  if (!el) return;
  el.innerHTML = Object.entries(data.skills).map(([cat, items]) => `
    <div class="reveal">
      <h3 class="skill-cat">${cat}</h3>
      <ul class="badges badges-lg" role="list">
        ${items.map(s => `<li>${badgeIconHtml(s.icon)}${s.name}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

function renderLearning(data) {
  const el = document.getElementById('learning-list');
  if (!el) return;
  el.innerHTML = data.learning.map(t =>
    `<li>${badgeIconHtml(t.icon)}${t.name}</li>`
  ).join('');
}

function renderContactInfo(data) {
  const el = document.getElementById('contact-info');
  if (!el) return;
  el.innerHTML = `
    <h3 class="contact-card-title">Vamos nos conectar</h3>
    <p class="contact-lead">${data.contact.availability}</p>
    <div class="contact-field">
      <span class="contact-label">Redes:</span>
      <ul class="contact-socials" role="list" aria-label="Redes e contato">
        ${socialLinksHtml(data.contact, { icons: true })}
      </ul>
    </div>
    <div class="contact-field">
      <span class="contact-label">Localização:</span>
      <p class="contact-location">${data.contact.address}</p>
    </div>
  `;
}

function renderFooterSocials(data) {
  const el = document.getElementById('footer-socials');
  if (!el) return;
  el.innerHTML = socialLinksHtml(data.contact);
}

let revealObserver = null;

function observeReveals() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els = document.querySelectorAll('.reveal:not(.visible)');

  if (prefersReduced || !('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
  }

  els.forEach(el => revealObserver.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  const data = portfolioData;

  renderHero(data);
  renderAbout(data);
  renderProjects(data);
  renderTimeline(data.education, 'education-timeline');
  renderTimeline(data.certifications, 'certifications-timeline');
  renderSkills(data);
  renderLearning(data);
  renderContactInfo(data);
  renderFooterSocials(data);

  const educationIcon = document.getElementById('education-icon');
  const certificationIcon = document.getElementById('certification-icon');
  if (educationIcon) educationIcon.innerHTML = SVG_EDUCATION;
  if (certificationIcon) certificationIcon.innerHTML = SVG_CERTIFICATE;

  observeReveals();

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    const closeMenu = () => {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Abrir menu de navegação');
    };

    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute(
        'aria-label',
        isOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'
      );
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        closeMenu();
        navToggle.focus();
      }
    });

    document.addEventListener('click', e => {
      if (
        navMenu.classList.contains('open') &&
        !navMenu.contains(e.target) &&
        e.target !== navToggle &&
        !navToggle.contains(e.target)
      ) {
        closeMenu();
      }
    });
  }

  /* -------- Efeito de digitação no nome -------- */
  const typedEl = document.getElementById('typed');
  const nameText = data.profile.name;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (typedEl) {
    if (prefersReduced) {
      typedEl.textContent = nameText;
    } else {
      let i = 0;
      const typeSpeed = 90;
      const type = () => {
        if (i <= nameText.length) {
          typedEl.textContent = nameText.slice(0, i);
          i++;
          setTimeout(type, typeSpeed);
        }
      };
      setTimeout(type, 400);
    }
  }

  /* -------- Destaque do link ativo conforme o scroll -------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if ('IntersectionObserver' in window) {
    const spyObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
              link.classList.toggle(
                'active',
                link.getAttribute('href') === `#${id}`
              );
            });
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach(section => spyObserver.observe(section));
  }

  const form = document.getElementById('contactForm');
  const feedback = document.getElementById('formFeedback');

  if (form && feedback) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      feedback.classList.remove('is-error', 'is-success');

      if (!form.checkValidity()) {
        feedback.textContent = '// Preencha todos os campos corretamente.';
        feedback.classList.add('is-error');
        form.reportValidity();
        return;
      }

      const nome = form.nome.value.trim();
      const email = form.email.value.trim();
      const mensagem = form.mensagem.value.trim();

      const subject = `Mensagem do portfólio — ${nome}`;
      const body = `Nome: ${nome}\nE-mail: ${email}\n\n${mensagem}`;
      const mailtoUrl =
        `mailto:${data.contact.email}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;

      feedback.textContent = `// Abrindo seu aplicativo de e-mail, ${nome}...`;
      feedback.classList.add('is-success');
      window.location.href = mailtoUrl;
      form.reset();
    });
  }
});

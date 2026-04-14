/**
 * VocalSwap — App Entry Point
 * Inicializa a aplicação, gerencia tabs e projetos
 */

'use strict';

/* ─────────────────────────────────────────
   NAVIGATION / TABS
   ───────────────────────────────────────── */

/**
 * Troca a tab ativa
 * @param {string} tabName - 'studio' | 'library' | 'projects'
 */
function switchTab(tabName) {
  // Atualiza botões nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    const isActive = btn.dataset.tab === tabName;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // Atualiza painéis
  document.querySelectorAll('.tab-panel').forEach(panel => {
    const isActive = panel.id === `tab-${tabName}`;
    panel.classList.toggle('active', isActive);
  });

  // Ações específicas ao trocar de tab
  if (tabName === 'library') {
    _renderLibraryPage();
  } else if (tabName === 'projects') {
    _loadProjectsPage();
  }
}

/* ─────────────────────────────────────────
   PROJECTS PAGE
   ───────────────────────────────────────── */

async function _loadProjectsPage() {
  const listEl = document.getElementById('projects-list');
  const emptyEl = document.getElementById('empty-projects');
  if (!listEl) return;

  listEl.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;padding:16px;color:var(--text-muted)">
      <i class="fa-solid fa-spinner fa-spin"></i> Carregando projetos...
    </div>
  `;

  try {
    const res = await fetchRecords('conversion_projects', { limit: 100, sort: 'created_at' });
    const projects = (res?.data || []).reverse(); // mais recentes primeiro

    if (projects.length === 0) {
      listEl.innerHTML = '';
      show(emptyEl);
      return;
    }

    hide(emptyEl);
    listEl.innerHTML = projects.map(p => _renderProjectItem(p)).join('');

    listEl.querySelectorAll('.project-item').forEach(item => {
      item.addEventListener('click', () => {
        // Futuramente: abrir projeto e restaurar estado
        showToast('Restauração de projetos será disponível na próxima versão.', 'info');
      });
    });

    listEl.querySelectorAll('.project-delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (confirm('Excluir este projeto?')) {
          try {
            await deleteRecord('conversion_projects', id);
            _loadProjectsPage();
            showToast('Projeto excluído.', 'info');
          } catch {
            showToast('Erro ao excluir projeto.', 'error');
          }
        }
      });
    });
  } catch (err) {
    console.error('Erro ao carregar projetos:', err);
    listEl.innerHTML = '<p style="padding:16px;color:var(--text-muted)">Erro ao carregar projetos.</p>';
  }
}

function _renderProjectItem(project) {
  const statusMap = {
    pending:           { label: 'Pendente',    class: 'processing' },
    separating_stems:  { label: 'Separando',   class: 'processing' },
    converting_voice:  { label: 'Convertendo', class: 'processing' },
    mixing:            { label: 'Mixando',     class: 'processing' },
    completed:         { label: 'Concluído',   class: 'completed' },
    error:             { label: 'Erro',        class: 'error' },
  };
  const statusInfo = statusMap[project.status] || statusMap.pending;

  const icons = {
    completed: 'fa-circle-check',
    processing: 'fa-spinner fa-spin',
    error: 'fa-circle-xmark',
  };
  const statusIcon = icons[statusInfo.class] || 'fa-circle';

  const voiceName = project.selected_voice_id
    ? LibraryState.voices.find(v => v.id === project.selected_voice_id)?.name || 'Voz desconhecida'
    : 'Voz de upload';

  return `
    <article class="project-item" role="listitem" aria-label="Projeto: ${escapeHtml(project.project_name)}">
      <div class="project-icon">
        <i class="fa-solid fa-music"></i>
      </div>
      <div class="project-info">
        <div class="project-name">${escapeHtml(project.project_name || 'Projeto sem nome')}</div>
        <div class="project-meta">
          <i class="fa-solid fa-file-audio"></i> ${escapeHtml(project.music_filename || '—')} &nbsp;·&nbsp;
          <i class="fa-solid fa-microphone"></i> ${escapeHtml(voiceName)} &nbsp;·&nbsp;
          <i class="fa-regular fa-calendar"></i> ${formatDate(project.created_at)}
        </div>
      </div>
      <div class="project-status ${statusInfo.class}">
        <i class="fa-solid ${statusIcon}"></i> ${statusInfo.label}
      </div>
      <div class="project-actions">
        <button class="btn-icon project-delete-btn" data-id="${project.id}" title="Excluir projeto" aria-label="Excluir projeto ${escapeHtml(project.project_name)}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </article>
  `;
}

/* ─────────────────────────────────────────
   QUICK ADD VOICE (buttons redirecting to studio)
   ───────────────────────────────────────── */

function _bindQuickActions() {
  // Botão "Adicionar Voz" e variantes
  document.getElementById('new-project-page-btn')?.addEventListener('click', () => {
    switchTab('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.getElementById('empty-new-project-btn')?.addEventListener('click', () => {
    switchTab('studio');
  });
}

/* ─────────────────────────────────────────
   MAIN INIT
   ───────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', async () => {
  // Tema
  initThemeToggle();

  // Nav tabs
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Quick actions
  _bindQuickActions();

  // Inicializa módulos
  initStudio();
  await initLibrary();

  // Small welcome toast
  setTimeout(() => {
    showToast('VocalSwap pronto! Faça upload de uma música para começar.', 'info', 4000);
  }, 800);
});

/* ─────────────────────────────────────────
   CSS inline helper para summary
   ───────────────────────────────────────── */
// Adiciona classe de cor de sucesso
(function addGreenClass() {
  const style = document.createElement('style');
  style.textContent = `.text-green { color: var(--color-success) !important; }`;
  document.head.appendChild(style);
})();

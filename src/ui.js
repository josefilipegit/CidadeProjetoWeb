/**
 * ui.js — CIDADE DO FRONT-END 2077
 *
 * Responsabilidades:
 *   - Atualizar o HUD (coordenadas, localização, FPS)
 *   - Desenhar o mini-mapa no canvas 2D
 *   - Abrir/fechar o painel holograma com conteúdo pedagógico
 *   - Renderizar seções de conteúdo dinamicamente (HTML gerado por JS)
 *
 * Não importa de interactions.js — evita dependência circular.
 * closeHologram() é exposto via window em interactions.js.
 *
 * Módulos que dependem deste: interactions.js, main.js
 */

import { getPlayerPosition } from './player.js';

// ─── Contexto do mini-mapa ───────────────────────────────────────────────────
let _mapCtx    = null;
const MAP_W    = 160;          // Largura do canvas do minimap
const MAP_H    = 160;          // Altura do canvas do minimap
const MAP_SCALE = 0.42;        // Fator de escala: unidades 3D → pixels

// ─── FPS tracking ────────────────────────────────────────────────────────────
let _fpsFrames   = 0;
let _fpsLastTime = 0;

// ─── Dados de localização por área ──────────────────────────────────────────
// Usado para exibir o nome da zona atual no HUD.
const AREAS = [
  { name: 'HTML TOWER',            x: -40, z: -20, r: 22 },
  { name: 'CSS LAB',               x:  40, z: -20, r: 22 },
  { name: 'JS ARENA',              x: -40, z:  32, r: 22 },
  { name: 'BOOTSTRAP DISTRICT',    x:  42, z:  32, r: 24 },
  { name: 'ACCESSIBILITY CENTER',  x:   0, z:  58, r: 26 },
  { name: 'PORTAL DE ENTRADA',     x:   0, z: -72, r: 20 },
];

// ─── Dados dos prédios no mini-mapa ─────────────────────────────────────────
const MAP_BUILDINGS = [
  { label: 'HTML',   x: -40, z: -20, color: '#0088ff', r: 6  },
  { label: 'CSS',    x:  40, z: -20, color: '#cc00ff', r: 6  },
  { label: 'JS',     x: -40, z:  32, color: '#ffcc00', r: 6  },
  { label: 'BS',     x:  42, z:  32, color: '#8833ff', r: 6  },
  { label: 'A11Y',   x:   0, z:  58, color: '#00ff88', r: 6  },
  { label: 'PORTAL', x:   0, z: -72, color: '#00ccff', r: 5  },
  { label: '◈',      x:   0, z:   0, color: '#ff44aa', r: 4  }, // Praça
];

// ============================================================
// INICIALIZAÇÃO
// ============================================================

/**
 * Inicializa o subsistema de UI.
 * Obtém o contexto do canvas do mini-mapa.
 *
 * Deve ser chamado uma única vez em main.js após initCamera().
 */
export function initUI() {
  const minimapCanvas = document.getElementById('minimap');
  _mapCtx = minimapCanvas.getContext('2d');

  // Configura suavização (off para visual pixelado/retro)
  _mapCtx.imageSmoothingEnabled = false;
}

// ============================================================
// UPDATE — chamado no game loop
// ============================================================

/**
 * Atualiza todos os elementos do HUD a cada frame.
 *
 * @param {number} time     - Tempo elapsed (THREE.Clock.getElapsedTime)
 * @param {number} rawDelta - Delta bruto do frame (para cálculo de FPS)
 */
export function updateHUD(time, rawDelta) {
  const pos = getPlayerPosition();

  // Coordenadas do jogador
  document.getElementById('coord-x').textContent = pos.x.toFixed(1);
  document.getElementById('coord-z').textContent = pos.z.toFixed(1);

  // Nome da área atual
  _updateLocationName(pos);

  // Mini-mapa
  _drawMinimap(pos);

  // FPS counter
  _updateFPS(time);
}

// ============================================================
// LOCALIZAÇÃO
// ============================================================

/**
 * Determina em qual área da cidade o jogador se encontra
 * e atualiza o display no HUD.
 *
 * @param {THREE.Vector3} pos
 */
function _updateLocationName(pos) {
  let name = 'PRAÇA CENTRAL';

  for (const area of AREAS) {
    const dx = pos.x - area.x;
    const dz = pos.z - area.z;
    if (dx * dx + dz * dz < area.r * area.r) {
      name = area.name;
      break;
    }
  }

  const el = document.getElementById('hud-location');
  if (el.textContent !== name) el.textContent = name;
}

// ============================================================
// MINI-MAPA
// ============================================================

/**
 * Desenha o mini-mapa no canvas 2D.
 * Mostra: fundo escuro, grid, prédios marcados, posição do jogador.
 *
 * @param {THREE.Vector3} playerPos
 */
function _drawMinimap(playerPos) {
  if (!_mapCtx) return;

  const ctx   = _mapCtx;
  const cx    = MAP_W / 2; // Centro do canvas
  const cy    = MAP_H / 2;

  ctx.clearRect(0, 0, MAP_W, MAP_H);

  // ── Fundo ────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(0, 3, 15, 0.92)';
  ctx.fillRect(0, 0, MAP_W, MAP_H);

  // ── Grade de referência ───────────────────────────────────
  ctx.strokeStyle = 'rgba(0, 40, 100, 0.25)';
  ctx.lineWidth   = 0.5;
  for (let i = 0; i < MAP_W; i += 16) {
    ctx.beginPath(); ctx.moveTo(i, 0);    ctx.lineTo(i, MAP_H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i);    ctx.lineTo(MAP_W, i); ctx.stroke();
  }

  // ── Prédios ───────────────────────────────────────────────
  MAP_BUILDINGS.forEach(b => {
    const mx = cx + b.x * MAP_SCALE;
    const my = cy + b.z * MAP_SCALE;

    // Ponto do prédio
    ctx.beginPath();
    ctx.arc(mx, my, b.r, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.fill();

    // Halo
    ctx.beginPath();
    ctx.arc(mx, my, b.r + 3, 0, Math.PI * 2);
    ctx.strokeStyle = b.color;
    ctx.globalAlpha = 0.25;
    ctx.lineWidth   = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Label
    ctx.fillStyle  = 'rgba(255, 255, 255, 0.8)';
    ctx.font       = '7px monospace';
    ctx.textAlign  = 'center';
    ctx.fillText(b.label, mx, my - b.r - 3);
  });

  // ── Jogador ───────────────────────────────────────────────
  const px = cx + playerPos.x * MAP_SCALE;
  const py = cy + playerPos.z * MAP_SCALE;

  // Halo branco
  ctx.beginPath();
  ctx.arc(px, py, 7, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth   = 2;
  ctx.stroke();

  // Ponto branco
  ctx.beginPath();
  ctx.arc(px, py, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // ── Borda do mapa ─────────────────────────────────────────
  ctx.strokeStyle = 'rgba(0, 100, 200, 0.4)';
  ctx.lineWidth   = 1;
  ctx.strokeRect(0.5, 0.5, MAP_W - 1, MAP_H - 1);
}

// ============================================================
// FPS COUNTER
// ============================================================

/**
 * Calcula e exibe o FPS real (média de 1 segundo).
 *
 * @param {number} time - Tempo elapsed
 */
function _updateFPS(time) {
  _fpsFrames++;

  if (time - _fpsLastTime >= 1.0) {
    document.getElementById('fps-counter').textContent = _fpsFrames;
    _fpsFrames   = 0;
    _fpsLastTime = time;
  }
}

// ============================================================
// PAINEL HOLOGRAMA
// ============================================================

/**
 * Abre o painel holograma com o conteúdo pedagógico de um prédio.
 *
 * @param {Object} content - Objeto com title, subtitle, color, icon, sections[]
 */
export function openHologram(content) {
  const panel    = document.getElementById('hologram-panel');
  const titleEl  = document.getElementById('hologram-title');
  const subEl    = document.getElementById('hologram-subtitle');
  const iconEl   = document.getElementById('hologram-icon');
  const contentEl = document.getElementById('hologram-content');
  const progressEl = document.getElementById('hologram-progress');

  // Preenche os dados do cabeçalho
  titleEl.textContent  = content.title    || '';
  subEl.innerHTML      = content.subtitle || '';
  iconEl.textContent   = content.icon     || '⬡';
  progressEl.textContent = `${(content.sections || []).length} TÓPICOS`;

  // Aplica a cor temática do prédio via CSS custom property
  const color = content.color || '#00f5ff';
  panel.style.setProperty('--hologram-color', color);

  // Renderiza as seções pedagógicas
  contentEl.innerHTML = _renderSections(content.sections || []);

  // Torna o painel visível
  panel.classList.remove('hidden');

  // Foca o conteúdo para acessibilidade por teclado
  setTimeout(() => {
    document.getElementById('hologram-close').focus();
  }, 100);
}

/**
 * Gera o HTML das seções pedagógicas do holograma.
 *
 * @param {Array} sections - Array de { tag, label, desc, example? }
 * @returns {string} HTML string
 */
function _renderSections(sections) {
  if (!sections.length) return '<p style="color:#6080a0">Sem conteúdo.</p>';

  return sections.map((s, i) => `
    <div class="holo-section" style="animation-delay: ${i * 0.08}s">
      <div class="holo-section-header">
        <code class="holo-tag">${s.tag}</code>
        <span class="holo-label">${s.label}</span>
      </div>
      <p class="holo-desc">${s.desc}</p>
      ${s.example ? `
        <div class="holo-code">
          <div class="holo-code-header">
            <span>exemplo</span>
            <span class="holo-code-lang">code</span>
          </div>
          <pre><code>${s.example}</code></pre>
        </div>
      ` : ''}
    </div>
  `).join('');
}

/**
 * Fecha o painel holograma com animação de saída.
 * Chamado por interactions.js via closeHologram().
 */
export function closeHologramUI() {
  const panel = document.getElementById('hologram-panel');
  if (panel.classList.contains('hidden')) return;

  // Adiciona animação de saída
  panel.style.animation = 'hologramClose 0.3s ease forwards';

  setTimeout(() => {
    panel.classList.add('hidden');
    panel.style.animation = ''; // Reseta para próxima abertura
  }, 300);
}

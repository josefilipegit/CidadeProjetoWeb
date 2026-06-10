/**
 * interactions.js — CIDADE DO FRONT-END 2077
 *
 * Responsabilidades:
 *   - Verificar a cada frame se o jogador está próximo de um prédio
 *   - Exibir o prompt "Pressione E" quando próximo
 *   - Ao pressionar E: abrir o holograma (openHologram de ui.js)
 *   - Ao pressionar E novamente (ou ESC): fechar o holograma
 *   - Gerenciar o estado isHologramOpen para não conflitar com o player
 *
 * Distância de interação: INTERACTION_DISTANCE (unidades Three.js)
 * Evita import circular: ui.js NÃO importa de interactions.js
 *
 * Módulos que dependem deste: main.js
 */

import { getPlayerPosition } from './player.js';
import { buildings }         from './buildings.js';
import { openHologram, closeHologramUI } from './ui.js';
import { unlockPointer }     from './camera.js';

// ─── Configuração ────────────────────────────────────────────────────────────
const INTERACTION_DISTANCE = 20; // Unidades Three.js

// ─── Estado das interações ───────────────────────────────────────────────────
let _nearestBuilding = null; // Prédio mais próximo (ou null)
let _isHologramOpen  = false; // Se o painel está aberto

// ============================================================
// INICIALIZAÇÃO
// ============================================================

/**
 * Registra listeners de teclado para interação (tecla E e ESC).
 * Expõe closeHologram globalmente para o botão HTML poder chamar.
 *
 * Deve ser chamado uma única vez em main.js.
 */
export function initInteractions() {
  document.addEventListener('keydown', _onKeyDown);

  // Expõe globalmente para o onclick="window.closeHologram()" do HTML
  window.closeHologram = closeHologram;
}

// ============================================================
// INPUT
// ============================================================

/**
 * Trata teclas de interação:
 *  - E: abre/fecha holograma
 *  - ESC: fecha holograma (se aberto)
 */
function _onKeyDown(e) {
  if (e.key.toLowerCase() === 'e') {
    if (!_isHologramOpen && _nearestBuilding) {
      // Abre o holograma do prédio mais próximo
      _openHologramFor(_nearestBuilding);
    } else if (_isHologramOpen) {
      // Fecha com E também (toggle)
      closeHologram();
    }
  }

  // ESC também fecha (além de desativar o pointer lock)
  if (e.key === 'Escape' && _isHologramOpen) {
    closeHologram();
  }
}

// ============================================================
// UPDATE — chamado no game loop
// ============================================================

/**
 * Atualiza a detecção de proximidade com prédios.
 * Deve ser chamado a cada frame em main.js.
 *
 * Algoritmo:
 *  1. Se o holograma estiver aberto, ignora (evita tremulação do UI)
 *  2. Calcula distância 2D (XZ) até cada prédio
 *  3. Atualiza _nearestBuilding
 *  4. Mostra/esconde o prompt de interação
 */
export function updateInteractions() {
  if (_isHologramOpen) return;

  const pos = getPlayerPosition();
  let closest     = null;
  let closestDist = Infinity;

  buildings.forEach(building => {
    const dx   = pos.x - building.position.x;
    const dz   = pos.z - building.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < INTERACTION_DISTANCE && dist < closestDist) {
      closest     = building;
      closestDist = dist;
    }
  });

  // Atualiza apenas se houve mudança (evita DOM updates desnecessários)
  if (closest !== _nearestBuilding) {
    _nearestBuilding = closest;
    _updatePromptUI(_nearestBuilding);
  }
}

// ============================================================
// LÓGICA DE INTERAÇÃO
// ============================================================

/**
 * Abre o painel holograma para um prédio específico.
 *
 * @param {Building} building
 */
function _openHologramFor(building) {
  _isHologramOpen = true;

  // Esconde o prompt durante o holograma
  document.getElementById('interaction-prompt').classList.add('hidden');

  // Chama ui.js para renderizar o conteúdo
  openHologram(building.content);

  // Libera o pointer lock para o usuário poder rolar/clicar no painel
  unlockPointer();
}

/**
 * Fecha o painel holograma e retorna ao estado de jogo.
 * Exportada e também disponível como window.closeHologram.
 */
export function closeHologram() {
  if (!_isHologramOpen) return;

  _isHologramOpen = false;

  // Fecha a UI com animação (via ui.js)
  closeHologramUI();

  // Restaura o prompt se o jogador ainda estiver perto de um prédio
  _updatePromptUI(_nearestBuilding);
}

// ============================================================
// UI DO PROMPT
// ============================================================

/**
 * Mostra ou esconde o prompt de interação com base no prédio próximo.
 *
 * @param {Building|null} building
 */
function _updatePromptUI(building) {
  const prompt  = document.getElementById('interaction-prompt');
  const nameEl  = document.getElementById('prompt-building-name');

  if (building) {
    nameEl.textContent = building.name;
    prompt.classList.remove('hidden');
  } else {
    prompt.classList.add('hidden');
  }
}

// ============================================================
// GETTERS PÚBLICOS
// ============================================================

/**
 * Indica se o holograma está aberto.
 * Usado por camera.js para não disputar o lock com o UI.
 *
 * @returns {boolean}
 */
export function getHologramState() {
  return _isHologramOpen;
}

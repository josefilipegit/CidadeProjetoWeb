/**
 * main.js — CIDADE DO FRONT-END 2077
 *
 * Ponto de entrada e orquestrador do jogo.
 *
 * Responsabilidades:
 *   - Inicializar todos os módulos na ordem correta
 *   - Executar o game loop (requestAnimationFrame)
 *   - Expor funções globais para os botões HTML (startGame, resumeGame)
 *   - Gerenciar o listener de resize da janela
 *
 * Ordem de inicialização (importante — há dependências):
 *   1. initRenderer()        → cria o WebGLRenderer
 *   2. createScene()         → cria a cena (luzes, chão, céu)
 *   3. initCamera(scene)     → cria câmera + PointerLockControls
 *   4. initBuildings()       → instancia prédios (usa `scene`)
 *   5. setBuildings()        → passa colisores ao player
 *   6. initPlayer()          → registra listeners de teclado
 *   7. initInteractions()    → registra listener tecla E
 *   8. initUI()              → obtém contexto do minimap
 *   9. animate()             → inicia o loop
 *
 * Módulos importados: scene, camera, player, buildings, interactions, ui
 */

import * as THREE from 'three';

// ── Módulos da engine do jogo ────────────────────────────────
import {
  initRenderer,
  createScene,
  animateParticles,
  onWindowResize,
  renderer,
  scene,
  clock,
} from './scene.js';

import {
  initCamera,
  camera,
} from './camera.js';

import {
  initPlayer,
  updatePlayer,
  setBuildings,
} from './player.js';

import {
  initBuildings,
  animateBuildings,
} from './buildings.js';

import {
  initInteractions,
  updateInteractions,
} from './interactions.js';

import {
  initUI,
  updateHUD,
} from './ui.js';

// ─── Estado global do jogo ───────────────────────────────────
let _gameStarted = false; // True após o jogador clicar em "Iniciar"

// ============================================================
// FUNÇÕES GLOBAIS (chamadas pelos botões HTML via onclick)
// ============================================================

/**
 * Inicia o jogo — chamada pelo botão "INICIAR EXPLORAÇÃO".
 * Esconde a tela de início e exibe o HUD.
 */
window.startGame = function () {
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');

  _gameStarted = true;

  // Aguarda um frame antes de solicitar o pointer lock
  // (evita bloqueio de popup em alguns browsers)
  requestAnimationFrame(() => {
    document.getElementById('game-canvas').dispatchEvent(new MouseEvent('click'));
  });
};

/**
 * Retoma o jogo após a pausa.
 * Chamada pelo botão "▶ CONTINUAR" na tela de pausa.
 */
window.resumeGame = function () {
  document.getElementById('pause-screen').classList.add('hidden');
  // O click no canvas recaptura o pointer lock automaticamente
  document.getElementById('game-canvas').dispatchEvent(new MouseEvent('click'));
};

// ============================================================
// INICIALIZAÇÃO
// ============================================================

/**
 * Inicializa toda a engine do jogo.
 * Assíncrono para permitir futuras extensões (carregamento de assets, etc.)
 */
async function init() {
  // 1. Renderer — deve ser o primeiro (cria o WebGLRenderer no canvas)
  initRenderer();

  // 2. Cena — luzes, chão, céu, fog, partículas, decorações
  const sceneObj = createScene();

  // 3. Câmera — PerspectiveCamera + PointerLockControls
  //    initCamera precisa da cena para adicionar o yaw object
  initCamera(sceneObj);

  // 4. Prédios — dependem de `scene` (importado via live binding de scene.js)
  const { buildingColliders } = initBuildings();

  // 5. Passa os colisores para o módulo player ANTES de initPlayer
  setBuildings(buildingColliders);

  // 6. Player — registra listeners de teclado
  initPlayer();

  // 7. Interações — registra listener da tecla E e expõe window.closeHologram
  initInteractions();

  // 8. UI — obtém contexto do canvas do mini-mapa
  initUI();

  // 9. Listener de resize da janela
  window.addEventListener('resize', () => onWindowResize(camera));

  // 10. Inicia o game loop
  _animate();
}

// ============================================================
// GAME LOOP
// ============================================================

/**
 * Loop principal — executado via requestAnimationFrame (~60 FPS).
 *
 * Ordem de atualização por frame:
 *  1. Calcula delta e tempo total
 *  2. Atualiza movimento do jogador (WASD)
 *  3. Verifica interações com prédios
 *  4. Anima os prédios (efeitos neon, rotações)
 *  5. Anima partículas (chuva de dados)
 *  6. Atualiza o HUD (coords, mapa, FPS)
 *  7. Renderiza a cena
 */
function _animate() {
  requestAnimationFrame(_animate);

  // Não atualiza antes do jogo iniciar
  if (!_gameStarted) {
    // Renderiza ao menos uma vez para mostrar a cena por trás da tela de início
    renderer.render(scene, camera);
    return;
  }

  // ── Delta time (framerate independent) ───────────────────
  const delta = clock.getDelta();
  const time  = clock.getElapsedTime();

  // Limita delta a 0.1s para evitar saltos em caso de frame drop
  const safeDelta = Math.min(delta, 0.1);

  // ── Atualizações ──────────────────────────────────────────
  updatePlayer(safeDelta);
  updateInteractions();
  animateBuildings(time);
  animateParticles();
  updateHUD(time, delta);

  // ── Renderização ──────────────────────────────────────────
  renderer.render(scene, camera);
}

// ============================================================
// BOOTSTRAP — Inicia tudo ao carregar o módulo
// ============================================================

init().catch(err => {
  console.error('[CIDADE DO FRONT-END 2077] Erro de inicialização:', err);
});

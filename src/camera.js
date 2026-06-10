/**
 * camera.js — CIDADE DO FRONT-END 2077
 *
 * Responsabilidades:
 *   - Criar a PerspectiveCamera em primeira pessoa
 *   - Gerenciar PointerLockControls (captura do mouse)
 *   - Callback de lock/unlock para integração com UI
 *   - Expor getters para posição e estado do lock
 *
 * Dependências externas: three/addons/controls/PointerLockControls.js
 * Módulos que dependem deste: player.js, main.js
 */

import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// ─── Referências exportadas ──────────────────────────────────────────────────
export let camera;
export let controls;

// ─── Callbacks registráveis externamente ─────────────────────────────────────
// Permitem que main.js reaja aos eventos de lock/unlock sem acoplamento circular.
let _onLockCallback   = null;
let _onUnlockCallback = null;

// ============================================================
// INICIALIZAÇÃO
// ============================================================

/**
 * Inicializa a câmera em primeira pessoa e os controles de pointer lock.
 *
 * @param {THREE.Scene} scene - Cena onde a câmera será adicionada
 * @returns {{ camera: THREE.PerspectiveCamera, controls: PointerLockControls }}
 */
export function initCamera(scene) {
  // ── Câmera perspectiva ───────────────────────────────────
  // FOV: 75° — valor padrão de jogos FPS
  // Near: 0.1 — corte próximo (evita z-fighting)
  // Far: 500 — distância máxima de render
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );

  // Posição inicial: na entrada da cidade, olhando para o centro
  // Y = 1.7 simula a altura dos olhos humanos (em metros/unidades)
  camera.position.set(0, 1.7, -58);

  // ── PointerLockControls ──────────────────────────────────
  // Captura o ponteiro do mouse e usa os movimentos para rotacionar a câmera.
  // O objeto retornado por getObject() é o "yaw object" que contém a câmera.
  controls = new PointerLockControls(camera, document.body);
  scene.add(controls.getObject());

  // ── Listeners ────────────────────────────────────────────
  controls.addEventListener('lock',   _handleLock);
  controls.addEventListener('unlock', _handleUnlock);

  // Click no canvas ativa o pointer lock (quando o jogo estiver ativo)
  document.getElementById('game-canvas').addEventListener('click', _requestLock);

  return { camera, controls };
}

// ============================================================
// EVENT HANDLERS
// ============================================================

/**
 * Chamado quando o pointer lock é ATIVADO com sucesso.
 * Esconde a tela de pausa e notifica o callback externo.
 */
function _handleLock() {
  document.getElementById('pause-screen').classList.add('hidden');
  if (_onLockCallback) _onLockCallback();
}

/**
 * Chamado quando o pointer lock é DESATIVADO (ESC pressionado).
 * Só mostra a pausa se o holograma não estiver aberto.
 */
function _handleUnlock() {
  const hologram = document.getElementById('hologram-panel');
  if (hologram.classList.contains('hidden')) {
    document.getElementById('pause-screen').classList.remove('hidden');
  }
  if (_onUnlockCallback) _onUnlockCallback();
}

/**
 * Solicita captura do mouse ao clicar no canvas.
 * Só ativa se o HUD estiver visível (jogo em andamento)
 * e se não estiver clicando em um elemento de UI.
 *
 * @param {MouseEvent} event
 */
function _requestLock(event) {
  // Não captura se estiver clicando em painel de UI
  if (event.target.closest('#hologram-panel')  ||
      event.target.closest('#start-screen')    ||
      event.target.closest('#pause-screen')) {
    return;
  }

  const hud = document.getElementById('hud');
  if (!hud.classList.contains('hidden') && !controls.isLocked) {
    controls.lock();
  }
}

// ============================================================
// API PÚBLICA
// ============================================================

/**
 * Retorna o objeto de câmera (yaw object) do PointerLockControls.
 * É este objeto que deve ser movido para mover o jogador — a câmera
 * é filho deste objeto e gira independentemente no eixo Y (pitch).
 *
 * @returns {THREE.Object3D}
 */
export function getCameraObject() {
  return controls.getObject();
}

/**
 * Indica se o pointer lock está ativo.
 * Quando false, o mouse está solto (menu/pause/holograma).
 *
 * @returns {boolean}
 */
export function isLocked() {
  return controls.isLocked;
}

/**
 * Registra callbacks para os eventos de lock/unlock.
 * Evita import circular — main.js registra aqui em vez de ouvir events direto.
 *
 * @param {Function} onLock   - Chamado quando o pointer lock é ativado
 * @param {Function} onUnlock - Chamado quando o pointer lock é desativado
 */
export function setLockCallbacks(onLock, onUnlock) {
  _onLockCallback   = onLock;
  _onUnlockCallback = onUnlock;
}

/**
 * Força o unlock do pointer — usado ao abrir o holograma.
 */
export function unlockPointer() {
  if (controls.isLocked) {
    controls.unlock();
  }
}

/**
 * Força o lock do pointer — usado ao fechar o holograma.
 */
export function lockPointer() {
  if (!controls.isLocked) {
    controls.lock();
  }
}

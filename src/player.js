/**
 * player.js — CIDADE DO FRONT-END 2077
 *
 * Responsabilidades:
 *   - Capturar input de teclado (WASD + Setas)
 *   - Mover o jogador com velocidade suave (delta time)
 *   - Limitar o jogador dentro da área da cidade
 *   - Verificar colisões circulares com os prédios (AABB simplificado)
 *
 * Por que colisão circular?
 *   Para um jogo educacional, colisão circular é suficiente e muito mais
 *   eficiente do que AABB full ou raycasting. Cada prédio tem um raio de
 *   exclusão — o jogador não pode se aproximar além desse raio.
 *
 * Módulos que dependem deste: interactions.js, ui.js, main.js
 */

import * as THREE from 'three';
import { getCameraObject, isLocked } from './camera.js';

// ─── Configurações de movimento ──────────────────────────────────────────────
const MOVE_SPEED    = 10;  // Unidades por segundo (sensação de escala urbana)
const PLAYER_HEIGHT = 1.7; // Altura dos olhos — mantida constante (sem gravidade)
const CITY_BOUNDS   = 180; // Limite da cidade em X e Z

// ─── Estado das teclas pressionadas ─────────────────────────────────────────
// Objeto simples de flags — mais performático que verificar e.key a cada frame.
const _keys = {
  forward:  false, // W ou ArrowUp
  backward: false, // S ou ArrowDown
  left:     false, // A ou ArrowLeft
  right:    false, // D ou ArrowRight
};

// ─── Colisores dos prédios ───────────────────────────────────────────────────
// Populados via setBuildings() após initBuildings() em main.js.
// Cada colider: { x: number, z: number, radius: number }
let _colliders = [];

// ─── Vetor auxiliar (reutilizado para evitar alocações no loop) ─────────────
const _moveDir = new THREE.Vector3();

// ============================================================
// INICIALIZAÇÃO
// ============================================================

/**
 * Registra os listeners de teclado.
 * Deve ser chamado uma única vez em main.js após initCamera().
 */
export function initPlayer() {
  document.addEventListener('keydown', _onKeyDown);
  document.addEventListener('keyup',   _onKeyUp);
}

// ============================================================
// INPUT
// ============================================================

/** Mapeia teclas pressionadas para as flags de direção. */
function _onKeyDown(e) {
  switch (e.code) {
    case 'KeyW':     case 'ArrowUp':    _keys.forward  = true; break;
    case 'KeyS':     case 'ArrowDown':  _keys.backward = true; break;
    case 'KeyA':     case 'ArrowLeft':  _keys.left     = true; break;
    case 'KeyD':     case 'ArrowRight': _keys.right    = true; break;
  }
}

/** Reseta as flags quando as teclas são soltas. */
function _onKeyUp(e) {
  switch (e.code) {
    case 'KeyW':     case 'ArrowUp':    _keys.forward  = false; break;
    case 'KeyS':     case 'ArrowDown':  _keys.backward = false; break;
    case 'KeyA':     case 'ArrowLeft':  _keys.left     = false; break;
    case 'KeyD':     case 'ArrowRight': _keys.right    = false; break;
  }
}

// ============================================================
// COLISÃO
// ============================================================

/**
 * Define a lista de colisores de prédios.
 * Chamado em main.js logo após initBuildings().
 *
 * @param {Array<{ x: number, z: number, radius: number }>} colliders
 */
export function setBuildings(colliders) {
  _colliders = colliders;
}

/**
 * Verifica se uma posição colide com algum prédio.
 * Usa distância euclidiana 2D (plano XZ — sem altura).
 *
 * @param {THREE.Vector3} pos
 * @returns {boolean} true se houver colisão
 */
function _checkCollision(pos) {
  for (const c of _colliders) {
    const dx = pos.x - c.x;
    const dz = pos.z - c.z;
    // Soma raio do prédio + "raio" do jogador (largura dos ombros ~0.5)
    if (dx * dx + dz * dz < (c.radius + 0.5) * (c.radius + 0.5)) {
      return true;
    }
  }
  return false;
}

// ============================================================
// UPDATE — chamado no game loop
// ============================================================

/**
 * Atualiza a posição do jogador.
 * Chamado a cada frame em main.js com o delta time do clock.
 *
 * Fluxo:
 *  1. Ignora se o pointer lock não está ativo
 *  2. Calcula vetor de direção local (relativo à câmera)
 *  3. Salva posição anterior
 *  4. Aplica translação via controls.moveForward/Right
 *  5. Fixa altura Y = PLAYER_HEIGHT
 *  6. Limita X e Z dentro da cidade
 *  7. Rollback se colisão detectada
 *
 * @param {number} delta - Segundos desde o último frame
 */
export function updatePlayer(delta) {
  // Sem movimento se pointer lock inativo (menu/pausa/holograma)
  if (!isLocked()) return;

  // Sem teclas pressionadas — nada a fazer
  const anyKey = _keys.forward || _keys.backward || _keys.left || _keys.right;
  if (!anyKey) return;

  const obj = getCameraObject(); // Yaw object do PointerLockControls

  // Salva posição para rollback em caso de colisão
  const prevX = obj.position.x;
  const prevZ = obj.position.z;

  // PointerLockControls expõe moveForward/moveRight que consideram
  // a rotação atual da câmera (já que são relativos ao espaço local).
  const speed = MOVE_SPEED * delta;

  if (_keys.forward)  controls_moveForward(obj,  speed);
  if (_keys.backward) controls_moveForward(obj, -speed);
  if (_keys.right)    controls_moveRight(obj,    speed);
  if (_keys.left)     controls_moveRight(obj,   -speed);

  // Fixa altura (sem gravidade/salto neste protótipo)
  obj.position.y = PLAYER_HEIGHT;

  // Limita dentro dos limites da cidade
  obj.position.x = Math.max(-CITY_BOUNDS, Math.min(CITY_BOUNDS, obj.position.x));
  obj.position.z = Math.max(-CITY_BOUNDS, Math.min(CITY_BOUNDS, obj.position.z));

  // Verifica colisão — se colidir, desfaz o movimento
  if (_checkCollision(obj.position)) {
    obj.position.x = prevX;
    obj.position.z = prevZ;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers de movimento (equivalente ao que PointerLockControls faz internamente)
// Reproduzidos aqui para evitar dependência do objeto controls diretamente.
// ──────────────────────────────────────────────────────────────────────────────

/** Move o objeto para frente/trás no espaço local da câmera. */
function controls_moveForward(object, distance) {
  _moveDir.setFromMatrixColumn(object.matrix, 0);
  _moveDir.crossVectors(object.up, _moveDir);
  object.position.addScaledVector(_moveDir, distance);
}

/** Move o objeto para direita/esquerda no espaço local da câmera. */
function controls_moveRight(object, distance) {
  _moveDir.setFromMatrixColumn(object.matrix, 0);
  object.position.addScaledVector(_moveDir, distance);
}

// ============================================================
// API PÚBLICA
// ============================================================

/**
 * Retorna a posição atual do jogador no mundo 3D.
 * Usada por interactions.js e ui.js.
 *
 * @returns {THREE.Vector3}
 */
export function getPlayerPosition() {
  return getCameraObject().position;
}

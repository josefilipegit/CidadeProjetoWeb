/**
 * scene.js — CIDADE DO FRONT-END 2077
 *
 * Responsabilidades:
 *   - Criar e configurar o WebGLRenderer
 *   - Inicializar a cena Three.js (scene)
 *   - Configurar iluminação (ambiente, direcional, neon points)
 *   - Criar o chão com grid neon
 *   - Criar o céu noturno com estrelas
 *   - Criar o sistema de partículas (chuva de dados)
 *   - Criar elementos decorativos da cidade (postes, calçadas)
 *
 * Módulos que dependem deste: buildings.js, main.js
 */

import * as THREE from 'three';

// ─── Exportações das referências globais da cena ────────────────────────────
// Usam 'let' porque são atribuídas DEPOIS da chamada a initRenderer/createScene.
// Em ES Modules, importações são live bindings — os importadores receberão
// os valores atualizados mesmo após reatribuição.
export let scene;
export let renderer;
export let clock;

// ─── Configurações da cena ──────────────────────────────────────────────────
const FOG_COLOR  = 0x000a1a;   // Azul muito escuro — névoa cyberpunk
const FOG_DENSITY = 0.008;    // Densidade da névoa exponencial
const BG_COLOR   = 0x000510;   // Cor de fundo do céu

// ─── Sistema de partículas (referência para animação) ───────────────────────
let _particlePositions = null;  // Float32Array das posições
let _particleVelocities = null; // Float32Array das velocidades Y
let _particleMesh = null;       // THREE.Points

// ============================================================
// RENDERER
// ============================================================

/**
 * Inicializa o WebGLRenderer no canvas HTML.
 * Configura: antialias, shadow maps, tone mapping.
 */
export function initRenderer() {
  const canvas = document.getElementById('game-canvas');

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });

  // Tamanho total da janela
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Limita pixel ratio a 2 para performance em telas de alta densidade
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Habilita sombras (suaves)
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Tone mapping cinematográfico (mais contraste e saturação)
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
}

// ============================================================
// CENA PRINCIPAL
// ============================================================

/**
 * Cria e retorna a cena Three.js com todos os elementos base.
 * Deve ser chamada APÓS initRenderer().
 *
 * @returns {THREE.Scene}
 */
export function createScene() {
  scene = new THREE.Scene();

  // Cor de fundo (visível além da névoa)
  scene.background = new THREE.Color(BG_COLOR);

  // Névoa exponencial — quanto mais longe, mais escuro fica
  scene.fog = new THREE.FogExp2(FOG_COLOR, FOG_DENSITY);

  // Clock para delta time (usado no loop principal)
  clock = new THREE.Clock();

  // ── Construção da cena ──────────────────────────────────
  _createLights();
  _createGround();
  _createSky();
  _createParticles();
  _createStreetDecorations();

  return scene;
}

// ============================================================
// ILUMINAÇÃO
// ============================================================

/**
 * Configura todas as luzes da cena:
 *  - Luz ambiente (roxo escuro, intensidade baixa)
 *  - Luz direcional (azul frio, com sombras)
 *  - Point lights neon estratégicos
 */
function _createLights() {
  // ── Luz Ambiente ─────────────────────────────────────────
  // Iluminação base baixa para manter o clima dark cyberpunk.
  // Um valor alto apagaria o efeito neon dos prédios.
  const ambient = new THREE.AmbientLight(0x0a0520, 1.5);
  scene.add(ambient);

  // ── Luz Direcional ───────────────────────────────────────
  // Simula uma fonte de luz distante (tipo cidade ao fundo).
  const dirLight = new THREE.DirectionalLight(0x3366cc, 0.6);
  dirLight.position.set(60, 120, 40);
  dirLight.castShadow = true;

  // Configura a câmera da sombra (área coberta)
  const sd = dirLight.shadow;
  sd.mapSize.set(2048, 2048);
  sd.camera.near   = 0.5;
  sd.camera.far    = 400;
  sd.camera.left   = -120;
  sd.camera.right  = 120;
  sd.camera.top    = 120;
  sd.camera.bottom = -120;
  sd.bias = -0.001;

  scene.add(dirLight);

  // ── Point Lights Neon ────────────────────────────────────
  // Cada prédio tem sua própria cor neon.
  // Estas luzes adicionais enriquecem a atmosfera.

  // Centro da praça — rosa
  _addPointLight(0xff00aa, 4, 60, 0, 12, 0);

  // HTML Tower — ciano
  _addPointLight(0x0088ff, 3, 70, -40, 20, -20);

  // CSS Lab — roxo
  _addPointLight(0xaa00ff, 3, 70,  40, 20, -20);

  // JS Arena — amarelo
  _addPointLight(0xffcc00, 3, 70, -40, 15, 30);

  // Bootstrap — índigo
  _addPointLight(0x6633ff, 3, 70,  40, 15, 30);

  // Accessibility — verde
  _addPointLight(0x00ff66, 3, 70,   0, 15, 55);
}

/** Utilitário: cria e adiciona uma PointLight à cena. */
function _addPointLight(color, intensity, distance, x, y, z) {
  const light = new THREE.PointLight(color, intensity, distance);
  light.position.set(x, y, z);
  scene.add(light);
  return light;
}

// ============================================================
// CHÃO
// ============================================================

/**
 * Cria o chão da cidade:
 *  - Plano base escuro
 *  - Grade neon (linhas menores + linhas maiores)
 *  - Calçadas perimetrais
 */
function _createGround() {
  // Plano principal — 400×400 unidades
  const geo = new THREE.PlaneGeometry(400, 400);
  const mat = new THREE.MeshStandardMaterial({
    color:             0x030318,
    emissive:          0x000510,
    emissiveIntensity: 0.5,
    roughness:         0.9,
    metalness:         0.1,
  });

  const ground = new THREE.Mesh(geo, mat);
  ground.rotation.x = -Math.PI / 2; // Deita o plano (eixo X)
  ground.receiveShadow = true;
  scene.add(ground);

  // Grade fina (suave)
  const gridFine = new THREE.GridHelper(400, 100, 0x001030, 0x000820);
  gridFine.position.y = 0.01;
  scene.add(gridFine);

  // Grade grossa — linhas principais de rua
  _createMainGridLines();
}

/**
 * Cria as linhas de rua principais (mais brilhantes que a grade fina).
 * Espaçadas de 40 em 40 unidades, formando quadras da cidade.
 */
function _createMainGridLines() {
  const mat = new THREE.LineBasicMaterial({ color: 0x001a40 });
  const points = [];

  for (let i = -200; i <= 200; i += 40) {
    // Linha vertical
    points.push(new THREE.Vector3(i, 0.05, -200));
    points.push(new THREE.Vector3(i, 0.05,  200));
    // Linha horizontal
    points.push(new THREE.Vector3(-200, 0.05, i));
    points.push(new THREE.Vector3( 200, 0.05, i));
  }

  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const lines = new THREE.LineSegments(geo, mat);
  scene.add(lines);
}

// ============================================================
// CÉU
// ============================================================

/**
 * Cria o céu noturno:
 *  - Esfera grande (invertida) como skybox
 *  - Campo de estrelas estático
 */
function _createSky() {
  // Esfera grande — renderiza o interior (BackSide)
  const skyGeo = new THREE.SphereGeometry(290, 32, 16);
  const skyMat = new THREE.MeshBasicMaterial({
    color: BG_COLOR,
    side:  THREE.BackSide,
  });
  scene.add(new THREE.Mesh(skyGeo, skyMat));

  // Estrelas
  _createStars();

  // Lua / planeta decorativo ao longe
  _createMoon();
}

/** Cria 3000 pontos de estrelas distribuídas aleatoriamente no hemisfério superior. */
function _createStars() {
  const count = 3000;
  const pos   = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // Coordenadas esféricas aleatórias
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(Math.random()); // 0..π/2 (hemisfério superior)
    const r     = 270 + Math.random() * 15;

    pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = Math.abs(r * Math.cos(phi)); // Força hemisfério superior
    pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const mat = new THREE.PointsMaterial({
    color:          0xffffff,
    size:           0.6,
    sizeAttenuation: true,
    transparent:    true,
    opacity:        0.7,
  });

  scene.add(new THREE.Points(geo, mat));
}

/** Cria um disco luminoso imitando uma lua/planeta cyberpunk. */
function _createMoon() {
  const geo = new THREE.SphereGeometry(8, 16, 16);
  const mat = new THREE.MeshStandardMaterial({
    color:             0x112244,
    emissive:          0x223388,
    emissiveIntensity: 0.5,
  });
  const moon = new THREE.Mesh(geo, mat);
  moon.position.set(150, 180, -200);
  scene.add(moon);

  // Halo ao redor da lua
  const haloGeo = new THREE.SphereGeometry(10, 16, 16);
  const haloMat = new THREE.MeshBasicMaterial({
    color:       0x0033aa,
    transparent: true,
    opacity:     0.1,
    side:        THREE.BackSide,
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.position.copy(moon.position);
  scene.add(halo);
}

// ============================================================
// PARTÍCULAS — "CHUVA DE DADOS"
// ============================================================

/**
 * Cria o sistema de partículas que representa o fluxo de dados
 * característico da estética cyberpunk.
 *
 * As partículas caem do céu e reaparecem no topo ao atingir o chão.
 * A animação é feita em animateParticles() no loop principal.
 */
function _createParticles() {
  const COUNT = 3000;
  _particlePositions  = new Float32Array(COUNT * 3);
  _particleVelocities = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    // Posição inicial espalhada por toda a cidade
    _particlePositions[i * 3]     = (Math.random() - 0.5) * 350;
    _particlePositions[i * 3 + 1] = Math.random() * 80;
    _particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 350;

    // Velocidade de queda individual (variação para parecer natural)
    _particleVelocities[i] = 0.04 + Math.random() * 0.12;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(_particlePositions, 3));

  const mat = new THREE.PointsMaterial({
    color:          0x0088ff,
    size:           0.15,
    transparent:    true,
    opacity:        0.5,
    sizeAttenuation: true,
  });

  _particleMesh = new THREE.Points(geo, mat);
  scene.add(_particleMesh);
}

/**
 * Anima as partículas de dados.
 * Deve ser chamada a cada frame no loop principal (main.js).
 */
export function animateParticles() {
  if (!_particleMesh) return;

  const pos = _particlePositions;

  for (let i = 0, n = _particleVelocities.length; i < n; i++) {
    // Move para baixo
    pos[i * 3 + 1] -= _particleVelocities[i];

    // Quando toca o chão, reinicia no topo
    if (pos[i * 3 + 1] < 0) {
      pos[i * 3 + 1] = 80;
    }
  }

  // Marca o atributo como "dirty" para forçar atualização na GPU
  _particleMesh.geometry.attributes.position.needsUpdate = true;
}

// ============================================================
// DECORAÇÃO DAS RUAS
// ============================================================

/**
 * Cria elementos decorativos para dar vida à cidade:
 *  - Postes de luz neon
 *  - Plataforma da praça central (anel)
 */
function _createStreetDecorations() {
  // Postes de luz nas ruas principais
  const poleData = [
    { x: -20, z: -40, color: 0x00f5ff },
    { x:  20, z: -40, color: 0xff00aa },
    { x: -20, z:   0, color: 0x00f5ff },
    { x:  20, z:   0, color: 0xffff00 },
    { x: -20, z:  40, color: 0x00ff88 },
    { x:  20, z:  40, color: 0xff00aa },
    { x:   0, z: -50, color: 0x0088ff },
    { x:   0, z:  20, color: 0xcc00ff },
    { x: -60, z:   5, color: 0xffcc00 },
    { x:  60, z:   5, color: 0x00ccff },
  ];

  poleData.forEach(({ x, z, color }) => _createStreetPole(x, z, color));
}

/**
 * Cria um poste de luz neon na posição X,Z.
 *
 * @param {number} x
 * @param {number} z
 * @param {number} color - Cor hexadecimal neon
 */
function _createStreetPole(x, z, color) {
  // Haste do poste
  const shaftGeo = new THREE.CylinderGeometry(0.08, 0.12, 9, 6);
  const shaftMat = new THREE.MeshStandardMaterial({
    color:    0x223344,
    metalness: 0.9,
    roughness: 0.4,
  });
  const shaft = new THREE.Mesh(shaftGeo, shaftMat);
  shaft.position.set(x, 4.5, z);
  shaft.castShadow = true;
  scene.add(shaft);

  // Luminária (esfera brilhante no topo)
  const lampGeo = new THREE.SphereGeometry(0.35, 8, 8);
  const lampMat = new THREE.MeshStandardMaterial({
    color:             color,
    emissive:          color,
    emissiveIntensity: 3,
  });
  const lamp = new THREE.Mesh(lampGeo, lampMat);
  lamp.position.set(x, 9.4, z);
  scene.add(lamp);

  // Luz pontual da luminária
  const ptLight = new THREE.PointLight(color, 1.5, 18);
  ptLight.position.set(x, 9, z);
  scene.add(ptLight);
}

// ============================================================
// RESIZE
// ============================================================

/**
 * Atualiza o renderer e a câmera quando a janela é redimensionada.
 * Deve ser chamado no listener 'resize' em main.js.
 *
 * @param {THREE.PerspectiveCamera} camera
 */
export function onWindowResize(camera) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

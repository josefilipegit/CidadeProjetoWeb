/**
 * buildings.js — CIDADE DO FRONT-END 2077
 *
 * Responsabilidades:
 *   - Definir a classe base Building
 *   - Implementar cada prédio temático da cidade
 *   - Criar elementos fixos: Portal de Entrada e Praça Central
 *   - Exportar arrays de prédios e colisores para outros módulos
 *
 * Prédios implementados:
 *   1. HtmlTower          — arranha-céu azul, tema HTML semântico
 *   2. CssLab             — prédio multi-facetado roxo, tema CSS
 *   3. JavaScriptArena    — arena circular, tema JavaScript
 *   4. BootstrapDistrict  — complexo modular índigo, tema Bootstrap
 *   5. AccessibilityCenter— centro branco/verde, tema Acessibilidade
 *
 * Módulos que dependem deste: interactions.js, ui.js, main.js
 */

import * as THREE from 'three';
import { scene } from './scene.js';

// ─── Arrays exportados ──────────────────────────────────────────────────────
export const buildings        = [];  // Instâncias de Building
export const buildingColliders = []; // { x, z, radius } para player.js

// ============================================================
// CLASSE BASE: Building
// ============================================================

/**
 * Classe base para todos os prédios da cidade.
 *
 * Cada subclasse deve:
 *   1. Chamar super() com os parâmetros de configuração
 *   2. Implementar o método build() que cria a geometria 3D
 *   3. Opcionalmente sobrescrever animate(time) para efeitos dinâmicos
 */
class Building {
  /**
   * @param {Object} cfg
   * @param {string}         cfg.id            - Identificador único
   * @param {string}         cfg.name          - Nome de exibição (HUD/UI)
   * @param {THREE.Vector3}  cfg.position      - Posição na cidade
   * @param {THREE.Vector3}  cfg.size          - Dimensões (width, height, depth)
   * @param {number}         cfg.primaryColor  - Cor principal (hex)
   * @param {number}         cfg.emissiveColor - Cor emissiva neon (hex)
   * @param {Object}         cfg.content       - Dados pedagógicos do holograma
   */
  constructor(cfg) {
    this.id            = cfg.id;
    this.name          = cfg.name;
    this.position      = cfg.position;
    this.size          = cfg.size;
    this.primaryColor  = cfg.primaryColor;
    this.emissiveColor = cfg.emissiveColor;
    this.content       = cfg.content;

    this.meshes        = [];   // Todos os meshes do prédio
    this.animData      = {};   // Dados para animação (lights, rings, etc.)
  }

  // ── Helpers ────────────────────────────────────────────────

  /** Adiciona um mesh à cena e ao array interno. */
  _add(mesh) {
    this.meshes.push(mesh);
    scene.add(mesh);
  }

  /** Cria as arestas neon (wireframe) de uma geometria. */
  _neonFrame(geometry, color, intensity = 1) {
    const edges = new THREE.EdgesGeometry(geometry);
    const mat   = new THREE.LineBasicMaterial({ color });
    const lines = new THREE.LineSegments(edges, mat);
    return lines;
  }

  /**
   * Cria um sprite 2D com o nome do prédio usando canvas.
   * Aparece flutuando acima do topo do prédio.
   *
   * @param {string} text
   * @param {string} color - Cor CSS do texto
   */
  _createLabel(text, color = '#00f5ff') {
    const canvas = document.createElement('canvas');
    canvas.width  = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 512, 128);

    // Sombra de glow
    ctx.shadowColor = color;
    ctx.shadowBlur  = 25;

    // Texto
    ctx.font      = 'bold 36px Orbitron, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.fillText(text, 256, 78);

    const tex    = new THREE.CanvasTexture(canvas);
    const mat    = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);

    sprite.scale.set(22, 5.5, 1);
    sprite.position.set(
      this.position.x,
      this.position.y + this.size.y / 2 + 7,
      this.position.z
    );

    return sprite;
  }

  /**
   * Material padrão de prédio.
   * @param {number} color
   * @param {number} emissive
   * @param {number} emissiveIntensity
   */
  _buildingMat(color, emissive, emissiveIntensity = 0.4) {
    return new THREE.MeshStandardMaterial({
      color,
      emissive,
      emissiveIntensity,
      roughness: 0.3,
      metalness: 0.7,
    });
  }

  /** Override nas subclasses para criar a geometria 3D. */
  build() {}

  /** Override para efeitos animados no loop. @param {number} time */
  animate(time) {}
}

// ============================================================
// 1. HTML TOWER — Arranha-céu azul ciano
// ============================================================

class HtmlTower extends Building {
  constructor() {
    super({
      id:   'html-tower',
      name: 'HTML TOWER',
      position: new THREE.Vector3(-40, 0, -20),
      size:     new THREE.Vector3(12, 60, 12),
      primaryColor:  0x001833,
      emissiveColor: 0x002266,
      content: {
        title:    'HTML TOWER',
        subtitle: '⟨/⟩ Estrutura da Web',
        color:    '#0099ff',
        icon:     '⟨/⟩',
        sections: [
          {
            tag:  '&lt;header&gt;',
            label: 'Header',
            desc: 'Cabeçalho da página. Contém identidade visual, título e navegação principal. Deve aparecer uma única vez no &lt;body&gt;.',
            example: '&lt;header&gt;\n  &lt;h1&gt;Meu Site&lt;/h1&gt;\n  &lt;nav&gt;Menu...&lt;/nav&gt;\n&lt;/header&gt;',
          },
          {
            tag:  '&lt;nav&gt;',
            label: 'Navegação',
            desc: 'Agrupa os links de navegação principais do site. Melhora a acessibilidade e o SEO.',
            example: '&lt;nav aria-label="Principal"&gt;\n  &lt;a href="/"&gt;Home&lt;/a&gt;\n  &lt;a href="/sobre"&gt;Sobre&lt;/a&gt;\n  &lt;a href="/contato"&gt;Contato&lt;/a&gt;\n&lt;/nav&gt;',
          },
          {
            tag:  '&lt;main&gt;',
            label: 'Conteúdo Principal',
            desc: 'Envolve o conteúdo principal e único da página. Só deve existir UM &lt;main&gt; por documento.',
            example: '&lt;main&gt;\n  &lt;h2&gt;Bem-vindo!&lt;/h2&gt;\n  &lt;section&gt;...&lt;/section&gt;\n&lt;/main&gt;',
          },
          {
            tag:  '&lt;section&gt;',
            label: 'Seção',
            desc: 'Agrupa conteúdo com temática relacionada. Deve ter sempre um heading próprio (&lt;h2&gt;, &lt;h3&gt;...).',
            example: '&lt;section&gt;\n  &lt;h2&gt;Nossos Serviços&lt;/h2&gt;\n  &lt;p&gt;Descrição...&lt;/p&gt;\n&lt;/section&gt;',
          },
          {
            tag:  '&lt;article&gt;',
            label: 'Artigo',
            desc: 'Conteúdo autossuficiente e reutilizável — posts de blog, notícias, comentários, cards de produto.',
            example: '&lt;article&gt;\n  &lt;h3&gt;Título do Post&lt;/h3&gt;\n  &lt;time&gt;2077-01-01&lt;/time&gt;\n  &lt;p&gt;Conteúdo...&lt;/p&gt;\n&lt;/article&gt;',
          },
          {
            tag:  '&lt;footer&gt;',
            label: 'Rodapé',
            desc: 'Rodapé da página ou seção. Contém copyright, links secundários, informações de contato.',
            example: '&lt;footer&gt;\n  &lt;p&gt;&amp;copy; 2077 Cidade Front-End&lt;/p&gt;\n  &lt;nav&gt;Links&lt;/nav&gt;\n&lt;/footer&gt;',
          },
        ],
      },
    });
    this.build();
  }

  build() {
    const { x, z }       = this.position;
    const { x: w, y: h, z: d } = this.size;
    const cy = h / 2;

    // ── Corpo principal ──────────────────────────────────────
    const bodyGeo = new THREE.BoxGeometry(w, h, d);
    const bodyMesh = new THREE.Mesh(bodyGeo, this._buildingMat(this.primaryColor, this.emissiveColor));
    bodyMesh.position.set(x, cy, z);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    this._add(bodyMesh);

    // ── Wireframe neon azul ──────────────────────────────────
    const frame = this._neonFrame(bodyGeo, 0x0055ff);
    frame.position.copy(bodyMesh.position);
    this._add(frame);

    // ── Topo piramidal (antena) ──────────────────────────────
    const topGeo = new THREE.ConeGeometry(w * 0.55, 14, 4);
    const topMat = new THREE.MeshStandardMaterial({
      color:             0x001155,
      emissive:          0x0044ff,
      emissiveIntensity: 1.2,
    });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.set(x, h + 7, z);
    top.rotation.y = Math.PI / 4; // Gira 45° para alinhar as arestas
    this._add(top);

    // ── Anéis decorativos ────────────────────────────────────
    for (let i = 1; i <= 4; i++) {
      const ringGeo = new THREE.TorusGeometry(w * 0.75, 0.18, 8, 32);
      const ringMat = new THREE.MeshStandardMaterial({
        color:             0x0066ff,
        emissive:          0x0066ff,
        emissiveIntensity: 1.5,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(x, (h * 0.85) / 4 * i, z);
      ring.rotation.x = Math.PI / 2;
      this._add(ring);
      this.animData[`ring${i}`] = ring; // Salva para animar
    }

    // ── Janelas emissivas ────────────────────────────────────
    this._createWindows(x, z, w, h, d);

    // ── Label ────────────────────────────────────────────────
    this._add(this._createLabel('HTML TOWER', '#0099ff'));

    // ── Luz da base ─────────────────────────────────────────
    const basePt = new THREE.PointLight(0x0066ff, 3, 35);
    basePt.position.set(x, 4, z);
    scene.add(basePt);
    this.animData.basePt = basePt;
  }

  /** Cria painéis de janela emissivos nas faces do prédio. */
  _createWindows(x, z, w, h, d) {
    const rows = 9, cols = 3;
    const ww = (w - 1) / cols;
    const wh = (h - 8) / rows;
    const winMat = new THREE.MeshStandardMaterial({
      color:             0x001a44,
      emissive:          0x0044bb,
      emissiveIntensity: 0.9,
    });

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() < 0.35) continue; // Algumas janelas apagadas
        const geo = new THREE.BoxGeometry(ww * 0.6, wh * 0.55, 0.15);
        const win = new THREE.Mesh(geo, winMat);
        win.position.set(
          x - w / 2 + (c + 0.5) * ww + 0.5,
          4 + (r + 0.5) * wh,
          z + d / 2 + 0.08
        );
        this._add(win);
      }
    }
  }

  animate(time) {
    // Anéis giram alternando direção
    for (let i = 1; i <= 4; i++) {
      const r = this.animData[`ring${i}`];
      if (r) r.rotation.z = time * 0.25 * (i % 2 === 0 ? 1 : -1);
    }
    // Luz da base pulsa
    if (this.animData.basePt) {
      this.animData.basePt.intensity = 2.5 + Math.sin(time * 2) * 0.8;
    }
  }
}

// ============================================================
// 2. CSS LAB — Prédio geométrico multi-painel
// ============================================================

class CssLab extends Building {
  constructor() {
    super({
      id:   'css-lab',
      name: 'CSS LAB',
      position: new THREE.Vector3(40, 0, -20),
      size:     new THREE.Vector3(18, 42, 18),
      primaryColor:  0x1a0033,
      emissiveColor: 0x5500aa,
      content: {
        title:    'CSS LAB',
        subtitle: '{ } Estilo & Design',
        color:    '#cc00ff',
        icon:     '{}',
        sections: [
          {
            tag:  'Flexbox',
            label: 'CSS Flexbox',
            desc: 'Layout unidimensional — alinha itens em linha ou coluna. Perfeito para navbars, cards e centralização de conteúdo.',
            example: '.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 1rem;\n  flex-wrap: wrap;\n}',
          },
          {
            tag:  'Grid',
            label: 'CSS Grid',
            desc: 'Layout bidimensional — controla LINHAS e COLUNAS. Ideal para layouts de página inteira.',
            example: '.grid {\n  display: grid;\n  grid-template-columns:\n    repeat(3, 1fr);\n  grid-template-rows:\n    auto 1fr auto;\n  gap: 20px;\n}',
          },
          {
            tag:  'var()',
            label: 'Variáveis CSS',
            desc: 'Defina valores reutilizáveis no :root e referencie com var(). Facilita theming e manutenção.',
            example: ':root {\n  --primary: #00f5ff;\n  --space-md: 1rem;\n  --radius: 8px;\n}\n.btn {\n  color: var(--primary);\n  padding: var(--space-md);\n}',
          },
          {
            tag:  '@keyframes',
            label: 'Animações',
            desc: 'Crie animações declarativas com @keyframes. Use animation-delay para efeitos escalonados.',
            example: '@keyframes pulsar {\n  0%   { opacity: 1; }\n  50%  { opacity: 0.4; }\n  100% { opacity: 1; }\n}\n.el {\n  animation: pulsar 2s ease infinite;\n}',
          },
          {
            tag:  '@media',
            label: 'Responsividade',
            desc: 'Media queries adaptam o layout a diferentes tamanhos de tela. Abordagem mobile-first recomendada.',
            example: '/* Mobile-first */\n.grid {\n  grid-template-columns: 1fr;\n}\n@media (min-width: 768px) {\n  .grid {\n    grid-template-columns:\n      repeat(3, 1fr);\n  }\n}',
          },
        ],
      },
    });
    this.build();
  }

  build() {
    const { x, z }       = this.position;
    const { x: w, y: h } = this.size;

    // ── Base larga ───────────────────────────────────────────
    const baseGeo = new THREE.BoxGeometry(w, h * 0.65, w);
    const baseMesh = new THREE.Mesh(baseGeo, this._buildingMat(this.primaryColor, this.emissiveColor, 0.5));
    baseMesh.position.set(x, h * 0.65 / 2, z);
    baseMesh.castShadow = true;
    this._add(baseMesh);

    const baseFrame = this._neonFrame(baseGeo, 0xcc00ff);
    baseFrame.position.copy(baseMesh.position);
    this._add(baseFrame);

    // ── Torre superior (mais estreita) ───────────────────────
    const topW   = w * 0.55;
    const topH   = h * 0.45;
    const topGeo = new THREE.BoxGeometry(topW, topH, topW);
    const topMesh = new THREE.Mesh(topGeo, this._buildingMat(0x110022, 0x7700cc, 0.6));
    topMesh.position.set(x, h * 0.65 + topH / 2, z);
    this._add(topMesh);

    // ── Painéis coloridos (cores CSS em 3D) ─────────────────
    const panelDefs = [
      { color: 0xff00ff, angle: 0 },
      { color: 0x00ffff, angle: Math.PI / 2 },
      { color: 0xff6600, angle: Math.PI },
      { color: 0x00ff44, angle: -Math.PI / 2 },
    ];

    panelDefs.forEach(({ color, angle }, i) => {
      const pGeo = new THREE.BoxGeometry(3.5, h * 0.35, 0.3);
      const pMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.8,
        side: THREE.DoubleSide,
      });
      const panel = new THREE.Mesh(pGeo, pMat);
      panel.position.set(
        x + Math.cos(angle) * (w / 2 + 2),
        h * 0.33,
        z + Math.sin(angle) * (w / 2 + 2)
      );
      panel.rotation.y = -angle;
      this._add(panel);
      this.animData[`panel${i}`] = panel;
    });

    // ── Antena com esfera ────────────────────────────────────
    const antennaGeo = new THREE.CylinderGeometry(0.1, 0.1, 8, 6);
    const antennaMat = new THREE.MeshStandardMaterial({ color: 0x440088, metalness: 0.9 });
    const antenna = new THREE.Mesh(antennaGeo, antennaMat);
    antenna.position.set(x, h + 4, z);
    this._add(antenna);

    const sphereGeo = new THREE.SphereGeometry(1, 12, 12);
    const sphereMat = new THREE.MeshStandardMaterial({
      color:             0xcc00ff,
      emissive:          0xff00ff,
      emissiveIntensity: 2,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(x, h + 8.5, z);
    this._add(sphere);
    this.animData.topSphere = sphere;

    this._add(this._createLabel('CSS LAB', '#cc00ff'));

    const basePt = new THREE.PointLight(0xcc00ff, 3, 40);
    basePt.position.set(x, 5, z);
    scene.add(basePt);
    this.animData.basePt = basePt;
  }

  animate(time) {
    for (let i = 0; i < 4; i++) {
      const p = this.animData[`panel${i}`];
      if (p) p.material.emissiveIntensity = 0.5 + Math.sin(time * 1.8 + i * 1.2) * 0.4;
    }
    if (this.animData.topSphere) {
      this.animData.topSphere.material.emissiveIntensity = 1.5 + Math.sin(time * 3) * 0.8;
    }
    if (this.animData.basePt) {
      this.animData.basePt.intensity = 2.5 + Math.sin(time * 1.5) * 0.8;
    }
  }
}

// ============================================================
// 3. JAVASCRIPT ARENA — Arena circular com cúpula
// ============================================================

class JavaScriptArena extends Building {
  constructor() {
    super({
      id:   'js-arena',
      name: 'JS ARENA',
      position: new THREE.Vector3(-40, 0, 32),
      size:     new THREE.Vector3(26, 18, 26),
      primaryColor:  0x151500,
      emissiveColor: 0x444400,
      content: {
        title:    'JS ARENA',
        subtitle: '() Lógica & Dinamismo',
        color:    '#ffcc00',
        icon:     'JS',
        sections: [
          {
            tag:  'addEventListener',
            label: 'Eventos DOM',
            desc: 'Escute interações do usuário: cliques, teclado, foco, input. addEventListener é o método padrão moderno.',
            example: 'document\n  .getElementById("btn")\n  .addEventListener(\n    "click",\n    (event) => {\n      console.log("Clicou!");\n    }\n  );',
          },
          {
            tag:  'querySelector',
            label: 'Manipulação DOM',
            desc: 'Selecione e modifique elementos HTML em tempo real com JavaScript.',
            example: 'const titulo =\n  document.querySelector("h1");\n\ntitulo.textContent = "Novo título";\ntitulo.classList.add("ativo");\ntitulo.style.color = "#00f5ff";',
          },
          {
            tag:  'class',
            label: 'Classes ES6',
            desc: 'Programe orientado a objetos com classes, construtores, herança (extends) e métodos.',
            example: 'class Estudante {\n  constructor(nome, nota) {\n    this.nome = nome;\n    this.nota = nota;\n  }\n  aprovado() {\n    return this.nota >= 7;\n  }\n}',
          },
          {
            tag:  '.map .filter .reduce',
            label: 'Métodos de Array',
            desc: 'Transforme coleções de dados de forma declarativa e imutável.',
            example: 'const notas = [8, 5, 9, 3, 7];\n\nconst aprovados = notas\n  .filter(n => n >= 7);\n// [8, 9, 7]\n\nconst media = notas\n  .reduce((a, b) => a + b, 0)\n  / notas.length;',
          },
          {
            tag:  'fetch / async',
            label: 'Fetch API',
            desc: 'Faça requisições HTTP assíncronas com fetch e async/await. Ideal para consumir APIs REST.',
            example: 'async function buscarDados() {\n  try {\n    const resp = await fetch(\n      "https://api.exemplo.com"\n    );\n    const data = await resp.json();\n    return data;\n  } catch (e) {\n    console.error(e);\n  }\n}',
          },
        ],
      },
    });
    this.build();
  }

  build() {
    const { x, z } = this.position;
    const radius = 13;

    // ── Anel base ────────────────────────────────────────────
    const ringGeo = new THREE.CylinderGeometry(radius, radius + 2.5, 5, 24);
    const ringMat = this._buildingMat(0x111100, 0x333300, 0.25);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(x, 2.5, z);
    ring.castShadow = true;
    this._add(ring);

    // ── Borda neon da arena ──────────────────────────────────
    const edgeTorus = new THREE.TorusGeometry(radius + 1.25, 0.4, 8, 48);
    const edgeMat = new THREE.MeshStandardMaterial({
      color:             0xffcc00,
      emissive:          0xffcc00,
      emissiveIntensity: 2,
    });
    const edge = new THREE.Mesh(edgeTorus, edgeMat);
    edge.position.set(x, 5.2, z);
    edge.rotation.x = Math.PI / 2;
    this._add(edge);
    this.animData.edge = edge;

    // ── Cúpula central ───────────────────────────────────────
    const domeGeo = new THREE.SphereGeometry(radius * 0.58, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMesh = new THREE.Mesh(domeGeo, this._buildingMat(0x111100, 0x666600, 0.5));
    domeMesh.position.set(x, 5, z);
    this._add(domeMesh);

    // Wireframe da cúpula
    const domeWireGeo = new THREE.SphereGeometry(radius * 0.59, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeWireMat = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
    const domeWire = new THREE.Mesh(domeWireGeo, domeWireMat);
    domeWire.position.set(x, 5, z);
    this._add(domeWire);
    this.animData.domeWire = domeWire;

    // ── Torres laterais ──────────────────────────────────────
    const towerAngles = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
    towerAngles.forEach((angle, i) => {
      const tx = x + Math.cos(angle) * radius * 0.75;
      const tz = z + Math.sin(angle) * radius * 0.75;
      const th = 12 + i * 2;
      const tGeo = new THREE.BoxGeometry(3, th, 3);
      const tMat = this._buildingMat(0x181800, 0xffaa00, 0.35);
      const tower = new THREE.Mesh(tGeo, tMat);
      tower.position.set(tx, th / 2, tz);
      this._add(tower);

      // Luz no topo de cada torre
      const tLight = new THREE.PointLight(0xffcc00, 1.5, 15);
      tLight.position.set(tx, th + 1, tz);
      scene.add(tLight);
      this.animData[`tLight${i}`] = tLight;
    });

    this._add(this._createLabel('JS ARENA', '#ffcc00'));

    const basePt = new THREE.PointLight(0xffcc00, 4, 45);
    basePt.position.set(x, 10, z);
    scene.add(basePt);
    this.animData.basePt = basePt;
  }

  animate(time) {
    if (this.animData.domeWire) this.animData.domeWire.rotation.y = time * 0.25;
    if (this.animData.edge) {
      this.animData.edge.material.emissiveIntensity = 1.5 + Math.sin(time * 3) * 0.8;
    }
    if (this.animData.basePt) {
      this.animData.basePt.intensity = 3 + Math.sin(time * 2.5) * 1;
    }
    for (let i = 0; i < 4; i++) {
      const l = this.animData[`tLight${i}`];
      if (l) l.intensity = 1 + Math.sin(time * 2 + i * 0.8) * 0.5;
    }
  }
}

// ============================================================
// 4. BOOTSTRAP DISTRICT — Complexo modular índigo
// ============================================================

class BootstrapDistrict extends Building {
  constructor() {
    super({
      id:   'bootstrap-district',
      name: 'BOOTSTRAP DISTRICT',
      position: new THREE.Vector3(42, 0, 32),
      size:     new THREE.Vector3(36, 36, 20),
      primaryColor:  0x12003a,
      emissiveColor: 0x440088,
      content: {
        title:    'BOOTSTRAP DISTRICT',
        subtitle: '[ ] Grid System',
        color:    '#7c3aed',
        icon:     '[]',
        sections: [
          {
            tag:  '.container',
            label: 'Container',
            desc: 'Centraliza e limita a largura do conteúdo. container tem largura máxima por breakpoint; container-fluid ocupa 100%.',
            example: '&lt;!-- Largura máxima por breakpoint --&gt;\n&lt;div class="container"&gt;\n  Conteúdo centralizado\n&lt;/div&gt;\n\n&lt;!-- Sempre 100% de largura --&gt;\n&lt;div class="container-fluid"&gt;\n  Conteúdo full-width\n&lt;/div&gt;',
          },
          {
            tag:  '.row',
            label: 'Row (Linha)',
            desc: 'Linha que agrupa colunas. Usa Flexbox internamente com margens negativas para alinhar com o container.',
            example: '&lt;div class="container"&gt;\n  &lt;div class="row g-3"&gt;\n    &lt;!-- Colunas aqui --&gt;\n    &lt;!-- g-3 = gap 1rem --&gt;\n  &lt;/div&gt;\n&lt;/div&gt;',
          },
          {
            tag:  '.col-*',
            label: 'Colunas (1–12)',
            desc: 'O grid usa 12 colunas. Defina tamanhos diferentes para cada breakpoint.',
            example: '&lt;div class="row"&gt;\n  &lt;div class="col-12 col-md-6\n             col-lg-4"&gt;\n    Responsivo!\n  &lt;/div&gt;\n&lt;/div&gt;',
          },
          {
            tag:  'Breakpoints',
            label: 'Breakpoints',
            desc: 'Bootstrap define 6 breakpoints: xs, sm, md, lg, xl, xxl. Use os sufixos nas classes.',
            example: '/* Breakpoints Bootstrap 5 */\n// xs:  < 576px   (padrão)\n// sm:  ≥ 576px\n// md:  ≥ 768px\n// lg:  ≥ 992px\n// xl:  ≥ 1200px\n// xxl: ≥ 1400px',
          },
        ],
      },
    });
    this.build();
  }

  build() {
    const { x, z } = this.position;

    // ── Três blocos modulares (representando colunas) ─────────
    const blocks = [
      { ox: -13, w: 9,  h: 34, d: 16, emissive: 0x440099 },
      { ox:   0, w: 11, h: 22, d: 16, emissive: 0x5500cc },
      { ox:  14, w: 9,  h: 42, d: 16, emissive: 0x6600dd },
    ];

    blocks.forEach((b, i) => {
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const mat = this._buildingMat(0x0e0028, b.emissive, 0.5);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x + b.ox, b.h / 2, z);
      mesh.castShadow = true;
      this._add(mesh);

      const frame = this._neonFrame(geo, 0x8833ff);
      frame.position.copy(mesh.position);
      this._add(frame);

      this.animData[`block${i}`] = mesh;
    });

    // ── Barras de conexão entre blocos ───────────────────────
    // Representam as fileiras (rows) do Bootstrap
    for (let y = 5; y <= 22; y += 5) {
      const barGeo = new THREE.BoxGeometry(34, 0.6, 1.5);
      const barMat = new THREE.MeshStandardMaterial({
        color:             0x7700ff,
        emissive:          0x8800ff,
        emissiveIntensity: 1.2,
      });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(x, y, z - 7);
      this._add(bar);
      this.animData[`bar_${y}`] = bar;
    }

    this._add(this._createLabel('BOOTSTRAP DISTRICT', '#9933ff'));

    const basePt = new THREE.PointLight(0x8800ff, 4, 50);
    basePt.position.set(x, 8, z);
    scene.add(basePt);
    this.animData.basePt = basePt;
  }

  animate(time) {
    if (this.animData.basePt) {
      this.animData.basePt.intensity = 3 + Math.sin(time * 1.2) * 1;
    }
    // Barras pulsam em sequência
    for (let y = 5; y <= 22; y += 5) {
      const bar = this.animData[`bar_${y}`];
      if (bar) bar.material.emissiveIntensity = 0.8 + Math.sin(time * 2 + y * 0.3) * 0.5;
    }
  }
}

// ============================================================
// 5. ACCESSIBILITY CENTER — Centro branco e verde
// ============================================================

class AccessibilityCenter extends Building {
  constructor() {
    super({
      id:   'accessibility-center',
      name: 'ACCESSIBILITY CENTER',
      position: new THREE.Vector3(0, 0, 58),
      size:     new THREE.Vector3(24, 30, 24),
      primaryColor:  0x051510,
      emissiveColor: 0x003322,
      content: {
        title:    'ACCESSIBILITY CENTER',
        subtitle: '♿ Web Para Todos',
        color:    '#00ff88',
        icon:     '♿',
        sections: [
          {
            tag:  'aria-label',
            label: 'ARIA Label',
            desc: 'Define um nome acessível para elementos que não têm texto visível. Essencial para botões com ícones.',
            example: '&lt;!-- Botão com ícone, sem texto --&gt;\n&lt;button\n  aria-label="Fechar menu"&gt;\n  ✕\n&lt;/button&gt;\n\n&lt;!-- Input sem label visível --&gt;\n&lt;input\n  type="search"\n  aria-label="Buscar produtos"&gt;',
          },
          {
            tag:  'role',
            label: 'Roles ARIA',
            desc: 'Define a função semântica de um elemento para leitores de tela. Use apenas quando o HTML nativo não for suficiente.',
            example: '&lt;div role="navigation"\n  aria-label="Menu lateral"&gt;\n&lt;/div&gt;\n\n&lt;div role="dialog"\n  aria-modal="true"\n  aria-labelledby="titulo"&gt;\n&lt;/div&gt;',
          },
          {
            tag:  'alt',
            label: 'Texto Alternativo',
            desc: 'Descreve imagens para leitores de tela. Imagens decorativas usam alt="" (vazio, não omitir).',
            example: '&lt;!-- Imagem informativa --&gt;\n&lt;img\n  src="grafico.png"\n  alt="Gráfico de barras mostrando\n  crescimento de 30% em 2077"&gt;\n\n&lt;!-- Imagem decorativa --&gt;\n&lt;img src="bg.png" alt=""&gt;',
          },
          {
            tag:  'tabindex',
            label: 'Tabindex',
            desc: 'Controla a navegação por teclado. 0 = ordem natural; -1 = fora da sequência; positivos são desencorajados.',
            example: '&lt;!-- Focável (ordem natural) --&gt;\n&lt;div tabindex="0"\n  role="button"\n  onclick="..."&gt;\n  Clique aqui\n&lt;/div&gt;\n\n&lt;!-- Removido do tab order --&gt;\n&lt;button tabindex="-1"&gt;',
          },
          {
            tag:  'Contraste WCAG',
            label: 'Contraste de Cores',
            desc: 'WCAG 2.1 exige: 4.5:1 para texto normal (AA), 3:1 para texto grande. Use ferramentas de verificação.',
            example: '/* ✅ Contraste adequado (AA) */\n.texto-principal {\n  color: #e0e8ff;    /* claro */\n  background: #0a0020;/* escuro */\n  /* ratio: ~12:1 ✓ */\n}\n\n/* ❌ Contraste insuficiente */\n.ruim {\n  color: #888888;\n  background: #aaaaaa;\n  /* ratio: 1.3:1 ✗ */\n}',
          },
        ],
      },
    });
    this.build();
  }

  build() {
    const { x, z }       = this.position;
    const { x: w, y: h } = this.size;

    // ── Corpo principal ──────────────────────────────────────
    const bodyGeo = new THREE.BoxGeometry(w, h, w);
    const bodyMesh = new THREE.Mesh(bodyGeo, this._buildingMat(this.primaryColor, this.emissiveColor, 0.35));
    bodyMesh.position.set(x, h / 2, z);
    bodyMesh.castShadow = true;
    this._add(bodyMesh);

    // ── Wireframe verde ──────────────────────────────────────
    const frame = this._neonFrame(bodyGeo, 0x00ff88);
    frame.position.copy(bodyMesh.position);
    this._add(frame);

    // ── Símbolo de acessibilidade (disco circular) ───────────
    const discGeo = new THREE.CylinderGeometry(7, 7, 0.5, 32);
    const discMat = new THREE.MeshStandardMaterial({
      color:             0x004422,
      emissive:          0x00ff88,
      emissiveIntensity: 0.8,
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.set(x, h / 2, z - w / 2 - 0.3);
    disc.rotation.x = Math.PI / 2;
    this._add(disc);
    this.animData.disc = disc;

    // ── Faixas horizontais (listras verdes) ─────────────────
    for (let i = 0; i < 6; i++) {
      const stripeGeo = new THREE.BoxGeometry(w + 3, 0.5, 0.5);
      const stripeMat = new THREE.MeshStandardMaterial({
        color:             0x00ff88,
        emissive:          0x00ff88,
        emissiveIntensity: 1.5,
      });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.set(x, 4 + i * 5, z - w / 2);
      this._add(stripe);
    }

    // ── Cúpula no topo ───────────────────────────────────────
    const domeGeo = new THREE.SphereGeometry(w / 2 * 0.7, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({
      color:             0x003311,
      emissive:          0x00dd66,
      emissiveIntensity: 0.6,
      transparent:       true,
      opacity:           0.85,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.set(x, h, z);
    this._add(dome);
    this.animData.dome = dome;

    this._add(this._createLabel('A11Y CENTER', '#00ff88'));

    const basePt = new THREE.PointLight(0x00ff88, 4, 50);
    basePt.position.set(x, 8, z);
    scene.add(basePt);
    this.animData.basePt = basePt;
  }

  animate(time) {
    if (this.animData.disc) {
      this.animData.disc.material.emissiveIntensity = 0.6 + Math.sin(time * 2) * 0.4;
    }
    if (this.animData.dome) {
      this.animData.dome.material.emissiveIntensity = 0.4 + Math.sin(time * 1.5) * 0.3;
    }
    if (this.animData.basePt) {
      this.animData.basePt.intensity = 3 + Math.sin(time * 1.8) * 0.8;
    }
  }
}

// ============================================================
// PORTAL DE ENTRADA
// ============================================================

/**
 * Cria o Portal de Entrada na ponta norte da cidade.
 * Estrutura: dois pilares + viga horizontal + efeito de campo.
 */
function _createPortal() {
  const px = 0, pz = -72;

  const pillarGeo = new THREE.BoxGeometry(3.5, 22, 3.5);
  const pillarMat = new THREE.MeshStandardMaterial({
    color:             0x001133,
    emissive:          0x0044aa,
    emissiveIntensity: 0.7,
    metalness:         0.9,
    roughness:         0.1,
  });

  // Pilar esquerdo
  const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
  leftPillar.position.set(px - 11, 11, pz);
  leftPillar.castShadow = true;
  scene.add(leftPillar);

  // Pilar direito
  const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
  rightPillar.position.set(px + 11, 11, pz);
  rightPillar.castShadow = true;
  scene.add(rightPillar);

  // Viga horizontal (topo)
  const archGeo = new THREE.BoxGeometry(26, 2.5, 3.5);
  const archMat = new THREE.MeshStandardMaterial({
    color:             0x001133,
    emissive:          0x0066ff,
    emissiveIntensity: 1.5,
  });
  const arch = new THREE.Mesh(archGeo, archMat);
  arch.position.set(px, 22, pz);
  scene.add(arch);

  // ── Campo de energia (plano semitransparente) ─────────────
  const fieldGeo = new THREE.PlaneGeometry(20, 20);
  const fieldMat = new THREE.MeshStandardMaterial({
    color:             0x000044,
    emissive:          0x002299,
    emissiveIntensity: 0.4,
    transparent:       true,
    opacity:           0.3,
    side:              THREE.DoubleSide,
  });
  const field = new THREE.Mesh(fieldGeo, fieldMat);
  field.position.set(px, 11, pz);
  scene.add(field);

  // ── Luzes do portal ─────────────────────────────────────────────
  const portalL1 = new THREE.PointLight(0x0066ff, 4, 30);
  portalL1.position.set(px - 11, 18, pz);
  scene.add(portalL1);

  const portalL2 = new THREE.PointLight(0x0066ff, 4, 30);
  portalL2.position.set(px + 11, 18, pz);
  scene.add(portalL2);

  // ── Texto "CIDADE DO FRONT-END 2077" ─────────────────────
  const canvas = document.createElement('canvas');
  canvas.width  = 1024;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 1024, 200);
  ctx.font = 'bold 68px Orbitron, monospace';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#00f5ff';
  ctx.shadowBlur  = 30;
  ctx.fillStyle   = '#00f5ff';
  ctx.fillText('CIDADE DO FRONT-END 2077', 512, 130);

  const tex = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(52, 10, 1);
  sprite.position.set(px, 30, pz);
  scene.add(sprite);
}

// ============================================================
// PRAÇA CENTRAL
// ============================================================

/**
 * Cria a praça central com plataforma circular,
 * obelisco com cristal animado e anel neon.
 */
function _createCentralSquare() {
  // Plataforma
  const platGeo = new THREE.CylinderGeometry(16, 16, 0.8, 32);
  const platMat = new THREE.MeshStandardMaterial({
    color:             0x040418,
    emissive:          0x000920,
    emissiveIntensity: 0.4,
    roughness:         0.7,
    metalness:         0.3,
  });
  const plat = new THREE.Mesh(platGeo, platMat);
  plat.position.set(0, 0.4, 0);
  plat.receiveShadow = true;
  scene.add(plat);

  // Anel neon da borda
  const torusGeo = new THREE.TorusGeometry(16, 0.35, 8, 64);
  const torusMat = new THREE.MeshStandardMaterial({
    color:             0x002266,
    emissive:          0x0055ff,
    emissiveIntensity: 2,
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.position.set(0, 0.8, 0);
  torus.rotation.x = Math.PI / 2;
  scene.add(torus);

  // Obelisco central
  _createObelisk();
}

/** Cria o obelisco central com cristal animado. */
function _createObelisk() {
  // Base quadrada
  const baseGeo = new THREE.BoxGeometry(4.5, 1, 4.5);
  const baseMesh = new THREE.Mesh(baseGeo, new THREE.MeshStandardMaterial({
    color: 0x001133, emissive: 0x001155, emissiveIntensity: 0.5, metalness: 0.9,
  }));
  baseMesh.position.set(0, 1, 0);
  scene.add(baseMesh);

  // Corpo do obelisco
  const obeliskGeo = new THREE.CylinderGeometry(0.25, 1.8, 14, 4);
  const obelisk = new THREE.Mesh(obeliskGeo, new THREE.MeshStandardMaterial({
    color: 0x000a22, emissive: 0x0033aa, emissiveIntensity: 0.7, metalness: 0.95, roughness: 0.05,
  }));
  obelisk.position.set(0, 8.5, 0);
  scene.add(obelisk);

  // Cristal no topo (octahedron)
  const crystalGeo = new THREE.OctahedronGeometry(1.8);
  const crystalMat = new THREE.MeshStandardMaterial({
    color:             0x00aaff,
    emissive:          0x00f5ff,
    emissiveIntensity: 2.5,
    transparent:       true,
    opacity:           0.85,
    roughness:         0,
    metalness:         0.6,
  });
  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  crystal.position.set(0, 16.2, 0);
  scene.add(crystal);

  // Referência global para animação no main.js
  window._centralCrystal = crystal;

  const crystalLight = new THREE.PointLight(0x00f5ff, 5, 35);
  crystalLight.position.set(0, 16, 0);
  scene.add(crystalLight);
  window._crystalLight = crystalLight;
}

// ============================================================
// INICIALIZAÇÃO PÚBLICA
// ============================================================

/**
 * Instancia todos os prédios e cria os elementos fixos da cidade.
 * Deve ser chamado APÓS createScene() em main.js.
 *
 * @returns {{ buildings: Building[], buildingColliders: Object[] }}
 */
export function initBuildings() {
  // Instancia cada prédio (o construtor chama build() internamente)
  const instances = [
    new HtmlTower(),
    new CssLab(),
    new JavaScriptArena(),
    new BootstrapDistrict(),
    new AccessibilityCenter(),
  ];

  // Registra no array global e cria colisores
  instances.forEach(b => {
    buildings.push(b);
    buildingColliders.push({
      x:      b.position.x,
      z:      b.position.z,
      radius: Math.max(b.size.x, b.size.z) / 2 + 2, // +2 = margem de segurança
    });
  });

  // Cria elementos fixos (sem colisão)
  _createPortal();
  _createCentralSquare();

  return { buildings, buildingColliders };
}

/**
 * Chama animate() de cada prédio e anima o cristal central.
 * Deve ser chamado a cada frame no loop principal (main.js).
 *
 * @param {number} time - Tempo elapsed do clock Three.js
 */
export function animateBuildings(time) {
  buildings.forEach(b => b.animate(time));

  // Animação do cristal central
  if (window._centralCrystal) {
    window._centralCrystal.rotation.y        = time * 0.6;
    window._centralCrystal.rotation.x        = Math.sin(time * 0.4) * 0.15;
    window._centralCrystal.position.y        = 16.2 + Math.sin(time * 1.2) * 0.4;
  }
  if (window._crystalLight) {
    window._crystalLight.intensity = 4 + Math.sin(time * 2.5) * 2;
  }
}

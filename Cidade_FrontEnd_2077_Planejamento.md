# Cidade Centro Universitário Projeção FRONT-END 2077 – Planejamento Pedagógico e Evolutivo

Este documento estabelece o roteiro de evolução arquitetural e didática da metrópole. O objetivo não é apenas ensinar código, mas imergir o grupo em uma **narrativa Cyberpunk**, onde cada módulo de Front-End é um edifício essencial para o funcionamento da metrópole.

---

## Estrutura das 4 Aulas de Projeto

A jornada do grupo para erguer o seu próprio "Polo" na cidade é dividida em quatro estágios de engenharia de software e design:

| Aula | Fase do Projeto | Objetivo e Entregáveis |
|------|-----------------|-------------------------|
| **Aula 1** | **Fundação & Ideação** | Definição do Conceito, Storyboard (como o usuário interage com o prédio), Wireframe Conceitual (rascunho de ideias) e Wireframe de Baixa Fidelidade (blocos básicos). |
| **Aula 2** | **Design & Arquitetura** | Evolução para Wireframe de Alta Fidelidade (cores, tipografia, neon), Prototipação navegável e definição da Arquitetura da Informação (estruturação das tags e rotas). |
| **Aula 3** | **Construção & Engenharia** | Implementação oficial no mundo 3D (Substituir o modelo "Wireframe" do prédio pela malha final em código) e desenvolvimento das interações (HTML/CSS/JS). |
| **Aula 4** | **Lançamento & Defesa** | Testes finais de performance/responsividade, polimento de UI/UX e a Apresentação Final (Pitch) do edifício funcionando para a comunidade. |

---

## Os 10 Polos Evolutivos (Narrativa e Missões)

Abaixo estão os escopos detalhados para os 10 prédios que os grupos construirão. Cada um ataca uma competência crítica do Front-End moderno através de uma lente gamificada.

### 1. Forms Factory (Formulários HTML5)
* **Conceito:** Uma usina industrial automatizada, com esteiras transportadoras de dados brilhantes. Ela representa o principal porto de entrada de informações vitais para a cidade.
* **A Missão do Grupo:** Construir os complexos painéis de controle da usina. O grupo deverá criar formulários avançados com validações rígidas e RegEx (Expressões Regulares) para evitar que "dados corrompidos" (inputs inválidos) causem falhas na rede da metrópole.

### 2. Media Museum (Áudio e Vídeo Web)
* **Conceito:** Um imponente museu digital flutuante, projetando hologramas gigantes em sua fachada. Ele é o repositório cultural de todos os arquivos de 2077.
* **A Missão do Grupo:** Desenvolver um portal de mídia customizado usando a API nativa de Áudio e Vídeo do HTML5. O grupo deve criar controles estilizados (play, pause, volume, progresso) para permitir que os cidadãos acessem arquivos históricos descriptografados.

### 3. Typography Temple (Tipografia e CSS Avançado)
* **Conceito:** Um santuário minimalista feito de vidro inteligente e luzes brancas suaves, focado na pureza da informação e estética visual. É onde a informação bruta se torna arte.
* **A Missão do Grupo:** Dominar Web Typography. O grupo receberá um "manifesto hacker" caótico e ilegível e deverá aplicar princípios avançados de hierarquia, kerning, line-height e fontes variáveis via CSS para transformá-lo em um documento esteticamente perfeito e legível.

### 4. Animation Alley (Keyframes e Transições CSS)
* **Conceito:** Uma ruela neo-noir, densa e vibrante, inspirada nos becos de Tóquio. Repleta de letreiros holográficos em movimento e neons que piscam ritmadamente.
* **A Missão do Grupo:** Dar vida a uma fachada comercial estática. Usando exclusivamente propriedades como `transform`, `transition` e `@keyframes`, o grupo deve criar micro-interações fluidas e outdoors que reagem à passagem do mouse e dos Drones.

### 5. DOM Domain (JavaScript DOM API)
* **Conceito:** O cérebro estrutural da cidade, fisicamente representado por uma gigantesca "Árvore de Energia" com milhares de galhos interconectados (Nós).
* **A Missão do Grupo:** "Hackear" a matriz da árvore em tempo real. O grupo usará JavaScript para criar, deletar e modificar elementos dinamicamente, reestruturando nós corrompidos para estabilizar a interface gráfica sem precisar recarregar a página.

### 6. Array Arcade (Lógica JS e Estrutura de Dados)
* **Conceito:** Um fliperama cyberpunk retrô-futurista de 5 andares, com telões globais rodando placares e estatísticas de jogadores em velocidade vertiginosa.
* **A Missão do Grupo:** Processar caóticas massas de dados. O grupo receberá Arrays e Objetos complexos contendo milhares de registros de jogadores e deverá usar métodos como `.map`, `.filter` e `.reduce` para extrair estatísticas, ranquear pontuações e renderizar uma tabela de líderes (Leaderboard).

### 7. Storage Station (Web Storage API)
* **Conceito:** Um data center impenetrável no subsolo da cidade, protegido por portas de cofre magnéticas, onde o "estado mental" e as memórias da metrópole são guardados.
* **A Missão do Grupo:** Garantir a persistência de dados no navegador. Ao criar um painel de configuração para o personagem (nome, escolha de tema dark/light, preferências), o grupo usará Local e Session Storage para garantir que essas escolhas sobrevivam mesmo se o sistema for "reiniciado" (refresh).

### 8. Canvas Coliseum (API Canvas 2D)
* **Conceito:** Uma arena de gladiadores holográfica, onde códigos disputam batalhas visuais. O chão é uma grade em branco onde pixels ganham vida matemática.
* **A Missão do Grupo:** Desenvolver um micro-jogo interativo ou uma visualização gráfica reativa (ex: um equalizador de som ou um gerador de partículas) manipulando o `<canvas>`, controlando eixos X e Y e pintando quadros em loop de animação (`requestAnimationFrame`).

### 9. UI/UX Hub (Experiência e Acessibilidade)
* **Conceito:** O centro de excelência médica e neurológica da cidade. Uma arquitetura orgânica focada no extremo conforto mental e físico dos ciborgues.
* **A Missão do Grupo:** Receber a interface de uma "loja de implantes cibernéticos" que está perdendo vendas por ter uma usabilidade horrível. O grupo deve auditar e reconstruir o layout focando na Jornada do Usuário (UX), garantindo alto contraste, contraste WCAG e navegação por teclado (Acessibilidade plena).

### 10. Mobile Market (Design Responsivo Extremo)
* **Conceito:** Um gigantesco mercado de rua hiper-tecnológico que possui tecnologia mutável: suas vitrines e corredores mudam fisicamente de formato dependendo de "quem" entra nele.
* **A Missão do Grupo:** O domínio final do Grid e do Flexbox com Media Queries. Construir uma aplicação de e-commerce complexa que flua de maneira impecável e inteligente, seja vista em um minúsculo visor de relógio inteligente, na tela de um celular ou nos outdoors panorâmicos da cidade.

---

## Detalhamento de Entregáveis por Aula

* **Aula 1: Fundação**
  * Pitch de 1 minuto do conceito do prédio escolhido.
  * *Storyboard* desenhado das interações do usuário.
  * Fluxo de navegação e *Wireframe de Baixa Fidelidade* em papel/Miro.
* **Aula 2: Arquitetura**
  * *Wireframe de Alta Fidelidade* (Figma/Adobe XD) com identidade visual (Tipografia, Cores Cyberpunk).
  * Definição da Arquitetura da Informação (estrutura do HTML necessária).
  * Documentação da missão específica do prédio.
* **Aula 3: Código**
  * Componentes modulares desenvolvidos.
  * Integração do código no arquivo da Cidade (inserção do HTML e JS no holograma correspondente).
  * Telas 100% responsivas.
* **Aula 4: Implantação**
  * Troca visual do prédio (substituir o modelo Wireframe (`wireframe: true`) por um bloco modelado através de primitivas ou texturas).
  * Demonstração ao vivo de todas as funcionalidades.

---


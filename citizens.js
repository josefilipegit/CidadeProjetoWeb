/* ============================================================
   CITIZENS (NPCs) - Módulo de Cidadãos
   ============================================================ */

var citizens = [];
var citizenGeo, citizenMat;

function initCitizens(scene) {
  var count = 25;
  var colors = [0x00f5ff, 0xff00aa, 0x00ff88, 0xffff00];
  
  for (var i = 0; i < count; i++) {
    var color = colors[Math.floor(Math.random() * colors.length)];
    var mat = new THREE.MeshStandardMaterial({ 
      color: color, 
      emissive: color, 
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.85
    });

    var group = new THREE.Group();
    
    // NPC Humanoide (Corpo + Cabeça)
    var bodyGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.4, 8);
    var body = new THREE.Mesh(bodyGeo, mat);
    body.position.y = -0.2;
    body.castShadow = true;
    
    var headGeo = new THREE.SphereGeometry(0.35, 8, 8);
    var head = new THREE.Mesh(headGeo, mat);
    head.position.y = 0.7;
    head.castShadow = true;
    
    group.add(body);
    group.add(head);
    
    // Posição inicial (em volta do centro)
    var angle = Math.random() * Math.PI * 2;
    var dist = 20 + Math.random() * 50;
    var startX = Math.cos(angle) * dist;
    var startZ = Math.sin(angle) * dist;
    
    group.position.set(startX, 1, startZ);
    scene.add(group);

    citizens.push({
      mesh: group,
      speed: 1.5 + Math.random() * 2,
      dirX: Math.cos(Math.random() * Math.PI * 2),
      dirZ: Math.sin(Math.random() * Math.PI * 2),
      timer: Math.random() * 5,
      baseY: 1
    });
  }
}

function updateCitizens(delta, time, boundLimit) {
  citizens.forEach(function(c) {
    c.timer -= delta;
    
    // Mudar de direção aleatoriamente
    if (c.timer <= 0) {
      var angle = Math.random() * Math.PI * 2;
      c.dirX = Math.cos(angle);
      c.dirZ = Math.sin(angle);
      c.timer = 2 + Math.random() * 4;
    }
    
    // Mover
    var nx = c.mesh.position.x + c.dirX * c.speed * delta;
    var nz = c.mesh.position.z + c.dirZ * c.speed * delta;
    
    // Bounding limits simples
    if (Math.abs(nx) > boundLimit || Math.abs(nz) > boundLimit) {
      c.dirX *= -1;
      c.dirZ *= -1;
      nx = c.mesh.position.x + c.dirX * c.speed * delta;
      nz = c.mesh.position.z + c.dirZ * c.speed * delta;
    }
    
    c.mesh.position.x = nx;
    c.mesh.position.z = nz;
    
    // Animação de caminhada (bobbing)
    c.mesh.position.y = c.baseY + Math.abs(Math.sin(time * 6 + c.timer)) * 0.2;
    
    // Olhar para onde anda
    var target = new THREE.Vector3(nx + c.dirX, c.mesh.position.y, nz + c.dirZ);
    c.mesh.lookAt(target);
  });
}

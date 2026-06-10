/* ============================================================
   HOVERCARS - Carros voadores neon
   ============================================================ */

var hovercars = [];

function initHovercars(scene) {
  var count = 12; // Menos carros, porem gigantes
  var colors = [0xff0055, 0x00f5ff, 0xffaa00, 0xbb00ff, 0x00ff88];
  
  for (var i = 0; i < count; i++) {
    var group = new THREE.Group();
    var c = colors[Math.floor(Math.random() * colors.length)];
    var mat = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.2, metalness: 0.8 });
    var neonMat = new THREE.MeshBasicMaterial({ color: c, fog: false }); // Neon ignora neblina
    
    // Chassi Gigante
    var chassiGeo = new THREE.BoxGeometry(3.5, 1.2, 8.5);
    var chassi = new THREE.Mesh(chassiGeo, mat);
    chassi.position.y = 0.6;
    group.add(chassi);
    
    // Cabine Superior
    var cabineGeo = new THREE.BoxGeometry(2.5, 0.8, 4);
    var cabine = new THREE.Mesh(cabineGeo, new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0, metalness: 1 }));
    cabine.position.set(0, 1.6, 1);
    group.add(cabine);
    
    // Propulsores Traseiros
    var propL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.2), neonMat);
    propL.position.set(-1.0, 0.6, -4.3);
    group.add(propL);
    
    var propR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.2), neonMat);
    propR.position.set(1.0, 0.6, -4.3);
    group.add(propR);

    // Linhas neon laterais grossas
    var edge1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 8.5), neonMat);
    edge1.position.set(-1.8, 0.6, 0);
    group.add(edge1);

    var edge2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 8.5), neonMat);
    edge2.position.set(1.8, 0.6, 0);
    group.add(edge2);
    
    // Super Iluminacao projetada para o chao
    var light = new THREE.PointLight(c, 4, 50);
    light.position.set(0, -1, 0);
    group.add(light);
    
    // Logica de Voo
    var axis = Math.random() > 0.5 ? 'x' : 'z';
    var dir = Math.random() > 0.5 ? 1 : -1;
    
    // Ruas
    var randomGridPos = (Math.floor(Math.random() * 9) - 4) * 45;
    var randomOtherPos = (Math.random() * 300) - 150;
    
    // Altura super baixa! Voam passando raspando pelos predios e letreiros (Y entre 8 e 18)
    var startY = 8 + Math.random() * 10; 
    
    if (axis === 'x') {
      group.position.set(randomOtherPos, startY, randomGridPos);
      group.rotation.y = dir === 1 ? Math.PI/2 : -Math.PI/2;
    } else {
      group.position.set(randomGridPos, startY, randomOtherPos);
      group.rotation.y = dir === 1 ? 0 : Math.PI;
    }
    
    scene.add(group);
    
    hovercars.push({
      mesh: group,
      speed: 20 + Math.random() * 15, // Velocidade alta
      axis: axis,
      dir: dir,
      baseY: startY,
      timeOffset: Math.random() * 10
    });
  }
}

function updateHovercars(delta, time, boundLimit) {
  hovercars.forEach(function(h) {
    if (h.axis === 'x') {
      h.mesh.position.x += h.dir * h.speed * delta;
      if (h.mesh.position.x > boundLimit) h.mesh.position.x = -boundLimit;
      if (h.mesh.position.x < -boundLimit) h.mesh.position.x = boundLimit;
    } else {
      h.mesh.position.z += h.dir * h.speed * delta;
      if (h.mesh.position.z > boundLimit) h.mesh.position.z = -boundLimit;
      if (h.mesh.position.z < -boundLimit) h.mesh.position.z = boundLimit;
    }
    h.mesh.position.y = h.baseY + Math.sin(time * 2 + h.timeOffset) * 1.5;
  });
}

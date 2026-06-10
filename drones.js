/* ============================================================
   DRONES - Módulo de Drones Voadores
   ============================================================ */

var drones = [];

function initDrones(scene) {
  var count = 10;
  
  // Geometria de diamante/losango para os drones
  var droneGeo = new THREE.OctahedronGeometry(1.2, 0);
  
  for (var i = 0; i < count; i++) {
    var droneGroup = new THREE.Group();
    
    // Corpo
    var mat = new THREE.MeshStandardMaterial({ 
      color: 0x111111, 
      metalness: 0.8,
      roughness: 0.2
    });
    var mesh = new THREE.Mesh(droneGeo, mat);
    mesh.scale.set(1, 0.3, 1);
    droneGroup.add(mesh);
    
    // Luz neon embaixo (scanner)
    var lightColor = Math.random() > 0.5 ? 0xff00aa : 0x00f5ff;
    var scanLight = new THREE.PointLight(lightColor, 2, 20);
    scanLight.position.set(0, -0.5, 0);
    droneGroup.add(scanLight);
    
    // Detalhe neon nas bordas
    var edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(droneGeo),
      new THREE.LineBasicMaterial({ color: lightColor })
    );
    edges.scale.set(1.05, 0.35, 1.05);
    droneGroup.add(edges);
    
    scene.add(droneGroup);

    drones.push({
      group: droneGroup,
      angle: (i / count) * Math.PI * 2,
      radius: 30 + Math.random() * 40,
      speed: 0.2 + Math.random() * 0.3,
      baseY: 15 + Math.random() * 15,
      bobSpeed: 1 + Math.random() * 2
    });
  }
}

function updateDrones(delta, time) {
  drones.forEach(function(d) {
    d.angle += d.speed * delta;
    
    var nx = Math.cos(d.angle) * d.radius;
    var nz = Math.sin(d.angle) * d.radius;
    var ny = d.baseY + Math.sin(time * d.bobSpeed) * 2;
    
    // Calcula direção para o lookAt
    var dx = Math.cos(d.angle + 0.1) * d.radius;
    var dz = Math.sin(d.angle + 0.1) * d.radius;
    
    d.group.position.set(nx, ny, nz);
    d.group.lookAt(dx, ny, dz);
    
    // Inclinação suave simulando voo
    d.group.rotation.z = Math.sin(time * d.bobSpeed) * 0.2;
    d.group.rotation.x += 0.2; // Leve inclinação pra frente
  });
}

/* ============================================================
   MISSIONS - Sistema de Missões
   ============================================================ */

var missionSequence = [
  { targetId: 'HTML TOWER', text: 'Missão 1: Visite a HTML TOWER' },
  { targetId: 'CSS LAB', text: 'Missão 2: Visite o CSS LAB' },
  { targetId: 'JS ARENA', text: 'Missão 3: Visite a JS ARENA' },
  { targetId: null, text: 'Todas as missões concluídas! Explore livremente.' }
];

var currentMissionIndex = 0;

function initMissions() {
  updateMissionHUD();
}

function updateMissionHUD() {
  var hudEl = document.getElementById('hud-mission');
  if (hudEl) {
    hudEl.textContent = missionSequence[currentMissionIndex].text;
  }
}

// Chamada global quando o usuário abre o holograma de um edifício
function checkMissions(buildingName) {
  var current = missionSequence[currentMissionIndex];
  
  if (current.targetId && buildingName === current.targetId) {
    // Missão concluída
    currentMissionIndex++;
    updateMissionHUD();
    showMissionCompleteAlert();
  }
}

function showMissionCompleteAlert() {
  var alertEl = document.getElementById('mission-alert');
  if (!alertEl) return;
  
  alertEl.textContent = 'MISSÃO CONCLUÍDA!';
  alertEl.classList.remove('hidden');
  alertEl.style.animation = 'none';
  // Reflow para reiniciar animação
  void alertEl.offsetWidth;
  alertEl.style.animation = 'alertPulse 2s ease forwards';
  
  setTimeout(function() {
    alertEl.classList.add('hidden');
  }, 3000);
}

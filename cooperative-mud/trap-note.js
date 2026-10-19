// 6단계에서 과잉일반화 선택지를 고른 기기에 7단계에서 되묻는 안내를 보여 준다(scenario.traps 사용).
// 공용 episode.js는 6단계 선택을 7단계에서 읽지 않으므로 이 작은 스크립트가 맡는다.
// 점수·오답 표시는 하지 않고, 다시 말해 보게 묻기만 한다. traps가 없는 활동에서는 아무것도 하지 않는다.
(function () {
  const scenario = window.CoopScenario;
  const saveButton = document.getElementById('statement-save-button');
  const resetButton = document.getElementById('reset-button');
  const box = document.getElementById('trap-note');
  if (!scenario || !scenario.traps || !saveButton || !box) return;

  function render() {
    const notes = scenario.traps.filter(function (trap) {
      const select = document.getElementById('statement-' + trap.field);
      return select && select.value === trap.value;
    }).map(function (trap) { return trap.note; });
    box.innerHTML = notes.length
      ? '<h3>우리 설명을 다시 살펴볼까요?</h3>' + notes.map(function (note) { return '<p>' + note + '</p>'; }).join('')
      : '';
    box.hidden = notes.length === 0;
  }

  // episode.js의 저장 처리가 먼저 등록되어 있으므로, 이 리스너는 그 뒤에 실행된다.
  saveButton.addEventListener('click', render);
  if (resetButton) {
    resetButton.addEventListener('click', function () {
      box.innerHTML = '';
      box.hidden = true;
    });
  }
}());

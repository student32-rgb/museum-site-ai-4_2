/* «Показати більше експонатів».
   Приховані експонати — <article class="scm-window mus-exhibit-extra" hidden> у #exhibits-grid.
   Поки прихованих немає, кнопка неактивна (aria-disabled) з підписом «Усі експонати показано». */
(function () {
  'use strict';

  var btn = document.getElementById('exhibits-more');
  var grid = document.getElementById('exhibits-grid');
  if (!btn || !grid) return;

  var label = btn.querySelector('span');
  var icon = btn.querySelector('svg');
  var STEP = 6;

  function hiddenItems() {
    return grid.querySelectorAll('.mus-exhibit-extra[hidden]');
  }

  function update() {
    var done = hiddenItems().length === 0;
    btn.setAttribute('aria-disabled', done ? 'true' : 'false');
    label.textContent = done ? btn.dataset.labelDone : btn.dataset.labelMore;
    if (icon) icon.hidden = !done;
  }

  btn.addEventListener('click', function () {
    if (btn.getAttribute('aria-disabled') === 'true') return;
    var items = hiddenItems();
    for (var i = 0; i < items.length && i < STEP; i++) items[i].hidden = false;
    update();
  });

  update();
})();

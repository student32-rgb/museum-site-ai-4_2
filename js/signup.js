/* Форма запису: автозаповнення напряму з картки, перевірка полів, 6 станів, відправлення.
   Стани: порожня → після «Записатися» в картці → помилки → надсилання → успіх / не вдалося. */
(function () {
  'use strict';

  /* Адреса обробника заявок. Поки сервера немає (null), відправлення імітується затримкою 1,2 с.
     Сервер має повторити перевірку полів. */
  var SUBMIT_URL = null;
  var FAKE_DELAY = 1200;

  var form = document.getElementById('signup-form');
  if (!form) return;

  var success = document.getElementById('signup-success');
  var again = document.getElementById('signup-again');
  var direction = document.getElementById('f-direction');
  var dirHint = document.getElementById('f-direction-hint');
  var nameInput = document.getElementById('f-name');
  var phoneInput = document.getElementById('f-phone');
  var fail = document.getElementById('f-fail');
  var status = document.getElementById('f-status');
  var submitBtn = document.getElementById('f-submit');
  var sendingBtn = document.getElementById('f-sending');

  var ALERT_ICON = '<svg class="mus-ico" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M7 1h2v2h1v2h1v2h1v2h1v2h1v4H2v-4h1V9h1V7h1V5h1V3h1zM7 5v4h2V5zM7 11v2h2v-2z"/></svg>';

  var fields = {
    direction: { el: direction, msg: form.dataset.msgDirection, check: function (v) { return v !== ''; } },
    name: { el: nameInput, msg: form.dataset.msgName, check: function (v) { return v.trim() !== ''; } },
    phone: { el: phoneInput, msg: form.dataset.msgPhone, check: isPhoneValid }
  };

  function isPhoneValid(v) {
    return /^\+?380\d{9}$/.test(String(v || '').replace(/[\s()\-]/g, ''));
  }

  /* aria-describedby: підказки й помилка поля */
  function describe(key) {
    var f = fields[key];
    var ids = [];
    if (key === 'direction' && !dirHint.hidden) ids.push(dirHint.id);
    if (key === 'phone') ids.push('f-phone-hint');
    if (f.el.getAttribute('aria-invalid') === 'true') ids.push(f.el.id + '-err');
    if (ids.length) f.el.setAttribute('aria-describedby', ids.join(' '));
    else f.el.removeAttribute('aria-describedby');
  }

  function setError(key, on) {
    var f = fields[key];
    var wrap = f.el.closest('.scm-field');
    var errId = f.el.id + '-err';
    var existing = document.getElementById(errId);
    wrap.classList.toggle('scm-field--error', on);
    f.el.setAttribute('aria-invalid', on ? 'true' : 'false');
    if (on && !existing) {
      var p = document.createElement('p');
      p.className = 'scm-field__error';
      p.id = errId;
      p.innerHTML = ALERT_ICON + '<span></span>';
      p.querySelector('span').textContent = f.msg;
      wrap.appendChild(p); // після підказки формату: підказка не ховається
    } else if (!on && existing) {
      existing.remove();
    }
    describe(key);
  }

  function setPrefilled(on) {
    dirHint.hidden = !on;
    describe('direction');
  }

  function setSending(on) {
    form.setAttribute('aria-busy', on ? 'true' : 'false');
    nameInput.readOnly = on;
    phoneInput.readOnly = on;
    // У <select> немає readonly: під час надсилання повертаємо обране значення
    if (on) { direction.setAttribute('aria-readonly', 'true'); direction.dataset.locked = direction.value; }
    else { direction.removeAttribute('aria-readonly'); delete direction.dataset.locked; }
    submitBtn.hidden = on;
    sendingBtn.hidden = !on;
    status.textContent = on ? sendingBtn.textContent.trim() : '';
  }

  function setFailed(on) {
    fail.hidden = !on;
    submitBtn.textContent = on ? form.dataset.labelRetry : form.dataset.labelSubmit;
  }

  function showSuccess() {
    form.hidden = true;
    success.hidden = false;
    success.querySelector('.scm-success').focus();
  }

  function resetForm() {
    form.reset();
    Object.keys(fields).forEach(function (k) { setError(k, false); });
    setPrefilled(false);
    setFailed(false);
    setSending(false);
    success.hidden = true;
    form.hidden = false;
    direction.focus();
  }

  function send(data) {
    if (!SUBMIT_URL) {
      return new Promise(function (resolve) { setTimeout(resolve, FAKE_DELAY); });
    }
    return fetch(SUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
    });
  }

  /* «Записатися» в картці: підставляє напрям і показує підказку */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[data-direction]');
    if (!link) return;
    if (!success.hidden) resetForm();
    direction.value = link.dataset.direction;
    setError('direction', false);
    setPrefilled(true);
  });

  direction.addEventListener('change', function () {
    if (direction.dataset.locked !== undefined) { direction.value = direction.dataset.locked; return; }
    setPrefilled(false);
    if (direction.value) setError('direction', false);
  });
  nameInput.addEventListener('input', function () { setError('name', false); });
  phoneInput.addEventListener('input', function () { setError('phone', false); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.getAttribute('aria-busy') === 'true') return;

    // Перевірка лише після натискання «Надіслати»; фокус — на перше хибне поле
    var firstInvalid = null;
    Object.keys(fields).forEach(function (k) {
      var f = fields[k];
      var ok = f.check(f.el.value);
      setError(k, !ok);
      if (!ok && !firstInvalid) firstInvalid = f.el;
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    setFailed(false);
    setSending(true);
    send({
      direction: direction.value,
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      lang: document.documentElement.lang
    }).then(function () {
      setSending(false);
      showSuccess();
    }, function () {
      // Дані лишаються в полях
      setSending(false);
      setFailed(true);
      submitBtn.focus();
    });
  });

  again.addEventListener('click', resetForm);
})();

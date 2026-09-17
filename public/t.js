/* Compound analytics tracker — embed via <script async src="https://usecompound.xyz/t.js?k=TOKEN"></script> */
(function () {
  var cs = document.currentScript;
  if (!cs) return;
  var src = cs.src || '';
  var qs = src.indexOf('?') >= 0 ? src.slice(src.indexOf('?') + 1) : '';
  var token = '';
  qs.split('&').forEach(function (p) {
    var kv = p.split('=');
    if (kv[0] === 'k') token = decodeURIComponent(kv[1] || '');
  });
  if (!token) return;

  var origin = src.slice(0, src.indexOf('/t.js'));
  var endpoint = origin + '/api/t';

  var sid = '';
  try { sid = sessionStorage.getItem('_cmpd_sid') || ''; } catch (e) {}
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    try { sessionStorage.setItem('_cmpd_sid', sid); } catch (e) {}
  }

  function ship(payload) {
    var body = JSON.stringify(Object.assign({ token: token, sid: sid, url: location.href }, payload));
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, new Blob([body], { type: 'text/plain' }));
        return;
      }
    } catch (e) {}
    fetch(endpoint, { method: 'POST', body: body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(function () {});
  }

  var api = {
    identify: function (uid, traits) {
      ship({ type: 'identify', userId: String(uid || ''), props: traits || {} });
    },
    track: function (name, props) {
      ship({ type: 'track', name: name || '', props: props || {} });
    },
    page: function (name, props) {
      ship({ type: 'page', name: name || document.title, props: props || {} });
    },
  };

  var prev = window._cmpd || {};
  var queue = prev._q || [];
  window._cmpd = api;

  var hadPage = false;
  queue.forEach(function (c) {
    if (c[0] === 'page') hadPage = true;
    if (api[c[0]]) api[c[0]].apply(null, c[1]);
  });
  if (!hadPage) api.page();
})();

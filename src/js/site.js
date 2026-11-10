(function () {
  // Mobile menu
  var btn = document.querySelector('.menu-btn'), nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') nav.classList.remove('open'); });
  }

  // Video: load YouTube only when someone presses play
  document.querySelectorAll('.yt').forEach(function (box) {
    box.addEventListener('click', function () {
      if (box.querySelector('iframe')) return;
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + box.dataset.yt + '?autoplay=1&rel=0';
      f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.allowFullscreen = true; f.title = 'Video';
      box.appendChild(f);
    });
  });

  // Hide events that ended before today (Tampa time), so the site never shows stale events between rebuilds.
  var today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/New_York' }).format(new Date());
  document.querySelectorAll('[data-hide-past]').forEach(function (list) {
    var shown = 0, limit = +list.dataset.limit || 0;
    list.querySelectorAll(':scope > [data-end]').forEach(function (c) {
      if (c.dataset.end < today || (limit && shown >= limit)) c.remove(); else shown++;
    });
    var empty = list.parentNode.querySelector('.empty-note');
    if (empty) empty.hidden = shown > 0;
  });
  document.querySelectorAll('.past-note').forEach(function (n) { n.hidden = !(n.dataset.end < today); });

  // News category filter
  var chips = document.querySelectorAll('.chip[data-filter]');
  function filter(cat) {
    chips.forEach(function (c) { c.classList.toggle('is-on', c.dataset.filter === cat); });
    document.querySelectorAll('.news-grid.all .news-card').forEach(function (card) {
      card.hidden = cat && card.dataset.cat !== cat;
    });
  }
  chips.forEach(function (c) { c.addEventListener('click', function () { filter(c.dataset.filter); }); });
  var q = new URLSearchParams(location.search).get('c');
  if (q && chips.length) filter({ 'press-coverage': 'in-the-news' }[q.replace(/\/$/, '')] || q.replace(/\/$/, ''));

  // Mailchimp (JSONP so visitors stay on the page)
  function mailchimp(form, fields) {
    return new Promise(function (resolve) {
      var cb = 'mc' + Date.now() + Math.floor(Math.random() * 1000);
      var url = form.replace('/post?', '/post-json?') + '&c=' + cb;
      Object.keys(fields).forEach(function (k) { if (fields[k]) url += '&' + encodeURIComponent(k) + '=' + encodeURIComponent(fields[k]); });
      var s = document.createElement('script');
      var t = setTimeout(function () { done({ result: 'error', msg: 'timeout' }); }, 10000);
      function done(r) { clearTimeout(t); delete window[cb]; s.remove(); resolve(r); }
      window[cb] = done;
      s.onerror = function () { done({ result: 'error', msg: 'network' }); };
      s.src = url;
      document.body.appendChild(s);
    });
  }
  var MC_URL = (document.querySelector('[data-mailchimp]') || {}).action;
  var MC_TAGS = ((document.querySelector('[data-mailchimp] [name=tags]') || {}).value) || '';

  document.querySelectorAll('[data-mailchimp]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.form-msg'), b = form.querySelector('button');
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      b.disabled = true; msg.className = 'form-msg'; msg.textContent = 'Signing you up…';
      mailchimp(form.action, data).then(function (r) {
        b.disabled = false;
        if (r.result === 'success' || /already subscribed/i.test(r.msg || '')) {
          msg.textContent = "You're in! Watch your inbox for updates from Team Taryn.";
          form.reset();
        } else if (r.msg === 'timeout' || r.msg === 'network') {
          form.submit(); // fall back to Mailchimp's own page
        } else {
          msg.className = 'form-msg err';
          msg.textContent = (r.msg || 'Something went wrong. Please try again.').replace(/<[^>]+>/g, '').replace(/^\d+ - /, '');
        }
      });
    });
  });

  // Volunteer form: saved in Netlify (with all details) + added to Mailchimp
  document.querySelectorAll('[data-volunteer]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.form-msg'), b = form.querySelector('button');
      var fd = new FormData(form);
      b.disabled = true; msg.className = 'form-msg'; msg.textContent = 'Sending…';
      var body = new URLSearchParams();
      fd.forEach(function (v, k) { body.append(k, v); });
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() })
        .then(function (res) { if (!res.ok) throw new Error(res.status); })
        .then(function () {
          if (MC_URL) mailchimp(MC_URL, { EMAIL: fd.get('email'), FNAME: fd.get('first_name'), LNAME: fd.get('last_name'), tags: MC_TAGS });
          msg.textContent = 'Thank you for joining Team Taryn! Someone from the campaign will be in touch soon.';
          form.reset(); b.disabled = false;
        })
        .catch(function () {
          b.disabled = false; msg.className = 'form-msg err';
          msg.textContent = 'Sorry, that didn’t go through. Please try again or email us.';
        });
    });
  });
})();

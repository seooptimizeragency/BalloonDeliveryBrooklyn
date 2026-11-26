// Shared interactivity: FAQ accordion, scroll-spy nav, YouTube facades, validated in-page form submission.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.faq-item .faq-q').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  const sections = [...document.querySelectorAll('[data-spy]')];
  const links = [...document.querySelectorAll('.main-nav a')];
  if (sections.length && links.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.toggle('active', (l.getAttribute('href') || '').endsWith('#' + e.target.id)));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => obs.observe(s));
  }

  document.querySelectorAll('.yt-facade').forEach(btn => {
    btn.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + btn.dataset.yt + '?autoplay=1&rel=0';
      iframe.title = btn.dataset.title || 'Balloons Lane video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      btn.replaceWith(iframe);
    });
  });

  document.querySelectorAll('form[data-inquiry-form]').forEach(form => {
    const status = form.querySelector('.form-status');
    const button = form.querySelector('button[type="submit"]');
    const frame = form.querySelector('.formsubmit-frame');
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    let submitting = false;
    let settleTimer = null;
    let timeoutTimer = null;

    function setStatus(message, ok) {
      if (!status) return;
      status.textContent = message;
      status.classList.toggle('is-success', !!ok);
      status.classList.toggle('is-error', !ok && !!message);
    }
    function mark(input, invalid) {
      if (!input) return;
      input.classList.toggle('field-invalid', !!invalid);
      if (invalid) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    }
    function finish(ok) {
      if (!submitting) return;
      submitting = false;
      window.clearTimeout(settleTimer);
      window.clearTimeout(timeoutTimer);
      if (button) { button.disabled = false; button.textContent = 'Send'; }
      if (ok) {
        form.reset();
        form.querySelectorAll('.field-invalid').forEach(el => mark(el, false));
        setStatus('Thank you! Your inquiry has been submitted successfully.', true);
      } else {
        setStatus('Sorry, your inquiry could not be sent. Please try again.', false);
      }
    }
    if (frame) {
      frame.addEventListener('load', () => {
        if (!submitting) return;
        let path = '';
        try { path = frame.contentWindow.location.pathname || ''; } catch (e) { path = ''; }
        if (path === '/form-sent/' || path === '/form-sent') { finish(true); return; }
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(() => finish(true), 1500);
      });
    }
    form.addEventListener('input', e => { mark(e.target, false); });
    form.addEventListener('change', e => { mark(e.target, false); });
    form.addEventListener('submit', e => {
      const honey = form.querySelector('[name="_honey"]');
      if (honey && honey.value) { e.preventDefault(); return; }
      const email = form.querySelector('[name="Email"]');
      const date = form.querySelector('[name="Event Date"]');
      const zip = form.querySelector('[name="Delivery Zip Code"]');
      const message = form.querySelector('[name="Message"]');
      const human = form.querySelector('[name="Human Verification"]');
      const file = form.querySelector('[name="attachment"]');
      let firstBad = null;
      function bad(input) { mark(input, true); if (!firstBad) firstBad = input; }
      if (!email || !emailRe.test(email.value.trim())) bad(email);
      if (!date || !date.value) bad(date);
      if (!zip || !zip.value.trim()) bad(zip);
      if (!message || !message.value.trim()) bad(message);
      if (file && file.files && file.files[0] && file.files[0].size > 10 * 1024 * 1024) bad(file);
      if (human && !human.checked) {
        e.preventDefault();
        mark(human, true);
        setStatus('Please verify you are human before sending.', false);
        human.focus();
        return;
      }
      if (firstBad) {
        e.preventDefault();
        setStatus(file && firstBad === file ? 'Please attach a file smaller than 10 MB.' : 'Please complete the required fields before sending.', false);
        firstBad.focus();
        return;
      }
      submitting = true;
      setStatus('', false);
      if (button) { button.disabled = true; button.textContent = 'Sending...'; }
      timeoutTimer = window.setTimeout(() => finish(false), 20000);
    });
  });
});

(function () {
  var btn = document.querySelector('.nav-toggle');
  var nav = document.getElementById('mainNav');
  if (!btn || !nav) return;
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    btn.textContent = open ? '✕' : '☰';
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = '☰';
    }
  });
})();

  // Before/after drag sliders
  document.querySelectorAll('[data-compare]').forEach(function(box){
    var after = box.querySelector('.after');
    var divider = box.querySelector('.divider');
    var handle = box.querySelector('.handle');
    var dragging = false;
    var current = 50;
    function apply(pct){
      current = Math.min(Math.max(pct, 0), 100);
      after.style.clipPath = 'inset(0 0 0 ' + current + '%)';
      divider.style.left = current + '%';
      handle.style.left = current + '%';
      handle.setAttribute('aria-valuenow', Math.round(current));
    }
    function setPos(clientX){
      var rect = box.getBoundingClientRect();
      var x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      apply((x / rect.width) * 100);
    }
    handle.addEventListener('keydown', function(e){
      if(e.key === 'ArrowLeft' || e.key === 'ArrowDown'){ apply(current - 5); e.preventDefault(); }
      if(e.key === 'ArrowRight' || e.key === 'ArrowUp'){ apply(current + 5); e.preventDefault(); }
      if(e.key === 'Home'){ apply(0); e.preventDefault(); }
      if(e.key === 'End'){ apply(100); e.preventDefault(); }
    });
    handle.addEventListener('pointerdown', function(e){
      dragging = true;
      handle.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    handle.addEventListener('pointermove', function(e){ if(dragging) setPos(e.clientX); });
    handle.addEventListener('pointerup', function(){ dragging = false; });
    handle.addEventListener('pointercancel', function(){ dragging = false; });
  });

  // Review carousels: swipe plus arrows plus dots
  document.querySelectorAll('[data-carousel]').forEach(function(col){
    var track = col.querySelector('.rev-track');
    var cards = track.querySelectorAll('.rev-card');
    var dotsBox = col.querySelector('.dots');
    var idx = 0;
    cards.forEach(function(_, i){
      var d = document.createElement('span');
      if(i===0) d.classList.add('active');
      dotsBox.appendChild(d);
    });
    var dots = dotsBox.querySelectorAll('span');
    function go(i){
      idx = Math.max(0, Math.min(i, cards.length-1));
      track.scrollTo({left: idx * track.clientWidth, behavior:'smooth'});
    }
    col.querySelector('[data-prev]').addEventListener('click', function(){ go(idx-1); });
    col.querySelector('[data-next]').addEventListener('click', function(){ go(idx+1); });
    track.addEventListener('scroll', function(){
      var i = Math.round(track.scrollLeft / track.clientWidth);
      if(i !== idx || !dots[i].classList.contains('active')){
        idx = i;
        dots.forEach(function(d, j){ d.classList.toggle('active', j===i); });
      }
    });
  });


  // ----- One-file page router -----
  var pages = {
    home: document.getElementById('page-home'),
    services: document.getElementById('page-services'),
    results: document.getElementById('page-results'),
    contact: document.getElementById('page-contact')
  };
  var titles = {
    home: 'Killer Wash | Pressure Washing Katy TX | Driveways, Patios & More',
    services: 'Services & Pricing | Killer Wash Pressure Washing Katy TX',
    results: 'Before & After Results | Killer Wash Pressure Washing Katy TX',
    contact: 'Contact | Free Quotes | Killer Wash Pressure Washing Katy TX'
  };
  function route(){
    var hash = (location.hash || '#home').replace('#','');
    var target = pages[hash] ? hash : 'home';
    Object.keys(pages).forEach(function(k){ pages[k].style.display = (k === target) ? 'block' : 'none'; });
    document.title = titles[target];
    if (typeof gtag === 'function') {
      gtag('event', 'page_view', {
        page_title: titles[target],
        page_location: location.href,
        page_path: '/' + target
      });
    }
    document.querySelectorAll('.nav-pill ul a').forEach(function(a){
      a.classList.toggle('active', a.getAttribute('data-route') === hash);
    });
    document.getElementById('mobileMenu').classList.remove('open');
    document.body.classList.remove('menu-open');
    document.body.classList.toggle('on-home', target === 'home');
    window.scrollTo(0, 0);
  }
  function toggleMenu(){
    var m = document.getElementById('mobileMenu');
    var open = m.classList.toggle('open');
    document.body.classList.toggle('menu-open', open);
    document.querySelectorAll('.burger').forEach(function(b){ b.setAttribute('aria-expanded', open); });
  }

  window.addEventListener('hashchange', route);
  route();

  // ----- Quote form: AJAX submit to Formspree with success state -----
  var quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    var dateInput = document.getElementById('f-date');
    var dateError = document.getElementById('dateError');
    var today = new Date();
    dateInput.min = today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0');
    function validateDay(){
      if (!dateInput.value) { dateInput.setCustomValidity(''); dateError.style.display = 'none'; return; }
      var parts = dateInput.value.split('-');
      var day = new Date(parts[0], parts[1] - 1, parts[2]).getDay();
      var openDays = [0, 2, 3, 4];
      if (openDays.indexOf(day) === -1) {
        dateInput.setCustomValidity('Please pick a Tuesday, Wednesday, Thursday, or Sunday.');
        dateError.style.display = 'block';
      } else {
        dateInput.setCustomValidity('');
        dateError.style.display = 'none';
      }
    }
    dateInput.addEventListener('change', validateDay);
    dateInput.addEventListener('input', validateDay);

    quoteForm.addEventListener('submit', function(e){
      e.preventDefault();
      validateDay();
      if (!quoteForm.reportValidity()) return;
      var btn = quoteForm.querySelector('.submit');
      btn.disabled = true;
      btn.textContent = 'Sending...';
      document.getElementById('formError').style.display = 'none';
      fetch(quoteForm.action, {
        method: 'POST',
        body: new FormData(quoteForm),
        headers: { 'Accept': 'application/json' }
      }).then(function(res){
        if (res.ok) {
          quoteForm.style.display = 'none';
          document.getElementById('formSuccess').style.display = 'block';
          if (typeof gtag === 'function') gtag('event', 'form_submit');
        } else {
          throw new Error('send failed');
        }
      }).catch(function(){
        btn.disabled = false;
        btn.textContent = 'Send Message';
        document.getElementById('formError').style.display = 'block';
      });
    });
  }

  // ----- GA4: track call and text taps as events -----
  document.querySelectorAll('a[href^="tel:"]').forEach(function(a){
    a.addEventListener('click', function(){
      if (typeof gtag === 'function') gtag('event', 'call_click');
    });
  });
  document.querySelectorAll('a[href^="sms:"]').forEach(function(a){
    a.addEventListener('click', function(){
      if (typeof gtag === 'function') gtag('event', 'text_click');
    });
  });

  // ----- Scroll pop-up on service and results images -----
  var popObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        if(navigator.vibrate) navigator.vibrate(20);
      } else {
        entry.target.classList.remove('in');
      }
    });
  }, {threshold: 0.35});
  document.querySelectorAll('.svc-card, .compare').forEach(function(el){
    popObserver.observe(el);
  });

  // ----- Prefetch subpage header images after the page loads -----
  window.addEventListener('load', function(){
    ['services_headline.jpg','results_headline.jpg'].forEach(function(src){
      var img = new Image();
      img.src = src;
    });
  });

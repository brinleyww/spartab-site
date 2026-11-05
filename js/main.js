document.documentElement.classList.add('js');

// mobile menu
var btn = document.querySelector('.menu-btn');
var nav = document.querySelector('.nav');

if (btn) {
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    btn.textContent = open ? 'Close' : 'Menu';
  });
}

document.getElementById('year').textContent = new Date().getFullYear();

// fade stuff in as you scroll to it. things that come in together get a small stagger
var reveals = document.querySelectorAll('.reveal');
var watched = document.querySelectorAll('.reveal, .bot-pic');

reveals.forEach(function (el) {
  // once it's in, drop the class so hover effects aren't stuck with the slow fade timing
  el.addEventListener('transitionend', function done(ev) {
    if (ev.target !== el || ev.propertyName !== 'opacity') return;
    el.classList.remove('reveal');
    el.style.transitionDelay = '';
    el.removeEventListener('transitionend', done);
  });
});

if ('IntersectionObserver' in window) {
  var io = new IntersectionObserver(function (entries) {
    var n = 0;
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      if (e.target.classList.contains('reveal')) e.target.style.transitionDelay = (n++ % 6) * 80 + 'ms';
      e.target.classList.add('seen');
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });

  watched.forEach(function (el) { io.observe(el); });
} else {
  watched.forEach(function (el) { el.classList.add('seen'); });
}

// home page video: plays while it's on screen, with sound unless you turned it off
var reel = document.querySelector('.reel video');
var soundBtn = document.querySelector('.sound-btn');

if (reel) {
  var stillPlease = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wantSound = true;
  try { wantSound = localStorage.getItem('reelSound') !== 'off'; } catch (e) {}

  var showSound = function () {
    soundBtn.textContent = reel.muted ? 'Sound off' : 'Sound on';
    soundBtn.setAttribute('aria-pressed', !reel.muted);
  };

  var start = function () {
    reel.muted = !wantSound;
    reel.play().then(showSound).catch(function () {
      // browsers block sound until you've clicked or tapped the page once, so start muted
      reel.muted = true;
      showSound();
      // low power mode etc can block autoplay completely, give them the normal controls then
      reel.play().catch(function () { reel.controls = true; });
    });
  };

  // first click/tap/key anywhere turns the sound on if the browser blocked it
  var unlock = function (e) {
    if (e.target.closest && e.target.closest('.sound-btn')) return;
    if (wantSound && reel.muted && !reel.paused) {
      reel.muted = false;
      showSound();
    }
    if (!reel.muted || !wantSound) {
      ['pointerdown', 'keydown'].forEach(function (ev) { document.removeEventListener(ev, unlock); });
    }
  };
  ['pointerdown', 'keydown'].forEach(function (ev) { document.addEventListener(ev, unlock); });

  reel.muted = !wantSound;
  if (stillPlease || !('IntersectionObserver' in window)) {
    reel.controls = true;
  } else {
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) start();
      else reel.pause();
    }, { threshold: 0.4 }).observe(reel);
  }
  showSound();

  reel.addEventListener('click', function () {
    if (reel.controls) return;
    reel.paused ? reel.play() : reel.pause();
  });

  soundBtn.addEventListener('click', function () {
    wantSound = reel.muted;
    reel.muted = !wantSound;
    try { localStorage.setItem('reelSound', wantSound ? 'on' : 'off'); } catch (e) {}
    if (reel.paused && !reel.controls) reel.play();
    showSound();
  });
}

// header shadow + robots timeline
var header = document.querySelector('.top');
var line = document.querySelector('.tl-line span');
var bots = document.querySelectorAll('.bot');

function onScroll() {
  header.classList.toggle('scrolled', window.scrollY > 10);

  if (!line) return;
  var mid = window.innerHeight * 0.6;
  var box = line.parentNode.getBoundingClientRect();
  var fill = Math.min(Math.max((mid - box.top) / box.height, 0), 1);
  line.style.height = fill * 100 + '%';

  bots.forEach(function (b) {
    b.classList.toggle('lit', b.getBoundingClientRect().top + 14 < mid);
  });
}

// end the line at the last dot instead of running past it
function fitLine() {
  var last = bots[bots.length - 1];
  line.parentNode.style.bottom = (last.parentNode.offsetHeight - last.offsetTop - 20) + 'px';
}
if (line) {
  fitLine();
  window.addEventListener('resize', fitLine);
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

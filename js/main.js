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

// home page video. youtube's own loop flashes the end screen and rebuffers,
// so jump back to the start just before the end instead
var ytFrame = document.querySelector('.reel iframe');

if (ytFrame) {
  window.onYouTubeIframeAPIReady = function () {
    var player;
    var watching = false;
    var watch = function () {
      if (!watching) return;
      var left = player.getDuration() - player.getCurrentTime();
      if (left > 0 && left < .25) player.seekTo(0, true);
      requestAnimationFrame(watch);
    };
    player = new YT.Player(ytFrame, {
      events: {
        onStateChange: function (e) {
          watching = e.data === YT.PlayerState.PLAYING;
          if (watching) requestAnimationFrame(watch);
          if (e.data === YT.PlayerState.ENDED) {
            player.seekTo(0, true);
            player.playVideo();
          }
        }
      }
    });
  };
  var api = document.createElement('script');
  api.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(api);
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

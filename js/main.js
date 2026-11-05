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

// Counter animation
document.querySelectorAll('.counter').forEach(counter => {
    const target = +counter.dataset.target;
    let count = 0, step = target/100;
    function update() {
      count += step;
      counter.textContent = (count < target) ? Math.floor(count) : target.toLocaleString();
      if (count < target) requestAnimationFrame(update);
    }
    update();
  });
  
  // Hero image switch
  function changeHero(src) {
    document.getElementById('hero-display').src = src;
  }
  const gallery = document.querySelector('.gallery');
const track = document.querySelector('.gallery-track');

gallery.addEventListener('mouseenter', () => {
  track.style.animationPlayState = 'paused';
});
gallery.addEventListener('mouseleave', () => {
  track.style.animationPlayState = 'running';
});

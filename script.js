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

// DIRECTIONAL NAVIGATION HOVER EFFECTS
document.querySelectorAll('.nav-links a').forEach(link => {
  let mouseX = 0;
  
  // Track mouse position when entering the link
  link.addEventListener('mouseenter', (e) => {
    const rect = link.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    mouseX = e.clientX;
    
    // Remove any existing direction classes
    link.classList.remove('hover-from-left', 'hover-from-right');
    
    // Add direction class based on cursor position
    if (mouseX < centerX) {
      // Cursor entered from left side - animate right
      link.classList.add('hover-from-left');
    } else {
      // Cursor entered from right side - animate left  
      link.classList.add('hover-from-right');
    }
  });
  
  // Clean up on mouse leave
  link.addEventListener('mouseleave', () => {
    link.classList.remove('hover-from-left', 'hover-from-right');
  });
});

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
  // Optional gallery hover pause (only if present on the page)
  (function attachGalleryHoverPause() {
    const gallery = document.querySelector('.gallery');
    const track = document.querySelector('.gallery-track');
    if (!gallery || !track) return;
    gallery.addEventListener('mouseenter', () => {
      track.style.animationPlayState = 'paused';
    });
    gallery.addEventListener('mouseleave', () => {
      track.style.animationPlayState = 'running';
    });
  })();

  // Smooth, infinite, right-to-left marquee for mission page logos
  (function initLogoMarquee() {
    const marquee = document.querySelector('.logo-marquee');
    if (!marquee) return;
    const viewport = marquee.querySelector('.logo-viewport');
    const track = marquee.querySelector('.logo-track');
    if (!viewport || !track) return;

    let offsetX = 0;
    const speedPxPerFrame = 0.7; // adjust for faster/slower scroll
    let rafId = null;
    const gapPx = parseFloat(getComputedStyle(track).gap) || 0;

    function animate() {
      offsetX -= speedPxPerFrame;
      track.style.transform = `translateX(${offsetX}px)`;

      const first = track.firstElementChild;
      if (first) {
        const firstRight = first.getBoundingClientRect().right;
        const viewportLeft = viewport.getBoundingClientRect().left;
        if (firstRight <= viewportLeft) {
          const firstWidth = first.getBoundingClientRect().width;
          track.appendChild(first);
          // trigger smooth re-entry animation on the moved element
          first.classList.remove('logo-reenter');
          // force reflow to restart animation reliably
          // eslint-disable-next-line no-unused-expressions
          void first.offsetWidth;
          first.classList.add('logo-reenter');
          // Compensate offset so there is no visual jump
          offsetX += firstWidth + gapPx;
          track.style.transform = `translateX(${offsetX}px)`;
        }
      }

      rafId = requestAnimationFrame(animate);
    }

    function start() {
      if (rafId == null) rafId = requestAnimationFrame(animate);
    }
    function stop() {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    marquee.addEventListener('mouseenter', stop);
    marquee.addEventListener('mouseleave', start);
    start();
  })();

  // Horizontal timeline: scroll-scrubbed translation (no loop)
  (function initTimeline() {
    const section = document.querySelector('.timeline');
    if (!section) return;
    const viewport = section.querySelector('.timeline-viewport');
    const track = section.querySelector('.timeline-track');
    if (!viewport || !track) return;

    // total scrollable distance equals the overflow width
    function getMaxTranslate() {
      const viewportWidth = viewport.clientWidth;
      const trackWidth = Array.from(track.children).reduce((w, el, i) => w + el.getBoundingClientRect().width + (i ? parseFloat(getComputedStyle(track).gap) : 0), 0);
      return Math.max(0, trackWidth - viewportWidth);
    }

    function updateFromScroll() {
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const start = Math.max(0, rect.top - windowHeight); // when bottom hits viewport top, start
      const end = rect.bottom; // until section bottom leaves viewport
      const progress = Math.min(1, Math.max(0, (window.scrollY - (window.scrollY + rect.top - windowHeight)) / (end - (rect.top))))
      const maxT = -getMaxTranslate();
      const translate = maxT * progress; // 0 to -max
      track.style.transform = `translateX(${translate}px)`;
    }

    // Fallback simpler mapping using Intersection + percentage of section scrolled
    function updateSimple() {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const scrollY = window.scrollY + window.innerHeight; // progress as bottom approaches section
      const progress = Math.min(1, Math.max(0, (scrollY - sectionTop) / (sectionHeight + window.innerHeight)));
      const maxT = -getMaxTranslate();
      track.style.transform = `translateX(${maxT * progress}px)`;
    }

    const onScroll = () => {
      updateSimple();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  })();

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

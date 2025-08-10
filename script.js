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
// ---------- Volunteer Testimonials: infinite right→left, 3-at-a-time ----------
(function volunteerTestimonialsLoop(){
  const viewport = document.querySelector('.testimonial-viewport');
  const track    = document.querySelector('.testimonial-track');
  if (!viewport || !track) return;

  const INTERVAL_MS = 7000;    // 7 seconds per slide
  const TRANSITION  = 600;     // CSS transition ms (keep in sync with CSS)

  let index = 0;               // page index (0-based, leftmost page)
  let visible = 3;             // we’ll clamp to 3 on desktop (2/1 on smaller)
  let timer  = null;

  function countVisible(){
    const w = viewport.clientWidth;
    if (w < 640) return 1;
    if (w < 900) return 2;
    return 3;
  }

  function pageWidth(){
    return viewport.clientWidth; // move by exact viewport width so 3 are fully visible
  }

  function setTranslate(px, animate=true){
    track.style.transition = animate ? `transform ${TRANSITION}ms ease` : 'none';
    track.style.transform  = `translateX(${-px}px)`;
  }

  function setup(){
    // remove old clones
    track.querySelectorAll('.tcard[data-clone]').forEach(n => n.remove());

    visible = countVisible();

    // clone first "visible" cards to end for seamless wrap
    const originals = Array.from(track.querySelectorAll('.tcard:not([data-clone])'));
    originals.slice(0, Math.min(visible, originals.length)).forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute('data-clone','1');
      track.appendChild(clone);
    });

    index = 0;
    setTranslate(0, false);
  }

  function step(){
    const originalsCount = track.querySelectorAll('.tcard:not([data-clone])').length;
    visible = countVisible();
    const pages = Math.max(1, Math.ceil(originalsCount / visible));

    index += 1;
    setTranslate(index * pageWidth(), true);

    // When we slide onto the clones (index === pages), jump back to 0 *after* transition
    if (index === pages) {
      track.addEventListener('transitionend', () => {
        index = 0;
        setTranslate(0, false);   // instant jump to start, no flicker
      }, { once: true });
    }
  }

  function start(){ stop(); timer = setInterval(step, INTERVAL_MS); }
  function stop(){ if (timer) { clearInterval(timer); timer = null; } }

  window.addEventListener('resize', () => { setup(); });
  viewport.addEventListener('mouseenter', stop);
  viewport.addEventListener('mouseleave', start);

  setup();
  start();
})();



// --- Events Roadmap: full-bleed + reveals + wave color shift + blur-up images ---
(function eventsRoadmapFullBleed(){
  const host   = document.getElementById('events-roadmap');
  const wave   = document.getElementById('wave-progress');
  const waveSvg= document.getElementById('wave-svg');
  if (!host || !wave || !waveSvg) return;

  // Events data
  const events = [
    { title:"Bollywood Ball @ Lake Washington High School", date:"2025-01-15", displayDate:"January 15th, 2025",
      excerpt:"Our first-ever youth-only dance with mocktails and an empowering playlist that brought Seattle’s youth together.",
      href:"bollywood-ball.html", img:"../media/img1.JPG" },
    { title:"Dandiya Night 2024 w/ Hopes and Smiles", date:"2024-10-19", displayDate:"October 19th, 2024",
      excerpt:"A joyful cultural celebration supporting youth mental health projects and community pride.",
      href:"dandiya-night.html", img:"../media/img2.JPG" },
    { title:"IACS Summer Fest Booth", date:"2024-06-23", displayDate:"June 23rd, 2024",
      excerpt:"Sold Italian Sodas to raise funds for uncompensated care and met new families in the community.",
      href:"iacs-summer-fest-booth.html", img:"../media/img3.JPG" },
    { title:"TTA Convention Booth", date:"2024-05-24", displayDate:"May 24–26th, 2024",
      excerpt:"We hosted a booth, shared our mission, and connected with hundreds about the importance of research.",
      href:"tta-convention-booth.html", img:"../media/img4.JPG" },
    { title:"IACS Diwali x WAVE", date:"2023-11-18", displayDate:"November 18th, 2023",
      excerpt:"A vibrant booth engaging youth about empowerment and wellness; inviting them to join our mission.",
      href:"iacs-diwali-x-wave.html", img:"../media/img5.JPG" },
    { title:"Dandiya Night 2023 w/ Hopes and Smiles", date:"2023-10-20", displayDate:"October 20th, 2023",
      excerpt:"A festive evening spotlighting South Asian traditions while raising awareness for pediatric cancer research.",
      href:"dandiya-night-2023.html", img:"../media/img6.JPG" }
  ].sort((a,b)=> new Date(b.date) - new Date(a.date)); // newest → oldest

  // Build rows
  const frag = document.createDocumentFragment();
  events.forEach((ev, i) => {
    const side = i % 2 === 0 ? 'left' : 'right';
    const row = document.createElement('div');
    row.className = `event-row ${side}`;
    row.innerHTML = `
      <div class="event-card">
        <div class="event-media">
          <img class="blur-up" src="${ev.img}" alt="${ev.title}" loading="lazy">
        </div>
        <div class="event-body">
          <h3>${ev.title}</h3>
          <div class="event-meta">${ev.displayDate}</div>
          <p>${ev.excerpt}</p>
          <a class="btn pulse-border" href="${ev.href}">Details</a>
        </div>
      </div>
      <svg class="connector" viewBox="0 0 120 80" aria-hidden="true">
        <path d="M2,40 C40,10 80,10 118,40"></path>
      </svg>
    `;
    frag.appendChild(row);
  });
  host.textContent = "";
  host.appendChild(frag);

  // ---- Blur-up loader for all event images
  host.querySelectorAll('.event-media img').forEach(img=>{
    if (img.complete) {
      img.classList.add('is-loaded'); img.classList.remove('blur-up');
    } else {
      img.addEventListener('load', ()=>{ img.classList.add('is-loaded'); img.classList.remove('blur-up'); }, { once:true });
      img.addEventListener('error', ()=>{ img.classList.remove('blur-up'); }, { once:true });
    }
  });

  // ---- Reveal-on-scroll for rows
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.25 });
  host.querySelectorAll('.event-row').forEach(row => io.observe(row));

  // ---- Wavy spine progress + color shift
  const gradStops = waveSvg.querySelectorAll('#grad stop'); // 2 stops
  // base brand colors
  const cStart = [0x23,0xB5,0xD3]; // var(--aqua)   #23B5D3
  const cEnd   = [0x1D,0x4E,0x89]; // var(--deep-blue) #1D4E89
  const lerp = (a,b,t)=> Math.round(a + (b-a)*t);
  const mixHex = (t)=> `#${[0,1,2].map(i=> lerp(cStart[i], cEnd[i], t).toString(16).padStart(2,'0')).join('')}`;

  function setPathMetrics(){
    const len = wave.getTotalLength();
    wave.style.strokeDasharray = len;
    wave.style.strokeDashoffset = len;
  }
  function onScroll(){
    const section = document.querySelector('.roadmap');
    const rect = section.getBoundingClientRect();
    const view = window.innerHeight;
    const progress = Math.max(0, Math.min(1, (view - rect.top) / (rect.height + view)));

    // stroke progress
    const len = wave.getTotalLength();
    wave.style.strokeDashoffset = len * (1 - progress);

    // color shift along progress (top = aqua, bottom = deep-blue)
    const t1 = Math.max(0, progress - 0.15); // slight offset for variety
    const t2 = Math.min(1, progress + 0.15);
    if (gradStops.length >= 2) {
      gradStops[0].setAttribute('stop-color', mixHex(t1));
      gradStops[1].setAttribute('stop-color', mixHex(t2));
    }
  }
  setPathMetrics(); onScroll();
  window.addEventListener('resize', ()=>{ setPathMetrics(); onScroll(); });
  window.addEventListener('scroll', onScroll, { passive:true });
})();

// BollyWood Ball Gallery

document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.getElementById("bb-gallery");

  // Array of image filenames
  const imageList = [
    "img1.JPG", "img2.JPG", "img3.JPG", "img4.JPG", "img5.JPG", "img6.JPG",
    "img7.JPG", "img8.JPG", "img9.JPG", "img10.JPG", "img11.JPG", "img12.JPG"
  ];

  imageList.forEach((imgName, index) => {
    const imgCard = document.createElement("a");
    imgCard.classList.add("gcard");
    imgCard.href = `../media/${imgName}`;
    imgCard.target = "_blank";
    imgCard.rel = "noopener";

    imgCard.innerHTML = `
      <span class="ring"></span>
      <img loading="lazy" src="../media/${imgName}" alt="Event photo ${index + 1}">
    `;

    gallery.appendChild(imgCard);
  });
});


/* ---------------------------
   Reusable Event Gallery
   usage:
     buildEventGallery('bb-gallery', [
       'img1.JPG','img2.JPG', ... 'img12.JPG'
     ], '../media/');
----------------------------*/
function buildEventGallery(containerId, filenames, basePath = '../media/') {
  const el = document.getElementById(containerId);
  if (!el) return;

  // Prevent duplicates if called twice
  if (el.dataset.built === '1') return;
  el.dataset.built = '1';

  const html = filenames.map((name, i) => `
    <a class="gcard" href="${basePath}${name}" target="_blank" rel="noopener">
      <span class="ring"></span>
      <img loading="lazy" src="${basePath}${name}" alt="Event photo ${i + 1}">
    </a>
  `).join('');
  el.innerHTML = html;
}

/* (Optional) KPI counters start when the hero enters view on event pages */
(function initEventCounters() {
  const hero = document.querySelector('.event-hero');
  if (!hero) return;
  const counters = hero.querySelectorAll('.counter');
  if (!counters.length) return;

  const start = () => {
    counters.forEach(counter => {
      const target = +counter.dataset.target || 0;
      const prefix = counter.dataset.prefix || '';
      let curr = 0;
      const step = Math.max(1, Math.ceil(target / 80));
      function tick() {
        curr += step;
        if (curr >= target) { counter.textContent = prefix + target.toLocaleString(); return; }
        counter.textContent = prefix + curr.toLocaleString();
        requestAnimationFrame(tick);
      }
      tick();
    });
  };

  const io = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) {
      start();
      io.disconnect();
    }
  }, { threshold: 0.35 });

  io.observe(hero);
})();


// ===== Meet the Team page wiring =====
(function () {
  const isTeamPage =
    document.getElementById('exec-row-top') ||
    document.getElementById('admin-row-top');
  if (!isTeamPage) return;

  // Data
  const EXEC = [
    { name:'Sanjana Medikurthi', role:'Founder & President', img:'../media/img2.JPG',
      desc:`Leads strategy and vision, fosters inclusive culture, represents WAVE to partners, the public, and Seattle Children’s, and keeps the team aligned on mission and outcomes.` },
    { name:'Moksh Doshi', role:'Vice President', img:'../media/img3.JPG',
      desc:`Partners with the President on strategy and operations, supports leads across events, and steps in wherever needed to keep programs running smoothly.` },
    { name:'Lahari Nellore', role:'Secretary', img:'../media/img4.JPG',
      desc:`Owns internal communication and documentation, meeting agendas and notes, and ensures action items move forward on schedule.` },
    { name:'Bhuvan Carjala', role:'Treasurer', img:'../media/img5.JPG',
      desc:`Manages budgets, donation reconciliation, and financial reporting. Works with event leads to plan costs and track progress toward goals.` },
    { name:'Sahasra Voruganti', role:'Social Media Manager', img:'../media/img6.JPG',
      desc:`Runs content calendars, creative assets, and engagement across platforms to grow awareness and amplify event campaigns.` },
  ];

  const ADMIN = [
    { name:'Laasya Chintamani', role:'Head of Development', img:'../media/img7.JPG',
      desc:`Supports sponsorships, donor relations, and grant opportunities. Creates materials that clearly communicate impact and needs.` },
    { name:'Samina Ali', role:'Head of Community Outreach', img:'../media/img8.JPG',
      desc:`Builds partnerships with schools, cultural orgs, and local groups. Coordinates volunteers and helps recruit new members.` },
    { name:'Omkar Page', role:'Head of Technology', img:'../media/img9.JPG',
      desc:`Oversees the website and digital tools, streamlines workflows, and supports event tech (ticketing, forms, analytics).` },
    { name:'Saketh Desam', role:'Head of Volunteer Connections', img:'../media/img10.JPG',
      desc:`Leads volunteer intake, onboarding, and scheduling. Ensures volunteers are trained, supported, and recognized.` },
  ];

  // Render helper
  function renderTeam(list, mountId, dataList) {
    const m = document.getElementById(mountId);
    if (!m) return;
    m.innerHTML = list.map((p, i) => `
      <button class="member" data-i="${i}" data-list="${dataList}">
        <div class="avatar"><img src="${p.img}" alt="${p.name}"></div>
        <div class="member-name">${p.name}</div>
        <div class="member-role">${p.role}</div>
      </button>
    `).join('');
  }

  // Exec: 3 top, 2 bottom (same horizontal spacing using 3-col grid)
  renderTeam(EXEC.slice(0, 3), 'exec-row-top', 'exec');
  renderTeam(EXEC.slice(3),     'exec-row-bottom', 'exec');

  // Admin: 3 top, 1 bottom centered (3-col grid, middle column)
  renderTeam(ADMIN.slice(0, 3), 'admin-row-top', 'admin');
  renderTeam(ADMIN.slice(3),    'admin-row-bottom', 'admin');

  // Modal bindings (+ toggle)
  const modal   = document.getElementById('team-modal');
  const closeX  = document.getElementById('tm-close');
  const closeB  = document.getElementById('tm-close-2');
  const tmA = document.getElementById('tm-avatar');
  const tmN = document.getElementById('tm-name');
  const tmR = document.getElementById('tm-role');
  const tmD = document.getElementById('tm-desc');

  let openKey = null; // tracks which card is open (listName|index)

  function openModal(person, key) {
    tmA.src  = person.img;  tmA.alt = person.name;
    tmN.textContent = person.name;
    tmR.textContent = person.role;
    tmD.textContent = person.desc;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    openKey = key;
  }
  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    openKey = null;
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.member');
    if (btn) {
      const idx = +btn.dataset.i;
      const listName = btn.dataset.list;
      const list = (listName === 'exec') ? EXEC : ADMIN;
      const person = list[idx];
      const key = `${listName}|${idx}`;

      // toggle behavior (click same card closes)
      if (openKey === key && modal.getAttribute('aria-hidden') === 'false') {
        closeModal();
      } else if (person) {
        openModal(person, key);
      }
    }
    // backdrop click closes
    if (e.target.id === 'team-modal') closeModal();
  });

  if (closeX) closeX.addEventListener('click', closeModal);
  if (closeB) closeB.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
})();

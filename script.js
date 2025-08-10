// =============================================================================
// WAVE Foundation Website - Main JavaScript Module
// =============================================================================

/**
 * Main application controller
 */
const WaveApp = {
  // Configuration constants
  CONFIG: {
    ANIMATION_DURATION: 600,
    SCROLL_THROTTLE: 16,
    COUNTER_STEPS: 100,
    TIMELINE_SPEED: 0.7,
    TESTIMONIAL_INTERVAL: 7000
  },

  // Initialize all components
  init() {
    this.initCounters();
    this.initHeroImageSwitcher();
    this.initGalleryControls();
    this.initLogoMarquee();
    this.initTimeline();
    this.initNavigationEffects();
    this.initTestimonials();
    this.initEventsRoadmap();
    this.initEventGallery();
    this.initEventCounters();
    this.initTimelineVisualization();
    this.initWaveCanvas();
  }
};

// =============================================================================
// COUNTER ANIMATIONS MODULE
// =============================================================================

const CounterAnimations = {
  /**
   * Initialize counter animations for elements with data-target attribute
   */
  init() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => this.animateCounter(counter));
  },

  /**
   * Animate a single counter element
   * @param {HTMLElement} counter - Counter element to animate
   */
  animateCounter(counter) {
    const target = parseInt(counter.dataset.target) || 0;
    const step = Math.max(1, Math.ceil(target / WaveApp.CONFIG.COUNTER_STEPS));
    let current = 0;

    const updateCounter = () => {
      current += step;
      const displayValue = current < target ? current : target;
      counter.textContent = displayValue.toLocaleString();
      
      if (current < target) {
        requestAnimationFrame(updateCounter);
      }
    };

    updateCounter();
  }
};

// =============================================================================
// HERO IMAGE SWITCHER MODULE
// =============================================================================

const HeroImageSwitcher = {
  /**
   * Initialize hero image switching functionality
   */
  init() {
    // Make changeHero function globally available for HTML onclick handlers
    window.changeHero = this.changeHero.bind(this);
  },

  /**
   * Change the hero display image
   * @param {string} src - Image source URL
   */
  changeHero(src) {
    const heroDisplay = document.getElementById('hero-display');
    if (heroDisplay && src) {
      heroDisplay.src = src;
    }
  }
};

// =============================================================================
// GALLERY CONTROLS MODULE
// =============================================================================

const GalleryControls = {
  /**
   * Initialize gallery hover pause functionality
   */
  init() {
    const gallery = document.querySelector('.gallery');
    const track = document.querySelector('.gallery-track');
    
    if (!gallery || !track) {
      return;
    }

    this.attachHoverPause(gallery, track);
  },

  /**
   * Attach hover pause functionality to gallery
   * @param {HTMLElement} gallery - Gallery container
   * @param {HTMLElement} track - Gallery track element
   */
  attachHoverPause(gallery, track) {
    gallery.addEventListener('mouseenter', () => {
      track.style.animationPlayState = 'paused';
    });

    gallery.addEventListener('mouseleave', () => {
      track.style.animationPlayState = 'running';
    });
  }
};

// =============================================================================
// LOGO MARQUEE MODULE
// =============================================================================

const LogoMarquee = {
  /**
   * Initialize smooth infinite logo marquee
   */
  init() {
    const marquee = document.querySelector('.logo-marquee');
    if (!marquee) {
      return;
    }

    const viewport = marquee.querySelector('.logo-viewport');
    const track = marquee.querySelector('.logo-track');
    
    if (!viewport || !track) {
      return;
    }

    this.setupMarquee(marquee, viewport, track);
  },

  /**
   * Setup marquee animation and controls
   * @param {HTMLElement} marquee - Marquee container
   * @param {HTMLElement} viewport - Viewport element
   * @param {HTMLElement} track - Track element
   */
  setupMarquee(marquee, viewport, track) {
    let offsetX = 0;
    let rafId = null;
    const speedPxPerFrame = WaveApp.CONFIG.TIMELINE_SPEED;
    const gapPx = parseFloat(getComputedStyle(track).gap) || 0;

    const animate = () => {
      offsetX -= speedPxPerFrame;
      track.style.transform = `translateX(${offsetX}px)`;

      const first = track.firstElementChild;
      if (first && this.shouldMoveFirstElement(first, viewport)) {
        this.moveElementToEnd(first, track);
        offsetX += first.getBoundingClientRect().width + gapPx;
        track.style.transform = `translateX(${offsetX}px)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    const start = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(animate);
      }
    };

    const stop = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    marquee.addEventListener('mouseenter', stop);
    marquee.addEventListener('mouseleave', start);
    start();
  },

  /**
   * Check if first element should be moved to end
   * @param {HTMLElement} first - First element
   * @param {HTMLElement} viewport - Viewport element
   * @returns {boolean}
   */
  shouldMoveFirstElement(first, viewport) {
    const firstRight = first.getBoundingClientRect().right;
    const viewportLeft = viewport.getBoundingClientRect().left;
    return firstRight <= viewportLeft;
  },

  /**
   * Move element to end of track with re-entry animation
   * @param {HTMLElement} element - Element to move
   * @param {HTMLElement} track - Track container
   */
  moveElementToEnd(element, track) {
    track.appendChild(element);
    element.classList.remove('logo-reenter');
    // Force reflow to restart animation
    void element.offsetWidth;
    element.classList.add('logo-reenter');
  }
};

// =============================================================================
// TIMELINE SCROLL MODULE
// =============================================================================

const TimelineScroll = {
  /**
   * Initialize horizontal timeline with scroll-based animation
   */
  init() {
    const section = document.querySelector('.timeline');
    if (!section) {
      return;
    }

    const viewport = section.querySelector('.timeline-viewport');
    const track = section.querySelector('.timeline-track');
    
    if (!viewport || !track) {
      return;
    }

    this.setupScrollTimeline(section, viewport, track);
  },

  /**
   * Setup scroll-based timeline animation
   * @param {HTMLElement} section - Timeline section
   * @param {HTMLElement} viewport - Timeline viewport
   * @param {HTMLElement} track - Timeline track
   */
  setupScrollTimeline(section, viewport, track) {
    const updateFromScroll = () => {
      const progress = this.calculateScrollProgress(section);
      const maxTranslate = this.getMaxTranslate(viewport, track);
      const translateX = -maxTranslate * progress;
      track.style.transform = `translateX(${translateX}px)`;
    };

    // Throttled scroll handler for performance
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateFromScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      requestAnimationFrame(updateFromScroll);
    });

    updateFromScroll();
  },

  /**
   * Calculate scroll progress through timeline section
   * @param {HTMLElement} section - Timeline section
   * @returns {number} Progress from 0 to 1
   */
  calculateScrollProgress(section) {
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    const triggerStart = rect.top;
    const triggerEnd = rect.bottom - windowHeight;
    
    if (triggerStart <= 0 && triggerEnd >= 0) {
      const scrollDistance = -triggerStart;
      const totalDistance = rect.height;
      return Math.min(1, Math.max(0, scrollDistance / totalDistance));
    } else if (triggerEnd < 0) {
      return 1;
    }
    
    return 0;
  },

  /**
   * Get maximum translate distance needed
   * @param {HTMLElement} viewport - Viewport element
   * @param {HTMLElement} track - Track element
   * @returns {number} Maximum translate distance
   */
  getMaxTranslate(viewport, track) {
    const viewportWidth = viewport.clientWidth;
    const trackWidth = track.scrollWidth;
    return Math.max(0, trackWidth - viewportWidth);
  }
};

// =============================================================================
// NAVIGATION EFFECTS MODULE
// =============================================================================

const NavigationEffects = {
  /**
   * Initialize directional navigation hover effects
   */
  init() {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => this.attachHoverEffect(link));
  },

  /**
   * Attach directional hover effect to navigation link
   * @param {HTMLElement} link - Navigation link element
   */
  attachHoverEffect(link) {
    let mouseX = 0;

    link.addEventListener('mouseenter', (e) => {
      const rect = link.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      mouseX = e.clientX;

      // Remove existing direction classes
      link.classList.remove('hover-from-left', 'hover-from-right');

      // Add direction class based on cursor position
      if (mouseX < centerX) {
        link.classList.add('hover-from-left');
      } else {
        link.classList.add('hover-from-right');
      }
    });

    link.addEventListener('mouseleave', () => {
      link.classList.remove('hover-from-left', 'hover-from-right');
    });
  }
};

// =============================================================================
// TESTIMONIALS MODULE
// =============================================================================

const TestimonialsCarousel = {
  // Configuration
  INTERVAL_MS: 7000,
  TRANSITION_MS: 600,

  /**
   * Initialize volunteer testimonials carousel
   */
  init() {
    const viewport = document.querySelector('.testimonial-viewport');
    const track = document.querySelector('.testimonial-track');
    
    if (!viewport || !track) {
      return;
    }

    this.setupCarousel(viewport, track);
  },

  /**
   * Setup testimonials carousel with infinite loop
   * @param {HTMLElement} viewport - Carousel viewport
   * @param {HTMLElement} track - Carousel track
   */
  setupCarousel(viewport, track) {
    let index = 0;
    let visible = 3;
    let timer = null;

    const countVisible = () => {
      const width = viewport.clientWidth;
      if (width < 640) {
        return 1;
      }
      if (width < 900) {
        return 2;
      }
      return 3;
    };

    const pageWidth = () => viewport.clientWidth;

    const setTranslate = (px, animate = true) => {
      track.style.transition = animate ? 
        `transform ${this.TRANSITION_MS}ms ease` : 'none';
      track.style.transform = `translateX(${-px}px)`;
    };

    const setup = () => {
      // Remove old clones
      track.querySelectorAll('.tcard[data-clone]').forEach(n => n.remove());

      visible = countVisible();

      // Clone first cards for seamless wrap
      const originals = Array.from(track.querySelectorAll('.tcard:not([data-clone])'));
      const clonesNeeded = Math.min(visible, originals.length);
      
      originals.slice(0, clonesNeeded).forEach(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute('data-clone', '1');
        track.appendChild(clone);
      });

      index = 0;
      setTranslate(0, false);
    };

    const step = () => {
      const originalsCount = track.querySelectorAll('.tcard:not([data-clone])').length;
      visible = countVisible();
      const pages = Math.max(1, Math.ceil(originalsCount / visible));

      index += 1;
      setTranslate(index * pageWidth(), true);

      // Handle infinite loop
      if (index === pages) {
        track.addEventListener('transitionend', () => {
          index = 0;
          setTranslate(0, false);
        }, { once: true });
      }
    };

    const start = () => {
      stop();
      timer = setInterval(step, this.INTERVAL_MS);
    };

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    // Event listeners
    window.addEventListener('resize', setup);
    viewport.addEventListener('mouseenter', stop);
    viewport.addEventListener('mouseleave', start);

    setup();
    start();
  }
};

// =============================================================================
// EVENTS ROADMAP MODULE
// =============================================================================

const EventsRoadmap = {
  /**
   * Initialize events roadmap with animations and color shifts
   */
  init() {
    const host = document.getElementById('events-roadmap');
    const wave = document.getElementById('wave-progress');
    const waveSvg = document.getElementById('wave-svg');
    
    if (!host || !wave || !waveSvg) {
      return;
    }

    this.setupRoadmap(host);
    this.setupWaveProgress(wave, waveSvg);
  },

  /**
   * Setup roadmap events data and DOM
   * @param {HTMLElement} host - Events container
   */
  setupRoadmap(host) {
    const events = this.getEventsData();
    this.buildEventsDOM(host, events);
    this.setupImageLoading(host);
    this.setupScrollReveal(host);
  },

  /**
   * Get events data
   * @returns {Array} Events data array
   */
  getEventsData() {
    return [
      { title: "Bollywood Ball @ Lake Washington High School", date: "2025-01-15", displayDate: "January 15th, 2025",
        excerpt: "Our first-ever youth-only dance with mocktails and an empowering playlist that brought Seattle's youth together.",
        href: "bollywood-ball.html", img: "../media/img1.JPG" },
      { title: "Dandiya Night 2024 w/ Hopes and Smiles", date: "2024-10-19", displayDate: "October 19th, 2024",
        excerpt: "A joyful cultural celebration supporting youth mental health projects and community pride.",
        href: "dandiya-night.html", img: "../media/img2.JPG" },
      { title: "IACS Summer Fest Booth", date: "2024-06-23", displayDate: "June 23rd, 2024",
        excerpt: "Sold Italian Sodas to raise funds for uncompensated care and met new families in the community.",
        href: "iacs-summer-fest-booth.html", img: "../media/img3.JPG" },
      { title: "TTA Convention Booth", date: "2024-05-24", displayDate: "May 24–26th, 2024",
        excerpt: "We hosted a booth, shared our mission, and connected with hundreds about the importance of research.",
        href: "tta-convention-booth.html", img: "../media/img4.JPG" },
      { title: "IACS Diwali x WAVE", date: "2023-11-18", displayDate: "November 18th, 2023",
        excerpt: "A vibrant booth engaging youth about empowerment and wellness; inviting them to join our mission.",
        href: "iacs-diwali-x-wave.html", img: "../media/img5.JPG" },
      { title: "Dandiya Night 2023 w/ Hopes and Smiles", date: "2023-10-20", displayDate: "October 20th, 2023",
        excerpt: "A festive evening spotlighting South Asian traditions while raising awareness for pediatric cancer research.",
        href: "dandiya-night-2023.html", img: "../media/img6.JPG" }
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  /**
   * Build events DOM structure
   * @param {HTMLElement} host - Container element
   * @param {Array} events - Events data
   */
  buildEventsDOM(host, events) {
    const fragment = document.createDocumentFragment();
    
    events.forEach((event, i) => {
      const side = i % 2 === 0 ? 'left' : 'right';
      const row = document.createElement('div');
      row.className = `event-row ${side}`;
      row.innerHTML = `
        <div class="event-card">
          <div class="event-media">
            <img class="blur-up" src="${event.img}" alt="${event.title}" loading="lazy">
          </div>
          <div class="event-body">
            <h3>${event.title}</h3>
            <div class="event-meta">${event.displayDate}</div>
            <p>${event.excerpt}</p>
            <a class="btn pulse-border" href="${event.href}">Details</a>
          </div>
        </div>
        <svg class="connector" viewBox="0 0 120 80" aria-hidden="true">
          <path d="M2,40 C40,10 80,10 118,40"></path>
        </svg>
      `;
      fragment.appendChild(row);
    });
    
    host.textContent = "";
    host.appendChild(fragment);
  },

  /**
   * Setup blur-up image loading
   * @param {HTMLElement} host - Container element
   */
  setupImageLoading(host) {
    host.querySelectorAll('.event-media img').forEach(img => {
      if (img.complete) {
        img.classList.add('is-loaded');
        img.classList.remove('blur-up');
      } else {
        img.addEventListener('load', () => {
          img.classList.add('is-loaded');
          img.classList.remove('blur-up');
        }, { once: true });
        
        img.addEventListener('error', () => {
          img.classList.remove('blur-up');
        }, { once: true });
      }
    });
  },

  /**
   * Setup scroll reveal animation
   * @param {HTMLElement} host - Container element
   */
  setupScrollReveal(host) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    host.querySelectorAll('.event-row').forEach(row => observer.observe(row));
  },

  /**
   * Setup wave progress and color shifting
   * @param {HTMLElement} wave - Wave path element
   * @param {HTMLElement} waveSvg - Wave SVG container
   */
  setupWaveProgress(wave, waveSvg) {
    const gradStops = waveSvg.querySelectorAll('#grad stop');
    const brandColors = {
      start: [0x23, 0xB5, 0xD3], // #23B5D3
      end: [0x1D, 0x4E, 0x89]    // #1D4E89
    };

    const lerp = (a, b, t) => Math.round(a + (b - a) * t);
    const mixHex = (t) => `#${[0, 1, 2].map(i => 
      lerp(brandColors.start[i], brandColors.end[i], t)
        .toString(16).padStart(2, '0')
    ).join('')}`;

    const setPathMetrics = () => {
      const length = wave.getTotalLength();
      wave.style.strokeDasharray = length;
      wave.style.strokeDashoffset = length;
    };

    const onScroll = () => {
      const section = document.querySelector('.roadmap');
      if (!section) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      const progress = Math.max(0, Math.min(1, 
        (viewHeight - rect.top) / (rect.height + viewHeight)
      ));

      // Update stroke progress
      const length = wave.getTotalLength();
      wave.style.strokeDashoffset = length * (1 - progress);

      // Update gradient colors
      const t1 = Math.max(0, progress - 0.15);
      const t2 = Math.min(1, progress + 0.15);
      
      if (gradStops.length >= 2) {
        gradStops[0].setAttribute('stop-color', mixHex(t1));
        gradStops[1].setAttribute('stop-color', mixHex(t2));
      }
    };

    setPathMetrics();
    onScroll();
    
    window.addEventListener('resize', () => {
      setPathMetrics();
      onScroll();
    });
    
    window.addEventListener('scroll', onScroll, { passive: true });
  }
};

// =============================================================================
// EVENT GALLERY MODULE
// =============================================================================

const EventGallery = {
  /**
   * Initialize event galleries
   */
  init() {
    this.initBollywoodBallGallery();
    this.setupEventGalleryBuilder();
  },

  /**
   * Initialize Bollywood Ball gallery specifically
   */
  initBollywoodBallGallery() {
    const gallery = document.getElementById("bb-gallery");
    if (!gallery) {
      return;
    }

    const imageList = [
      "img1.JPG", "img2.JPG", "img3.JPG", "img4.JPG", "img5.JPG", "img6.JPG",
      "img7.JPG", "img8.JPG", "img9.JPG", "img10.JPG", "img11.JPG", "img12.JPG"
    ];

    this.buildGallery(gallery, imageList, "../media/");
  },

  /**
   * Build gallery from image list
   * @param {HTMLElement} container - Gallery container
   * @param {Array} imageList - Array of image filenames
   * @param {string} basePath - Base path for images
   */
  buildGallery(container, imageList, basePath) {
    const fragment = document.createDocumentFragment();
    
    imageList.forEach((imgName, index) => {
      const imgCard = document.createElement("a");
      imgCard.classList.add("gcard");
      imgCard.href = `${basePath}${imgName}`;
      imgCard.target = "_blank";
      imgCard.rel = "noopener";

      imgCard.innerHTML = `
        <span class="ring"></span>
        <img loading="lazy" src="${basePath}${imgName}" alt="Event photo ${index + 1}">
      `;

      fragment.appendChild(imgCard);
    });

    container.appendChild(fragment);
  },

  /**
   * Setup reusable event gallery builder function
   */
  setupEventGalleryBuilder() {
    window.buildEventGallery = (containerId, filenames, basePath = '../media/') => {
      const element = document.getElementById(containerId);
      if (!element) {
        return;
      }

      // Prevent duplicates if called twice
      if (element.dataset.built === '1') {
        return;
      }
      element.dataset.built = '1';

      this.buildGallery(element, filenames, basePath);
    };
  }
};

// =============================================================================
// EVENT COUNTERS MODULE
// =============================================================================

const EventCounters = {
  /**
   * Initialize KPI counters for event pages
   */
  init() {
    const hero = document.querySelector('.event-hero');
    if (!hero) {
      return;
    }

    const counters = hero.querySelectorAll('.counter');
    if (!counters.length) {
      return;
    }

    this.setupIntersectionObserver(hero, counters);
  },

  /**
   * Setup intersection observer for counter animation
   * @param {HTMLElement} hero - Hero section
   * @param {NodeList} counters - Counter elements
   */
  setupIntersectionObserver(hero, counters) {
    const startCounters = () => {
      counters.forEach(counter => {
        const target = parseInt(counter.dataset.target) || 0;
        const prefix = counter.dataset.prefix || '';
        this.animateCounter(counter, target, prefix);
      });
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        startCounters();
        observer.disconnect();
      }
    }, { threshold: 0.35 });

    observer.observe(hero);
  },

  /**
   * Animate individual counter
   * @param {HTMLElement} counter - Counter element
   * @param {number} target - Target value
   * @param {string} prefix - Text prefix
   */
  animateCounter(counter, target, prefix) {
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 80));
    
    const tick = () => {
      current += step;
      if (current >= target) {
        counter.textContent = prefix + target.toLocaleString();
        return;
      }
      counter.textContent = prefix + current.toLocaleString();
      requestAnimationFrame(tick);
    };
    
    tick();
  }
};

// =============================================================================
// TIMELINE VISUALIZATION MODULE
// =============================================================================

const TimelineVisualization = {
  /**
   * Initialize interactive timeline visualization
   */
  init() {
    const timelineTrack = document.getElementById('timelineTrack');
    const timelineWrapper = document.querySelector('.timeline-wrapper');
    
    if (!timelineTrack || !timelineWrapper) {
      return;
    }

    this.setupTimeline(timelineTrack, timelineWrapper);
  },

  /**
   * Get timeline data
   * @returns {Array} Timeline data
   */
  getTimelineData() {
    return [
      { date: "Jan 2020", title: "WAVE Foundation", description: "Journey begins to support children's cancer research", image: "../media/hero1.jpg" },
      { date: "Mar 2021", title: "First Community Event", description: "Inaugural fundraising event", image: "../media/img1.JPG" },
      { date: "Jul 2021", title: "Seattle Children's Partnership", description: "Official hospital partnership established", image: "../media/img2.JPG" },
      { date: "Oct 2021", title: "Dandiya Night Launch", description: "Traditional dance celebration fundraiser", image: "../media/img3.JPG" },
      { date: "Feb 2022", title: "Research Grant Milestone", description: "Reached $50,000 in research funding", image: "../media/img4.JPG" },
      { date: "Jun 2022", title: "Summer Festival", description: "Community outreach at local festivals", image: "../media/img5.JPG" },
      { date: "Sep 2022", title: "Bollywood Ball Premiere", description: "Elegant gala celebrating impact", image: "../media/img6.JPG" },
      { date: "Dec 2022", title: "Year-End Impact", description: "Supporting 100+ families", image: "../media/img7.JPG" },
      { date: "Apr 2023", title: "Educational Outreach", description: "Awareness programs in schools", image: "../media/img8.JPG" },
      { date: "Aug 2023", title: "Community Growth", description: "Expanding to 200+ volunteers", image: "../media/img9.JPG" },
      { date: "Nov 2023", title: "Digital Innovation", description: "New fundraising platforms", image: "../media/img10.JPG" },
      { date: "Mar 2024", title: "Medical Equipment Fund", description: "Contributing to treatment technology", image: "../media/img11.JPG" },
      { date: "Jul 2024", title: "National Recognition", description: "Featured in pediatric cancer advocacy", image: "../media/img12.JPG" },
      { date: "Dec 2024", title: "Milestone Achievement", description: "Reaching $500,000 in contributions", image: "../media/hero2.jpg" },
      { date: "Jan 2025", title: "Future Vision", description: "Expanding mission with new programs", image: "../media/hero3.jpg" }
    ];
  },

  /**
   * Setup timeline with all functionality
   * @param {HTMLElement} timelineTrack - Timeline track element
   * @param {HTMLElement} timelineWrapper - Timeline wrapper element
   */
  setupTimeline(timelineTrack, timelineWrapper) {
    this.createTimelineItems(timelineTrack);
    this.setupEventListeners(timelineWrapper);
    this.updateActiveItem(timelineWrapper);
  },

  /**
   * Create timeline items from data
   * @param {HTMLElement} timelineTrack - Timeline track element
   */
  createTimelineItems(timelineTrack) {
    const timelineData = this.getTimelineData();
    const fragment = document.createDocumentFragment();
    
    timelineData.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'timeline-item';
      div.dataset.index = index;
      div.innerHTML = `
        <img src="${item.image}" alt="${item.title}" class="timeline-image" 
             onerror="this.src='../media/hero4.jpg'">
        <div class="timeline-date">${item.date}</div>
        <div class="timeline-title">${item.title}</div>
        <div class="timeline-description">${item.description}</div>
      `;
      fragment.appendChild(div);
    });
    
    timelineTrack.appendChild(fragment);
  },

  /**
   * Setup event listeners for timeline
   * @param {HTMLElement} timelineWrapper - Timeline wrapper element
   */
  setupEventListeners(timelineWrapper) {
    timelineWrapper.addEventListener('scroll', () => {
      this.updateActiveItem(timelineWrapper);
    });

    timelineWrapper.addEventListener('click', (e) => {
      this.handleItemClick(e, timelineWrapper);
    });

    // Add horizontal scroll support for mouse wheel
    timelineWrapper.addEventListener('wheel', (e) => {
      this.handleWheelScroll(e, timelineWrapper);
    });
  },

  /**
   * Update active timeline item based on scroll position
   * @param {HTMLElement} timelineWrapper - Timeline wrapper element
   */
  updateActiveItem(timelineWrapper) {
    const wrapperRect = timelineWrapper.getBoundingClientRect();
    const wrapperCenter = wrapperRect.left + wrapperRect.width / 2;
    const items = document.querySelectorAll('.timeline-item');
    let activeIndex = 0;
    let minDistance = Infinity;

    items.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.left + rect.width / 2;
      const distance = Math.abs(itemCenter - wrapperCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        activeIndex = index;
      }
      item.classList.remove('active');
    });

    if (items[activeIndex]) {
      items[activeIndex].classList.add('active');
    }
  },

  /**
   * Handle click on timeline item
   * @param {Event} e - Click event
   * @param {HTMLElement} timelineWrapper - Timeline wrapper element
   */
  handleItemClick(e, timelineWrapper) {
    const item = e.target.closest('.timeline-item');
    if (!item) {
      return;
    }
    
    const index = parseInt(item.dataset.index);
    const itemWidth = 320; // 280px + 40px gap
    const scrollPosition = index * itemWidth;
    
    timelineWrapper.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
  },

  /**
   * Handle mouse wheel scroll for horizontal scrolling
   * @param {WheelEvent} e - Wheel event
   * @param {HTMLElement} timelineWrapper - Timeline wrapper element
   */
  handleWheelScroll(e, timelineWrapper) {
    // Prevent default vertical scrolling behavior
    e.preventDefault();
    
    // Convert vertical wheel delta to horizontal scroll
    const scrollSpeed = 2; // Adjust this value to control scroll sensitivity
    const deltaX = e.deltaY * scrollSpeed;
    
    // Apply horizontal scroll
    timelineWrapper.scrollLeft += deltaX;
    
    // Update active item after scroll
    requestAnimationFrame(() => {
      this.updateActiveItem(timelineWrapper);
    });
  }
};

// =============================================================================
// WAVE CANVAS MODULE
// =============================================================================

const WaveCanvas = {
  /**
   * Initialize interactive wave canvas animation
   */
  init() {
    const canvas = document.getElementById('waveCanvas');
    if (!canvas) {
      return;
    }
    
    this.setupCanvas(canvas);
  },

  /**
   * Setup canvas with all functionality
   * @param {HTMLElement} canvas - Canvas element
   */
  setupCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const playBtn = document.getElementById('playBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 400;
    
    // Initialize animation state
    this.initializeAnimation(canvas, ctx, playBtn, resetBtn);
  },

  /**
   * Initialize animation with all components
   * @param {HTMLElement} canvas - Canvas element
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {HTMLElement} playBtn - Play button
   * @param {HTMLElement} resetBtn - Reset button
   */
  initializeAnimation(canvas, ctx, playBtn, resetBtn) {
    let animationId;
    let isPlaying = false;
    let time = 0;
    let waves = [];
    let particles = [];
    
    // Wave colors from brand palette
    const waveColors = ['#23B5D3', '#1D4E89', '#0C1B33'];
    
    // Initialize wave objects
    const initWaves = () => {
      waves = [];
      for (let i = 0; i < 3; i++) {
        waves.push({
          amplitude: 30 + i * 15,
          frequency: 0.01 + i * 0.005,
          phase: i * Math.PI / 3,
          color: waveColors[i],
          opacity: 0.8 - i * 0.2
        });
      }
    };

    // Particle class for impact visualization
    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.life = 1.0;
        this.decay = 0.02;
        this.size = Math.random() * 3 + 1;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.vx *= 0.99;
        this.vy *= 0.99;
      }
      
      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = '#23B5D3';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
      isDead() {
        return this.life <= 0;
      }
    }

    // Animation functions
    const drawGrid = (ctx) => {
      ctx.save();
      ctx.strokeStyle = 'rgba(29, 78, 137, 0.1)';
      ctx.lineWidth = 1;
      
      // Vertical and horizontal grid lines
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      ctx.restore();
    };

    const drawWave = (ctx, wave, time) => {
      ctx.save();
      ctx.globalAlpha = wave.opacity;
      ctx.strokeStyle = wave.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      for (let x = 0; x < canvas.width; x += 2) {
        const y = canvas.height / 2 + 
                  Math.sin((x * wave.frequency) + (time * 0.02) + wave.phase) * wave.amplitude;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
      ctx.restore();
    };

    const drawInfo = (ctx) => {
      ctx.save();
      ctx.fillStyle = '#1D4E89';
      ctx.font = 'bold 24px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('WAVE Impact Visualization', canvas.width / 2, 40);
      
      ctx.font = '16px Inter, sans-serif';
      ctx.fillStyle = '#2E3A4E';
      ctx.fillText('Click anywhere to create ripples of change', canvas.width / 2, 65);
      
      ctx.textAlign = 'left';
      ctx.fillText(`Particles: ${particles.length}`, 20, canvas.height - 40);
      ctx.fillText(`Time: ${Math.floor(time / 60)}s`, 20, canvas.height - 20);
      
      ctx.restore();
    };

    const animate = () => {
      // Clear with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#f8fbff');
      gradient.addColorStop(1, '#e6f4f8');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      drawGrid(ctx);
      
      // Draw waves
      waves.forEach(wave => drawWave(ctx, wave, time));
      
      // Update and draw particles
      particles = particles.filter(particle => {
        particle.update();
        particle.draw(ctx);
        return !particle.isDead();
      });
      
      drawInfo(ctx);
      
      time++;
      
      if (isPlaying) {
        animationId = requestAnimationFrame(animate);
      }
    };

    // Control functions
    const startAnimation = () => {
      if (!isPlaying) {
        isPlaying = true;
        if (playBtn) {
          playBtn.textContent = 'Pause';
        }
        animate();
      } else {
        isPlaying = false;
        if (playBtn) {
          playBtn.textContent = 'Play Animation';
        }
        cancelAnimationFrame(animationId);
      }
    };

    const resetAnimation = () => {
      isPlaying = false;
      time = 0;
      particles = [];
      if (playBtn) {
        playBtn.textContent = 'Play Animation';
      }
      cancelAnimationFrame(animationId);
      
      // Draw initial state
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#f8fbff');
      gradient.addColorStop(1, '#e6f4f8');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      drawGrid(ctx);
      drawInfo(ctx);
    };

    const addParticles = (x, y) => {
      for (let i = 0; i < 10; i++) {
        particles.push(new Particle(x, y));
      }
    };

    const handleCanvasClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;
      
      addParticles(x, y);
    };

    // Setup event listeners
    if (playBtn) {
      playBtn.addEventListener('click', startAnimation);
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', resetAnimation);
    }
    canvas.addEventListener('click', handleCanvasClick);

    // Handle window resize
    window.addEventListener('resize', () => {
      const container = canvas.parentElement;
      const containerWidth = container.clientWidth - 40;
      const aspectRatio = 800 / 400;
      
      if (containerWidth < 800) {
        canvas.style.width = containerWidth + 'px';
        canvas.style.height = (containerWidth / aspectRatio) + 'px';
      } else {
        canvas.style.width = '800px';
        canvas.style.height = '400px';
      }
    });

    // Initialize
    initWaves();
    resetAnimation();
    
    // Initial resize
    window.dispatchEvent(new Event('resize'));
  }
};

// =============================================================================
// APPLICATION INITIALIZATION
// =============================================================================

/**
 * Initialize all WAVE application modules when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  // Update WaveApp object with module references
  WaveApp.initCounters = CounterAnimations.init.bind(CounterAnimations);
  WaveApp.initHeroImageSwitcher = HeroImageSwitcher.init.bind(HeroImageSwitcher);
  WaveApp.initGalleryControls = GalleryControls.init.bind(GalleryControls);
  WaveApp.initLogoMarquee = LogoMarquee.init.bind(LogoMarquee);
  WaveApp.initTimeline = TimelineScroll.init.bind(TimelineScroll);
  WaveApp.initNavigationEffects = NavigationEffects.init.bind(NavigationEffects);
  WaveApp.initTestimonials = TestimonialsCarousel.init.bind(TestimonialsCarousel);
  WaveApp.initEventsRoadmap = EventsRoadmap.init.bind(EventsRoadmap);
  WaveApp.initEventGallery = EventGallery.init.bind(EventGallery);
  WaveApp.initEventCounters = EventCounters.init.bind(EventCounters);
  WaveApp.initTimelineVisualization = TimelineVisualization.init.bind(TimelineVisualization);
  WaveApp.initWaveCanvas = WaveCanvas.init.bind(WaveCanvas);
  
  // Initialize all modules
  WaveApp.init();
});

// Make essential functions globally available for HTML event handlers
window.changeHero = (src) => {
  const heroDisplay = document.getElementById('hero-display');
  if (heroDisplay && src) {
    heroDisplay.src = src;
  }
};

window.buildEventGallery = (containerId, filenames, basePath = '../media/') => {
  const element = document.getElementById(containerId);
  if (!element) {
    return;
  }

  // Prevent duplicates if called twice
  if (element.dataset.built === '1') {
    return;
  }
  element.dataset.built = '1';

  const html = filenames.map((name, i) => `
    <a class="gcard" href="${basePath}${name}" target="_blank" rel="noopener">
      <span class="ring"></span>
      <img loading="lazy" src="${basePath}${name}" alt="Event photo ${i + 1}">
    </a>
  `).join('');
  element.innerHTML = html;
};

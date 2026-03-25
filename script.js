// ============================================================
// WROK LANDING PAGE — script.js
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ===== Mobile Nav Toggle =====
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  function openMobileNav() {
    document.body.classList.add('mobile-nav-open');
    navToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    document.body.classList.remove('mobile-nav-open');
    navToggle.classList.remove('active');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', () => {
    if (document.body.classList.contains('mobile-nav-open')) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => closeMobileNav());
  });

  // ===== Navbar scroll effect =====
  const navbar = document.getElementById('navbar');

  function onScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ===== Active nav link highlighting =====
  const navAnchors = document.querySelectorAll('[data-nav]');
  const sections = [];

  navAnchors.forEach(a => {
    const targetId = a.getAttribute('href').substring(1);
    const section = document.getElementById(targetId);
    if (section) {
      sections.push({ el: section, link: a });
    }
  });

  function updateActiveNav() {
    const scrollY = window.scrollY + 120;
    let current = null;
    for (const s of sections) {
      if (s.el.offsetTop <= scrollY) {
        current = s;
      }
    }
    navAnchors.forEach(a => a.classList.remove('active'));
    if (current) {
      current.link.classList.add('active');
    }
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // ===== Scroll-triggered fade-in animations =====
  const faders = document.querySelectorAll('.fade-in');

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px'
  });

  faders.forEach(el => fadeObserver.observe(el));

  // ===== Feature Carousel =====
  const showcase = document.getElementById('featureShowcase');
  const slides = document.querySelectorAll('.feature-slide');
  const pills = document.querySelectorAll('.feature-pill');
  const dots = document.querySelectorAll('.feature-dot');
  const prevBtn = document.getElementById('featurePrev');
  const nextBtn = document.getElementById('featureNext');
  const featureNav = document.getElementById('featureNav');

  // Slide order matches the pill order (Auto-Scheduling, Analytics, Export, Calendar, ...)
  const slideOrder = [0, 9, 10, 1, 2, 3, 4, 8, 5, 6, 7];
  let currentSlide = 0;       // actual data-slide value of the active slide
  let autoTimer = null;
  const SLIDE_INTERVAL = 6000;
  const totalSlides = slides.length;

  // Index of currentSlide within slideOrder
  function orderIndex() {
    const i = slideOrder.indexOf(currentSlide);
    return i >= 0 ? i : 0;
  }

  // ===== Lock carousel height to tallest slide =====
  function normalizeShowcaseHeight() {
    if (!showcase || slides.length === 0) return;
    // Reset so we can measure naturally
    showcase.style.height = 'auto';
    let maxH = 0;
    // Measure each slide individually (absolute so they don't stack)
    slides.forEach(s => {
      s.style.cssText = 'position:absolute !important;top:0 !important;left:0 !important;right:0 !important;opacity:1 !important;transform:none !important;visibility:hidden !important;';
      const h = s.offsetHeight;
      if (h > maxH) maxH = h;
    });
    // Restore all inline styles
    slides.forEach(s => { s.style.cssText = ''; });
    if (maxH > 0) showcase.style.height = maxH + 'px';
  }

  normalizeShowcaseHeight();
  window.addEventListener('resize', normalizeShowcaseHeight);

  function goToSlide(index, direction) {
    const currentEl = showcase.querySelector('.feature-slide[data-slide="' + currentSlide + '"]');
    if (index === currentSlide && currentEl && currentEl.classList.contains('active')) return;

    // Wrap using slideOrder
    const curOI = slideOrder.indexOf(index);
    if (curOI < 0) return; // safety

    const dir = direction || (slideOrder.indexOf(index) > orderIndex() ? 'next' : 'prev');

    const oldEl = showcase.querySelector('.feature-slide[data-slide="' + currentSlide + '"]');
    const newEl = showcase.querySelector('.feature-slide[data-slide="' + index + '"]');
    if (!oldEl || !newEl) return;

    // Outgoing slide
    oldEl.classList.remove('active');
    oldEl.classList.add(dir === 'next' ? 'exit-left' : 'exit-right');

    // Incoming slide
    newEl.classList.remove('exit-left', 'exit-right');
    newEl.classList.add(dir === 'next' ? 'enter-right' : 'enter-left');

    // Force reflow to trigger transition
    void newEl.offsetWidth;

    newEl.classList.remove('enter-right', 'enter-left');
    newEl.classList.add('active');

    currentSlide = index;

    // Clean up old slide after transition
    setTimeout(() => {
      oldEl.classList.remove('exit-left', 'exit-right');
    }, 500);

    // Update pills
    pills.forEach(p => p.classList.remove('active'));
    const activePill = document.querySelector('.feature-pill[data-slide="' + currentSlide + '"]');
    if (activePill) {
      activePill.classList.add('active');
      // Scroll pill into view (container-only, never moves the page)
      const navWrap = featureNav ? featureNav.closest('.feature-nav-wrap') || featureNav.parentElement : null;
      if (navWrap) {
        const wrapRect = navWrap.getBoundingClientRect();
        const pillRect = activePill.getBoundingClientRect();
        if (pillRect.left < wrapRect.left || pillRect.right > wrapRect.right) {
          const scrollTarget = activePill.offsetLeft - navWrap.offsetWidth / 2 + activePill.offsetWidth / 2;
          navWrap.scrollTo({ left: scrollTarget, behavior: 'smooth' });
        }
      }
    }

    // Update dots
    dots.forEach(d => d.classList.remove('active'));
    const activeDot = document.querySelector('.feature-dot[data-slide="' + currentSlide + '"]');
    if (activeDot) activeDot.classList.add('active');
  }

  function nextSlide() {
    const nextIdx = (orderIndex() + 1) % slideOrder.length;
    goToSlide(slideOrder[nextIdx], 'next');
  }

  function prevSlide() {
    const prevIdx = (orderIndex() - 1 + slideOrder.length) % slideOrder.length;
    goToSlide(slideOrder[prevIdx], 'prev');
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(nextSlide, SLIDE_INTERVAL);
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  // Pill clicks
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const idx = parseInt(pill.dataset.slide, 10);
      const dir = idx > currentSlide ? 'next' : 'prev';
      goToSlide(idx, dir);
      startAuto();
    });
  });

  // Dot clicks
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.slide, 10);
      const dir = idx > currentSlide ? 'next' : 'prev';
      goToSlide(idx, dir);
      startAuto();
    });
  });

  // Arrow clicks
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAuto(); });

  // Pause on hover
  if (showcase) {
    showcase.addEventListener('mouseenter', stopAuto);
    showcase.addEventListener('mouseleave', startAuto);
  }

  // Keyboard navigation when showcase is in view
  document.addEventListener('keydown', (e) => {
    if (!showcase) return;
    const rect = showcase.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.key === 'ArrowLeft') { prevSlide(); startAuto(); }
    if (e.key === 'ArrowRight') { nextSlide(); startAuto(); }
  });

  // Touch swipe support
  if (showcase) {
    let touchStartX = 0;
    let touchEndX = 0;

    showcase.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    showcase.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide();
        else prevSlide();
        startAuto();
      }
    }, { passive: true });
  }

  // Initialize carousel
  if (totalSlides > 0) {
    startAuto();
  }

  // ===== FAQ Accordion =====
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(other => other.classList.remove('open'));
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // ===== Back to Top Button =====
  const backToTop = document.getElementById('backToTop');

  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 600) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== Spotlight Interactive Cards =====

  // ---- 1. Schedule Card: Clickable Cells + Generate ----
  const SHIFT_CYCLE = ['morning', 'afternoon', 'night', 'off'];

  // Click any cell to cycle shift type
  document.querySelectorAll('.sc-grid-row .sc-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const current = SHIFT_CYCLE.find(s => cell.classList.contains(s)) || 'off';
      const nextIdx = (SHIFT_CYCLE.indexOf(current) + 1) % SHIFT_CYCLE.length;
      SHIFT_CYCLE.forEach(s => cell.classList.remove(s));
      cell.classList.add(SHIFT_CYCLE[nextIdx]);
    });
  });

  // Generate cascade animation
  const generateBtn = document.getElementById('scGenerateBtn');
  if (generateBtn) {
    let generating = false;

    generateBtn.addEventListener('click', () => {
      if (generating) return;
      generating = true;

      const rows = document.querySelectorAll('.sc-grid-row');
      const allCells = [];
      rows.forEach(row => {
        row.querySelectorAll('.sc-cell').forEach(cell => allCells.push(cell));
      });

      // Step 1: Clear all to "off"
      allCells.forEach(cell => {
        SHIFT_CYCLE.forEach(s => cell.classList.remove(s));
        cell.classList.remove('cell-pop');
        cell.classList.add('off');
        cell.style.opacity = '0.3';
      });

      // Step 2: Fill one-by-one after a short pause
      setTimeout(() => {
        const rowCount = rows.length;
        const colCount = 7;

        allCells.forEach((cell, i) => {
          const row = Math.floor(i / colCount);
          const col = i % colCount;
          const delay = (row * colCount + col) * 50;

          setTimeout(() => {
            // Pick random shift; guarantee at least one "off" per row
            // (force last cell of row to "off" if none yet in this row)
            const rowStart = row * colCount;
            const rowEnd = rowStart + colCount;
            const isLastInRow = (col === colCount - 1);
            let hasOffInRow = false;

            if (isLastInRow) {
              for (let j = rowStart; j < rowEnd - 1; j++) {
                if (allCells[j].classList.contains('off')) {
                  hasOffInRow = true;
                  break;
                }
              }
            }

            let shift;
            if (isLastInRow && !hasOffInRow) {
              shift = 'off';
            } else {
              // Weight: 30% morning, 25% afternoon, 20% night, 25% off
              const r = Math.random();
              if (r < 0.30) shift = 'morning';
              else if (r < 0.55) shift = 'afternoon';
              else if (r < 0.75) shift = 'night';
              else shift = 'off';
            }

            SHIFT_CYCLE.forEach(s => cell.classList.remove(s));
            cell.classList.add(shift);
            cell.style.opacity = '';

            // Trigger pop animation
            cell.classList.remove('cell-pop');
            void cell.offsetWidth; // reflow
            cell.classList.add('cell-pop');
          }, delay);
        });

        // Unlock after full cascade
        const totalDuration = allCells.length * 50 + 400;
        setTimeout(() => { generating = false; }, totalDuration);
      }, 300);
    });
  }

  // ---- 2. Chat Card: Type & Send Messages ----
  const chatField = document.getElementById('scChatField');
  const chatSendBtn = document.getElementById('scChatSend');
  const chatContainer = document.querySelector('.sc-chat');

  if (chatField && chatSendBtn && chatContainer) {
    const CANNED_REPLIES = [
      'Sounds good, I\'ll update the schedule!',
      'Thanks! See you on shift.',
      'Got it, let me check with the manager.',
      'Perfect, I\'ll confirm the swap now.',
      'No worries, we\'ll figure it out!',
    ];

    let chatCooldown = false;

    function getTimeString() {
      const now = new Date();
      let h = now.getHours();
      const m = now.getMinutes().toString().padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `${h}:${m} ${ampm}`;
    }

    function createBubble(text, type) {
      const bubble = document.createElement('div');
      bubble.className = `sc-bubble ${type} bubble-enter`;
      bubble.innerHTML = `<p>${text}</p><span class="sc-chat-time">${getTimeString()}${type === 'sent' ? ' <span class="sc-chat-read">&#10003;</span>' : ''}</span>`;
      return bubble;
    }

    function scrollChatToBottom() {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function sendMessage() {
      const text = chatField.value.trim();
      if (!text || chatCooldown) return;

      chatCooldown = true;

      // Sanitize text (prevent XSS in demo)
      const safe = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');

      // Append sent bubble
      const sentBubble = createBubble(safe, 'sent');
      chatContainer.appendChild(sentBubble);
      chatField.value = '';
      scrollChatToBottom();

      // Auto-reply after 1.5s
      setTimeout(() => {
        const reply = CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)];
        const receivedBubble = createBubble(reply, 'received');
        chatContainer.appendChild(receivedBubble);
        scrollChatToBottom();

        // Update sent bubble to show read receipt
        const sentCheck = sentBubble.querySelector('.sc-chat-read');
        if (sentCheck) sentCheck.innerHTML = '&#10003;&#10003;';
      }, 1500);

      // 2s cooldown
      setTimeout(() => { chatCooldown = false; }, 2000);
    }

    chatSendBtn.addEventListener('click', sendMessage);
    chatField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // ---- 3. Time Off Card: Badge Toggle ----
  const BADGE_CYCLE = ['approved', 'pending', 'denied'];
  const BADGE_LABELS = { approved: 'Approved', pending: 'Pending', denied: 'Denied' };

  document.querySelectorAll('.sc-timeoff-badge').forEach(badge => {
    badge.addEventListener('click', () => {
      const current = BADGE_CYCLE.find(s => badge.classList.contains(s)) || 'approved';
      const nextIdx = (BADGE_CYCLE.indexOf(current) + 1) % BADGE_CYCLE.length;
      const next = BADGE_CYCLE[nextIdx];

      BADGE_CYCLE.forEach(s => badge.classList.remove(s));
      badge.classList.add(next);
      badge.textContent = BADGE_LABELS[next];

      // Pop animation
      badge.classList.remove('badge-pop');
      void badge.offsetWidth; // reflow
      badge.classList.add('badge-pop');
    });
  });

  // ===== Phone 3D Rotate + Scroll Movement =====
  var phoneFloat = document.querySelector('.phone-float');
  if (phoneFloat) {
    // Drag to rotate
    var isDrag = false, sx = 0, sy = 0;
    var ry = 0, rx = 0, cry = 0, crx = 0;

    phoneFloat.addEventListener('mousedown', function(e) {
      isDrag = true; sx = e.clientX; sy = e.clientY;
      phoneFloat.classList.add('dragging');
      e.preventDefault();
    });
    document.addEventListener('mousemove', function(e) {
      if (!isDrag) return;
      ry = cry + (e.clientX - sx) * 0.4;
      rx = Math.max(-25, Math.min(25, crx - (e.clientY - sy) * 0.2));
      phoneFloat.style.transform = 'translateY(0) rotateY(' + ry + 'deg) rotateX(' + rx + 'deg)';
    });
    document.addEventListener('mouseup', function() {
      if (!isDrag) return;
      isDrag = false; cry = ry; crx = rx;
      phoneFloat.classList.remove('dragging');
      setTimeout(function() {
        if (!isDrag) {
          phoneFloat.style.transition = 'transform 1.2s cubic-bezier(0.23,1,0.32,1)';
          phoneFloat.style.transform = '';
          cry = 0; crx = 0; ry = 0; rx = 0;
          setTimeout(function() { phoneFloat.style.transition = ''; }, 1300);
        }
      }, 3000);
    });
    // Touch
    phoneFloat.addEventListener('touchstart', function(e) {
      isDrag = true; sx = e.touches[0].clientX; sy = e.touches[0].clientY;
      phoneFloat.classList.add('dragging');
    }, { passive: true });
    document.addEventListener('touchmove', function(e) {
      if (!isDrag) return;
      ry = cry + (e.touches[0].clientX - sx) * 0.4;
      rx = Math.max(-25, Math.min(25, crx - (e.touches[0].clientY - sy) * 0.2));
      phoneFloat.style.transform = 'translateY(0) rotateY(' + ry + 'deg) rotateX(' + rx + 'deg)';
    }, { passive: true });
    document.addEventListener('touchend', function() {
      if (!isDrag) return;
      isDrag = false; cry = ry; crx = rx;
      phoneFloat.classList.remove('dragging');
      setTimeout(function() {
        if (!isDrag) {
          phoneFloat.style.transition = 'transform 1.2s cubic-bezier(0.23,1,0.32,1)';
          phoneFloat.style.transform = '';
          cry = 0; crx = 0; ry = 0; rx = 0;
          setTimeout(function() { phoneFloat.style.transition = ''; }, 1300);
        }
      }, 3000);
    });

  }

});

// ============================================================
// THREE.JS 3D PHONE — WebGL body + CSS3D screen
// ============================================================
(function() {
  if (window.innerWidth <= 768) return;
  if (typeof THREE === 'undefined' || typeof THREE.CSS3DRenderer === 'undefined') return;

  var container = document.getElementById('phone3d-container');
  var webglCanvas = document.getElementById('phone3d-webgl');
  var cssContainer = document.getElementById('phone3d-css');
  var heroVisual = document.querySelector('.hero-visual');
  var phoneMockup = document.querySelector('.phone-mockup.hero-phone');
  var phoneScreen = document.querySelector('.phone-mockup.hero-phone .phone-screen');
  if (!container || !webglCanvas || !cssContainer || !heroVisual || !phoneMockup || !phoneScreen) return;

  // Extract phone-screen from the phone-float hierarchy, then remove the rest
  // This eliminates the floating dark bar (phone-frame/notch) while keeping the screen
  var phoneFrame = phoneMockup.querySelector('.phone-frame');
  if (phoneFrame && phoneScreen) {
    // Move phone-screen out of the hierarchy to a hidden container
    var screenHolder = document.createElement('div');
    screenHolder.style.position = 'absolute';
    screenHolder.style.left = '-9999px';
    screenHolder.style.top = '0';
    document.body.appendChild(screenHolder);
    screenHolder.appendChild(phoneScreen);
  }
  // Now remove the entire phone-float (frame, notch, everything)
  var phoneFloatEl = document.querySelector('.phone-float');
  if (phoneFloatEl) phoneFloatEl.remove();

  // Size to the full hero section, not just hero-visual
  var heroSection = document.getElementById('hero');
  var W = heroSection ? heroSection.offsetWidth : heroVisual.offsetWidth;
  var H = heroSection ? heroSection.offsetHeight : heroVisual.offsetHeight;

  // Shared camera
  var camera = new THREE.PerspectiveCamera(40, W / H, 1, 10000);
  camera.position.z = 900;

  // Scene for WebGL (phone body)
  var glScene = new THREE.Scene();

  // Scene for CSS3D (phone screen)
  var cssScene = new THREE.Scene();

  // WebGL Renderer (transparent, for phone body)
  var glRenderer = new THREE.WebGLRenderer({ canvas: webglCanvas, alpha: true, antialias: true });
  glRenderer.setSize(W, H);
  glRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // CSS3D Renderer (for HTML phone screen)
  var cssRenderer = new THREE.CSS3DRenderer();
  cssRenderer.setSize(W, H);
  cssRenderer.domElement.style.position = 'absolute';
  cssRenderer.domElement.style.top = '0';
  cssRenderer.domElement.style.left = '0';
  cssRenderer.domElement.style.pointerEvents = 'none';
  cssContainer.appendChild(cssRenderer.domElement);

  // ===== Phone Body (WebGL) =====
  // Phone body — screen must fit inside this
  var PW = 280, PH = 500, PD = 18;

  function makeRoundedRect(w, h, r) {
    var s = new THREE.Shape();
    s.moveTo(-w/2+r, -h/2);
    s.lineTo(w/2-r, -h/2);
    s.quadraticCurveTo(w/2, -h/2, w/2, -h/2+r);
    s.lineTo(w/2, h/2-r);
    s.quadraticCurveTo(w/2, h/2, w/2-r, h/2);
    s.lineTo(-w/2+r, h/2);
    s.quadraticCurveTo(-w/2, h/2, -w/2, h/2-r);
    s.lineTo(-w/2, -h/2+r);
    s.quadraticCurveTo(-w/2, -h/2, -w/2+r, -h/2);
    return s;
  }

  var bodyGeo = new THREE.ExtrudeGeometry(makeRoundedRect(PW, PH, 40), {
    depth: PD, bevelEnabled: true, bevelThickness: 3,
    bevelSize: 3, bevelSegments: 4
  });
  bodyGeo.center();

  // Lighter grey body — clearly visible
  var bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x3a3a52, metalness: 0.6, roughness: 0.35,
    clearcoat: 0.3, clearcoatRoughness: 0.4
  });
  var phoneMesh = new THREE.Mesh(bodyGeo, bodyMat);
  glScene.add(phoneMesh);

  // Back face — slightly different shade
  var backGeo = new THREE.PlaneGeometry(PW - 16, PH - 16);
  var backMat = new THREE.MeshPhysicalMaterial({ color: 0x2a2a40, metalness: 0.5, roughness: 0.5 });
  var backMesh = new THREE.Mesh(backGeo, backMat);
  backMesh.position.z = -PD / 2 - 1;
  backMesh.rotation.y = Math.PI;
  phoneMesh.add(backMesh);

  // Camera module on back — square housing with rounded corners
  var camModuleGeo = new THREE.PlaneGeometry(60, 60);
  var camModuleMat = new THREE.MeshPhysicalMaterial({ color: 0x222238, metalness: 0.7, roughness: 0.3 });
  var camModuleMesh = new THREE.Mesh(camModuleGeo, camModuleMat);
  camModuleMesh.position.set(-PW/2 + 55, PH/2 - 55, -PD/2 - 1.5);
  camModuleMesh.rotation.y = Math.PI;
  phoneMesh.add(camModuleMesh);

  // Main camera lens (large)
  var lens1Geo = new THREE.RingGeometry(10, 16, 32);
  var lens1Mat = new THREE.MeshBasicMaterial({ color: 0x444466, side: THREE.DoubleSide });
  var lens1Mesh = new THREE.Mesh(lens1Geo, lens1Mat);
  lens1Mesh.position.set(-PW/2 + 45, PH/2 - 45, -PD/2 - 2);
  lens1Mesh.rotation.y = Math.PI;
  phoneMesh.add(lens1Mesh);

  // Inner lens (glass effect)
  var lensInnerGeo = new THREE.CircleGeometry(8, 32);
  var lensInnerMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a0a1a, metalness: 0.9, roughness: 0.1, clearcoat: 1.0
  });
  var lensInnerMesh = new THREE.Mesh(lensInnerGeo, lensInnerMat);
  lensInnerMesh.position.set(-PW/2 + 45, PH/2 - 45, -PD/2 - 2.5);
  lensInnerMesh.rotation.y = Math.PI;
  phoneMesh.add(lensInnerMesh);

  // Second camera lens (smaller)
  var lens2Geo = new THREE.RingGeometry(6, 10, 32);
  var lens2Mesh = new THREE.Mesh(lens2Geo, lens1Mat);
  lens2Mesh.position.set(-PW/2 + 65, PH/2 - 45, -PD/2 - 2);
  lens2Mesh.rotation.y = Math.PI;
  phoneMesh.add(lens2Mesh);

  // Flash LED
  var flashGeo = new THREE.CircleGeometry(4, 16);
  var flashMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
  var flashMesh = new THREE.Mesh(flashGeo, flashMat);
  flashMesh.position.set(-PW/2 + 55, PH/2 - 65, -PD/2 - 2);
  flashMesh.rotation.y = Math.PI;
  phoneMesh.add(flashMesh);

  // Wrok logo on back
  // (Using a simple "W" rendered as a plane — in real life you'd use a texture)

  // Lighting — bright enough to see the phone body clearly
  glScene.add(new THREE.AmbientLight(0xffffff, 0.8));
  var mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
  mainLight.position.set(400, 300, 600);
  glScene.add(mainLight);
  var fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
  fillLight.position.set(-400, 200, 400);
  glScene.add(fillLight);
  var rimLight = new THREE.DirectionalLight(0x0D7C66, 0.5);
  rimLight.position.set(-200, 0, -400);
  glScene.add(rimLight);

  // ===== CSS Phone Screen (CSS3D) =====
  // CSS3DObject wraps only the phone-screen (the white app content), not the dark frame
  var cssObject = new THREE.CSS3DObject(phoneScreen);
  // Scale screen to fill most of the 3D body (thin bezel)
  var rawW = phoneScreen.offsetWidth || 260;
  var rawH = phoneScreen.offsetHeight || 520;
  var scaleByW = (PW - 14) / rawW;
  var scaleByH = (PH - 14) / rawH;
  var fitScale = Math.min(scaleByW, scaleByH) * 1.15;
  cssObject.scale.set(fitScale * 1.1, fitScale, 1); // width 10% wider
  cssObject.position.set(0, 0, PD / 2 + 1);
  cssScene.add(cssObject);

  // Create a group to rotate WebGL phone body
  var phoneGroup = new THREE.Group();
  glScene.remove(phoneMesh);
  phoneGroup.add(phoneMesh);
  glScene.add(phoneGroup);

  // Position the phone at the right side of the hero
  // FOV=40 at z=900: visible half-width ≈ 900*tan(20°) ≈ 328 units
  // Place phone at ~60% to the right
  // Position: the notch was at the right spot, so match that position
  // Notch was roughly 55% from left of hero. Camera sees ±328 units.
  // 55% of the way = 0.55 * 656 - 328 = 32.8. But hero-content takes left ~45%,
  // so phone should be at about x = -30 to 0 in scene coords
  phoneGroup.position.set(-220, 40, 0);
  phoneMesh.position.set(0, 0, 0);

  // Mark 3D as active
  heroVisual.classList.add('has-3d');

  // Enable pointer events on the container for dragging
  container.style.pointerEvents = 'auto';
  container.style.cursor = 'grab';
  container.style.zIndex = '10';

  // ===== Drag to Rotate =====
  var isDragging = false, prevMX = 0, prevMY = 0;
  var targetRotY = -0.15, targetRotX = 0.04;
  var autoTime = 0;

  container.addEventListener('mousedown', function(e) {
    isDragging = true; prevMX = e.clientX; prevMY = e.clientY;
    container.style.cursor = 'grabbing';
    e.preventDefault();
  });
  window.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    targetRotY += (e.clientX - prevMX) * 0.005;
    targetRotX = Math.max(-0.5, Math.min(0.5, targetRotX + (e.clientY - prevMY) * 0.003));
    prevMX = e.clientX; prevMY = e.clientY;
  });
  window.addEventListener('mouseup', function() {
    isDragging = false;
    container.style.cursor = 'grab';
  });

  // Touch
  container.addEventListener('touchstart', function(e) {
    isDragging = true; prevMX = e.touches[0].clientX; prevMY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    targetRotY += (e.touches[0].clientX - prevMX) * 0.005;
    targetRotX = Math.max(-0.5, Math.min(0.5, targetRotX + (e.touches[0].clientY - prevMY) * 0.003));
    prevMX = e.touches[0].clientX; prevMY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchend', function() { isDragging = false; });

  // ===== Resize =====
  window.addEventListener('resize', function() {
    W = heroSection ? heroSection.offsetWidth : heroVisual.offsetWidth;
    H = heroSection ? heroSection.offsetHeight : heroVisual.offsetHeight;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    glRenderer.setSize(W, H);
    cssRenderer.setSize(W, H);
  });

  // ===== Render Loop =====
  function animate() {
    requestAnimationFrame(animate);
    autoTime += 0.008;

    if (!isDragging) {
      targetRotY += Math.sin(autoTime) * 0.001;
    }

    // Smooth lerp rotation
    phoneGroup.rotation.y += (targetRotY - phoneGroup.rotation.y) * 0.06;
    phoneGroup.rotation.x += (targetRotX - phoneGroup.rotation.x) * 0.06;

    // Bob animation
    phoneGroup.position.y = 40 + Math.sin(autoTime * 0.7) * 5;

    // Sync CSS3D object to match the phone group's world transform
    var worldPos = phoneMesh.getWorldPosition(new THREE.Vector3());
    cssObject.position.set(worldPos.x, phoneGroup.position.y, worldPos.z + PD / 2 + 1);
    cssObject.rotation.copy(phoneGroup.rotation);

    // Hide screen when viewing the back (rotated past ~80 degrees)
    var absRotY = Math.abs(phoneGroup.rotation.y % (Math.PI * 2));
    if (absRotY > Math.PI) absRotY = Math.PI * 2 - absRotY;
    var showScreen = absRotY < 1.57; // 90 degrees — hide only when fully past side
    cssObject.visible = showScreen;
    phoneMockup.style.opacity = showScreen ? '1' : '0';

    // Render both
    glRenderer.render(glScene, camera);
    cssRenderer.render(cssScene, camera);
  }
  animate();
})();

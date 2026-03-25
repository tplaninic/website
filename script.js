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

});

// ===== Three.js 3D Phone (desktop only) =====
(function() {
  if (window.innerWidth <= 768) return;
  if (typeof THREE === 'undefined') return;

  var canvas = document.getElementById('phone3d');
  var heroVisual = document.querySelector('.hero-visual');
  var phoneMockup = document.querySelector('.phone-mockup.hero-phone');
  if (!canvas || !heroVisual || !phoneMockup) return;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  function resize() {
    var w = heroVisual.offsetWidth;
    var h = heroVisual.offsetHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // Phone dimensions
  var PW = 3.0, PH = 6.0, PD = 0.22, PR = 0.45;

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

  // Phone body — extruded rounded rect with bevel
  var bodyGeo = new THREE.ExtrudeGeometry(makeRoundedRect(PW, PH, PR), {
    depth: PD, bevelEnabled: true, bevelThickness: 0.03,
    bevelSize: 0.03, bevelSegments: 4
  });
  bodyGeo.center();
  var bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a1a2e, metalness: 0.8, roughness: 0.25,
    clearcoat: 0.5, clearcoatRoughness: 0.2
  });
  var phoneMesh = new THREE.Mesh(bodyGeo, bodyMat);
  scene.add(phoneMesh);

  // Screen on front face
  var screenW = PW - 0.35, screenH = PH - 0.4;
  var screenGeo = new THREE.PlaneGeometry(screenW, screenH);
  var screenTex = null; // will be set by html2canvas
  var screenMat = new THREE.MeshBasicMaterial({ color: 0xf5f5f5 });
  var screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.z = PD / 2 + 0.02;
  phoneMesh.add(screenMesh);

  // Also add a white background behind the screen (prevents bleed-through)
  var screenBgGeo = new THREE.PlaneGeometry(screenW + 0.02, screenH + 0.02);
  var screenBgMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  var screenBgMesh = new THREE.Mesh(screenBgGeo, screenBgMat);
  screenBgMesh.position.z = PD / 2 + 0.015;
  phoneMesh.add(screenBgMesh);

  // Back face
  var backGeo = new THREE.PlaneGeometry(PW - 0.1, PH - 0.1);
  var backMat = new THREE.MeshPhysicalMaterial({
    color: 0x15152a, metalness: 0.6, roughness: 0.4
  });
  var backMesh = new THREE.Mesh(backGeo, backMat);
  backMesh.position.z = -PD / 2 - 0.01;
  backMesh.rotation.y = Math.PI;
  phoneMesh.add(backMesh);

  // Camera lens on back
  var lensMesh = new THREE.Mesh(
    new THREE.RingGeometry(0.08, 0.15, 32),
    new THREE.MeshBasicMaterial({ color: 0x333355, side: THREE.DoubleSide })
  );
  lensMesh.position.set(0, PH/2 - 0.6, -PD/2 - 0.02);
  lensMesh.rotation.y = Math.PI;
  phoneMesh.add(lensMesh);

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  var mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
  mainLight.position.set(4, 4, 6);
  scene.add(mainLight);
  var rimLight = new THREE.DirectionalLight(0x0D7C66, 0.4);
  rimLight.position.set(-3, 1, -3);
  scene.add(rimLight);

  camera.position.set(0, 0, 9);

  // Capture CSS phone screen as texture
  var textureApplied = false;
  function capturePhoneScreen() {
    if (typeof html2canvas === 'undefined') return;
    // Make sure CSS phone is visible for capture
    phoneMockup.style.visibility = 'visible';
    html2canvas(phoneMockup, {
      backgroundColor: '#ffffff', scale: 2, useCORS: true, logging: false
    }).then(function(cap) {
      screenTex = new THREE.CanvasTexture(cap);
      screenMat.map = screenTex;
      screenMat.color.set(0xffffff);
      screenMat.needsUpdate = true;
      textureApplied = true;
      // Now hide CSS phone and enable interaction after render
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          heroVisual.classList.add('has-3d');
          canvas.classList.add('interactive');
        });
      });
    }).catch(function(err) {
      console.warn('html2canvas failed:', err);
    });
  }
  // Capture after CSS phone is fully painted
  setTimeout(capturePhoneScreen, 1200);

  // Drag to rotate
  var isDragging = false, prevMX = 0, prevMY = 0;
  var targetRotY = -0.12, targetRotX = 0.05, autoTime = 0;

  canvas.addEventListener('mousedown', function(e) {
    isDragging = true; prevMX = e.clientX; prevMY = e.clientY;
    e.preventDefault();
  });
  window.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    targetRotY += (e.clientX - prevMX) * 0.006;
    targetRotX = Math.max(-0.5, Math.min(0.5, targetRotX + (e.clientY - prevMY) * 0.004));
    prevMX = e.clientX; prevMY = e.clientY;
  });
  window.addEventListener('mouseup', function() { isDragging = false; });

  canvas.addEventListener('touchstart', function(e) {
    isDragging = true; prevMX = e.touches[0].clientX; prevMY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    targetRotY += (e.touches[0].clientX - prevMX) * 0.006;
    targetRotX = Math.max(-0.5, Math.min(0.5, targetRotX + (e.touches[0].clientY - prevMY) * 0.004));
    prevMX = e.touches[0].clientX; prevMY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchend', function() { isDragging = false; });

  // Scroll-based positioning: phone slides to the right as you scroll
  var scrollTargetX = 0; // 0 = centered in hero, positive = right
  var scrollTargetScale = 1;
  var currentScrollX = 0, currentScrollScale = 1;

  window.addEventListener('scroll', function() {
    var scrollY = window.scrollY || window.pageYOffset;
    var heroH = heroVisual.offsetHeight || 600;
    var progress = Math.min(1, Math.max(0, scrollY / (heroH * 0.6)));
    // Move phone to the right and shrink as user scrolls
    scrollTargetX = progress * 3.5; // slide right in 3D space
    scrollTargetScale = 1 - progress * 0.25; // shrink to 0.75
  }, { passive: true });

  // Render loop
  function animate() {
    requestAnimationFrame(animate);
    autoTime += 0.008;
    if (!isDragging) {
      targetRotY += Math.sin(autoTime) * 0.002 - targetRotY * 0.001;
    }
    phoneMesh.rotation.y += (targetRotY - phoneMesh.rotation.y) * 0.06;
    phoneMesh.rotation.x += (targetRotX - phoneMesh.rotation.x) * 0.06;

    // Scroll-based position
    currentScrollX += (scrollTargetX - currentScrollX) * 0.08;
    currentScrollScale += (scrollTargetScale - currentScrollScale) * 0.08;
    phoneMesh.position.x = currentScrollX;
    phoneMesh.position.y = Math.sin(autoTime * 0.7) * 0.12;
    phoneMesh.scale.setScalar(currentScrollScale);

    renderer.render(scene, camera);
  }
  animate();
})();

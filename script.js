// =====================================================
//  ROTEIRO DE VIAGEM — Animações e Interatividade
// =====================================================

// ─── CARROSSEL DE FOTOS ───
const carousels = {};

function initCarousel(id) {
  const track = document.getElementById(`track-${id}`);
  const dotsContainer = document.getElementById(`dots-${id}`);
  if (!track || !dotsContainer) return;

  const slides = track.querySelectorAll('.carousel-slide');
  const total = slides.length;
  let current = 0;
  let autoTimer = null;
  let touchStartX = 0;
  let touchEndX = 0;

  // Criar dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function updateDots() {
    dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    updateDots();
    // Ken Burns: zoom na imagem ativa
    slides.forEach((s, i) => {
      const img = s.querySelector('img');
      if (img) img.classList.toggle('zoomed', i === current);
    });
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, 4500);
  }
  function stopAuto() { clearInterval(autoTimer); }

  // Touch swipe (mobile)
  track.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    stopAuto();
  }, { passive: true });
  track.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? next() : prev();
    }
    startAuto();
  }, { passive: true });

  // Pause on hover
  const carouselEl = document.getElementById(`carousel-${id}`);
  carouselEl?.addEventListener('mouseenter', stopAuto);
  carouselEl?.addEventListener('mouseleave', startAuto);

  // Start
  goTo(0);
  startAuto();

  carousels[id] = { goTo, next, prev };
}

// Função global chamada pelos botões onclick no HTML
function moveCarousel(id, direction) {
  if (carousels[id]) {
    direction > 0 ? carousels[id].next() : carousels[id].prev();
  }
}

// Inicializa após DOM carregado
document.addEventListener('DOMContentLoaded', () => {
  initCarousel('madrid');
  initCarousel('barcelona');
  initCarousel('paris');
});

document.addEventListener('DOMContentLoaded', () => {

  // ─── INTERSECTION OBSERVER (Scroll animations) ───
  const animateElements = document.querySelectorAll(
    '.animate-up, .animate-left, .animate-right'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  animateElements.forEach(el => observer.observe(el));

  // ─── PARALLAX SUAVE NO HERO ───
  const hero = document.getElementById('hero');
  const heroContent = hero?.querySelector('.hero-content');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight && heroContent) {
      heroContent.style.transform = `translateY(${scrollY * 0.25}px)`;
      heroContent.style.opacity = `${1 - scrollY / (window.innerHeight * 0.9)}`;
    }
  }, { passive: true });

  // ─── CURSOR TRAIL (efeito de rastro no mouse) ───
  const trail = [];
  const TRAIL_LENGTH = 10;
  const emojis = ['✈️','⭐','🌟','💫','✨'];

  document.addEventListener('mousemove', (e) => {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      font-size: ${Math.random() * 10 + 8}px;
      opacity: 0.6;
      transform: translate(-50%, -50%);
      transition: opacity 0.6s ease;
      user-select: none;
    `;
    dot.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    document.body.appendChild(dot);
    trail.push(dot);

    if (trail.length > TRAIL_LENGTH) {
      const old = trail.shift();
      old?.remove();
    }

    requestAnimationFrame(() => {
      setTimeout(() => {
        dot.style.opacity = '0';
        setTimeout(() => dot.remove(), 600);
      }, 100);
    });
  });

  // ─── SMOOTH SCROLL PARA ÂNCORAS ───
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ─── CONTADOR ANIMADO nas estatísticas ───
  const statNums = document.querySelectorAll('.stat-num');
  let statsAnimated = false;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        statNums.forEach(el => {
          const target = parseFloat(el.textContent.replace('+', ''));
          const isPlus = el.textContent.includes('+');
          let current = 0;
          const step = target / 30;
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            el.textContent = Math.floor(current) + (isPlus ? '+' : '');
          }, 40);
        });
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statsObserver.observe(heroStats);

  // ─── CARD TILT 3D (efeito perspectiva no hover) ───
  document.querySelectorAll('.attraction-card, .tip-card, .day-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotX = (-y / rect.height) * 6;
      const rotY = (x / rect.width) * 6;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px) scale(1.01)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });
  });

  // ─── PROGRESS BAR DE SCROLL ───
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    height: 3px;
    background: linear-gradient(90deg, #ef4444, #004d98, #002395, #d4af37);
    z-index: 9998;
    width: 0%;
    transition: width 0.1s linear;
  `;
  document.body.prepend(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = Math.min((scrollTop / docHeight) * 100, 100);
    progressBar.style.width = pct + '%';
  }, { passive: true });

  // ─── FLOATING NAV (navega entre cidades) ───
  const floatingNav = document.createElement('nav');
  floatingNav.id = 'floating-nav';
  floatingNav.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(80px);
    background: rgba(10,22,40,0.92);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 50px;
    padding: 10px 20px;
    display: flex;
    gap: 4px;
    z-index: 1000;
    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s;
    opacity: 0;
  `;

  const navItems = [
    { label: '🇪🇸 Madrid', href: '#madrid' },
    { label: '⛪ Barcelona', href: '#barcelona' },
    { label: '🇫🇷 Paris', href: '#paris' },
    { label: '💡 Dicas', href: '#dicas' },
  ];

  navItems.forEach(item => {
    const btn = document.createElement('a');
    btn.href = item.href;
    btn.textContent = item.label;
    btn.style.cssText = `
      color: rgba(255,255,255,0.8);
      font-family: 'Outfit', sans-serif;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 8px 16px;
      border-radius: 50px;
      text-decoration: none;
      transition: background 0.2s, color 0.2s;
      white-space: nowrap;
    `;
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(255,255,255,0.15)';
      btn.style.color = '#fff';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = '';
      btn.style.color = 'rgba(255,255,255,0.8)';
    });
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(item.href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    floatingNav.appendChild(btn);
  });

  document.body.appendChild(floatingNav);

  // Show/hide floating nav based on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight * 0.6) {
      floatingNav.style.transform = 'translateX(-50%) translateY(0)';
      floatingNav.style.opacity = '1';
    } else {
      floatingNav.style.transform = 'translateX(-50%) translateY(80px)';
      floatingNav.style.opacity = '0';
    }
  }, { passive: true });

  // ─── IMAGENS COM FALLBACK (lazy load manual) ───
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    img.addEventListener('error', () => {
      // Fallback para gradient placeholder se imagem falhar
      const parent = img.parentElement;
      const placeholder = document.createElement('div');
      placeholder.style.cssText = `
        width: 100%; height: 100%;
        background: linear-gradient(135deg, #1a3560, #3b82f6);
        display: flex; align-items: center; justify-content: center;
        font-size: 3rem;
      `;
      placeholder.textContent = img.alt.includes('Madrid') ? '🇪🇸' :
                                  img.alt.includes('Paris') ? '🇫🇷' :
                                  img.alt.includes('Barcel') ? '⛪' : '📸';
      img.style.display = 'none';
      parent?.appendChild(placeholder);
    });
  });

  // ─── EASTER EGG: Konami Code ───
  const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiPos = 0;
  document.addEventListener('keydown', (e) => {
    if (e.key === konami[konamiPos]) {
      konamiPos++;
      if (konamiPos === konami.length) {
        konamiPos = 0;
        launchConfetti();
      }
    } else {
      konamiPos = 0;
    }
  });

  function launchConfetti() {
    const colors = ['#ef4444','#004d98','#edbb00','#002395','#d4af37','#3b82f6'];
    for (let i = 0; i < 80; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
          position: fixed;
          width: 10px; height: 10px;
          border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          top: -20px;
          left: ${Math.random() * 100}vw;
          z-index: 99999;
          pointer-events: none;
          animation: confetti-fall ${Math.random() * 2 + 2}s ease-in forwards;
        `;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 4000);
      }, Math.random() * 500);
    }

    // Inject confetti keyframe
    if (!document.getElementById('confetti-style')) {
      const style = document.createElement('style');
      style.id = 'confetti-style';
      style.textContent = `
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  console.log('%c✈️ Boa Viagem! Madrid · Barcelona · Paris', 'color: #3b82f6; font-size: 18px; font-weight: bold;');
  console.log('%c💡 Tente o código Konami para uma surpresa!', 'color: #60a5fa; font-size: 12px;');
});

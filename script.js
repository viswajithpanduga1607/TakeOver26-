/* ============================================
   VERDIKT AI — Interactions & Logic
   TakeOver'26 | Tech Resolutions (FTS.19)
   ============================================ */

// ── Configuration ──
const CONFIG = {
  // Replace with your n8n Production Webhook URL before deployment
  WEBHOOK_URL: 'https://workflow.ccbp.in/webhook/takeover26',
  REQUEST_TIMEOUT: 30000, // 30 seconds
};

// ── Particle System ──
class ParticleNetwork {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 160 };
    this.accentRGB = { r: 124, g: 58, b: 237 }; // --accent
    this.secondaryRGB = { r: 6, g: 182, b: 212 }; // --accent-secondary

    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    // Density-based count: fewer on mobile for performance
    const area = this.canvas.width * this.canvas.height;
    const count = Math.min(90, Math.max(30, Math.floor(area / 18000)));
    this.particles = [];

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.5,
        baseOpacity: Math.random() * 0.4 + 0.1,
        // Alternate between accent colors
        color: Math.random() > 0.7 ? this.secondaryRGB : this.accentRGB,
      });
    }
  }

  bindEvents() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.resize();
        this.createParticles();
      }, 200);
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const p of this.particles) {
      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.x < -10) p.x = this.canvas.width + 10;
      if (p.x > this.canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = this.canvas.height + 10;
      if (p.y > this.canvas.height + 10) p.y = -10;

      // Mouse proximity glow
      let opacity = p.baseOpacity;
      if (this.mouse.x !== null) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.mouse.radius) {
          const boost = (1 - dist / this.mouse.radius) * 0.6;
          opacity = Math.min(1, opacity + boost);
        }
      }

      // Draw particle
      const { r, g, b } = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      this.ctx.fill();
    }

    // Draw connections
    const maxDist = 140;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const lineOpacity = (1 - dist / maxDist) * 0.12;
          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.strokeStyle = `rgba(124, 58, 237, ${lineOpacity})`;
          this.ctx.lineWidth = 0.6;
          this.ctx.stroke();
        }
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

// ── Scroll Animations (Intersection Observer) ──
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Don't unobserve — allows re-entering for subtle effect
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));
}

// ── Navigation ──
function initNavigation() {
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const navAnchors = document.querySelectorAll('[data-nav]');

  // Scroll effect — add background on scroll
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    nav.classList.toggle('scrolled', currentScroll > 50);
    lastScroll = currentScroll;
  });

  // Mobile toggle
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close mobile menu on link click
  navAnchors.forEach((anchor) => {
    anchor.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // Active link highlighting (scroll spy)
  const sections = document.querySelectorAll('section[id]');
  const spy = () => {
    const scrollY = window.scrollY + 120;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (link) {
        link.classList.toggle('active', scrollY >= top && scrollY < top + height);
      }
    });
  };
  window.addEventListener('scroll', spy);
  spy(); // Initial check
}

// ── Form Submission ──
function initForm() {
  const form = document.getElementById('request-form');
  const submitBtn = document.getElementById('submit-btn');
  const resultContainer = document.getElementById('result-container');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate required fields
    const employeeName = document.getElementById('employeeName').value.trim();
    const requestType = document.getElementById('requestType').value;
    const description = document.getElementById('description').value.trim();
    const context = document.getElementById('context').value.trim();

    if (!employeeName || !requestType || !description) {
      showError('Please fill in all required fields before submitting.');
      return;
    }

    if (employeeName.length < 2) {
      showError('Please enter a valid name (at least 2 characters).');
      return;
    }

    if (description.length < 10) {
      showError('Please provide a more detailed description (at least 10 characters).');
      return;
    }

    // Check if webhook URL is configured
    if (CONFIG.WEBHOOK_URL === 'YOUR_WEBHOOK_URL_HERE') {
      showError('Webhook URL is not configured yet. The deployment is in progress — please check back soon!');
      return;
    }

    // Set loading state
    setLoading(true);
    hideResult();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

      const response = await fetch(CONFIG.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeName,
          requestType,
          description,
          context: context || '',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      showResult(data);
    } catch (error) {
      console.error('Submission error:', error);

      if (error.name === 'AbortError') {
        showError('The request timed out. The AI agent might be busy — please try again in a moment.');
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        showError('Could not connect to the server. Please check your internet connection and try again.');
      } else {
        showError('Something went wrong while processing your request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  });
}

function setLoading(isLoading) {
  const btn = document.getElementById('submit-btn');
  const form = document.getElementById('request-form');
  const inputs = form.querySelectorAll('input, select, textarea');

  btn.classList.toggle('loading', isLoading);
  btn.disabled = isLoading;
  inputs.forEach((input) => (input.disabled = isLoading));
}

function showResult(data) {
  const container = document.getElementById('result-container');
  const card = document.getElementById('result-card');
  const icon = document.getElementById('result-icon');
  const decision = document.getElementById('result-decision');
  const reason = document.getElementById('result-reason');
  const message = document.getElementById('result-message');
  const confirmation = document.getElementById('result-confirmation');

  // Determine decision type
  const decisionText = (data.decision || '').toUpperCase();
  let variant, iconEmoji, displayDecision;

  if (decisionText.includes('APPROVE') || decisionText.includes('AUTO_APPROVE')) {
    variant = 'approve';
    iconEmoji = '✅';
    displayDecision = 'Auto Approved';
  } else if (decisionText.includes('REVIEW') || decisionText.includes('NEEDS_REVIEW')) {
    variant = 'review';
    iconEmoji = '⏳';
    displayDecision = 'Needs Review';
  } else if (decisionText.includes('REJECT')) {
    variant = 'reject';
    iconEmoji = '❌';
    displayDecision = 'Rejected';
  } else {
    variant = 'review';
    iconEmoji = '📋';
    displayDecision = data.decision || 'Processed';
  }

  // Remove previous variants
  card.className = 'result-card ' + variant;

  // Set content
  icon.textContent = iconEmoji;
  decision.textContent = displayDecision;
  reason.innerHTML = `<strong>Reason:</strong> ${data.reason || 'No reason provided.'}`;

  if (data.message) {
    message.textContent = data.message;
    confirmation.style.display = 'flex';
  } else {
    confirmation.style.display = 'none';
  }

  // Show with animation
  container.classList.add('visible');

  // Scroll to result
  setTimeout(() => {
    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
}

function showError(errorMessage) {
  const container = document.getElementById('result-container');
  const card = document.getElementById('result-card');
  const icon = document.getElementById('result-icon');
  const decision = document.getElementById('result-decision');
  const reason = document.getElementById('result-reason');
  const confirmation = document.getElementById('result-confirmation');

  card.className = 'result-card error';
  icon.textContent = '⚠️';
  decision.textContent = 'Error';
  reason.innerHTML = errorMessage;
  confirmation.style.display = 'none';

  // Add retry button
  const existingRetry = card.querySelector('.btn-retry');
  if (!existingRetry) {
    const retryBtn = document.createElement('button');
    retryBtn.className = 'btn-retry';
    retryBtn.textContent = 'Try Again';
    retryBtn.onclick = () => {
      hideResult();
      document.getElementById('employeeName').focus();
    };
    card.querySelector('.result-body').appendChild(retryBtn);
  }

  container.classList.add('visible');
  setTimeout(() => {
    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
}

function hideResult() {
  const container = document.getElementById('result-container');
  container.classList.remove('visible');

  // Clean up retry button if present
  const retryBtn = container.querySelector('.btn-retry');
  if (retryBtn) retryBtn.remove();
}

// ── Expandable Roadmap Cards ──
function initRoadmapCards() {
  const cards = document.querySelectorAll('[data-roadmap-card]');

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      // Close other cards
      cards.forEach((other) => {
        if (other !== card) other.classList.remove('expanded');
      });
      // Toggle this card
      card.classList.toggle('expanded');
    });
  });
}

// ── Role Selection Toggle ──
function initRoleSelection() {
  const btnEmployee = document.getElementById('btn-role-employee');
  const btnManager = document.getElementById('btn-role-manager');
  const viewEmployee = document.getElementById('employee-view');
  const viewManager = document.getElementById('manager-view');

  if (!btnEmployee || !btnManager || !viewEmployee || !viewManager) return;

  btnEmployee.addEventListener('click', () => {
    btnEmployee.classList.add('active');
    btnManager.classList.remove('active');
    viewEmployee.style.display = 'block';
    viewManager.style.display = 'none';
    
    setTimeout(() => {
      viewEmployee.classList.add('visible');
      viewManager.classList.remove('visible');
    }, 10);
  });

  btnManager.addEventListener('click', () => {
    btnManager.classList.add('active');
    btnEmployee.classList.remove('active');
    viewManager.style.display = 'block';
    viewEmployee.style.display = 'none';
    
    setTimeout(() => {
      viewManager.classList.add('visible');
      viewEmployee.classList.remove('visible');
    }, 10);
  });

  // Default State
  btnEmployee.click();
}

// ── Smooth Scroll for CTA ──
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// ── Initialize Everything on DOM Ready ──
document.addEventListener('DOMContentLoaded', () => {
  // Particle background
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    new ParticleNetwork(canvas);
  }

  // Scroll-triggered animations
  initScrollAnimations();

  // Navigation
  initNavigation();

  // Form logic
  initForm();

  // Roadmap expandable cards
  initRoadmapCards();

  // Role Selection Toggle
  initRoleSelection();

  // Smooth scrolling
  initSmoothScroll();

  // Trigger hero animations immediately
  setTimeout(() => {
    document.querySelectorAll('.hero .fade-up').forEach((el) => {
      el.classList.add('visible');
    });
  }, 100);
});

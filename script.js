/* ============================================
   VERDIKT AI — Interactions & Logic
   TakeOver'26 | Tech Resolutions (FTS.19)
   ============================================ */

import { Renderer, Program, Mesh, Triangle } from 'https://cdn.jsdelivr.net/npm/ogl@1.0.11/dist/ogl.mjs';

// ── Configuration ──
const CONFIG = {
  // Replace with your n8n Production Webhook URL before deployment
  WEBHOOK_URL: 'https://workflow.ccbp.in/webhook/takeover26',
  REQUEST_TIMEOUT: 30000, // 30 seconds
};

// ── Lightfall Background (Vanilla JS Port) ──
const MAX_COLORS = 8;
const hexToRGB = hex => {
  const c = hex.replace('#', '').padEnd(6, '0');
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  return [r, g, b];
};

const prepColors = input => {
  const base = (input && input.length ? input : ['#A6C8FF', '#5227FF', '#FF9FFC']).slice(0, MAX_COLORS);
  const count = base.length;
  const arr = [];
  for (let i = 0; i < MAX_COLORS; i++) arr.push(hexToRGB(base[Math.min(i, base.length - 1)]));
  const avg = [0, 0, 0];
  for (let i = 0; i < count; i++) {
    avg[0] += arr[i][0];
    avg[1] += arr[i][1];
    avg[2] += arr[i][2];
  }
  avg[0] /= count;
  avg[1] /= count;
  avg[2] /= count;
  return { arr, count, avg };
};

const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `
precision highp float;
uniform vec3  iResolution;
uniform vec2  iMouse;
uniform float iTime;
uniform vec3  uColor0, uColor1, uColor2, uColor3, uColor4, uColor5, uColor6, uColor7;
uniform int   uColorCount;
uniform vec3  uBgColor;
uniform vec3  uMouseColor;
uniform float uSpeed, uStreakWidth, uStreakLength, uGlow, uDensity, uTwinkle, uZoom, uBgGlow, uOpacity, uMouseEnabled, uMouseStrength, uMouseRadius;
uniform int   uStreakCount;
varying vec2 vUv;

vec3 palette(float h) {
  int count = uColorCount;
  if (count < 1) count = 1;
  int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));
  if (idx <= 0) return uColor0;
  if (idx == 1) return uColor1;
  if (idx == 2) return uColor2;
  if (idx == 3) return uColor3;
  if (idx == 4) return uColor4;
  if (idx == 5) return uColor5;
  if (idx == 6) return uColor6;
  return uColor7;
}

vec3 tanhv(vec3 x) {
  vec3 e = exp(-2.0 * x);
  return (1.0 - e) / (1.0 + e);
}

vec2 sceneC(vec2 frag, vec2 r) {
  vec2 P = (frag + frag - r) / r.x;
  float z = 0.0;
  float d = 1e3;
  vec4 O = vec4(0.0);
  for (int k = 0; k < 39; k++) {
    if (d <= 1e-4) break;
    O = z * normalize(vec4(P, uZoom, 0.0)) - vec4(0.0, 4.0, 1.0, 0.0) / 4.5;
    d = 1.0 - sqrt(length(O * O));
    z += d;
  }
  return vec2(O.x, atan(O.z, O.y));
}

void mainImage(out vec4 o, vec2 C) {
  vec2 r = iResolution.xy;
  vec2 uv0 = (C + C - r) / r.x;
  float T = 0.1 * iTime * uSpeed + 9.0;
  float angRings = max(1.0, floor(6.28318530718 * max(uDensity, 0.05) + 0.5));
  vec2 Y = vec2(5e-3, 6.28318530718 / angRings);

  vec2 c0 = sceneC(C, r);
  vec2 cdx = sceneC(C + vec2(1.0, 0.0), r);
  vec2 cdy = sceneC(C + vec2(0.0, 1.0), r);
  vec2 dCx = cdx - c0;
  vec2 dCy = cdy - c0;
  dCx.y -= 6.28318530718 * floor(dCx.y / 6.28318530718 + 0.5);
  dCy.y -= 6.28318530718 * floor(dCy.y / 6.28318530718 + 0.5);
  vec2 fw = abs(dCx) + abs(dCy);
  C = c0;

  vec2 P = vec2(2.0, 1.0) * uv0 - (r / r.x) * vec2(0.0, 1.0);
  vec4 O = vec4(uBgColor * 90.0 * uBgGlow / (1e3 * dot(P, P) + 6.0), 0.0);

  float mGlow = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2 mN = (iMouse + iMouse - r) / r.x;
    float md = length(uv0 - mN);
    mGlow = exp(-md * md / max(uMouseRadius * uMouseRadius, 1e-4)) * uMouseStrength;
    O.rgb += uMouseColor * mGlow * 0.25;
  }

  float zr = 5e-4 * uStreakWidth;
  vec2 rr = vec2(max(length(fw), 1e-5));
  float tail = 19.0 / max(uStreakLength, 0.05);

  for (int m = 0; m < 16; m++) {
    if (m >= uStreakCount) break;
    float jf = float(m) + 1.0;
    float ic = fract(sin(dot(vec2(jf, floor(C.x / Y.x + 0.5)), vec2(7.0, 11.0)) * 73.0));
    vec2 Pp = C - (T + T * ic) * vec2(0.0, 1.0);
    Pp -= floor(Pp / Y + 0.5) * Y;
    float h = fract(8663.0 * ic);
    vec3 col = palette(h);
    float weight = mix(1.5, 1.0 + sin(T + 7.0 * h + 4.0), uTwinkle);
    weight *= (1.0 + mGlow * 2.0);
    vec2 inner = vec2(length(max(Pp, vec2(-1.0, 0.0))), length(Pp) - zr) - zr;
    vec2 sm = vec2(1.0) - smoothstep(-rr, rr, inner);
    O.rgb += dot(sm, vec2(exp(tail * Pp.y), 3.0)) * col * weight;
    C.x += Y.x / 8.0;
  }

  vec3 colr = sqrt(tanhv(max(O.rgb * uGlow - vec3(0.04, 0.08, 0.02), 0.0)));
  o = vec4(colr, uOpacity);
}

void main() {
  vec4 color;
  mainImage(color, vUv * iResolution.xy);
  gl_FragColor = color;
}
`;

class Lightfall {
  constructor(containerElement, opts = {}) {
    this.container = containerElement;
    this.dpr = opts.dpr ?? (window.devicePixelRatio || 1);
    this.paused = opts.paused || false;
    this.colors = opts.colors || ['#A6C8FF', '#5227FF', '#FF9FFC'];
    this.backgroundColor = opts.backgroundColor || '#0A29FF';
    this.speed = opts.speed !== undefined ? opts.speed : 1;
    this.streakCount = opts.streakCount !== undefined ? opts.streakCount : 8;
    this.streakWidth = opts.streakWidth !== undefined ? opts.streakWidth : 1;
    this.streakLength = opts.streakLength !== undefined ? opts.streakLength : 1;
    this.glow = opts.glow !== undefined ? opts.glow : 1;
    this.density = opts.density !== undefined ? opts.density : 1;
    this.twinkle = opts.twinkle !== undefined ? opts.twinkle : 1;
    this.zoom = opts.zoom !== undefined ? opts.zoom : 2;
    this.backgroundGlow = opts.backgroundGlow !== undefined ? opts.backgroundGlow : 1;
    this.opacity = opts.opacity !== undefined ? opts.opacity : 1;
    this.mouseInteraction = opts.mouseInteraction !== undefined ? opts.mouseInteraction : true;
    this.mouseStrength = opts.mouseStrength !== undefined ? opts.mouseStrength : 1;
    this.mouseRadius = opts.mouseRadius !== undefined ? opts.mouseRadius : 0.6;
    this.mouseDampening = opts.mouseDampening !== undefined ? opts.mouseDampening : 0.15;
    this.mixBlendMode = opts.mixBlendMode;

    if (this.mixBlendMode) {
      this.container.style.mixBlendMode = this.mixBlendMode;
    }

    this.mouseTarget = [0, 0];
    this.lastTime = 0;
    this.rafId = null;

    this.init();
  }

  init() {
    this.renderer = new Renderer({
      dpr: this.dpr,
      alpha: true,
      antialias: true
    });
    this.gl = this.renderer.gl;
    this.canvas = this.gl.canvas;

    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.container.appendChild(this.canvas);

    const { arr, count, avg } = prepColors(this.colors);

    this.uniforms = {
      iResolution: { value: [this.gl.drawingBufferWidth, this.gl.drawingBufferHeight, 1] },
      iMouse: { value: [0, 0] },
      iTime: { value: 0 },
      uColor0: { value: arr[0] },
      uColor1: { value: arr[1] },
      uColor2: { value: arr[2] },
      uColor3: { value: arr[3] },
      uColor4: { value: arr[4] },
      uColor5: { value: arr[5] },
      uColor6: { value: arr[6] },
      uColor7: { value: arr[7] },
      uColorCount: { value: count },
      uBgColor: { value: hexToRGB(this.backgroundColor) },
      uMouseColor: { value: avg },
      uSpeed: { value: this.speed },
      uStreakCount: { value: Math.max(1, Math.min(16, Math.round(this.streakCount))) },
      uStreakWidth: { value: this.streakWidth },
      uStreakLength: { value: this.streakLength },
      uGlow: { value: this.glow },
      uDensity: { value: this.density },
      uTwinkle: { value: this.twinkle },
      uZoom: { value: this.zoom },
      uBgGlow: { value: this.backgroundGlow },
      uOpacity: { value: this.opacity },
      uMouseEnabled: { value: this.mouseInteraction ? 1 : 0 },
      uMouseStrength: { value: this.mouseStrength },
      uMouseRadius: { value: this.mouseRadius }
    };

    this.program = new Program(this.gl, { vertex, fragment, uniforms: this.uniforms });
    this.geometry = new Triangle(this.gl);
    this.mesh = new Mesh(this.gl, { geometry: this.geometry, program: this.program });

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
    this.resize();

    this.onPointerMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scale = this.renderer.dpr || 1;
      const x = (e.clientX - rect.left) * scale;
      const y = (rect.height - (e.clientY - rect.top)) * scale;
      this.mouseTarget = [x, y];
      if (this.mouseDampening <= 0) {
        this.uniforms.iMouse.value = [x, y];
      }
    };

    if (this.mouseInteraction) {
      this.canvas.addEventListener('pointermove', this.onPointerMove);
    }

    this.loop = this.loop.bind(this);
    this.rafId = requestAnimationFrame(this.loop);
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    this.renderer.setSize(rect.width, rect.height);
    this.uniforms.iResolution.value = [this.gl.drawingBufferWidth, this.gl.drawingBufferHeight, 1];
  }

  loop(t) {
    this.rafId = requestAnimationFrame(this.loop);
    this.uniforms.iTime.value = t * 0.001;

    if (this.mouseDampening > 0) {
      if (!this.lastTime) this.lastTime = t;
      const dt = (t - this.lastTime) / 1000;
      this.lastTime = t;
      const tau = Math.max(1e-4, this.mouseDampening);
      let factor = 1 - Math.exp(-dt / tau);
      if (factor > 1) factor = 1;
      const target = this.mouseTarget;
      const cur = this.uniforms.iMouse.value;
      cur[0] += (target[0] - cur[0]) * factor;
      cur[1] += (target[1] - cur[1]) * factor;
    } else {
      this.lastTime = t;
    }

    if (!this.paused && this.program && this.mesh) {
      try {
        this.renderer.render({ scene: this.mesh });
      } catch (e) {
        console.error(e);
      }
    }
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.mouseInteraction) this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.resizeObserver.disconnect();
    if (this.canvas.parentElement === this.container) {
      this.container.removeChild(this.canvas);
    }
    if (this.program && this.program.remove) this.program.remove();
    if (this.geometry && this.geometry.remove) this.geometry.remove();
    if (this.mesh && this.mesh.remove) this.mesh.remove();
    if (this.renderer && this.renderer.destroy) this.renderer.destroy();
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

// ── SPA Navigation & View Routing ──
function navigateToView(viewId) {
  const views = document.querySelectorAll('.spa-view');
  const navLinks = document.querySelectorAll('.spa-nav');

  // Hide all views
  views.forEach((v) => (v.style.display = 'none'));

  // Show target view
  const target = document.getElementById(viewId);
  if (target) {
    target.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update active nav link (only header nav links, not CTA)
  navLinks.forEach((link) => {
    if (link.closest('.nav-links')) {
      link.classList.toggle('active-nav-link', link.getAttribute('data-view') === viewId);
    }
  });
}

function initNavigation() {
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('nav-toggle');
  const navLinksContainer = document.getElementById('nav-links');

  // Scroll effect — add background on scroll
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Mobile toggle
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinksContainer.classList.toggle('open');
  });

  // SPA routing for all .spa-nav links (nav + CTA buttons)
  document.querySelectorAll('.spa-nav').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const viewId = link.getAttribute('data-view');
      if (viewId) navigateToView(viewId);

      // Close mobile menu
      navToggle.classList.remove('active');
      navLinksContainer.classList.remove('open');
    });
  });

  // Logo click → home
  const logo = document.getElementById('nav-logo');
  if (logo) {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToView('home-view');
    });
  }
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
    const department = document.getElementById('department').value;
    const description = document.getElementById('description').value.trim();
    const context = document.getElementById('context').value.trim();

    if (!employeeName || !requestType || !department || !description) {
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
          department,
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

// ── Smooth Scroll (for in-page anchors only) ──
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]:not(.spa-nav)').forEach((anchor) => {
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

// ── Toast Notification System ──
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast-notification toast--${type}`;
  toast.innerHTML = `${type === 'success' ? '✅' : '❌'} ${message}`;
  document.body.appendChild(toast);

  // Begin exit animation after 2.5s, remove after animation completes
  setTimeout(() => {
    toast.classList.add('toast-exit');
    toast.addEventListener('animationend', () => toast.remove());
  }, 2500);
}

// ── Manager Dashboard Logic ──
function initDashboard() {
  // --- Stat Counter Animation ---
  const statCounter = document.querySelector('.dash-stat-count');
  if (statCounter) {
    let count = parseInt(statCounter.textContent, 10) || 142;
    setInterval(() => {
      count++;
      statCounter.textContent = count;
    }, 7000); // Tick every 7 seconds
  }

  // --- Filter Logic ---
  const filterSelect = document.getElementById('dash-filter-status');
  const feed = document.getElementById('request-feed');

  if (filterSelect && feed) {
    filterSelect.addEventListener('change', () => {
      const selected = filterSelect.value;
      const cards = feed.querySelectorAll('.dash-card');

      cards.forEach((card) => {
        const cardStatus = card.getAttribute('data-status');
        if (selected === 'all' || cardStatus === selected) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // --- Override Button Logic ---
  const overrideBtns = document.querySelectorAll('.btn-override');
  overrideBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.dash-card');
      if (!card) return;

      // Update the badge to show human override
      const badge = card.querySelector('.dash-badge');
      if (badge) {
        badge.className = 'dash-badge dash-badge--success';
        badge.textContent = 'Manager Override';
      }

      // Update the card's data-status so filters still work
      card.setAttribute('data-status', 'AUTO_APPROVE');

      // Disable the button after override
      btn.textContent = 'Overridden ✓';
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'default';

      showToast('AI Decision overridden successfully.', 'success');
    });
  });
}

// ── Initialize Everything on DOM Ready ──
document.addEventListener('DOMContentLoaded', () => {
  // Lightfall background
  const container = document.getElementById('lightfall-container');
  if (container) {
    new Lightfall(container, {
      colors: ['#7c3aed', '#06b6d4', '#a855f7'], // Violet, Cyan, Purple to match Verdikt theme
      backgroundColor: '#050312', // Very dark violet matching existing bg
      speed: 1,
      streakCount: 8,
      streakWidth: 1,
      streakLength: 1,
      glow: 1,
      density: 1,
      twinkle: 1,
      zoom: 2,
      backgroundGlow: 1,
      opacity: 1,
      mouseInteraction: true,
      mouseStrength: 1,
      mouseRadius: 0.6
    });
  }

  // Scroll-triggered animations
  initScrollAnimations();

  // SPA Navigation & Routing
  initNavigation();

  // Form logic
  initForm();

  // Roadmap expandable cards
  initRoadmapCards();

  // Smooth scrolling (in-page anchors)
  initSmoothScroll();

  // Manager Dashboard
  initDashboard();

  // Trigger hero animations immediately
  setTimeout(() => {
    document.querySelectorAll('.hero .fade-up').forEach((el) => {
      el.classList.add('visible');
    });
  }, 100);
});

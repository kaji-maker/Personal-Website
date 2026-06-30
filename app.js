/**
 * SigmaFlow Portfolio main application controller
 * Manages UI, themes, offline search, modals, and canvas simulations.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize App Managers
  ThemeManager.init();
  SearchManager.init();
  ModalManager.init();
  SandboxManager.init();
  HeroBackground.init();
  EmailManager.init();
});

/* ==========================================================================
   1. Theme Management (Light / Dark Mode)
   ========================================================================== */
const ThemeManager = {
  themeToggleBtn: null,
  
  init() {
    this.themeToggleBtn = document.getElementById('theme-toggle');
    if (!this.themeToggleBtn) return;

    // Detect stored theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    this.setTheme(initialTheme);
    
    this.themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      this.setTheme(newTheme);
    });
  },
  
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
};

/* ==========================================================================
   2. Hero Background Canvas Animation (Generative Particle Field)
   ========================================================================== */
const HeroBackground = {
  canvas: null,
  ctx: null,
  particles: [],
  maxParticles: 80,
  animationId: null,
  mouse: { x: null, y: null, radius: 150 },

  init() {
    this.canvas = document.getElementById('hero-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.resizeCanvas();
    this.createParticles();
    this.animate();

    window.addEventListener('resize', () => this.resizeCanvas());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  },

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        color: i % 2 === 0 ? 'var(--primary-color)' : 'var(--secondary-color)'
      });
    }
  },

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const connectionColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';
    
    this.particles.forEach((p, idx) => {
      // Update coordinates
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off screen boundaries
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

      // Mouse interactive push/pull
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          p.x -= (dx / dist) * force * 1.5;
          p.y -= (dy / dist) * force * 1.5;
        }
      }

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(p.color).trim();
      this.ctx.fill();

      // Connect lines with neighboring particles
      for (let j = idx + 1; j < this.particles.length; j++) {
        const other = this.particles[j];
        const dx = p.x - other.x;
        const dy = p.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(other.x, other.y);
          this.ctx.strokeStyle = connectionColor;
          this.ctx.lineWidth = 0.8;
          this.ctx.stroke();
        }
      }
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }
};

/* ==========================================================================
   3. Offline Search, Tag Filtration & Projects UI Generator
   ========================================================================== */
const SearchManager = {
  projects: [],
  selectedCategory: 'all',
  searchQuery: '',
  selectedTags: new Set(),
  
  gridContainer: null,
  searchInput: null,
  clearSearchBtn: null,
  filterTabs: null,
  tagsCloud: null,
  searchStatus: null,
  mobileToggleBtn: null,
  navMenu: null,

  init() {
    this.projects = window.projectsData || [];
    this.gridContainer = document.getElementById('projects-grid');
    this.searchInput = document.getElementById('search-input');
    this.clearSearchBtn = document.getElementById('search-clear-btn');
    this.filterTabs = document.getElementById('filter-tabs');
    this.tagsCloud = document.getElementById('tags-cloud');
    this.searchStatus = document.getElementById('search-status');
    this.mobileToggleBtn = document.getElementById('mobile-menu-toggle');
    this.navMenu = document.getElementById('nav-menu');

    if (!this.gridContainer) return;

    this.renderProjects();
    this.renderTagCloud();
    this.setupListeners();
    this.updateClearBtnVisibility();
  },

  setupListeners() {
    // Search input
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.updateClearBtnVisibility();
      this.filterAndRender();
    });

    // Clear search
    this.clearSearchBtn.addEventListener('click', () => {
      this.searchInput.value = '';
      this.searchQuery = '';
      this.updateClearBtnVisibility();
      this.filterAndRender();
      this.searchInput.focus();
    });

    // Filter tabs
    this.filterTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-btn');
      if (!tab) return;
      
      this.filterTabs.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      tab.classList.add('active');
      this.selectedCategory = tab.dataset.filter;
      this.filterAndRender();
    });

    // Mobile nav toggle
    if (this.mobileToggleBtn && this.navMenu) {
      this.mobileToggleBtn.addEventListener('click', () => {
        this.navMenu.classList.toggle('active');
        const lines = this.mobileToggleBtn.querySelectorAll('line');
        this.mobileToggleBtn.classList.toggle('active');
      });
      // Close menu on link click
      this.navMenu.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-link')) {
          this.navMenu.classList.remove('active');
        }
      });
    }
  },

  updateClearBtnVisibility() {
    if (this.searchQuery.length > 0) {
      this.clearSearchBtn.style.display = 'flex';
    } else {
      this.clearSearchBtn.style.display = 'none';
    }
  },

  renderProjects() {
    this.gridContainer.innerHTML = '';
    
    this.projects.forEach(project => {
      const card = document.createElement('div');
      card.className = `project-card card-hover-effect fade-in`;
      card.id = `card-${project.id}`;
      card.setAttribute('data-category', project.category);
      
      const badgeClass = project.category === 'math' ? 'badge-math' : 'badge-flutter';
      const categoryLabel = project.category === 'math' ? 'Math Model' : 'Flutter App';
      
      // Inline tags mapping
      const tagsHTML = project.tags.map(t => `<span class="project-tag">${t}</span>`).join('');
      
      card.innerHTML = `
        <div class="project-thumbnail">
          <canvas class="thumbnail-canvas" id="canvas-thumb-${project.id}"></canvas>
          <div class="project-card-badge ${badgeClass}">${categoryLabel}</div>
          <div class="project-card-stat">${project.stats}</div>
          <div class="project-thumbnail-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h6v6" />
              <path d="M10 14L21 3" />
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
          </div>
        </div>
        <div class="project-info">
          <h3 class="project-card-title">${project.title}</h3>
          <p class="project-card-desc">${project.description}</p>
          <div class="project-card-tags">${tagsHTML}</div>
          <div class="project-card-footer">
            <button class="btn btn-secondary btn-sm btn-card-action" onclick="ModalManager.open('${project.id}')">View Details</button>
          </div>
        </div>
      `;
      
      this.gridContainer.appendChild(card);
      this.renderMiniThumbnailAnimation(project);
    });
  },

  renderMiniThumbnailAnimation(project) {
    setTimeout(() => {
      const canvas = document.getElementById(`canvas-thumb-${project.id}`);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = canvas.offsetWidth || 360;
      canvas.height = canvas.offsetHeight || 180;
      
      let t = 0;
      const drawThumb = () => {
        if (!document.getElementById(`canvas-thumb-${project.id}`)) return; // Element removed/hidden
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = project.category === 'math' ? 'rgba(138, 43, 226, 0.25)' : 'rgba(0, 206, 209, 0.25)';
        ctx.lineWidth = 1.5;
        
        if (project.category === 'math') {
          // Tracing sine/cosine combination for Math cards
          ctx.beginPath();
          for (let x = 0; x < canvas.width; x += 2) {
            const y = canvas.height / 2 + 
                      Math.sin(x * 0.02 + t) * 30 + 
                      Math.cos(x * 0.05 - t * 0.5) * 15;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        } else {
          // Drawing grid pattern + phone mockup borders for Flutter cards
          ctx.strokeStyle = 'rgba(0, 206, 209, 0.1)';
          for (let x = 0; x < canvas.width; x += 25) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
          }
          for (let y = 0; y < canvas.height; y += 25) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }
          
          ctx.strokeStyle = 'rgba(0, 206, 209, 0.3)';
          ctx.strokeRect(canvas.width/2 - 35, canvas.height/2 - 60, 70, 120);
          ctx.strokeRect(canvas.width/2 - 30, canvas.height/2 - 50, 60, 100);
          ctx.beginPath();
          ctx.arc(canvas.width/2 + Math.sin(t) * 15, canvas.height/2 + Math.cos(t * 1.5) * 20, 5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 206, 209, 0.5)';
          ctx.fill();
        }
        
        t += 0.015;
        requestAnimationFrame(drawThumb);
      };
      
      drawThumb();
    }, 100);
  },

  renderTagCloud() {
    this.tagsCloud.innerHTML = '';
    
    // Get unique tags across all projects
    const allTags = new Set();
    this.projects.forEach(p => p.tags.forEach(t => allTags.add(t)));
    
    allTags.forEach(tag => {
      const tagBtn = document.createElement('button');
      tagBtn.className = 'tag-btn';
      tagBtn.textContent = tag;
      tagBtn.addEventListener('click', () => {
        if (this.selectedTags.has(tag)) {
          this.selectedTags.delete(tag);
          tagBtn.classList.remove('active');
        } else {
          this.selectedTags.add(tag);
          tagBtn.classList.add('active');
        }
        this.filterAndRender();
      });
      this.tagsCloud.appendChild(tagBtn);
    });
  },

  filterAndRender() {
    let visibleCount = 0;
    
    this.projects.forEach(project => {
      const card = document.getElementById(`card-${project.id}`);
      if (!card) return;

      const matchesCategory = this.selectedCategory === 'all' || project.category === this.selectedCategory;
      
      const matchesSearch = this.searchQuery === '' || 
        project.title.toLowerCase().includes(this.searchQuery) ||
        project.description.toLowerCase().includes(this.searchQuery) ||
        project.tags.some(tag => tag.toLowerCase().includes(this.searchQuery));
        
      const matchesTags = this.selectedTags.size === 0 || 
        [...this.selectedTags].every(tag => project.tags.includes(tag));

      if (matchesCategory && matchesSearch && matchesTags) {
        card.style.display = 'flex';
        card.classList.remove('fade-out');
        card.classList.add('fade-in');
        visibleCount++;
      } else {
        card.classList.remove('fade-in');
        card.classList.add('fade-out');
        // Delay hiding display to allow fade-out transitions
        setTimeout(() => {
          if (card.classList.contains('fade-out')) {
            card.style.display = 'none';
          }
        }, 250);
      }
    });

    // Update status bar
    if (this.searchQuery !== '' || this.selectedTags.size > 0 || this.selectedCategory !== 'all') {
      this.searchStatus.style.display = 'block';
      this.searchStatus.textContent = `Found ${visibleCount} projects matching your filters.`;
    } else {
      this.searchStatus.style.display = 'none';
    }
  }
};

/* ==========================================================================
   4. Detailed Projects Modal & Simulated Mobile Previews
   ========================================================================== */
const ModalManager = {
  overlay: null,
  activeProject: null,
  canvas: null,
  ctx: null,
  animationId: null,
  flutterPreview: null,

  init() {
    this.overlay = document.getElementById('project-modal');
    this.canvas = document.getElementById('modal-project-canvas');
    this.flutterPreview = document.getElementById('modal-flutter-preview');
    
    if (!this.overlay) return;
    this.ctx = this.canvas.getContext('2d');

    const closeBtn = document.getElementById('modal-close-btn');
    closeBtn.addEventListener('click', () => this.close());
    
    // Close modal on outside click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
  },

  open(projectId) {
    const project = window.projectsData.find(p => p.id === projectId);
    if (!project) return;
    this.activeProject = project;

    // Populate data
    document.getElementById('modal-project-title').textContent = project.title;
    document.getElementById('modal-project-description').textContent = project.longDescription;
    
    const badge = document.getElementById('modal-project-badge');
    badge.textContent = project.category === 'math' ? 'Mathematics Model' : 'Flutter Mobile';
    badge.className = `project-badge ${project.category === 'math' ? 'badge-math' : 'badge-flutter'}`;
    
    document.getElementById('modal-project-stat').textContent = project.stats;

    // Update GitHub Repository Link
    const githubLink = document.getElementById('modal-github-link');
    if (githubLink) {
      githubLink.setAttribute('href', project.codeLink || 'https://github.com/kaji-maker');
    }

    // Load Tags
    const tagsCloud = document.getElementById('modal-project-tags');
    tagsCloud.innerHTML = project.tags.map(t => `<span class="project-tag">${t}</span>`).join('');

    // Customize Modal Action buttons
    const actionBtn = document.getElementById('modal-action-btn');
    if (project.category === 'math') {
      actionBtn.textContent = 'Launch in Sandbox';
      actionBtn.onclick = () => {
        this.close();
        document.getElementById('model-selector').value = project.interactiveType;
        document.getElementById('model-selector').dispatchEvent(new Event('change'));
        window.location.hash = 'sandbox';
      };
    } else {
      actionBtn.textContent = 'Simulate Screen Interactions';
      actionBtn.onclick = () => {
        this.triggerSimulatedFlutterFeature();
      };
    }

    // Toggle Canvas / Flutter UI Mockups
    if (project.category === 'math') {
      this.canvas.classList.remove('hidden');
      this.flutterPreview.classList.add('hidden');
      this.resizeCanvas();
      this.startMathModelPreview(project.interactiveType);
    } else {
      this.canvas.classList.add('hidden');
      this.flutterPreview.classList.remove('hidden');
      this.renderFlutterMockup(project.id);
    }

    // Populate System Architecture SVG
    this.renderArchitectureSVG(project);

    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock background scroll
  },

  close() {
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  },

  resizeCanvas() {
    this.canvas.width = this.canvas.offsetWidth || 500;
    this.canvas.height = this.canvas.offsetHeight || 370;
  },

  /* 4a. Math Preview in Modal */
  startMathModelPreview(type) {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    
    let t = 0;
    const draw = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      this.ctx.strokeStyle = isDark ? '#a855f7' : '#7c3aed';
      this.ctx.lineWidth = 2;

      if (type === 'lorenz') {
        // Rotating chaotic orbits
        this.ctx.beginPath();
        let ox = this.canvas.width/2;
        let oy = this.canvas.height/2;
        for (let i = 0; i < 200; i++) {
          const theta = i * 0.15 + t;
          const r = (50 + Math.sin(theta * 1.8) * 35) * Math.sin(t * 0.1);
          const x = ox + Math.cos(theta) * r;
          const y = oy + Math.sin(theta) * r;
          if (i === 0) this.ctx.moveTo(x, y);
          else this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();
      } else if (type === 'fourier') {
        // Simple orbital harmonics
        const ox = this.canvas.width/2;
        const oy = this.canvas.height/2;
        let x = ox;
        let y = oy;
        
        this.ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        this.ctx.lineWidth = 1;
        
        // Draw 3 circles
        const radii = [60, 30, 15];
        const freqs = [1, 3, 5];
        radii.forEach((r, idx) => {
          this.ctx.beginPath();
          this.ctx.arc(x, y, r, 0, Math.PI*2);
          this.ctx.stroke();
          
          const nextX = x + Math.cos(t * freqs[idx]) * r;
          const nextY = y + Math.sin(t * freqs[idx]) * r;
          
          this.ctx.beginPath();
          this.ctx.moveTo(x, y);
          this.ctx.lineTo(nextX, nextY);
          this.ctx.strokeStyle = 'var(--primary-color)';
          this.ctx.stroke();
          
          x = nextX;
          y = nextY;
        });
      } else if (type === 'ulam') {
        // Prime dot clusters
        this.ctx.fillStyle = isDark ? '#06edf9' : '#00b4d8';
        const ox = this.canvas.width/2;
        const oy = this.canvas.height/2;
        for (let i = 0; i < 400; i += 3) {
          const theta = i * 0.8;
          const r = Math.sqrt(i) * 8;
          this.ctx.beginPath();
          this.ctx.arc(ox + Math.cos(theta) * r, oy + Math.sin(theta) * r, 2, 0, Math.PI*2);
          this.ctx.fill();
        }
      } else if (type === 'mandelbrot') {
        // Draw mathematical mandelbrot coordinate axes dynamically
        this.ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height/2);
        this.ctx.lineTo(this.canvas.width, this.canvas.height/2);
        this.ctx.moveTo(this.canvas.width/2, 0);
        this.ctx.lineTo(this.canvas.width/2, this.canvas.height);
        this.ctx.stroke();
        
        this.ctx.fillStyle = isDark ? 'rgba(168, 85, 247, 0.4)' : 'rgba(124, 58, 237, 0.4)';
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width/2, this.canvas.height/2, 80 + Math.sin(t) * 10, 0, Math.PI*2);
        this.ctx.fill();
      }

      t += 0.05;
      this.animationId = requestAnimationFrame(draw);
    };
    draw();
  },

  /* 4b. Custom Flutter Interface Simulations */
  renderFlutterMockup(projectId) {
    const screen = document.getElementById('phone-app-content');
    if (!screen) return;
    
    if (projectId === 'zenith-task') {
      screen.innerHTML = `
        <div class="flutter-mock-header">
          <span class="flutter-mock-header-title">ZenithTask Flow</span>
        </div>
        <div class="flutter-mock-content">
          <div class="flutter-mock-card">
            <span style="font-weight:600">Calculus Homework Set 4</span>
            <div class="flutter-mock-card-bar accent"></div>
          </div>
          <div class="flutter-mock-card">
            <span style="font-weight:600">ODE Solver Implementation</span>
            <div class="flutter-mock-card-bar" style="width: 40%"></div>
          </div>
          <div class="flutter-mock-card">
            <span style="font-weight:600">Review SQLite Schema (Drift)</span>
            <div class="flutter-mock-card-bar" style="width: 80%"></div>
          </div>
          
          <div class="flutter-mock-grid">
            <div class="flutter-mock-card" style="text-align:center">
              <span style="font-size:1.1rem; font-weight:700">88%</span>
              <p style="font-size:0.55rem; color:var(--text-tertiary)">Productivity</p>
            </div>
            <div class="flutter-mock-card" style="text-align:center">
              <span style="font-size:1.1rem; font-weight:700">12</span>
              <p style="font-size:0.55rem; color:var(--text-tertiary)">Tasks Open</p>
            </div>
          </div>
        </div>
      `;
    } else if (projectId === 'aether-weather') {
      screen.innerHTML = `
        <div class="flutter-mock-header" style="justify-content: space-between;">
          <span class="flutter-mock-header-title">AetherWeather</span>
          <span style="font-size: 0.65rem; color: #a855f7;">• Connected</span>
        </div>
        <div class="flutter-mock-content" style="text-align:center;">
          <h1 style="font-size: 2.2rem; font-family:var(--font-family-display); font-weight: 500; margin-top:10px;">22°C</h1>
          <p style="color:var(--text-secondary); margin-bottom: 12px;">Thunderstorm & Rain</p>
          
          <!-- Custom simulated physics graph -->
          <div style="height: 90px; background: rgba(0, 206, 209, 0.05); border:1px solid rgba(0,206,209,0.2); border-radius: 8px; position:relative; overflow:hidden;">
            <canvas id="flutter-rain-canvas" style="position:absolute; width:100%; height:100%; top:0; left:0;"></canvas>
            <div style="position:relative; z-index:1; padding: 8px 12px; font-weight:600; text-align:left; font-size:0.6rem; color:rgba(255,255,255,0.7)">LIVE RAIN INTENSITY</div>
          </div>

          <div class="flutter-mock-card" style="margin-top:10px; font-size: 0.65rem; text-align: left;">
            ⚡ Wind: 14km/h | Humidity: 92% | Barometer: 1011hPa
          </div>
        </div>
      `;
      // Initiate Mini Rain animation inside Flutter mock
      setTimeout(() => {
        const rCanvas = document.getElementById('flutter-rain-canvas');
        if (!rCanvas) return;
        const rCtx = rCanvas.getContext('2d');
        rCanvas.width = rCanvas.offsetWidth;
        rCanvas.height = rCanvas.offsetHeight;
        let drops = [];
        const tick = () => {
          if (!document.getElementById('flutter-rain-canvas')) return;
          rCtx.clearRect(0,0,rCanvas.width,rCanvas.height);
          rCtx.strokeStyle = 'rgba(0, 206, 209, 0.5)';
          rCtx.lineWidth = 1;
          
          if (drops.length < 20) {
            drops.push({ x: Math.random() * rCanvas.width, y: 0, l: Math.random()*8+4, vy: Math.random()*4+4 });
          }
          drops.forEach((d, idx) => {
            rCtx.beginPath();
            rCtx.moveTo(d.x, d.y);
            rCtx.lineTo(d.x + 1, d.y + d.l);
            rCtx.stroke();
            d.y += d.vy;
            if (d.y > rCanvas.height) drops[idx] = { x: Math.random()*rCanvas.width, y: 0, l: Math.random()*8+4, vy: Math.random()*4+4 };
          });
          requestAnimationFrame(tick);
        };
        tick();
      }, 100);
    } else if (projectId === 'calorytics') {
      screen.innerHTML = `
        <div class="flutter-mock-header">
          <span class="flutter-mock-header-title">Calorytics Local</span>
        </div>
        <div class="flutter-mock-content">
          <div class="flutter-mock-circle-stat">1.8k</div>
          <p style="text-align:center; color: var(--text-secondary); font-size: 0.65rem; margin-top:-5px;">Calories Burned</p>
          
          <div class="flutter-mock-card">
            <span style="font-weight:600">Local Telemetry Encrypted</span>
            <div class="flutter-mock-card-bar accent" style="width: 100%; background: #4caf50;"></div>
          </div>
          <div class="flutter-mock-card" style="font-size:0.6rem;">
            🧬 HealthKit Connection Sync completed 4m ago.
          </div>
        </div>
      `;
    } else if (projectId === 'fluxflow') {
      screen.innerHTML = `
        <div class="flutter-mock-header">
          <span class="flutter-mock-header-title">FluxFlow canvas</span>
        </div>
        <!-- Node canvas drawing -->
        <div style="flex-grow:1; position:relative; background: #0c0d12;">
          <div style="position:absolute; top:30px; left:20px; width:45px; height:20px; background:var(--primary-color); border-radius:4px; font-size:0.5rem; display:flex; align-items:center; justify-content:center; font-weight:700;">Task A</div>
          <div style="position:absolute; top:80px; left:70px; width:45px; height:20px; background:var(--secondary-color); border-radius:4px; font-size:0.5rem; display:flex; align-items:center; justify-content:center; font-weight:700;">Task B</div>
          
          <svg style="position:absolute; width:100%; height:100%; pointer-events:none;">
            <path d="M 65 40 Q 90 40, 92 80" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" stroke-dasharray="2,2"/>
          </svg>
        </div>
      `;
    }
  },

  triggerSimulatedFlutterFeature() {
    const screen = document.getElementById('phone-app-content');
    if (!screen || !this.activeProject) return;
    
    // Animate mockup to show database sync / toggle actions
    screen.classList.add('shake');
    setTimeout(() => screen.classList.remove('shake'), 400);
  },

  /* 4c. SVG Technical Architecture Graphics generator */
  renderArchitectureSVG(project) {
    const flowContainer = document.getElementById('modal-architecture-flow');
    if (!flowContainer) return;

    if (project.category === 'math') {
      flowContainer.innerHTML = `
        <svg class="arch-diagram-svg" viewBox="0 0 400 120">
          <rect x="10" y="35" width="90" height="50" rx="6" fill="var(--bg-secondary)" stroke="var(--border-glass)" stroke-width="2"/>
          <text x="55" y="65" fill="var(--text-primary)" font-size="10" font-weight="700" text-anchor="middle">Input Params</text>
          
          <path d="M 100 60 L 140 60" fill="none" stroke="var(--primary-color)" stroke-width="2" marker-end="url(#arrow)"/>
          
          <rect x="150" y="35" width="100" height="50" rx="6" fill="var(--primary-glow)" stroke="var(--primary-color)" stroke-width="2"/>
          <text x="200" y="60" fill="var(--text-primary)" font-size="9" font-weight="700" text-anchor="middle">RK4 Numerical</text>
          <text x="200" y="73" fill="var(--secondary-color)" font-size="8" text-anchor="middle">Integration Step</text>
          
          <path d="M 250 60 L 290 60" fill="none" stroke="var(--secondary-color)" stroke-width="2"/>
          
          <rect x="300" y="35" width="90" height="50" rx="6" fill="var(--bg-secondary)" stroke="var(--border-glass)" stroke-width="2"/>
          <text x="345" y="65" fill="var(--text-primary)" font-size="10" font-weight="700" text-anchor="middle">Canvas Traces</text>
        </svg>
      `;
    } else {
      flowContainer.innerHTML = `
        <svg class="arch-diagram-svg" viewBox="0 0 400 120">
          <rect x="10" y="35" width="90" height="50" rx="6" fill="var(--bg-secondary)" stroke="var(--border-glass)" stroke-width="2"/>
          <text x="55" y="65" fill="var(--text-primary)" font-size="10" font-weight="700" text-anchor="middle">Flutter UI</text>
          
          <path d="M 100 60 L 140 60" fill="none" stroke="var(--primary-color)" stroke-width="2"/>
          
          <rect x="150" y="35" width="100" height="50" rx="6" fill="var(--primary-glow)" stroke="var(--primary-color)" stroke-width="2"/>
          <text x="200" y="60" fill="var(--text-primary)" font-size="10" font-weight="700" text-anchor="middle">BLoC / State</text>
          <text x="200" y="73" fill="var(--secondary-color)" font-size="8" text-anchor="middle">Data Repository</text>
          
          <path d="M 250 60 L 290 60" fill="none" stroke="var(--secondary-color)" stroke-width="2"/>
          
          <rect x="300" y="35" width="90" height="50" rx="6" fill="var(--bg-secondary)" stroke="var(--border-glass)" stroke-width="2"/>
          <text x="345" y="58" fill="var(--text-primary)" font-size="9" font-weight="700" text-anchor="middle">SQLite Storage</text>
          <text x="345" y="70" fill="var(--text-tertiary)" font-size="8" text-anchor="middle">Local Hive Cache</text>
        </svg>
      `;
    }
  }
};

/* ==========================================================================
   5. Interactive Math Sandbox Engine
   ========================================================================== */
const SandboxManager = {
  canvas: null,
  ctx: null,
  activeModel: 'lorenz',
  isPlaying: true,
  animationId: null,
  lastFrameTime: 0,
  frameCount: 0,
  fpsDisplay: null,
  coordDisplay: null,
  slidersContainer: null,
  modelDescription: null,
  drawPrompt: null,

  // Model states
  lorenz: {
    x: 0.1, y: 0.0, z: 0.0,
    sigma: 10.0, rho: 28.0, beta: 2.6666,
    path: [],
    maxPath: 1200
  },
  fourier: {
    points: [],
    dftCoeffs: [],
    t: 0,
    isDrawing: false,
    drawPath: [],
    waveType: 'square'
  },
  ulam: {
    zoom: 12,
    modFilter: 41,
    limit: 12000
  },
  mandelbrot: {
    maxIter: 80,
    minR: -2.0, maxR: 1.0,
    minI: -1.2, maxI: 1.2,
    zoomFactor: 1.0
  },

  init() {
    this.canvas = document.getElementById('sandbox-canvas');
    this.fpsDisplay = document.getElementById('fps-counter');
    this.coordDisplay = document.getElementById('coordinates-display');
    this.slidersContainer = document.getElementById('sliders-container');
    this.modelDescription = document.getElementById('model-description-text');
    this.drawPrompt = document.getElementById('draw-prompt');
    
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.setupViewport();
    this.loadModel('lorenz');
    this.setupListeners();
    this.tick();

    window.addEventListener('resize', () => this.setupViewport());
  },

  setupViewport() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    
    // Clear trails if Lorenz
    this.lorenz.path = [];

    // Redraw static views immediately on resize
    if (this.activeModel === 'mandelbrot') {
      this.renderMandelbrot();
    } else if (this.activeModel === 'ulam') {
      this.drawUlam();
    }
  },

  setupListeners() {
    // Model switching selector
    document.getElementById('model-selector').addEventListener('change', (e) => {
      this.loadModel(e.target.value);
    });

    // Toggle play/pause
    const playBtn = document.getElementById('btn-toggle-play');
    playBtn.addEventListener('click', () => {
      this.isPlaying = !this.isPlaying;
      document.getElementById('play-icon').classList.toggle('hidden');
      document.getElementById('pause-icon').classList.toggle('hidden');
    });

    // Reset physics state
    document.getElementById('btn-canvas-reset').addEventListener('click', () => {
      this.resetModel();
    });

    // Randomize parameter values
    document.getElementById('btn-randomize-params').addEventListener('click', () => {
      this.randomizeParams();
    });

    // Fourier specific drawing listener
    document.getElementById('btn-fourier-draw-mode').addEventListener('click', () => {
      this.drawPrompt.classList.add('hidden');
      this.fourier.isDrawing = true;
      this.fourier.points = [];
      this.fourier.drawPath = [];
      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    });

    // Drawing coordinates handlers
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
    this.canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      this.handleMouseDown(touch);
    });
    this.canvas.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      this.handleMouseMove(touch);
    });
    this.canvas.addEventListener('touchend', () => this.handleMouseUp());
  },

  loadModel(modelName) {
    this.activeModel = modelName;
    this.drawPrompt.classList.add('hidden');
    this.fourier.isDrawing = false;
    
    document.getElementById('sandbox-model-title').textContent = 
      modelName === 'lorenz' ? 'Lorenz Chaos Attractor' : 
      modelName === 'fourier' ? 'Fourier Series Epicycles' : 
      modelName === 'ulam' ? 'Ulam Prime Spiral' : 'Mandelbrot Fractal Explorer';

    this.renderSliders();
    this.resetModel();
  },

  resetModel() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (this.activeModel === 'lorenz') {
      this.lorenz.x = 0.1;
      this.lorenz.y = 0.0;
      this.lorenz.z = 0.0;
      this.lorenz.path = [];
    } else if (this.activeModel === 'fourier') {
      this.fourier.t = 0;
      this.drawPrompt.classList.remove('hidden');
      this.fourier.points = [];
      this.fourier.dftCoeffs = [];
      this.loadFourierPreset('infinity');
    } else if (this.activeModel === 'ulam') {
      this.ulam.zoom = 12;
    } else if (this.activeModel === 'mandelbrot') {
      this.mandelbrot.minR = -2.0;
      this.mandelbrot.maxR = 1.0;
      this.mandelbrot.minI = -1.2;
      this.mandelbrot.maxI = 1.2;
      this.mandelbrot.zoomFactor = 1.0;
      this.renderMandelbrot();
    }
  },

  randomizeParams() {
    if (this.activeModel === 'lorenz') {
      this.lorenz.sigma = parseFloat((Math.random() * 25 + 5).toFixed(1));
      this.lorenz.rho = parseFloat((Math.random() * 50 + 10).toFixed(1));
      this.lorenz.beta = parseFloat((Math.random() * 4 + 1).toFixed(3));
      
      this.updateSliderValue('lorenz-sigma', this.lorenz.sigma);
      this.updateSliderValue('lorenz-rho', this.lorenz.rho);
      this.updateSliderValue('lorenz-beta', this.lorenz.beta);
    } else if (this.activeModel === 'ulam') {
      this.ulam.modFilter = Math.floor(Math.random() * 80 + 2);
      this.updateSliderValue('ulam-mod', this.ulam.modFilter);
    } else if (this.activeModel === 'mandelbrot') {
      this.mandelbrot.maxIter = Math.floor(Math.random() * 120 + 40);
      this.updateSliderValue('mandelbrot-iter', this.mandelbrot.maxIter);
      this.renderMandelbrot();
    }
  },

  updateSliderValue(id, val) {
    const slider = document.getElementById(id);
    if (slider) {
      slider.value = val;
      const display = document.getElementById(`${id}-val`);
      if (display) display.textContent = val;
    }
  },

  renderSliders() {
    this.slidersContainer.innerHTML = '';
    
    if (this.activeModel === 'lorenz') {
      this.modelDescription.textContent = "The Lorenz system models chaotic atmospheric convection. Adjust σ (fluid viscosity), ρ (temperature gradient), and β (system geometry) to see bifurcation and attractors.";
      
      this.addSlider('lorenz-sigma', 'Prandtl (σ)', 1, 40, this.lorenz.sigma, 0.5, (val) => {
        this.lorenz.sigma = val;
      });
      this.addSlider('lorenz-rho', 'Rayleigh (ρ)', 10, 80, this.lorenz.rho, 0.5, (val) => {
        this.lorenz.rho = val;
      });
      this.addSlider('lorenz-beta', 'Dimension (β)', 0.5, 6, this.lorenz.beta, 0.05, (val) => {
        this.lorenz.beta = val;
      });
    } else if (this.activeModel === 'fourier') {
      this.modelDescription.textContent = "Fourier series epicycles decompose any coordinate trail into simple rotators. Choose a preset below or click 'Clear & Draw' to draw your own custom shape.";
      
      const selectHtml = `
        <div class="control-group">
          <label class="control-label">Drawing Preset</label>
          <div class="custom-select-wrapper">
            <select class="control-select" id="fourier-preset">
              <option value="infinity">Infinity Loops</option>
              <option value="heart">Mathematical Heart</option>
              <option value="square">Square Wave</option>
            </select>
          </div>
        </div>
      `;
      this.slidersContainer.innerHTML = selectHtml;
      
      document.getElementById('fourier-preset').addEventListener('change', (e) => {
        this.loadFourierPreset(e.target.value);
      });
    } else if (this.activeModel === 'ulam') {
      this.modelDescription.textContent = "The Ulam Spiral arranges natural numbers outwards. Prime numbers show diagonal lines. Toggle the modular filter to show quadratic paths (e.g. Euler's n² - n + 41).";
      
      this.addSlider('ulam-zoom', 'Grid Zoom', 4, 30, this.ulam.zoom, 1, (val) => {
        this.ulam.zoom = val;
      });
      this.addSlider('ulam-mod', 'Quadratic Prime Coeff', 2, 90, this.ulam.modFilter, 1, (val) => {
        this.ulam.modFilter = val;
      });
    } else if (this.activeModel === 'mandelbrot') {
      this.modelDescription.textContent = "The Mandelbrot Set represents boundaries of fractal stability under iteration. Click on the canvas to zoom in, and Shift-click to zoom out. Lower iteration count is faster, higher is crisper.";
      
      this.addSlider('mandelbrot-iter', 'Max Iterations', 30, 200, this.mandelbrot.maxIter, 5, (val) => {
        this.mandelbrot.maxIter = val;
        this.renderMandelbrot();
      });
    }
  },

  addSlider(id, label, min, max, initial, step, callback) {
    const wrapper = document.createElement('div');
    wrapper.className = 'slider-wrapper';
    wrapper.innerHTML = `
      <div class="slider-label-val">
        <span class="slider-name">${label}</span>
        <span class="slider-value" id="${id}-val">${initial}</span>
      </div>
      <input type="range" class="slider-input" id="${id}" min="${min}" max="${max}" value="${initial}" step="${step}">
    `;
    this.slidersContainer.appendChild(wrapper);
    
    const input = wrapper.querySelector('input');
    const valDisplay = wrapper.querySelector(`#${id}-val`);
    input.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      valDisplay.textContent = val;
      callback(val);
    });
  },

  /* Drawing Path mouse handlers */
  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.activeModel === 'fourier' && this.fourier.isDrawing) {
      this.fourier.drawPath = [{x, y}];
    } else if (this.activeModel === 'mandelbrot') {
      // Get click coordinate in complex plane
      const cr = this.mandelbrot.minR + (x / this.canvas.width) * (this.mandelbrot.maxR - this.mandelbrot.minR);
      const ci = this.mandelbrot.minI + (y / this.canvas.height) * (this.mandelbrot.maxI - this.mandelbrot.minI);
      
      const widthR = this.mandelbrot.maxR - this.mandelbrot.minR;
      const heightI = this.mandelbrot.maxI - this.mandelbrot.minI;
      
      // Zoom factor: Left-click zooms in, Shift-click zooms out
      const factor = e.shiftKey ? 2.0 : 0.4;
      
      this.mandelbrot.minR = cr - (widthR * factor) / 2;
      this.mandelbrot.maxR = cr + (widthR * factor) / 2;
      this.mandelbrot.minI = ci - (heightI * factor) / 2;
      this.mandelbrot.maxI = ci + (heightI * factor) / 2;
      
      this.renderMandelbrot();
    }
  },

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Display coordinates
    this.coordDisplay.textContent = `X: ${x.toFixed(0)} | Y: ${y.toFixed(0)} | Z: --`;

    if (this.activeModel !== 'fourier' || !this.fourier.isDrawing || this.fourier.drawPath.length === 0) return;
    
    this.fourier.drawPath.push({x, y});
    
    // Paint drawing instantly
    this.ctx.strokeStyle = '#00cedf';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(this.fourier.drawPath[0].x, this.fourier.drawPath[0].y);
    for(let i=1; i<this.fourier.drawPath.length; i++) {
      this.ctx.lineTo(this.fourier.drawPath[i].x, this.fourier.drawPath[i].y);
    }
    this.ctx.stroke();
  },

  handleMouseUp() {
    if (this.activeModel !== 'fourier' || !this.fourier.isDrawing || this.fourier.drawPath.length < 5) return;
    
    this.fourier.isDrawing = false;
    this.fourier.points = this.fourier.drawPath.map(p => ({ x: p.x - this.canvas.width/2, y: p.y - this.canvas.height/2 }));
    this.computeDFT();
    this.fourier.t = 0;
  },

  /* Fourier Presets loader */
  loadFourierPreset(type) {
    this.fourier.points = [];
    const step = 0.05;
    if (type === 'infinity') {
      for (let theta = 0; theta < Math.PI * 2; theta += step) {
        const scale = 140;
        const x = (scale * Math.cos(theta)) / (1 + Math.sin(theta) * Math.sin(theta));
        const y = (scale * Math.sin(theta) * Math.cos(theta)) / (1 + Math.sin(theta) * Math.sin(theta));
        this.fourier.points.push({ x, y });
      }
    } else if (type === 'heart') {
      for (let theta = 0; theta < Math.PI * 2; theta += step) {
        const scale = 10;
        const x = scale * 16 * Math.sin(theta) ** 3;
        const y = -scale * (13 * Math.cos(theta) - 5 * Math.cos(2*theta) - 2 * Math.cos(3*theta) - Math.cos(4*theta));
        this.fourier.points.push({ x, y });
      }
    } else if (type === 'square') {
      // Create a square box shape
      for(let x = -80; x < 80; x += 10) this.fourier.points.push({ x, y: -60 });
      for(let y = -60; y < 60; y += 10) this.fourier.points.push({ x: 80, y });
      for(let x = 80; x > -80; x -= 10) this.fourier.points.push({ x, y: 60 });
      for(let y = 60; y > -60; y -= 10) this.fourier.points.push({ x: -80, y });
    }
    
    this.computeDFT();
  },

  computeDFT() {
    const N = this.fourier.points.length;
    this.fourier.dftCoeffs = [];
    
    for (let k = 0; k < N; k++) {
      let re = 0;
      let im = 0;
      for (let n = 0; n < N; n++) {
        const phi = (Math.PI * 2 * k * n) / N;
        re += this.fourier.points[n].x * Math.cos(phi) + this.fourier.points[n].y * Math.sin(phi);
        im += -this.fourier.points[n].x * Math.sin(phi) + this.fourier.points[n].y * Math.cos(phi);
      }
      re = re / N;
      im = im / N;
      
      const freq = k;
      const amp = Math.sqrt(re * re + im * im);
      const phase = Math.atan2(im, re);
      this.fourier.dftCoeffs.push({ freq, amp, phase });
    }
    
    // Sort epicycles by size so it looks satisfying
    this.fourier.dftCoeffs.sort((a, b) => b.amp - a.amp);
  },

  /* 5a. Numerical Physics integrations (RK4 Step) */
  runLorenzPhysics() {
    const dt = 0.0085;
    const l = this.lorenz;
    
    // Evaluate RK4 Integration steps
    const dx = (x, y, z) => l.sigma * (y - x);
    const dy = (x, y, z) => x * (l.rho - z) - y;
    const dz = (x, y, z) => x * y - l.beta * z;
    
    const stepRK4 = () => {
      const x1 = l.x, y1 = l.y, z1 = l.z;
      const kx1 = dx(x1, y1, z1);
      const ky1 = dy(x1, y1, z1);
      const kz1 = dz(x1, y1, z1);
      
      const x2 = l.x + kx1 * dt * 0.5;
      const y2 = l.y + ky1 * dt * 0.5;
      const z2 = l.z + kz1 * dt * 0.5;
      const kx2 = dx(x2, y2, z2);
      const ky2 = dy(x2, y2, z2);
      const kz2 = dz(x2, y2, z2);
      
      const x3 = l.x + kx2 * dt * 0.5;
      const y3 = l.y + ky2 * dt * 0.5;
      const z3 = l.z + kz2 * dt * 0.5;
      const kx3 = dx(x3, y3, z3);
      const ky3 = dy(x3, y3, z3);
      const kz3 = dz(x3, y3, z3);
      
      const x4 = l.x + kx3 * dt;
      const y4 = l.y + ky3 * dt;
      const z4 = l.z + kz3 * dt;
      const kx4 = dx(x4, y4, z4);
      const ky4 = dy(x4, y4, z4);
      const kz4 = dz(x4, y4, z4);
      
      l.x += (kx1 + 2 * kx2 + 2 * kx3 + kx4) * dt / 6;
      l.y += (ky1 + 2 * ky2 + 2 * ky3 + ky4) * dt / 6;
      l.z += (kz1 + 2 * kz2 + 2 * kz3 + kz4) * dt / 6;
    };
    
    // Solve multiple iterations per frame for speed
    for (let i = 0; i < 4; i++) {
      stepRK4();
      l.path.push({ x: l.x, y: l.y, z: l.z });
      if (l.path.length > l.maxPath) l.path.shift();
    }
  },

  /* 5b. Frame Runner */
  tick() {
    this.animationId = requestAnimationFrame(() => this.tick());
    
    // FPS tracking
    const now = performance.now();
    this.frameCount++;
    if (now > this.lastFrameTime + 1000) {
      const fps = Math.round((this.frameCount * 1000) / (now - this.lastFrameTime));
      this.fpsDisplay.textContent = `FPS: ${fps}`;
      this.frameCount = 0;
      this.lastFrameTime = now;
    }

    if (!this.isPlaying) return;
    
    if (this.activeModel === 'lorenz') {
      this.runLorenzPhysics();
      this.drawLorenz();
    } else if (this.activeModel === 'fourier') {
      this.drawFourier();
    } else if (this.activeModel === 'ulam') {
      this.drawUlam();
    }
  },

  /* 5c. Drawing Lorenz system in rotating 3D space */
  drawLorenz() {
    this.ctx.fillStyle = '#06060c';
    if (document.documentElement.getAttribute('data-theme') === 'light') {
      this.ctx.fillStyle = '#f0f0f7';
    }
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    const path = this.lorenz.path;
    if (path.length < 2) return;
    
    const ox = this.canvas.width / 2;
    const oy = this.canvas.height / 2 + 30;
    
    // Slow rotational yaw/pitch coefficients
    const timeAngle = Date.now() * 0.0003;
    const pitch = 0.25;
    
    this.ctx.beginPath();
    path.forEach((pt, i) => {
      // 3D Matrix rotates around Z-axis and projected to screen space
      const xRot = pt.x * Math.cos(timeAngle) - pt.y * Math.sin(timeAngle);
      const yRot = pt.x * Math.sin(timeAngle) + pt.y * Math.cos(timeAngle);
      const zRot = pt.z;
      
      const screenX = ox + xRot * 6.5;
      const screenY = oy - (zRot - yRot * Math.sin(pitch)) * 6.5;
      
      if (i === 0) this.ctx.moveTo(screenX, screenY);
      else this.ctx.lineTo(screenX, screenY);
    });
    
    // Rainbow glow gradient
    const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    gradient.addColorStop(0, '#a855f7');
    gradient.addColorStop(0.5, '#00cedf');
    gradient.addColorStop(1, '#ec4899');
    
    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 1.6;
    this.ctx.stroke();

    // Display position coordinates
    const latest = path[path.length - 1];
    this.coordDisplay.textContent = `X: ${latest.x.toFixed(2)} | Y: ${latest.y.toFixed(2)} | Z: ${latest.z.toFixed(2)}`;
  },

  /* 5d. Draw Fourier Orbiting circles */
  drawFourier() {
    if (this.fourier.isDrawing) return;
    
    this.ctx.fillStyle = '#06060c';
    if (document.documentElement.getAttribute('data-theme') === 'light') {
      this.ctx.fillStyle = '#f0f0f7';
    }
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    const ox = this.canvas.width / 2;
    const oy = this.canvas.height / 2;
    
    let x = ox;
    let y = oy;
    
    const wavePath = [];
    const coeffs = this.fourier.dftCoeffs;
    if (coeffs.length === 0) return;
    
    // Draw rotating orbital epicycles
    coeffs.forEach((c) => {
      const prevX = x;
      const prevY = y;
      
      x += c.amp * Math.cos(c.freq * this.fourier.t + c.phase);
      y += c.amp * Math.sin(c.freq * this.fourier.t + c.phase);
      
      // Draw outer circle
      this.ctx.beginPath();
      this.ctx.arc(prevX, prevY, c.amp, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(168, 85, 247, 0.08)';
      this.ctx.lineWidth = 1.0;
      this.ctx.stroke();
      
      // Draw vector connector line
      this.ctx.beginPath();
      this.ctx.moveTo(prevX, prevY);
      this.ctx.lineTo(x, y);
      this.ctx.strokeStyle = 'rgba(0, 206, 209, 0.4)';
      this.ctx.stroke();
    });
    
    // Store path values dynamically
    if (!this.fourier.path) this.fourier.path = [];
    this.fourier.path.push({ x, y });
    if (this.fourier.path.length > 500) this.fourier.path.shift();
    
    // Draw resulting Fourier curve
    this.ctx.beginPath();
    this.fourier.path.forEach((pt, i) => {
      if (i === 0) this.ctx.moveTo(pt.x, pt.y);
      else this.ctx.lineTo(pt.x, pt.y);
    });
    this.ctx.strokeStyle = '#00cedf';
    this.ctx.lineWidth = 2.5;
    this.ctx.stroke();
    
    // Draw dot at drawing point
    this.ctx.beginPath();
    this.ctx.arc(x, y, 4, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ff007f';
    this.ctx.fill();
    
    this.fourier.t += (Math.PI * 2) / coeffs.length;
    
    this.coordDisplay.textContent = `X: ${(x - ox).toFixed(1)} | Y: ${(y - oy).toFixed(1)} | Z: ${coeffs.length} epicycles`;
  },

  /* 5e. Draw Prime Ulam Spiral */
  drawUlam() {
    this.ctx.fillStyle = '#06060c';
    if (document.documentElement.getAttribute('data-theme') === 'light') {
      this.ctx.fillStyle = '#f0f0f7';
    }
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    const ox = this.canvas.width / 2;
    const oy = this.canvas.height / 2;
    const zoom = this.ulam.zoom;
    
    const isPrime = (num) => {
      if (num <= 1) return false;
      if (num <= 3) return true;
      if (num % 2 === 0 || num % 3 === 0) return false;
      for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
      }
      return true;
    };
    
    let x = 0;
    let y = 0;
    let dx = 1;
    let dy = 0;
    let state = 0; // Spiral direction
    let numSteps = 1;
    let stepCount = 0;
    
    const limit = Math.min(this.ulam.limit, Math.floor((this.canvas.width / zoom) * (this.canvas.height / zoom)));
    
    this.ctx.fillStyle = 'rgba(255,255,255,0.06)';
    if (document.documentElement.getAttribute('data-theme') === 'light') {
      this.ctx.fillStyle = 'rgba(0,0,0,0.04)';
    }
    
    for (let n = 1; n <= limit; n++) {
      const px = ox + x * zoom;
      const py = oy + y * zoom;
      
      // Draw grid boxes if zoomed in
      if (zoom > 10) {
        this.ctx.strokeRect(px - zoom/2, py - zoom/2, zoom, zoom);
      }
      
      if (isPrime(n)) {
        // Highlight Prime
        this.ctx.fillStyle = '#00cedf';
        
        // Highlight quadratic polynomials (Euler: x^2 - x + modFilter)
        // If n satisfies algebraic polynomial curves, mark differently
        const discriminant = 1 + 4 * (n - this.ulam.modFilter);
        if (discriminant >= 0) {
          const s = Math.round(Math.sqrt(discriminant));
          if (s * s === discriminant && (1 + s) % 2 === 0) {
            this.ctx.fillStyle = '#ff007f';
          }
        }
        
        this.ctx.beginPath();
        this.ctx.arc(px, py, Math.max(1.5, zoom * 0.22), 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = 'rgba(255,255,255,0.06)';
      }
      
      // Compute spiral movement vector
      x += dx;
      y += dy;
      stepCount++;
      
      if (stepCount === numSteps) {
        stepCount = 0;
        // Rotate 90 deg counter-clockwise
        if (dx === 1 && dy === 0) { dx = 0; dy = -1; }      // Go Up
        else if (dx === 0 && dy === -1) { dx = -1; dy = 0; } // Go Left
        else if (dx === -1 && dy === 0) { dx = 0; dy = 1; }  // Go Down
        else if (dx === 0 && dy === 1) { dx = 1; dy = 0; }   // Go Right
        
        state++;
        if (state % 2 === 0) {
          numSteps++;
        }
      }
    }
    
    this.coordDisplay.textContent = `Center: 0 | Spiral range: 1 to ${limit}`;
  },

  /* 5f. Render High Performance Mandelbrot Explorer */
  renderMandelbrot() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const imgData = this.ctx.createImageData(w, h);
    
    const minR = this.mandelbrot.minR;
    const maxR = this.mandelbrot.maxR;
    const minI = this.mandelbrot.minI;
    const maxI = this.mandelbrot.maxI;
    const maxIter = this.mandelbrot.maxIter;
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Pixel loops
    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        // Map pixel coordinates to Complex numbers cr + ci*i
        const cr = minR + (px / w) * (maxR - minR);
        const ci = minI + (py / h) * (maxI - minI);
        
        let zr = 0.0;
        let zi = 0.0;
        let iter = 0;
        
        let zr2 = 0.0;
        let zi2 = 0.0;
        
        while (zr2 + zi2 <= 4.0 && iter < maxIter) {
          zi = 2.0 * zr * zi + ci;
          zr = zr2 - zi2 + cr;
          zr2 = zr * zr;
          zi2 = zi * zi;
          iter++;
        }
        
        // Coloring calculations
        const idx = (px + py * w) * 4;
        if (iter === maxIter) {
          // Inside Mandelbrot set
          imgData.data[idx] = isDark ? 6 : 240;
          imgData.data[idx + 1] = isDark ? 6 : 240;
          imgData.data[idx + 2] = isDark ? 12 : 247;
          imgData.data[idx + 3] = 255;
        } else {
          // Smooth color shading based on escape rate
          const hue = (iter / maxIter) * 360;
          const r = Math.sin(0.05 * iter + 0) * 127 + 128;
          const g = Math.sin(0.05 * iter + 2) * 127 + 128;
          const b = Math.sin(0.05 * iter + 4) * 127 + 128;
          
          imgData.data[idx] = r;
          imgData.data[idx + 1] = g;
          imgData.data[idx + 2] = b;
          imgData.data[idx + 3] = 255;
        }
      }
    }
    
    this.ctx.putImageData(imgData, 0, 0);
    this.coordDisplay.textContent = `Range Real: [${minR.toFixed(2)}, ${maxR.toFixed(2)}] | Complex: [${minI.toFixed(2)}i, ${maxI.toFixed(2)}i]`;
  }
};

/* ==========================================================================
   6. Email Clipboard & Toast Manager
   ========================================================================== */
const EmailManager = {
  init() {
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const email = link.getAttribute('href').replace('mailto:', '');
        
        navigator.clipboard.writeText(email).then(() => {
          this.showToast(`Email copied: ${email}`);
        }).catch(err => {
          // Fallback if clipboard API fails
          window.location.href = link.getAttribute('href');
        });
      });
    });
  },

  showToast(message) {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast-notification glassmorphism';
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--secondary-color); margin-right: 8px; flex-shrink: 0;">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);

    // Trigger reflow
    toast.offsetHeight;
    toast.classList.add('active');

    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 3000);
  }
};

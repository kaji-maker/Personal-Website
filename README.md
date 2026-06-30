# 🌌 SigmaFlow - Interactive Developer Web Portfolio

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](index.html)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](style.css)
[![JS ES6+](https://img.shields.io/badge/ES6%2B-F7DF1E?style=flat&logo=javascript&logoColor=black)](app.js)
[![Flutter / Dart](https://img.shields.io/badge/Flutter%20%2F%20Dart-02569B?style=flat&logo=flutter&logoColor=white)](projects.js)

Welcome to **SigmaFlow**, a high-fidelity, interactive single-page portfolio website designed to showcase a unique intersection of **Computational Mathematics Simulators** and **High-Performance Flutter Mobile Apps**.

The site runs entirely client-side, is fully responsive, implements smooth glassmorphic aesthetics, and provides a math-focused playground where physical and numerical models execute in real-time inside the browser.

---

## 🎨 Key Features

### 🌗 Adaptive Theming & Glassmorphism
*   **Dual Color Palettes**: Built with custom HSL CSS variables that transition smoothly between a high-contrast dark theme (default) and a clean light theme.
*   **Aesthetics**: Glassmorphic components utilize translucent borders, drop shadows, and webkit backdrop blur filters (`blur(20px)`) to create a premium feel.

### 🌐 Social Dock & Smart Actions
*   **Navigation social dock**: Frosted-glass, circular buttons linking to GitHub, LinkedIn, and Email.
*   **Error-free Email Links**: mailto clicks bypass the default OS mail app handler to prevent "No Apps Available" errors, automatically copy the email address `info@bikrambbasnet.com.np` to the clipboard, and trigger a springy glassmorphic toast banner.

### 🔍 Offline Search Registry
*   **Static Search Index**: A fully local project catalog containing categories (`math`/`flutter`), telemetry stats, and tags.
*   **Instant Compound Filtering**: Real-time project filtration by category tabs, keyword inputs, or interactive tag toggles.
*   **Visual Micro-interactions**: Hover effects with slight perspective shifts ($3D$ card rotation) and transitions for search results.

### 📐 Interactive Mathematics Sandbox
Four mathematical models run at 60 FPS inside an interactive HTML5 canvas:
1.  **Lorenz Chaos Attractor**: Evaluates Lorenz's Coupled Atmospheric Convection equations using a stable **4th-order Runge-Kutta numerical integrator (RK4)**. Coordinates are projected from $3D \rightarrow 2D$ space with camera orbit rotations. Real-time controls are provided for coefficients ($\sigma$, $\rho$, $\beta$).
2.  **Fourier Epicycles**: Computes a **Discrete Fourier Transform (DFT)** on coordinate paths. Includes an interactive drawing mode where the coordinates of a path drawn by the user are decomposed into rotators (epicycles) that redraw the shape.
3.  **Ulam Spiral**: Arranges numbers in a coordinate grid spiral, highlighting primes using an $O(\sqrt{n})$ Sieve checker. A rigorous discriminant test highlights prime values satisfying Euler's quadratic generating polynomial ($x^2 - x + C$).
4.  **Mandelbrot Fractal**: Renders escape velocities of the complex plane mapping ($z_{n+1} = z_n^2 + c$). Features interactive point-of-interest clicking to zoom in (0.4x scale) and Shift-clicking to zoom out (2.0x scale).

### 📱 Simulated Mobile Viewports
*   **Phone Screen Emulator**: Integrates a CSS device mockup to display simulated views for Flutter projects.
*   **Custom Painters**: Features weather simulators (rain particle physics) and mind-map canvas rendering inside the simulated screen.
*   **Dynamic Architecture Flowcharts**: Generates dynamic flow diagrams detailing state-management schemes (e.g. BLoC, Riverpod, Drift, SQLite).

---

## 📁 File Structure

```
profile-web/
├── index.html       # Page structure & UI layout
├── style.css        # Adaptive design variables, responsive grids, and animations
├── app.js           # Interactive controller (Theme, Search, Canvas Solvers, Modals)
├── projects.js      # Structured database for Math and Flutter projects
├── package.json     # Node dev dependencies for Vite server previewing
└── LICENSE          # MIT License terms
```

---

## 🚀 Getting Started

Since the project is built with clean vanilla JavaScript, you can open and run it locally without a web server.

### Option A: Zero Server Required (Local File View)
Open [index.html](index.html) directly in your browser:
*   On Linux: `xdg-open index.html`
*   On macOS: `open index.html`

### Option B: Local Web Server (Vite)
If you wish to host it via a dev server:
1.  Verify Node.js is installed.
2.  Run the following commands in the project directory:
    ```bash
    # Install development dependencies
    npm install
    
    # Start the local development server
    npm run dev
    ```
3.  Navigate to **[http://localhost:8080](http://localhost:8080)**.

---

## 🔬 Mathematical Specifications

### Runge-Kutta 4th-Order ODE Integration (Lorenz System)
To solve the system of differential equations:
$$\frac{dx}{dt} = \sigma(y - x)$$
$$\frac{dy}{dt} = x(\rho - z) - y$$
$$\frac{dz}{dt} = xy - \beta z$$

We evaluate four derivative steps per time increment ($dt$):
$$k_1 = f(t_n, y_n)$$
$$k_2 = f\left(t_n + \frac{dt}{2}, y_n + dt\frac{k_1}{2}\right)$$
$$k_3 = f\left(t_n + \frac{dt}{2}, y_n + dt\frac{k_2}{2}\right)$$
$$k_4 = f(t_n + dt, y_n + dt \cdot k_3)$$
$$y_{n+1} = y_n + \frac{dt}{6}(k_1 + 2k_2 + 2k_3 + k_4)$$

This integration guarantees stable chaotic trajectories without numeric divergence.

### Discrete Fourier Transform (Fourier Epicycles)
For an array of $N$ complex coordinates representing the drawn path, we calculate:
$$X[k] = \sum_{n=0}^{N-1} x[n] \cdot \left(\cos\left(\frac{2\pi}{N} k n\right) - i \sin\left(\frac{2\pi}{N} k n\right)\right)$$

The resulting amplitudes ($\sqrt{Re^2 + Im^2}$) and phases ($\text{atan2}(Im, Re)$) govern the size and rotational start offsets of the epicycles.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

Copyright &copy; 2026 Bikram Bahadur Basnet.

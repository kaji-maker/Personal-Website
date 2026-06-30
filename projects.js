const projectsData = [
  {
    id: "lorenz-attractor",
    title: "Lorenz Chaos Simulator",
    category: "math",
    description: "An interactive visualization of chaos theory solving the Lorenz system of differential equations in real-time.",
    longDescription: "This computational mathematics model solves the Lorenz system of three coupled, non-linear ordinary differential equations (originally proposed by Edward Lorenz to model atmospheric convection). Using 4th-order Runge-Kutta numerical integration (RK4), the simulator plots the chaotic trajectory in a 3D-projected canvas, allowing real-time adjustment of parameters (Prandtl number σ, Rayleigh number ρ, and geometric dimension β) to witness bifurcation and the transition into chaotic attractors.",
    tags: ["Differential Equations", "Runge-Kutta", "Chaos Theory", "Canvas API", "Math Simulation"],
    stats: "RK4 Integration",
    interactiveType: "lorenz",
    featured: true,
    codeLink: "https://github.com/kaji-maker/lorenz-chaos-simulator"
  },
  {
    id: "fourier-series",
    title: "Fourier Series Epicycles",
    category: "math",
    description: "An interactive generator that decomposes complex geometric paths into orbiting circular epicycles using Fourier analysis.",
    longDescription: "This project demonstrates the mathematical beauty of Fourier Series, showing how any continuous closed curve can be approximated by a sum of rotating vectors (epicycles). It computes the Discrete Fourier Transform (DFT) of a custom user-drawn path or preset shapes (e.g., square wave, sawtooth wave, math symbols) and animates the epicycles drawing the curve in real-time, visualizing the frequency domain transition back to the spatial domain.",
    tags: ["Fourier Transform", "Signal Processing", "Discrete Math", "Vector Calculus", "Canvas API"],
    stats: "DFT Algorithm",
    interactiveType: "fourier",
    featured: true,
    codeLink: "https://github.com/kaji-maker/fourier-series-epicycles"
  },
  {
    id: "ulam-spiral",
    title: "Ulam Prime Spiral Visualizer",
    category: "math",
    description: "A graphical rendering of the distribution of prime numbers, revealing unexpected mathematical patterns.",
    longDescription: "The Ulam Spiral (or prime spiral) is a graphical depiction of prime numbers arranged in a rectangular grid spiraling outwards. This visualizer computes prime numbers using an optimized Sieve of Eratosthenes and maps them dynamically. Users can toggle different spiral configurations, zoom in/out, and overlay modular math filters (like quadratic polynomials generating lines of primes, e.g., Euler's polynomial n² - n + 41) to highlight emerging diagonal paths.",
    tags: ["Number Theory", "Primes", "Sieve of Eratosthenes", "Data Visualization", "Modular Math"],
    stats: "Sieve Optimizer",
    interactiveType: "ulam",
    featured: false,
    codeLink: "https://github.com/kaji-maker/ulam-prime-spiral"
  },
  {
    id: "mandelbrot-fractal",
    title: "Mandelbrot Fractal Explorer",
    category: "math",
    description: "An interactive GPU-accelerated canvas explorer for rendering the complex-number Mandelbrot and Julia sets.",
    longDescription: "A high-performance fractal explorer rendering the Mandelbrot Set defined by the quadratic recurrence relation z_{n+1} = z_n^2 + c. It features deep zooming, customizable color mapping based on escape velocity, coordinate tracking in the complex plane, and interactive switching to Julia Set configurations by selecting a seed coordinate.",
    tags: ["Complex Analysis", "Fractals", "GPU/Canvas", "Chaos Theory", "Algorithms"],
    stats: "Complex Plane",
    interactiveType: "mandelbrot",
    featured: false,
    codeLink: "https://github.com/kaji-maker/mandelbrot-fractal-explorer"
  },
  {
    id: "zenith-task",
    title: "ZenithTask Flutter App",
    category: "flutter",
    description: "A productivity application designed with advanced custom physics, modular architecture, and offline-first database sync.",
    longDescription: "ZenithTask is a premium Flutter application focused on task flow optimization. It features a custom render object-based timeline view, bespoke physical animations built using Flutter's physics engine (SpringSimulation), and an offline-first SQLite repository powered by Drift. The app uses the BLoC pattern for state management and includes automatic REST sync with retry policies and conflict resolution.",
    tags: ["Flutter", "Dart", "BLoC State", "SQLite / Drift", "Custom Physics", "Offline-first"],
    stats: "15k+ Downloads",
    interactiveType: "flutter-zenith",
    featured: true,
    codeLink: "https://github.com/kaji-maker/zenith-task"
  },
  {
    id: "aether-weather",
    title: "AetherWeather Simulator",
    category: "flutter",
    description: "A gorgeous weather app combining real-time API integrations with particle simulations rendered via CustomPainters.",
    longDescription: "AetherWeather is a showcase of high-performance rendering in Flutter. Instead of relying on static animations, it uses custom canvas particles to simulate rainfall, snowflakes, fog, and lightning strikes responsive to device gyro sensors. It implements Clean Architecture, uses Provider for theme and setting states, and communicates with OpenWeatherMap APIs using cached HTTP clients.",
    tags: ["Flutter", "Dart", "CustomPainters", "Clean Architecture", "Gyro Sensors", "API Integration"],
    stats: "4.9/5 Rating",
    interactiveType: "flutter-aether",
    featured: true,
    codeLink: "https://github.com/kaji-maker/aether-weather"
  },
  {
    id: "calorytics",
    title: "Calorytics Health Analytics",
    category: "flutter",
    description: "A secure, privacy-focused health tracker featuring offline local telemetry and beautiful SVG dashboard charts.",
    longDescription: "Calorytics leverages Flutter's Canvas and path painting features to display interactive health charts and telemetry dashboards without heavy external dependencies. Data is encrypted and stored locally in Hive. State management is handled via Riverpod, and it incorporates background sync workers (via Workmanager) to pull data from Google Fit and Apple Health SDKs.",
    tags: ["Flutter", "Dart", "Riverpod", "Hive DB", "SVG Charts", "Biometrics"],
    stats: "Offline Encrypted",
    interactiveType: "flutter-calorytics",
    featured: false,
    codeLink: "https://github.com/kaji-maker/calorytics"
  },
  {
    id: "fluxflow",
    title: "FluxFlow Node Mapper",
    category: "flutter",
    description: "A gesture-driven mind mapping and canvas-based flowchart editor built from scratch using Flutter GestureDetectors.",
    longDescription: "FluxFlow is a highly interactive canvas tool built in Flutter for creating node-link diagrams. It handles custom touch calculations for panning, multi-finger zoom, drag-and-drop nodes, and bezier curves with custom arrowheads. It implements a custom undo-redo stack and exports charts to high-quality SVG and PDF formats.",
    tags: ["Flutter", "Dart", "Custom Painters", "Gesture Detection", "Matrix4 Transforms", "Export SVG"],
    stats: "Vector Editor",
    interactiveType: "flutter-fluxflow",
    featured: false,
    codeLink: "https://github.com/kaji-maker/fluxflow"
  }
];

// Export standard module pattern if supported, otherwise expose globally
if (typeof module !== 'undefined' && module.exports) {
  module.exports = projectsData;
} else {
  window.projectsData = projectsData;
}

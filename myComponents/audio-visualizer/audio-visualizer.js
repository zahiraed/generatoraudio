import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js";

class AudioVisualizer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const css = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
        }
        #visualizer-container {
          position: relative;
          width: 900px;
          height: 500px;
          border-radius: 800px; /* Rounded rectangle edges */
          overflow: hidden;
          box-shadow: 6px 6px 10px pink;
        }
        canvas {
          display: block;
        }
      </style>
    `;
    const htmlDOM = `<div id="visualizer-container"></div>`;
    this.shadowRoot.innerHTML = `${css}${htmlDOM}`;
    this.setupVisualizer();
  }

  setupVisualizer() {
    const audioPlayer = document.querySelector("audio-player");
    if (!audioPlayer) {
      console.error("Audio player element not found");
      return;
    }

    const waitForAudioPlayer = () => {
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          const audioPlayer = document.querySelector("audio-player");
          if (audioPlayer) {
            const shadowRoot = audioPlayer.shadowRoot;

            const player = shadowRoot
              ? shadowRoot.querySelector("#player")
              : null;

            if (player) {
              clearInterval(interval);
              resolve(audioPlayer);
            }
          }
        }, 100); // Poll every 100ms
      });
    };

    waitForAudioPlayer().then((audioPlayer) => {
      const player = audioPlayer.shadowRoot.querySelector("#player");
      if (!(player instanceof HTMLMediaElement)) {
        console.error("Audio player is not an HTMLMediaElement");
        return;
      }

      const container = this.shadowRoot.querySelector("#visualizer-container");
      const width = container.offsetWidth || 900;
      const height = container.offsetHeight || 500;

      // Three.js Setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;

      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000); // Black background
      container.appendChild(renderer.domElement);

      // Create Particle System
      const particleCount = 1000; // Number of particles
      const particlesGeometry = new THREE.BufferGeometry();
      const positions = [];
      const colors = [];
      const sizes = [];

      for (let i = 0; i < particleCount; i++) {
        positions.push(
          (Math.random() - 0.5) * 10, // Random x position
          (Math.random() - 0.5) * 10, // Random y position
          (Math.random() - 0.5) * 10 // Random z position
        );
        colors.push(Math.random(), Math.random(), Math.random()); // Random RGB
        sizes.push(Math.random() * 0.1 + 0.1); // Random size
      }

      particlesGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      particlesGeometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 3)
      );

      const particlesMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        size: 0.1,
        sizeAttenuation: true,
      });

      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);

      // Audio Context and AnalyserNode
      const context = audioPlayer.getAudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const source = audioPlayer.getMediaElementSource();
      source.connect(analyser);
      source.connect(context.destination);

      // Animation Loop
      const animate = () => {
        analyser.getByteFrequencyData(dataArray);

        // Animate particles based on frequency data
        const positions = particlesGeometry.attributes.position.array;
        const colors = particlesGeometry.attributes.color.array;

        for (let i = 0; i < particleCount; i++) {
          const freqIndex = i % bufferLength; // Loop through frequencies
          const scale = dataArray[freqIndex] / 255;

          // Modify particle positions
          positions[i * 3 + 2] = scale * 5; // Modify Z-axis based on frequency

          // Update particle colors dynamically
          colors[i * 3] = Math.random(); // Red
          colors[i * 3 + 1] = scale; // Green
          colors[i * 3 + 2] = Math.random(); // Blue
        }

        particlesGeometry.attributes.position.needsUpdate = true;
        particlesGeometry.attributes.color.needsUpdate = true;

        // Rotate particles
        particles.rotation.y += 0.002;
        particles.rotation.x += 0.001;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };

      animate();
    });
  }
}

customElements.define("audio-visualizer", AudioVisualizer);

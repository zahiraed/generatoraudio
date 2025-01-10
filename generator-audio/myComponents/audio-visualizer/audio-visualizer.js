class AudioVisualizer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    document.addEventListener("DOMContentLoaded", () => {
      const visualizer = document.querySelector("audio-visualizer");
      if (visualizer) {
        console.log("Initializing audio visualizer...");
        visualizer.connectedCallback();
      } else {
        console.error("Audio visualizer element not found.");
      }
    });
  }

  connectedCallback() {
    const css = `
      <style>
      canvas {
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 800px;
        box-shadow: 6px 6px 10px pink;
        
      }
      </style>`;

    const htmlDOM = `
      <div class='box'>
        <canvas id='aCanvas' height='500' width='900'></canvas>
      </div>`;

    this.shadowRoot.innerHTML = `${css} ${htmlDOM}`;
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
            console.log("Audio player element detected:", audioPlayer);

            const shadowRoot = audioPlayer.shadowRoot;
            console.log("ShadowRoot of audio player:", shadowRoot);

            const player = shadowRoot
              ? shadowRoot.querySelector("#player")
              : null;
            console.log("Player element inside shadow DOM:", player);

            if (player) {
              console.log("Audio player is fully initialized.");
              clearInterval(interval);
              resolve(audioPlayer);
            } else {
              console.log("Player element not found in shadow DOM yet.");
            }
          } else {
            console.log("Audio player element not found in the DOM.");
          }
        }, 100); // Poll every 100ms
      });
    };

    waitForAudioPlayer().then((audioPlayer) => {
      const canvas = this.shadowRoot.querySelector("canvas");
      const canvasContext = canvas.getContext("2d");
      let width, height;
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const player = audioPlayer.shadowRoot.querySelector("#player");
      if (!(player instanceof HTMLMediaElement)) {
        console.error("Audio player is not an HTMLMediaElement");
        return;
      }
      const source = context.createMediaElementSource(player);
      source.connect(analyser);
      source.connect(context.destination);

      function loadCanvas() {
        width = canvas.width;
        height = canvas.height;
        console.log("Canvas dimensions:", { width, height });

        canvasContext.fillStyle = "rgba(0, 0, 0, 1)";
        canvasContext.fillRect(0, 0, width, height);
        canvasContext.lineWidth = 3;
        canvasContext.strokeStyle = "yellow";
      }

      function startVisualize() {
        analyser.getByteTimeDomainData(dataArray);
        canvasContext.clearRect(0, 0, width, height);
        canvasContext.fillStyle = "rgba(0, 0, 0, 1)";
        canvasContext.fillRect(0, 0, width, height);

        let sliceWidth = width * (1.0 / dataArray.length);
        let x = 0;
        let y = height - 200;
        for (let i = 0; i < dataArray.length; i++) {
          canvasContext.beginPath();
          canvasContext.moveTo(x, y);
          let v = y - (dataArray[i] - 127);
          canvasContext.lineTo(x, v);
          canvasContext.stroke();
          x += sliceWidth;
        }
        window.requestAnimationFrame(startVisualize);
      }

      loadCanvas();
      startVisualize();
    });
  }
}

customElements.define("audio-visualizer", AudioVisualizer);

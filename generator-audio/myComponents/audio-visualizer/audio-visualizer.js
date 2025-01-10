class AudioVisualizer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    document.addEventListener("DOMContentLoaded", () => {
      const visualizer = document.querySelector("audio-visualizer");
      if (visualizer) {
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
        border: none;
        border-radius: 800px;
        box-shadow: 6px 6px 10px pink;
      }
      </style>`;

    const htmlDOM = `
        <canvas id='aCanvas' height='500' width='900'></canvas>
`;

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
            const shadowRoot = audioPlayer.shadowRoot;

            const player = shadowRoot
              ? shadowRoot.querySelector("#player")
              : null;

            if (player) {
              clearInterval(interval);
              resolve(audioPlayer);
            } else {
            }
          } else {
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
      const canvas = this.shadowRoot.querySelector("canvas");
      const canvasContext = canvas.getContext("2d");
      let width, height;
      const context = audioPlayer.getAudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const source = audioPlayer.getMediaElementSource();
      source.connect(analyser);
      source.connect(context.destination);

      function loadCanvas() {
        width = canvas.width;
        height = canvas.height;

        canvasContext.fillStyle = "rgba(0, 0, 0, 1)";
        canvasContext.fillRect(0, 0, width, height);
        canvasContext.lineWidth = 2;
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

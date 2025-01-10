import "../audio-controls/audio-volume-slider/volume-slider.js";
class AudioPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.src = this.getAttribute("src");

    fetch('./myComponents/audio-player/audio-player.html')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load template: ${response.statusText}`);
        }
        return response.text();
      })
      .then((data) => {
        console.log("Audio player template loaded.");
        const template = document.createElement('template');
        template.innerHTML = data;
        const templateContent = template.content.querySelector('template').content;

        this.shadowRoot.appendChild(templateContent.cloneNode(true));
        console.log("Audio player shadow DOM initialized.");
        
        // Now safely call connectedCallback
        this.initializePlayer();
      })
      .catch((error) => {
        console.error("Error loading audio player template:", error);
      });
  }

  initializePlayer() {
    console.log("AudioPlayer initializePlayer called.");
    this.player = this.shadowRoot.querySelector("#player");
    if (!this.player) {
      console.error("Player element not found in shadow DOM.");
      return;
    }
    console.log("Player element found:", this.player);
    this.player.src = this.src; // Set the src attribute for the audio element
    console.log("Audio player source set to:", this.src);
    this.defineListeners();
  }

  defineListeners() {
    this.shadowRoot.querySelector("#play").addEventListener("click", () => {
      this.player.play();
    });
    this.shadowRoot.querySelector("#pause").addEventListener("click", () => {
      this.player.pause();
    });
    this.shadowRoot.querySelector("#stop").addEventListener("click", () => {
      this.player.pause();
      this.player.currentTime = 0;
    });
    this.shadowRoot.querySelector("#forward").addEventListener("click", () => {
      this.player.currentTime += 10;
    });
    this.shadowRoot.querySelector("#backward").addEventListener("click", () => {
      this.player.currentTime -= 10;
    });
    this.shadowRoot.querySelector("#volumeSlider").addEventListener("input", (e) => {
      this.player.volume = e.target.value;
    });

    const balanceControl = this.shadowRoot.querySelector('[data-action="panner"]');
    balanceControl.addEventListener(
      "input",
      function () {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const source = context.createMediaElementSource(this.player);
        const balancer = new StereoPannerNode(context, { pan: this.value });
        source.connect(balancer).connect(context.destination);
      }.bind(this),
      false
    );
  }
}

customElements.define("audio-player", AudioPlayer);

import "../audio-controls/audio-volume-slider/volume-slider.js";
class AudioPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.src = this.getAttribute("src");

    fetch("./myComponents/audio-player/audio-player.html")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load template: ${response.statusText}`);
        }
        return response.text();
      })
      .then((data) => {
        const template = document.createElement("template");
        template.innerHTML = data;
        const templateContent =
          template.content.querySelector("template").content;

        this.shadowRoot.appendChild(templateContent.cloneNode(true));

        // Now safely call connectedCallback
        this.initializePlayer();
      })
      .catch((error) => {
        console.error("Error loading audio player template:", error);
      });
  }

  initializePlayer() {
    this.player = this.shadowRoot.querySelector("#player");
    if (!this.player) {
      console.error("Player element not found in shadow DOM.");
      return;
    }
    this.player.src = this.src; // Set the src attribute for the audio element

    // Initialize AudioContext and connect the audio source
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      this.mediaElementSource = this.audioContext.createMediaElementSource(
        this.player
      );

      // Connect the audio graph: mediaElementSource -> stereoPanner -> destination
    }
    this.defineListeners();
  }

  // Expose AudioContext and MediaElementSourceNode
  getAudioContext() {
    return this.audioContext;
  }

  getMediaElementSource() {
    return this.mediaElementSource;
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
    this.shadowRoot
      .querySelector("#volumeSlider")
      .addEventListener("input", (e) => {
        this.player.volume = e.target.value;
      });

    // Listen for song-selected events
    document.addEventListener("song-selected", (event) => {
      const src = event.detail.src;
      this.player.src = src;
      this.player.play();
      console.log(`Now playing: ${src}`);
    });
  }
}

customElements.define("audio-player", AudioPlayer);

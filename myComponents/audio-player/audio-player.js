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
    console.log("Initializing player...");
    this.player = this.shadowRoot.querySelector("#player");
    if (!this.player) {
      console.error("Player element not found in shadow DOM.");
      return;
    }
    this.player.src = this.src; // Set the src attribute for the audio element

    // Initialize AudioContext on startup
    if (!this.audioContext) {
      console.log("Creating AudioContext...");
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      this.mediaElementSource = this.audioContext.createMediaElementSource(
        this.player
      );
      this.mediaElementSource.connect(this.audioContext.destination);
      // Dispatch a custom event to notify other components
      this.dispatchEvent(
        new CustomEvent("audio-context-created", {
          detail: { audioContext: this.audioContext, mediaElementSource: this.mediaElementSource },
          bubbles: true,
          composed: true,
        })
      );
      console.log("AudioContext created and event dispatched.");
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
    console.log("Defining listeners...");
    this.shadowRoot.querySelector("#play").addEventListener("click", () => {
      console.log("Play button clicked.");
      this.audioContext.resume().then(() => {
        this.player.play();
      });
    });
    this.shadowRoot.querySelector("#pause").addEventListener("click", () => {
      console.log("Pause button clicked.");
      this.player.pause();
    });
    this.shadowRoot.querySelector("#stop").addEventListener("click", () => {
      console.log("Stop button clicked.");
      this.player.pause();
      this.player.currentTime = 0;
    });
    this.shadowRoot.querySelector("#forward").addEventListener("click", () => {
      console.log("Forward button clicked.");
      this.player.currentTime += 10;
    });
    this.shadowRoot.querySelector("#backward").addEventListener("click", () => {
      console.log("Backward button clicked.");
      this.player.currentTime -= 10;
    });
    this.shadowRoot
      .querySelector("#volumeSlider")
      .addEventListener("input", (e) => {
        console.log("Volume slider changed:", e.target.value);
        this.player.volume = e.target.value;
      });

    // Listen for song-selected events
    document.addEventListener("song-selected", (event) => {
      const src = event.detail.src;
      console.log("Song selected:", src);
      this.audioContext.resume().then(() => {
        this.player.src = src;
        this.player.play();
      });
    });
  }
}

customElements.define("audio-player", AudioPlayer);

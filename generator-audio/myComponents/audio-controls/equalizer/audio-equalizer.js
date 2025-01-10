class AudioEqualizer extends HTMLElement {
  presets = {
    rock: [-5, 5, 0, 3, 5, 0, -2],
    pop: [0, 3, 2, 5, 2, -1, 0],
    jazz: [2, -1, 3, 0, 5, 3, -5],
    classical: [0, 0, 0, 0, 0, 0, 0],
    "vocal-boost": [-5, -3, 0, 5, 3, 2, -2],
    "bass-boost": [5, 3, 0, -2, -5, -7, -10],
  };

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.filters = []; // Array to hold the filters for each frequency band

    fetch("./myComponents/audio-controls/equalizer/audio-equalizer.html")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load template: ${response.statusText}`);
        }
        return response.text();
      })
      .then((data) => {
        console.log("Audio equalizer template loaded.");
        const template = document.createElement("template");
        template.innerHTML = data;
        const templateContent =
          template.content.querySelector("template").content;
        this.shadowRoot.appendChild(templateContent.cloneNode(true));
        this.connectedCallback(); // Call initialization logic here
      })
      .catch((error) => {
        console.error("Error loading audio equalizer template:", error);
      });
  }

  connectedCallback() {
    console.log("AudioEqualizer connected to the DOM.");
    const audioPlayer = document.querySelector("audio-player");

    if (audioPlayer) {
      this.audioContext = audioPlayer.getAudioContext();
      const mediaSource = audioPlayer.getMediaElementSource();

      // Create filters and connect them
      const frequencies = [40, 100, 250, 1000, 2500, 6000, 12000];
      let previousNode = mediaSource;

      frequencies.forEach((freq, index) => {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = "peaking";
        filter.frequency.value = freq;
        filter.Q.value = 1;
        filter.gain.value = 0; // Initial gain set to 0
        previousNode.connect(filter);
        this.filters.push(filter);

        console.log(`Filter ${index} created with frequency ${freq} Hz`);
        previousNode = filter;
      });

      // Create and connect an AnalyserNode for visualization
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256; // Number of frequency bins
      this.filters[this.filters.length - 1].connect(this.analyser);

      // Connect the analyser to the destination
      this.analyser.connect(this.audioContext.destination);

      console.log(`Filters array length: ${this.filters.length}`);

      // Initialize the visualization
      this.initializeVisualization();

      console.log(`Filters array length: ${this.filters.length}`);

      // Connect the last filter to the destination
      this.filters[this.filters.length - 1].connect(
        this.audioContext.destination
      );

      // Define listeners for sliders and presets
      this.defineListeners();
    } else {
      console.error("Audio player not found. Cannot initialize equalizer.");
    }
  }

  initializeEqualizer() {
    console.log("Initializing Equalizer...");
    this.defineListeners();
  }

  defineListeners() {
    const sliders = this.shadowRoot.querySelectorAll(".slider-container input");

    console.log(`Found ${sliders.length} sliders.`);

    sliders.forEach((slider, index) => {
      slider.addEventListener("input", (event) => {
        const gainValue = parseFloat(event.target.value);
        console.log(`Slider for filter ${index} set to ${gainValue}`);
        if (this.filters[index]) {
          this.filters[index].gain.value = gainValue;
          console.log(
            `Filter ${index} gain updated to ${this.filters[index].gain.value}`
          );
        } else {
          console.error(`Filter ${index} not found.`);
        }
      });
    });

    const presetSelector = this.shadowRoot.querySelector("#preset-selector");
    presetSelector.addEventListener("change", (event) => {
      console.log(`Preset selected: ${event.target.value}`);
      this.applyPreset(event.target.value);
    });
  }

  applyPreset(presetName) {
    const gains = this.presets[presetName];
    if (!gains) {
      console.warn("Preset not found:", presetName);
      return;
    }

    const sliders = this.shadowRoot.querySelectorAll(".slider-container input");

    sliders.forEach((slider, index) => {
      slider.value = gains[index];
      if (this.filters[index]) {
        this.filters[index].gain.value = gains[index]; // Update the filter gain
        console.log(
          `Setting filter ${index} (${this.filters[index].frequency.value} Hz) gain to ${gains[index]}`
        );
      }
    });
  }

  initializeVisualization() {
    const canvas = this.shadowRoot.querySelector("#frequency-visualization");
    const canvasContext = canvas.getContext("2d");

    const drawVisualization = () => {
      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      this.analyser.getByteFrequencyData(dataArray);

      canvasContext.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];

        // Color based on intensity
        const red = barHeight + 25;
        const green = 250 - barHeight;
        const blue = 50;

        canvasContext.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        canvasContext.fillRect(
          x,
          canvas.height - barHeight / 2,
          barWidth,
          barHeight
        );

        x += barWidth + 1;
      }

      requestAnimationFrame(drawVisualization);
    };

    drawVisualization();
  }
}

customElements.define("audio-equalizer", AudioEqualizer);

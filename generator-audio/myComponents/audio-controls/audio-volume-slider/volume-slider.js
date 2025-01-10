class AudioVolumeSlider extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const css = `
    <style>
      :host {
        display: inline-block;
        position: relative;
        margin: 0;
        padding: 0;
        font-family: sans-serif;
        font-size: 11px;
        cursor: pointer;
      }
      .volume-slider-body {
        display: inline-block;
        position: relative;
        margin: 0;
        padding: 0;
        vertical-align: bottom;
        white-space: pre;
      }
      .volume-slider-knob {
        display: inline-block;
        position: absolute;
        margin: 0;
        padding: 0;
        background: url('data:image/svg+xml;base64,${btoa(this.getKnobSVG())}') no-repeat;
        background-size: 100% 100%;
      }
    </style>`;

    const htmlDOM = `
    <div class='volume-slider-body' tabindex='1' touch-action='none'>
      <div class='volume-slider-knob' touch-action='none'></div>
    </div>`;

    this.shadowRoot.innerHTML = `${css} ${htmlDOM}`;
    this.elem = this.shadowRoot.querySelector('.volume-slider-body');
    this.knob = this.elem.querySelector('.volume-slider-knob');
    this.setupSlider();
  }

  getKnobSVG() {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#000" />
      <circle cx="12" cy="12" r="8" fill="#fff" />
      <line x1="12" y1="4" x2="12" y2="2" stroke="#000" stroke-width="2" />
    </svg>`;
  }

  setupSlider() {
    this.min = 0;
    this.max = 1;
    this.value = 0.5;
    this.step = 0.01;
    this.width = 24;
    this.height = 128;
    this.knobWidth = 24;
    this.knobHeight = 24;
    this.dlen = this.height - this.knobHeight;

    this.elem.style.width = `${this.width}px`;
    this.elem.style.height = `${this.height}px`;
    this.knob.style.width = `${this.knobWidth}px`;
    this.knob.style.height = `${this.knobHeight}px`;

    this.redraw();
    this.defineListeners();
  }

  redraw() {
    const ratio = (this.value - this.min) / (this.max - this.min);
    this.knob.style.top = `${(1 - ratio) * this.dlen}px`;
    this.knob.style.left = `${(this.width - this.knobWidth) / 2}px`; // Center the knob horizontally
  }

  defineListeners() {
    this.elem.addEventListener('mousedown', this.pointerdown.bind(this), { passive: false });
    this.elem.addEventListener('touchstart', this.pointerdown.bind(this), { passive: false });
  }

  pointerdown(ev) {
    const pointermove = (ev) => {
      const rect = this.elem.getBoundingClientRect();
      const y = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const ratio = Math.max(0, Math.min(1, (rect.bottom - y) / this.dlen));
      this.value = this.min + ratio * (this.max - this.min);
      this.redraw();
      this.dispatchEvent(new Event('input'));
    };

    const pointerup = () => {
      window.removeEventListener('mousemove', pointermove);
      window.removeEventListener('touchmove', pointermove, { passive: false });
      window.removeEventListener('mouseup', pointerup);
      window.removeEventListener('touchend', pointerup);
      window.removeEventListener('touchcancel', pointerup);
    };

    window.addEventListener('mousemove', pointermove);
    window.addEventListener('touchmove', pointermove, { passive: false });
    window.addEventListener('mouseup', pointerup);
    window.addEventListener('touchend', pointerup);
    window.addEventListener('touchcancel', pointerup);

    pointermove(ev);
    ev.preventDefault();
    ev.stopPropagation();
  }
}

customElements.define("audio-volume-slider", AudioVolumeSlider);
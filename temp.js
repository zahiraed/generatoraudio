import "./lib/webaudio-controls.js";

class myComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.src = this.getAttribute("src");
  }
  //background-image: url('myComponents/assets/knobs/fond.jfif');
  connectedCallback() {
    // here creating our html DOM with CSS
    const css = `
        
    <style>
   h1 {
          color: black;
          text-align: center;
      }
      .container {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        height: fit-content;
      }
      .controls {
        margin-top: 30px;
        display: flex;
        justify-content: space-evenly;
        border: 2px solid black;
        padding: 10px;
        border-radius: 800px;
        background: grey;; 
        box-shadow: 6px 6px 10px pink;
      }
      button {
        cursor: pointer;
        margin: 0 0.2em;
        padding: 0.4em;
        font-size: 1em;
        border-radius: 8px;
        height: fit-content;
      }
      button img {
        width: 50px;
        height: 50px;
      }
      canvas {
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 800px;
        box-shadow: 6px 6px 10px pink;
        
      }
      .pan-button {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .vol-lev {
        border: 2px solid black;
        width: fit-content;
        float: right;
        margin-right: 30px;
        margin-top: 300px;
        border-radius: 8px;
        padding: 10px;
        display: flex;
        justify-content: space-around;
        align-items: center;
        color: white;
        background-color: grey;
        box-shadow: 6px 6px 10px black;
      }
      .equalizer-div {
        border: 2px solid black;
        width: 20%;
        padding: 20px;
        border-radius: 8px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 12px;
        place-items: center;
        color: white;
        background-color: grey;
        box-shadow: 6px 6px 10px black;
      }
      #volumeSlider {
        border: 3px solid white;
        border-radius: 12px;
      }
      .sliders {
        display: flex;
        margin: 0 auto;
        width: 100%;
      }
      .range-slider {
        display: flex;
        flex-direction: column;
      }
      input[type="range"]  {
        cursor: pointer;
      }
      
  </style>`;

    const htmlDOM = `        
    <h1>Mon lecteur audio</h1>
        
      <div class="vol-lev">
        <div style="display:flex; justify-content:center;flex-direction:column;">
          <div class="pan-button">
            Left <input type="range" id="panner" class="control-panner" list="pan-vals" min="-1" max="1" value="0" step="0.01" data-action="panner" /> Right
            <datalist id="pan-vals">
              <option value="-1" label="left">
              <option value="1" label="right">
            </datalist>
          </div>
          <label for="panner" style="width:30px; margin: auto;">Balance</label>
        </div>

        <webaudio-slider id="volumeSlider" style="margin: 0 1em;" direction="vert" min=0 max=2 step=0.1 value="1"  colors="#0f0;#000;#ff0">Volume</webaudio-slider>
      </div>


      <div class='container'>
        
        <div class='controls'>
          <audio id="player" src="${this.src}" loop="true"></audio>
          <br>        

          <button id="play"><img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAAxElEQVRIie3WMWpCURBG4Q8FSRrtbC2SPhvICmzchVuwtXQLbsE2pVUIkjqQHVgqNmIj6EvxGHhFQAIvcxt/OPVhhrlzh3sKZ4MvTLLFVYNPvJYQB294LiGucMYSw2xxcMQcj9niYIsputni4BvjEuJgjZcS4goXrDDKFgcnLDDIFgd7zNDLFgfvTUHnL23ISJuV7iS3Ooarn1VxkeeUvkDSV2b6J3FQT+pDW8Jb4vRD4Kqe1Kf/Ev4mTj32PhQ6b+9pPT+XHgysHrPM6QAAAABJRU5ErkJggg=='/></button>
          <button id="pause"><img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAAXklEQVRIie2WUQqAIBAFx06XdP8LuN5DfwwKUhA2kHoD+yPjzu+C+DMHkIHSxoDo6Hexy5JzkpcfBovK5J8pfxuEX0VhhRVWWGGFFV47nB/ezNHvErnfUQnYHX3xcSrwEiKQG9/iJwAAAABJRU5ErkJggg==' /></button>
          <button id="stop"><img src="https://img.icons8.com/ios-filled/50/000000/stop.png"/></button>
          <button id="forward"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAACHElEQVR4nO3aPY8NURzH8Q8r7Ip4iIREsEGpoBASFETn4SXQSBReAAkKCYpNSHgBIlGKKLQKW25CRWNbQiUUiIdgFHfPuuy9dmfu3JmN8/8mv9xkmt8535zMnDtnCIIgCIIgCIIgCPJjpMe1LViJjw2PZQzj+ILvDXeDvXiOYiZTONRA7wiu6ggvZn5vYl0D3bNswju/J9+d+9g2xO5LfXrf4iyWDbF7lgt9BpHyGdewqubeJToT/Vf3MxypuXcOt+cZRMprnJwZeB2sXWBvgQfYXlPvHO6UGEiBJzhQQ+/6kr3fcAura+j+g7ICCvzEPWwdoLesgJQ3OKP3U6wSVQSkfMJljFborSog5SkOVuidwyACUl7hlHL3h0EFdK/E8QrznqUOASmPsWuBvXUI+HsljrUtoMAP3MWGBgUMshJrF5DyHuexokEBKVPY17aAlGkcb1hA90rc2LaAlEfY2aCAlA8694d+K7ExAYXOZuYG1jQoIOUFjrYtIOV0CwJSJtLEl/aykQHncJh8BcAJ8haAvAU8JF8BE5jsvtDkU+Arrsv0MZjtRmgax3r0/vdb4fRnaHmf3mEKmMTu+SY+LAFZ/x3O9oXISx3zZfgvXoll+1J0MbwWr20jV+VgZH8NvYvmYCT7o7HsD0fbPB6/2Ke30eNx2KNjOw2gyQ8krmj5A4luNlvA3nkIjGKHao/TIAiCIAiCIAiCICjBL6Td6ua5TLqNAAAAAElFTkSuQmCC"></button>
          <button id="backward"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAABW0lEQVRIie2VMU7DMBhGnwND1YU5dhnojgRbBxiAE5SFrSNwjHICRtROCAkkJrgACzAwIW7AQO1sjJCl+VnSKkKlsRsWUL417/+ebNkx1Knz36JCB1qt1nqWZefAh3Nue1F+OURqjOllWXYGNKvyXuJ2u72SpulARA5+iy8VG2M6aZpeAWs+Ul8+mvNtSWvdF5FHT2kQP3PFWutV4BIoPTyL8DBjxXEcd4EX35JQfpLpddJaN5VSpyJy6D2s1DCEd85NfcWtvhORjm8JQIj0e4pbLYuWVBJHUbQnIoOQYaXUsLJ4NBp9JklyDHSBd59ha+2RiOz78jPFkzjnboEN4N6nIEmSm5x/qCTO5W/OuV3gBBiXleT8ji//ozjP2DnXV0ptAa8eXUH8PDEA1tqnRqOxCVx7yL35oPfYGNMTkekzV/whhPKlKy7GWnsRRVEHeMbjMIXyder87XwBum2qnJAnRMIAAAAASUVORK5CYII="></button>
        </div>
        <br>
        <div class='box'>
          <canvas id='aCanvas' height='500' width='900'></canvas>
        </div>
        
      </div>


  <div class="equalizer-div">
    <div class="section">
      <div class="title">HF</div>
      <div class="sliders">
        <div class="range-slider">
          <span class="scope">22</span>
          <input type="range" class="vertical" orient="vertical" min="4700" max="22000" step="100" value="4700" data-filter="filter1" data-param="frequency">
          <span class="scope scope-min">4.7</span>
          <span class="param">kHz</span>  
        </div>
        <div class="range-slider">
          <span class="scope">50</span>
          <input type="range" class="vertical" orient="vertical" min="-50" max="50" value="50" data-filter="filter1" data-param="gain">
          <span class="scope scope-min">-50</span>
          <span class="param">dB</span>  
        </div>
      </div>
    </div>
    <br>

    <div class="section">
      <div class="title">LF</div>
      <div class="sliders">
        <div class="range-slider">
          <span class="scope">220</span>
          <input type="range" class="vertical" orient="vertical" min="35" max="220" step="1" value="35" data-filter="filter2" data-param="frequency">
          <span class="scope scope-min">35</span>
          <span class="param">Hz</span>  
        </div>
        <div class="range-slider">
          <span class="scope">50</span>
          <input type="range" class="vertical" orient="vertical" min="-50" max="50" value="50" data-filter="filter2" data-param="gain">
          <span class="scope scope-min">-50</span>
          <span class="param">dB</span>  
        </div>
      </div>
    </div>
<br>
    <div class="section">
      <div class="title">HMF</div>
      <div class="sliders">
        <div class="range-slider">
          <span class="scope">5.9</span>
          <input type="range" class="vertical" orient="vertical" min="800" max="5900" step="100" value="800" data-filter="filter3" data-param="frequency">
          <span class="scope scope-min">0.8</span>
          <span class="param">kHz</span>  
        </div>
        <div class="range-slider">
          <span class="scope">12</span>
          <input type="range" class="vertical" orient="vertical" min="0.7" max="12" step="0.1" value="0.7" data-filter="filter3" data-param="Q">
          <span class="scope scope-min">0.7</span>
          <span class="param">Q</span>  
        </div>
      </div>
    </div>  

    
  </div>`;

    // now using all those variables to populate the DOM
    this.shadowRoot.innerHTML = `${css} ${htmlDOM}`;
    this.player = this.shadowRoot.querySelector("#player");
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
    this.shadowRoot
      .querySelector("#volumeSlider")
      .addEventListener("input", (e) => {
        this.player.volume = e.target.value;
      });

    var audioElement = this.shadowRoot.querySelector("#player");

    var canvas = this.shadowRoot.querySelector("canvas");
    var canvasContext = canvas.getContext("2d");
    let width, height; // width and height for canvas
    var context = new (window.AudioContext || window.webkitAudioContext)();
    var source = context.createMediaElementSource(audioElement);
    const analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const gainNode = context.createGain();

    // declaring all filters
    let filter1 = context.createBiquadFilter();
    let filter2 = context.createBiquadFilter();
    let filter3 = context.createBiquadFilter();
    let filter4 = context.createBiquadFilter();

    // binding all the filters together
    source.connect(filter1);
    filter1.connect(filter2);
    filter2.connect(filter3);
    filter3.connect(filter4);
    filter4.connect(context.destination);

    

    var equalizerSliders = this.shadowRoot.querySelectorAll(".vertical");
    equalizerSliders.forEach(function (slider) {
      slider.addEventListener("input", function () {
        if (this.dataset.filter == "filter4") {
          filter4[this.dataset.param].value = this.value;
        }
        if (this.dataset.filter == "filter3") {
          filter3[this.dataset.param].value = this.value;
        }
        if (this.dataset.filter == "filter1") {
          filter1[this.dataset.param].value = this.value;
        } else {
          filter2[this.dataset.param].value = this.value;
        }
      });
    });

    // creating audio balance filter
    const balanceOptions = { pan: 0 };
    const balancer = new StereoPannerNode(context, balanceOptions);
    const balanceControl = this.shadowRoot.querySelector(
      '[data-action="panner"]'
    );
    balanceControl.addEventListener(
      "input", function () {
        balancer.pan.value = this.value;
      },false);

    // connect our graph
    source.connect(gainNode).connect(balancer).connect(context.destination);

    // creating visualization effect when window loads the content
    window.addEventListener(
      "load",
      () => {
        loadCanvas();
        startVisualize();
      },
      false
    );

    function loadCanvas() {
      width = canvas.width;
      height = canvas.height;
      canvasContext.fillStyle = "rgba(0, 0, 0, 1)";
      canvasContext.fillRect(0, 0, width, height);
      canvasContext.lineWidth = 3;
      canvasContext.strokeStyle = "orange";

      // connecting all the nodes
      source.connect(analyser);
      source.connect(context.destination);
    }

    function startVisualize() {
      analyser.getByteTimeDomainData(dataArray);
      canvasContext.fillRect(0, 0, width, height);
      let sliceWidth = width * (1.0 / dataArray.length);
      let x = 0;
      let y = height - 200;
      for (let i=0; i<dataArray.length; i++) {
        canvasContext.beginPath();
        canvasContext.moveTo(x, y);
        let v = y - (dataArray[i] - 127);
        canvasContext.lineTo(x, v);
        canvasContext.stroke();
        x += sliceWidth;
      }
      window.requestAnimationFrame(startVisualize);
    }
  }
}

customElements.define("audio-element", myComponent);
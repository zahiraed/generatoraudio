class AudioPlaylist extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    fetch("./myComponents/audio-playlist/audio-playlist.html")
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
        this.connectedCallback(); // Call initialization logic here
      })
      .catch((error) => {
        console.error("Error loading audio playlist template:", error);
      });
  }

  connectedCallback() {
    this.setupListeners();
  }

  getBaseURL = () => {
    const scriptURL = new URL(import.meta.url);
    return (
      scriptURL.origin +
      scriptURL.pathname.substring(0, scriptURL.pathname.lastIndexOf("/") + 1)
    );
  };

  setupListeners() {
    const items = this.shadowRoot.querySelectorAll(".playlist-item");
    items.forEach((item) => {
      item.addEventListener("click", () => {
        const src = item.getAttribute("data-src");
        console.log("Selected song:", src);
        const path = this.getBaseURL() + src;
        console.log("full path:", this.getBaseURL() + src);
        // Remove "active" class from all items
        items.forEach((i) => i.classList.remove("active"));

        // Add "active" class to the clicked item
        item.classList.add("active");

        // Dispatch a custom event with the selected song
        this.dispatchEvent(
          new CustomEvent("song-selected", {
            detail: { path },
            bubbles: true,
            composed: true,
          })
        );
      });
    });
  }
}

customElements.define("audio-playlist", AudioPlaylist);

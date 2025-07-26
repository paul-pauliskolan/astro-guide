class StarMapApp {
  constructor() {
    console.log("Initializing StarMapApp");
    this.geolocation = new GeolocationService();
    this.starMap = new StarMap("starmap", STARS);
    this.setupEventListeners();
    this.updateMagnitudeDisplay();

    // Test magnitude filtering on startup
    setTimeout(() => {
      console.log("Testing magnitude filtering...");
      this.starMap.setMagnitudeLimit(1.0); // Show only brightest stars
      setTimeout(() => {
        this.starMap.setMagnitudeLimit(4.0); // Back to default
      }, 2000);
    }, 1000);
  }

  setupEventListeners() {
    // Magnitude slider
    const slider = document.getElementById("magnitude-slider");
    slider.addEventListener("input", (e) => {
      const value = parseFloat(e.target.value);
      console.log("Slider changed to:", value);
      this.starMap.setMagnitudeLimit(value);
      this.updateMagnitudeDisplay();
    });

    // Geolocation button
    document.getElementById("get-location").addEventListener("click", () => {
      this.getLocation();
    });

    // Star selection
    document.addEventListener("starSelected", (e) => {
      this.showStarInfo(e.detail);
    });

    // Close star info
    document.getElementById("close-info").addEventListener("click", () => {
      this.hideStarInfo();
    });
  }

  async getLocation() {
    const button = document.getElementById("get-location");
    const coordinates = document.getElementById("coordinates");

    button.textContent = "Getting location...";
    button.disabled = true;

    try {
      const position = await this.geolocation.getCurrentPosition();
      this.starMap.setLocation(position.latitude, position.longitude);

      coordinates.textContent = `Location: ${position.latitude.toFixed(
        4
      )}°N, ${position.longitude.toFixed(4)}°E`;
      button.textContent = "Location Updated";

      setTimeout(() => {
        button.textContent = "Get My Location";
        button.disabled = false;
      }, 2000);
    } catch (error) {
      console.error("Error getting location:", error);
      coordinates.textContent = `Error: ${error.message}`;
      button.textContent = "Try Again";
      button.disabled = false;
    }
  }

  updateMagnitudeDisplay() {
    const slider = document.getElementById("magnitude-slider");
    const display = document.getElementById("magnitude-value");
    display.textContent = parseFloat(slider.value).toFixed(1);
  }

  showStarInfo(star) {
    const infoPanel = document.getElementById("star-info");
    const name = document.getElementById("star-name");
    const details = document.getElementById("star-details");

    name.textContent = star.name;
    details.innerHTML = `
      <strong>Constellation:</strong> ${star.constellation}<br>
      <strong>Magnitude:</strong> ${star.magnitude}<br>
      <strong>Distance:</strong> ${star.distance}<br>
      <strong>Spectral Class:</strong> ${star.spectralClass}<br>
      <strong>Description:</strong> ${star.description}
    `;

    infoPanel.classList.remove("hidden");
  }

  hideStarInfo() {
    document.getElementById("star-info").classList.add("hidden");
    this.starMap.selectedStar = null;
    this.starMap.render();
  }
}

// Initialize the app when the page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, starting app");
  new StarMapApp();
});

class StarMapApp {
  constructor() {
    console.log("Initializing StarMapApp");
    this.geolocation = new GeolocationService();
    this.starMap = new StarMap("starmap", STARS);
    this.setupEventListeners();
    this.updateAllDisplays();
  }

  setupEventListeners() {
    // Filter sliders
    document
      .getElementById("magnitude-slider")
      .addEventListener("input", () => {
        this.updateFilters();
      });

    document.getElementById("distance-slider").addEventListener("input", () => {
      this.updateFilters();
    });

    document.getElementById("age-slider").addEventListener("input", () => {
      this.updateFilters();
    });

    document.getElementById("mass-slider").addEventListener("input", () => {
      this.updateFilters();
    });

    // Reset filters button
    document.getElementById("reset-filters").addEventListener("click", () => {
      this.resetFilters();
    });

    // Geolocation button
    document.getElementById("get-location").addEventListener("click", () => {
      this.getLocation();
    });

    // Star selection and filtering events
    document.addEventListener("starSelected", (e) => {
      this.showStarInfo(e.detail);
    });

    document.addEventListener("starsFiltered", (e) => {
      this.updateVisibleCount(e.detail.count, e.detail.total);
    });

    document.getElementById("close-info").addEventListener("click", () => {
      this.hideStarInfo();
    });
  }

  updateFilters() {
    const magnitudeRange = {
      min: -2.0,
      max: parseFloat(document.getElementById("magnitude-slider").value),
    };

    const distanceRange = {
      min: 0,
      max: parseFloat(document.getElementById("distance-slider").value),
    };

    const ageRange = {
      min: 0,
      max: parseFloat(document.getElementById("age-slider").value),
    };

    const massRange = {
      min: 0.1,
      max: parseFloat(document.getElementById("mass-slider").value),
    };

    this.starMap.setRangeFilters(
      magnitudeRange,
      distanceRange,
      ageRange,
      massRange
    );
    this.updateAllDisplays();
  }

  updateAllDisplays() {
    const magnitude = document.getElementById("magnitude-slider").value;
    const distance = document.getElementById("distance-slider").value;
    const age = document.getElementById("age-slider").value;
    const mass = document.getElementById("mass-slider").value;

    document.getElementById("magnitude-value").textContent =
      parseFloat(magnitude).toFixed(1);
    document.getElementById("distance-value").textContent =
      parseFloat(distance).toFixed(0);
    document.getElementById("age-value").textContent =
      parseFloat(age).toFixed(1);
    document.getElementById("mass-value").textContent =
      parseFloat(mass).toFixed(1);
  }

  resetFilters() {
    document.getElementById("magnitude-slider").value = 4.0;
    document.getElementById("distance-slider").value = 1000;
    document.getElementById("age-slider").value = 10.0;
    document.getElementById("mass-slider").value = 25.0;
    this.updateFilters();
  }

  updateVisibleCount(visible, total) {
    document.getElementById(
      "visible-count"
    ).textContent = `Showing ${visible} of ${total} stars`;
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

  showStarInfo(star) {
    const infoPanel = document.getElementById("star-info");
    const name = document.getElementById("star-name");
    const details = document.getElementById("star-details");

    name.textContent = star.name;
    details.innerHTML = `
      <strong>Constellation:</strong> ${star.constellation}<br>
      <strong>Magnitude:</strong> ${star.magnitude}<br>
      <strong>Distance:</strong> ${star.distance} light years<br>
      <strong>Age:</strong> ${star.age} billion years<br>
      <strong>Mass:</strong> ${star.mass} solar masses<br>
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

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, starting app");
  new StarMapApp();
});

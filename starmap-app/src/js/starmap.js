class StarMap {
  constructor(canvasId, stars) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.stars = stars;
    this.magnitudeLimit = 4.0;
    this.latitude = 59.3293; // Default to Stockholm
    this.longitude = 18.0686;
    this.selectedStar = null;

    // Sky dome parameters
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;
    this.horizonRadius =
      Math.min(this.canvas.width, this.canvas.height) / 2 - 30;

    this.setupEventListeners();
    this.render();
  }

  setLocation(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.render();
  }

  setMagnitudeLimit(limit) {
    console.log("Setting magnitude limit to:", limit);
    this.magnitudeLimit = limit;
    this.render();
  }

  // Convert celestial coordinates to stereographic projection (realistic sky dome)
  // ...existing code...

  // Convert celestial coordinates to realistic azimuth/elevation projection
  celestialToCanvas(ra, dec) {
    // Get current time for proper star positions
    const now = new Date();
    const lst = this.getLocalSiderealTime(now);

    // Convert RA/Dec to Alt/Az coordinates based on observer location and time
    const coords = this.equatorialToHorizontal(ra, dec, lst, this.latitude);

    // Only show stars above horizon
    if (coords.altitude < 0) {
      return { x: -1000, y: -1000 }; // Off screen
    }

    // Convert to canvas coordinates
    // Azimuth: 0° = North, 90° = East, 180° = South, 270° = West
    const azimuthRad = (coords.azimuth * Math.PI) / 180;

    // Project altitude to radius (90° = center, 0° = horizon)
    const radius = this.horizonRadius * (1 - coords.altitude / 90);

    // Azimuth to angle (rotate so North is up)
    const angle = azimuthRad - Math.PI / 2; // Rotate 90° so North is up

    const x = this.centerX + radius * Math.cos(angle);
    const y = this.centerY + radius * Math.sin(angle);

    return { x, y };
  }

  // Calculate Local Sidereal Time
  getLocalSiderealTime(date) {
    const J2000 = new Date("2000-01-01T12:00:00Z");
    const daysSinceJ2000 =
      (date.getTime() - J2000.getTime()) / (1000 * 60 * 60 * 24);

    // Greenwich Sidereal Time at 0h UT
    const GST0 = (280.46061837 + 360.98564736629 * daysSinceJ2000) % 360;

    // Current Greenwich Sidereal Time
    const hours =
      date.getUTCHours() +
      date.getUTCMinutes() / 60 +
      date.getUTCSeconds() / 3600;
    const GST = (GST0 + 15.04107 * hours) % 360;

    // Local Sidereal Time
    const LST = (GST + this.longitude) % 360;

    return LST;
  }

  // Convert Equatorial coordinates (RA/Dec) to Horizontal coordinates (Alt/Az)
  equatorialToHorizontal(ra, dec, lst, latitude) {
    // Hour Angle
    const hourAngle = (lst - ra + 360) % 360;
    const H = (hourAngle * Math.PI) / 180;
    const decRad = (dec * Math.PI) / 180;
    const latRad = (latitude * Math.PI) / 180;

    // Calculate altitude
    const sinAlt =
      Math.sin(decRad) * Math.sin(latRad) +
      Math.cos(decRad) * Math.cos(latRad) * Math.cos(H);
    const altitude = (Math.asin(sinAlt) * 180) / Math.PI;

    // Calculate azimuth
    const cosAz =
      (Math.sin(decRad) - Math.sin(latRad) * sinAlt) /
      (Math.cos(latRad) * Math.cos(Math.asin(sinAlt)));
    let azimuth = (Math.acos(Math.max(-1, Math.min(1, cosAz))) * 180) / Math.PI;

    // Adjust azimuth based on hour angle
    if (Math.sin(H) >= 0) {
      azimuth = 360 - azimuth;
    }

    return { altitude, azimuth };
  }

  // ...existing code...

  getStarSize(magnitude) {
    // More dramatic size differences
    return Math.max(1, 10 - magnitude * 3);
  }

  render() {
    console.log("Rendering with magnitude limit:", this.magnitudeLimit);

    // Clear canvas with dark sky gradient
    this.drawSkyBackground();

    // Draw horizon circle and compass
    this.drawHorizonAndCompass();

    // Add background stars
    this.drawBackground();

    // Filter stars by magnitude
    const visibleStars = this.stars.filter(
      (star) => star.magnitude <= this.magnitudeLimit
    );

    console.log(
      `Showing ${visibleStars.length} stars with magnitude <= ${this.magnitudeLimit}`
    );

    // Draw each visible star
    visibleStars.forEach((star) => {
      const pos = this.celestialToCanvas(star.ra, star.dec);

      // Only draw stars within the horizon circle
      const distFromCenter = Math.sqrt(
        Math.pow(pos.x - this.centerX, 2) + Math.pow(pos.y - this.centerY, 2)
      );

      if (distFromCenter <= this.horizonRadius) {
        this.drawStar(star, pos.x, pos.y);
      }
    });

    // Highlight selected star
    if (this.selectedStar) {
      const pos = this.celestialToCanvas(
        this.selectedStar.ra,
        this.selectedStar.dec
      );
      this.drawSelectionRing(pos.x, pos.y);
    }
  }

  drawSkyBackground() {
    // Create radial gradient from center (zenith) to edge (horizon)
    const gradient = this.ctx.createRadialGradient(
      this.centerX,
      this.centerY,
      0,
      this.centerX,
      this.centerY,
      this.horizonRadius
    );
    gradient.addColorStop(0, "#001133"); // Dark blue at zenith
    gradient.addColorStop(0.7, "#000822"); // Darker towards horizon
    gradient.addColorStop(1, "#000511"); // Very dark at horizon

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawHorizonAndCompass() {
    // Draw horizon circle
    this.ctx.strokeStyle = "#444444";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(
      this.centerX,
      this.centerY,
      this.horizonRadius,
      0,
      2 * Math.PI
    );
    this.ctx.stroke();

    // Draw compass directions
    this.ctx.fillStyle = "#cccccc";
    this.ctx.font = "16px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    const compassOffset = 20;

    // North (top)
    this.ctx.fillText(
      "N",
      this.centerX,
      this.centerY - this.horizonRadius - compassOffset
    );

    // South (bottom)
    this.ctx.fillText(
      "S",
      this.centerX,
      this.centerY + this.horizonRadius + compassOffset
    );

    // East (right)
    this.ctx.fillText(
      "E",
      this.centerX + this.horizonRadius + compassOffset,
      this.centerY
    );

    // West (left)
    this.ctx.fillText(
      "W",
      this.centerX - this.horizonRadius - compassOffset,
      this.centerY
    );

    // Draw cardinal direction lines
    this.ctx.strokeStyle = "#666666";
    this.ctx.lineWidth = 1;

    // North-South line
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX, this.centerY - this.horizonRadius);
    this.ctx.lineTo(this.centerX, this.centerY + this.horizonRadius);
    this.ctx.stroke();

    // East-West line
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX - this.horizonRadius, this.centerY);
    this.ctx.lineTo(this.centerX + this.horizonRadius, this.centerY);
    this.ctx.stroke();

    // Draw elevation circles (30°, 60°)
    this.ctx.strokeStyle = "#333333";
    this.ctx.lineWidth = 1;

    // 60° elevation (30° from zenith)
    this.ctx.beginPath();
    this.ctx.arc(
      this.centerX,
      this.centerY,
      this.horizonRadius * 0.33,
      0,
      2 * Math.PI
    );
    this.ctx.stroke();

    // 30° elevation (60° from zenith)
    this.ctx.beginPath();
    this.ctx.arc(
      this.centerX,
      this.centerY,
      this.horizonRadius * 0.67,
      0,
      2 * Math.PI
    );
    this.ctx.stroke();
  }

  drawBackground() {
    // Add random background stars within horizon circle
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    for (let i = 0; i < 200; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * this.horizonRadius;
      const x = this.centerX + radius * Math.cos(angle);
      const y = this.centerY + radius * Math.sin(angle);
      const size = Math.random() * 0.5 + 0.2;

      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, 2 * Math.PI);
      this.ctx.fill();
    }
  }

  drawStar(star, x, y) {
    const size = this.getStarSize(star.magnitude);

    // Star color based on spectral class
    let color = "#ffffff";
    if (star.spectralClass.startsWith("M")) color = "#ffaa77"; // Red
    else if (star.spectralClass.startsWith("K")) color = "#ffcc88"; // Orange
    else if (star.spectralClass.startsWith("G")) color = "#ffff88"; // Yellow
    else if (star.spectralClass.startsWith("F")) color = "#ffffff"; // White
    else if (star.spectralClass.startsWith("A"))
      color = "#aaccff"; // Blue-white
    else if (star.spectralClass.startsWith("B")) color = "#88aaff"; // Blue

    // Draw star glow effect
    const glowSize = size * 3;
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, glowSize);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.3, color + "80");
    gradient.addColorStop(1, "transparent");

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, glowSize, 0, 2 * Math.PI);
    this.ctx.fill();

    // Draw bright star core
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, 2 * Math.PI);
    this.ctx.fill();

    // Draw star name
    this.ctx.fillStyle = "white";
    this.ctx.font = "12px Arial";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(star.name, x + size + 8, y);

    // Store position for click detection
    star.canvasX = x;
    star.canvasY = y;
    star.radius = glowSize;
  }

  drawSelectionRing(x, y) {
    this.ctx.strokeStyle = "#ffd700";
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 25, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  setupEventListeners() {
    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Only allow clicks within horizon circle
      const distFromCenter = Math.sqrt(
        Math.pow(clickX - this.centerX, 2) + Math.pow(clickY - this.centerY, 2)
      );

      if (distFromCenter > this.horizonRadius) return;

      // Find clicked star
      const visibleStars = this.stars.filter(
        (star) => star.magnitude <= this.magnitudeLimit
      );

      for (let star of visibleStars) {
        if (star.canvasX && star.canvasY) {
          const distance = Math.sqrt(
            Math.pow(clickX - star.canvasX, 2) +
              Math.pow(clickY - star.canvasY, 2)
          );

          if (distance <= star.radius) {
            this.selectStar(star);
            break;
          }
        }
      }
    });
  }

  selectStar(star) {
    this.selectedStar = star;
    this.render();

    // Trigger star info display
    const event = new CustomEvent("starSelected", { detail: star });
    document.dispatchEvent(event);
  }
}

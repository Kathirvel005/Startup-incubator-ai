/**
 * Particle Background System
 * Renders a lightweight, interactive particle network on an HTML5 canvas.
 */

(function () {
  const canvas = document.getElementById("particle-canvas");
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles = [];
  const properties = {
    bgColor: "rgba(7, 10, 19, 1)",
    particleColor: "rgba(0, 242, 254, 0.25)",
    particleRadius: 2.5,
    particleCount: 65,
    maxVelocity: 0.5,
    lineLength: 130,
    linkColor: "rgba(255, 0, 127, 0.08)",
  };

  // Adjust count based on screensize
  if (width < 768) {
    properties.particleCount = 30;
    properties.lineLength = 90;
  }

  // Handle window resizing
  window.addEventListener("resize", function () {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.velocityRow = (Math.random() * 2 - 1) * properties.maxVelocity;
      this.velocityCol = (Math.random() * 2 - 1) * properties.maxVelocity;
    }

    position() {
      // Re-boundary checking
      if (this.x + this.velocityRow > width || this.x + this.velocityRow < 0) {
        this.velocityRow = -this.velocityRow;
      }
      if (this.y + this.velocityCol > height || this.y + this.velocityCol < 0) {
        this.velocityCol = -this.velocityCol;
      }

      this.x += this.velocityRow;
      this.y += this.velocityCol;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, properties.particleRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = properties.particleColor;
      ctx.fill();
    }
  }

  // Link particles with subtle glow lines
  function drawLines() {
    let x1, y1, x2, y2, length, opacity;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        x1 = particles[i].x;
        y1 = particles[i].y;
        x2 = particles[j].x;
        y2 = particles[j].y;

        length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

        if (length < properties.lineLength) {
          opacity = 1 - length / properties.lineLength;
          ctx.lineWidth = 0.5;
          ctx.strokeStyle = `rgba(0, 242, 254, ${opacity * 0.12})`;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.closePath();
          ctx.stroke();
        }
      }
    }
  }

  function init() {
    for (let i = 0; i < properties.particleCount; i++) {
      particles.push(new Particle());
    }
    loop();
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);

    // Draw lines first
    drawLines();

    // Position and draw particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].position();
      particles[i].draw();
    }

    requestAnimationFrame(loop);
  }

  // Run on start
  init();
})();

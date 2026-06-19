/**
 * Main AI Startup Incubator Controller
 * Coordinates page transitions, animations, live counters, custom gauges, tilt cards, and PDF generators.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const pitchPanel = document.getElementById("pitch-panel");
  const loadingPanel = document.getElementById("loading-panel");
  const dashboardPanel = document.getElementById("dashboard-panel");
  
  const pitchForm = document.getElementById("pitch-form");
  const backPitchBtn = document.getElementById("back-pitch-btn");
  const downloadReportBtn = document.getElementById("download-report-btn");
  const actionOverlay = document.getElementById("action-overlay");
  const overlayStatusText = document.getElementById("overlay-status-text");

  // Loading Steps elements
  const loaderProgress = document.getElementById("loader-progress");
  const loadingSteps = [
    document.getElementById("step-1"),
    document.getElementById("step-2"),
    document.getElementById("step-3"),
    document.getElementById("step-4")
  ];

  // Cached analysis state
  let currentPitchData = null;
  let currentAnalysisResult = null;

  // ----------------------------------------------------
  // 1. TILT 3D CARD ANIMATIONS
  // ----------------------------------------------------
  function initTiltCards() {
    const cards = document.querySelectorAll(".hover-3d");
    cards.forEach(card => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Normalize coordinates to -1 to 1 range
        const normX = x / (rect.width / 2);
        const normY = y / (rect.height / 2);
        
        // Calculate tilt angles (maximum 8 degrees)
        const tiltX = -normY * 8;
        const tiltY = normX * 8;
        
        // Apply transform
        card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(10px) translateY(-5px)`;
      });
      
      card.addEventListener("mouseleave", () => {
        card.style.transform = `perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px) translateY(0px)`;
      });
    });
  }

  // ----------------------------------------------------
  // 2. LIVE COUNTUP METERS
  // ----------------------------------------------------
  function animateCounter(elementId, targetValue, duration = 1500) {
    const el = document.getElementById(elementId);
    if (!el) return;

    let start = 0;
    const increment = targetValue / (duration / 16); // ~60fps
    
    function updateCounter() {
      start += increment;
      if (start >= targetValue) {
        el.innerText = Math.round(targetValue).toLocaleString();
      } else {
        el.innerText = Math.round(start).toLocaleString();
        requestAnimationFrame(updateCounter);
      }
    }
    
    requestAnimationFrame(updateCounter);
  }

  // ----------------------------------------------------
  // 3. SVG RISK GAUGE ANIMATION
  // ----------------------------------------------------
  function animateRiskGauge(riskValue) {
    const needle = document.getElementById("gauge-needle");
    const arc = document.getElementById("gauge-fill-arc");
    const ratingBadge = document.getElementById("risk-rating-badge");

    // 1. Rotate Needle (-90deg for 0% risk to 90deg for 100% risk)
    const angle = (riskValue / 100) * 180 - 90;
    needle.style.transform = `rotate(${angle}deg)`;

    // 2. Animate SVG Dasharray (Total arc length is 251.2)
    const maxDash = 251.2;
    const dashoffset = maxDash - (riskValue / 100) * maxDash;
    
    // Animate arc fill line offset
    arc.style.transition = "stroke-dashoffset 2s cubic-bezier(0.18, 0.89, 0.32, 1.28)";
    arc.style.strokeDashoffset = dashoffset;

    // 3. Update status badge styling
    let ratingStr = "LOW RISK PROFILE";
    let colorClass = "green-glow";

    if (riskValue > 70) {
      ratingStr = "CRITICAL / VOLATILE RISK";
      colorClass = "red-glow";
      ratingBadge.style.color = "var(--accent-red)";
    } else if (riskValue > 40) {
      ratingStr = "MODERATE OPERATIONAL RISK";
      colorClass = "gold-glow";
      ratingBadge.style.color = "var(--accent-gold)";
    } else {
      ratingBadge.style.color = "var(--accent-green)";
    }

    ratingBadge.className = `metric-desc text-center font-bold ${colorClass}`;
    ratingBadge.innerText = ratingStr;
  }

  // ----------------------------------------------------
  // 4. TYPING AI TEXT EFFECTS
  // ----------------------------------------------------
  function typeText(container, itemsArray, callback) {
    container.innerHTML = "";
    let itemIdx = 0;
    
    function typeNextItem() {
      if (itemIdx >= itemsArray.length) {
        if (callback) callback();
        return;
      }
      
      const li = document.createElement("li");
      container.appendChild(li);
      
      const fullText = itemsArray[itemIdx];
      let charIdx = 0;
      
      function typeChar() {
        if (charIdx < fullText.length) {
          li.innerHTML += fullText.charAt(charIdx);
          charIdx++;
          setTimeout(typeChar, 10); // typing speed
        } else {
          itemIdx++;
          setTimeout(typeNextItem, 200); // delay before next list item
        }
      }
      
      typeChar();
    }
    
    typeNextItem();
  }

  // ----------------------------------------------------
  // 5. RENDERING PIPELINES
  // ----------------------------------------------------
  function renderAnalysisData(data) {
    // A. Key Numerical counters
    animateCounter("metric-success-rate", data.successRate);
    animateCounter("metric-innovation-score", data.innovationScore);
    
    // B. Risk Gauge Needle & Arc
    setTimeout(() => {
      animateCounter("metric-risk-rate", data.riskRate);
      animateRiskGauge(data.riskRate);
    }, 400);

    // C. Capital Status Assessment
    animateCounter("metric-required-budget", data.requiredAmount);
    
    const budgetBadge = document.getElementById("metric-budget-status");
    budgetBadge.innerText = data.budgetStatus;
    budgetBadge.className = `status-badge ${data.budgetStatus.toLowerCase()}`;
    
    document.getElementById("metric-budget-explanation").innerText = data.budgetStatusExplanation;

    // D. Strategy Typing adaptation
    const recsList = document.getElementById("recommendations-list");
    typeText(recsList, data.recommendations);

    // E. Implementation Roadmap timeline
    const timeline = document.getElementById("milestones-timeline");
    timeline.innerHTML = "";
    data.milestones.forEach((mile, idx) => {
      const node = document.createElement("div");
      node.className = "timeline-node";
      node.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="timeline-header">
            <span class="timeline-phase">${mile.phase}</span>
            <span class="timeline-duration">${mile.duration}</span>
          </div>
          <span class="timeline-title">${mile.title}</span>
          <p class="timeline-desc">${mile.description}</p>
        </div>
      `;
      timeline.appendChild(node);
    });

    // F. Competitors Table
    const compTable = document.getElementById("competitor-table-body").querySelector("tbody");
    compTable.innerHTML = "";
    data.competitors.forEach(comp => {
      const tr = document.createElement("tr");
      
      let badgeType = "sufficient"; // Green
      if (comp.type.toLowerCase().includes("direct")) {
        badgeType = "deficit"; // Red
      } else if (comp.type.toLowerCase().includes("indirect")) {
        badgeType = "surplus"; // Blue
      }
      
      tr.innerHTML = `
        <td>
          <div class="font-bold">${comp.name}</div>
          <span class="competitor-badge ${badgeType}">${comp.type}</span>
        </td>
        <td>${comp.strength}</td>
        <td>${comp.weakness}</td>
        <td class="highlight-cyan font-bold">${comp.usp}</td>
      `;
      compTable.appendChild(tr);
    });

    // G. Similar Startup Analogs
    const analogsList = document.getElementById("analogs-list");
    analogsList.innerHTML = "";
    data.similarStartups.forEach(sim => {
      const card = document.createElement("div");
      card.className = "analog-card";
      card.innerHTML = `
        <h4>${sim.name}</h4>
        <p>${sim.description}</p>
        <span class="analog-takeaway">
          <i class="fa-solid fa-graduation-cap"></i> Key Takeaway: ${sim.keyTakeaway}
        </span>
      `;
      analogsList.appendChild(card);
    });

    // Re-initialize 3D transforms for dynamically added templates
    initTiltCards();
  }

  // ----------------------------------------------------
  // 6. ACTION & LOADING TRANSITIONS
  // ----------------------------------------------------
  function transitionPanel(hidePanel, showPanel) {
    hidePanel.classList.remove("active");
    setTimeout(() => {
      hidePanel.style.display = "none";
      showPanel.style.display = "block";
      setTimeout(() => {
        showPanel.classList.add("active");
      }, 50);
    }, 400);
  }

  function simulateLoadingProgress(callback) {
    let progress = 0;
    loaderProgress.style.width = "0%";
    
    // Reset steps markers
    loadingSteps.forEach((step, idx) => {
      step.className = "check-item";
      step.querySelector(".status-icon").className = "fa-solid fa-clock status-icon";
    });
    
    // Enable Step 1
    loadingSteps[0].classList.add("active");
    loadingSteps[0].querySelector(".status-icon").className = "fa-solid fa-circle-notch fa-spin status-icon";

    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 5) + 3;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Mark all steps complete
        loadingSteps.forEach(step => {
          step.className = "check-item success";
          step.querySelector(".status-icon").className = "fa-solid fa-circle-check status-icon";
        });
        
        loaderProgress.style.width = "100%";
        setTimeout(callback, 500);
      } else {
        loaderProgress.style.width = `${progress}%`;
        
        // Step transition milestones
        if (progress > 75) {
          markStepComplete(2);
          markStepActive(3);
        } else if (progress > 50) {
          markStepComplete(1);
          markStepActive(2);
        } else if (progress > 25) {
          markStepComplete(0);
          markStepActive(1);
        }
      }
    }, 120);
  }

  function markStepComplete(idx) {
    if (loadingSteps[idx].classList.contains("active")) {
      loadingSteps[idx].className = "check-item success";
      loadingSteps[idx].querySelector(".status-icon").className = "fa-solid fa-circle-check status-icon";
    }
  }

  function markStepActive(idx) {
    if (!loadingSteps[idx].classList.contains("active") && !loadingSteps[idx].classList.contains("success")) {
      loadingSteps[idx].className = "check-item active";
      loadingSteps[idx].querySelector(".status-icon").className = "fa-solid fa-circle-notch fa-spin status-icon";
    }
  }

  // ----------------------------------------------------
  // 7. EVENT LISTENERS & AJAX REQUESTS
  // ----------------------------------------------------
  
  // Submit Idea Form
  pitchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const idea = document.getElementById("startup-idea").value.trim();
    const amount = document.getElementById("startup-amount").value;
    const platform = document.getElementById("startup-platform").value;

    currentPitchData = { idea, amount, platform };

    // Move to loading screen
    transitionPanel(pitchPanel, loadingPanel);

    // Call API and loading animation concurrently
    let apiData = null;
    let loadingDone = false;

    // Trigger API call
    const apiPromise = fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentPitchData)
    })
    .then(res => {
      if (!res.ok) throw new Error("Backend analyzer reported an error.");
      return res.json();
    })
    .then(data => {
      apiData = data;
      return data;
    })
    .catch(err => {
      console.error("Analysis request failed:", err);
      return null;
    });

    // Run loading visual track
    simulateLoadingProgress(() => {
      loadingDone = true;
      checkCompletion();
    });

    async function checkCompletion() {
      if (!loadingDone) return;
      
      const data = await apiPromise;
      if (!data) {
        alert("The AI Incubation engine is temporarily offline. Please ensure your Express server is running.");
        transitionPanel(loadingPanel, pitchPanel);
        return;
      }

      currentAnalysisResult = data;
      
      // Feed data to chatbot context
      if (window.chatBubbleInstance) {
        window.chatBubbleInstance.setStartupContext({
          idea,
          amount,
          platform,
          analysis: data
        });
      }

      // Render dashboard metrics and slide it in
      renderAnalysisData(data);
      transitionPanel(loadingPanel, dashboardPanel);
    }
  });

  // Back Button to Idea Form
  backPitchBtn.addEventListener("click", () => {
    transitionPanel(dashboardPanel, pitchPanel);
  });

  // Download PDF report
  downloadReportBtn.addEventListener("click", async () => {
    if (!currentPitchData || !currentAnalysisResult) {
      alert("No active analysis report found to export.");
      return;
    }

    // Show loading spinner overlay
    actionOverlay.className = "action-overlay-visible";
    overlayStatusText.innerText = "Assembling PDF Layout Report...";

    try {
      const response = await fetch("/api/download-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: currentPitchData.idea,
          amount: currentPitchData.amount,
          platform: currentPitchData.platform,
          analysis: currentAnalysisResult
        })
      });

      if (!response.ok) {
        throw new Error("Failed to compile PDF document on server.");
      }

      // Fetch binary blob
      const blob = await response.blob();
      
      // Create local URL
      const url = window.URL.createObjectURL(blob);
      
      // Download Trigger
      const a = document.createElement("a");
      a.href = url;
      
      const cleanPlatform = currentPitchData.platform.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
      a.download = `Venture-Report-${cleanPlatform}.pdf`;
      
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download request failed:", err);
      alert("Encountered a server issue compile error building your PDF report. Check node log.");
    } finally {
      // Hide spinner overlay
      actionOverlay.className = "action-overlay-hidden";
    }
  });

  // Init standard page animations on start
  initTiltCards();
});

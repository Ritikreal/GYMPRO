// ===== CORE FUNCTIONALITY (PRESERVED) =====
let workouts = JSON.parse(localStorage.getItem("workouts")) || [];
let chart;

function save() {
  localStorage.setItem("workouts", JSON.stringify(workouts));
}

function showTab(tab) {
  // Animate tab exit
  const currentTab = document.querySelector(".tab.active");
  if (currentTab) {
    gsap.to(currentTab, {
      opacity: 0,
      scale: 0.96,
      duration: 0.15,
      onComplete: () => {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        document.getElementById(tab).classList.add("active");
        
        // Animate new tab
        const newTab = document.getElementById(tab);
        gsap.fromTo(newTab, 
          { opacity: 0, scale: 0.96 },
          { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(0.3)" }
        );
        
        if (tab === "progress") renderChart();
        
        // Update active nav button style
        updateActiveNav(tab);
      }
    });
  } else {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.getElementById(tab).classList.add("active");
    if (tab === "progress") renderChart();
    updateActiveNav(tab);
  }
}

function updateActiveNav(tab) {
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabMap = { home: 0, add: 1, progress: 2 };
  navBtns.forEach((btn, idx) => {
    if (idx === tabMap[tab]) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function addWorkout() {
  const exercise = document.getElementById("exercise").value;
  const reps = parseInt(document.getElementById("reps").value);
  const weight = parseFloat(document.getElementById("weight").value);

  if (!exercise || !reps || !weight) return;

  const newWorkout = {
    exercise,
    reps,
    weight,
    date: new Date().toLocaleDateString()
  };
  
  workouts.push(newWorkout);
  save();
  render();
  clearInputs();
  
  // Animate the new workout addition
  const workoutElements = document.querySelectorAll('.workout');
  if (workoutElements.length > 0) {
    const lastWorkout = workoutElements[workoutElements.length - 1];
    gsap.fromTo(lastWorkout,
      { opacity: 0, x: -30, scale: 0.95 },
      { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: "back.out(0.4)" }
    );
  }
  
  // Show success haptic feedback
  const btn = document.querySelector('.btn-primary');
  gsap.to(btn, { scale: 0.96, duration: 0.1, yoyo: true, repeat: 1 });
}

function clearInputs() {
  document.getElementById("exercise").value = "";
  document.getElementById("reps").value = "";
  document.getElementById("weight").value = suggestWeight();
}

function deleteWorkout(index) {
  // Animate delete
  const workoutElements = document.querySelectorAll('.workout');
  if (workoutElements[index]) {
    gsap.to(workoutElements[index], {
      opacity: 0,
      x: 30,
      scale: 0.9,
      duration: 0.3,
      onComplete: () => {
        workouts.splice(index, 1);
        save();
        render();
      }
    });
  } else {
    workouts.splice(index, 1);
    save();
    render();
  }
}

function render() {
  const container = document.getElementById("workouts");
  if (!container) return;
  
  container.innerHTML = "";

  let totalWeight = 0;

  workouts.forEach((w, i) => {
    totalWeight += w.reps * w.weight;

    const workoutDiv = document.createElement('div');
    workoutDiv.className = 'workout';
    workoutDiv.innerHTML = `
      <div class="workout-info">
        <div class="workout-exercise">${escapeHtml(w.exercise)}</div>
        <div class="workout-details">${w.reps} reps × ${w.weight} kg</div>
        <div class="workout-date">${w.date}</div>
      </div>
      <button class="workout-delete" onclick="deleteWorkout(${i})">Delete</button>
    `;
    container.appendChild(workoutDiv);
  });

  // Show/hide empty state
  const emptyState = document.getElementById("emptyState");
  if (emptyState) {
    emptyState.style.display = workouts.length === 0 ? "block" : "none";
  }

  // Update stats
  const totalWorkoutsEl = document.getElementById("totalWorkouts");
  const totalWeightEl = document.getElementById("totalWeight");
  const workoutCountEl = document.getElementById("workoutCount");
  
  if (totalWorkoutsEl) totalWorkoutsEl.innerText = workouts.length;
  if (totalWeightEl) totalWeightEl.innerText = totalWeight;
  if (workoutCountEl) workoutCountEl.innerText = workouts.length;

  updateDashboard();
  
  // Animate each workout with stagger
  const newWorkouts = document.querySelectorAll('.workout');
  gsap.fromTo(newWorkouts,
    { opacity: 0, x: -20 },
    { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
  );
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderChart() {
  const ctx = document.getElementById("chart");
  if (!ctx) return;

  const grouped = {};
  workouts.forEach(w => {
    grouped[w.date] = (grouped[w.date] || 0) + (w.reps * w.weight);
  });

  const labels = Object.keys(grouped);
  const data = Object.values(grouped);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Total Volume (kg)",
        data,
        borderColor: "#00e676",
        backgroundColor: "rgba(0, 230, 118, 0.1)",
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: "#00b0ff",
        pointBorderColor: "#0a0a0a",
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: "#ffffff",
            font: { size: 11 }
          }
        }
      },
      scales: {
        y: {
          grid: { color: "rgba(255,255,255,0.05)" },
          ticks: { color: "#ffffff" }
        },
        x: {
          grid: { display: false },
          ticks: { color: "#ffffff", maxRotation: 45, minRotation: 45 }
        }
      }
    }
  });
  
  // Animate chart entrance
  gsap.fromTo(ctx, 
    { opacity: 0, scale: 0.95 },
    { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(0.3)" }
  );
}

// AI-like Features
function calculateStreak() {
  if (workouts.length === 0) return 0;

  const dates = [...new Set(workouts.map(w => w.date))];
  dates.sort((a, b) => new Date(b) - new Date(a));

  let streak = 1;
  let currentDate = new Date(dates[0]);

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i]);
    const diffDays = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
}

function calculateGoal() {
  if (workouts.length === 0) return 100;
  let total = 0;
  workouts.forEach(w => total += w.reps * w.weight);
  return Math.round(total * 1.1);
}

function generateTip() {
  if (workouts.length < 3) return "💪 Stay consistent - you're building momentum!";
  
  const last = workouts[workouts.length - 1];
  const prev = workouts[workouts.length - 2];
  
  if (last.weight > prev.weight) {
    return "🚀 Great progress! Try increasing reps next session!";
  } else if (last.reps > prev.reps) {
    return "⚡ Amazing! Your endurance is improving!";
  } else {
    return "🔥 Push a little harder - add 2.5kg next time!";
  }
}

function suggestWeight() {
  if (workouts.length === 0) return 10;
  const last = workouts[workouts.length - 1];
  return Math.round(last.weight * 1.05);
}

function updateDashboard() {
  const streakEl = document.getElementById("streak");
  const goalEl = document.getElementById("goal");
  const tipEl = document.getElementById("tip");
  
  if (streakEl) streakEl.innerText = calculateStreak();
  if (goalEl) goalEl.innerText = calculateGoal();
  if (tipEl) tipEl.innerText = generateTip();
}

// Animate dashboard numbers on update
function animateNumber(element, start, end) {
  if (!element) return;
  gsap.fromTo(element, 
    { innerText: start },
    { innerText: end, duration: 0.5, snap: { innerText: 1 }, ease: "power2.out" }
  );
}

// Page load animations
function initAnimations() {
  // Animate logo
  gsap.fromTo(".logo", 
    { y: -30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, ease: "back.out(0.4)" }
  );
  
  // Animate dashboard
  gsap.fromTo(".dashboard-card", 
    { y: 30, opacity: 0, scale: 0.95 },
    { y: 0, opacity: 1, scale: 1, duration: 0.5, delay: 0.1, ease: "back.out(0.3)" }
  );
  
  // Animate stats footer
  gsap.fromTo(".stats-footer", 
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.4, delay: 0.3 }
  );
  
  // Animate nav
  gsap.fromTo(".nav", 
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5, delay: 0.2, ease: "back.out(0.4)" }
  );
}

// Run animations on load
document.addEventListener('DOMContentLoaded', () => {
  render();
  document.getElementById("weight").value = suggestWeight();
  initAnimations();
  updateActiveNav('home');
  
  // Add input focus animations
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      gsap.to(input, { scale: 1.02, duration: 0.2 });
    });
    input.addEventListener('blur', () => {
      gsap.to(input, { scale: 1, duration: 0.2 });
    });
  });
});
let workouts = JSON.parse(localStorage.getItem("workouts")) || [];
let chart;

function save() {
  localStorage.setItem("workouts", JSON.stringify(workouts));
}

function showTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(tab).classList.add("active");

  if (tab === "progress") renderChart();
}

function addWorkout() {
  const exercise = document.getElementById("exercise").value;
  const reps = parseInt(document.getElementById("reps").value);
  const weight = parseInt(document.getElementById("weight").value);

  if (!exercise || !reps || !weight) return;

  workouts.push({
    exercise,
    reps,
    weight,
    date: new Date().toLocaleDateString()
  });

  save();
  render();
  clearInputs();
}

function clearInputs() {
  document.getElementById("exercise").value = "";
  document.getElementById("reps").value = "";
  document.getElementById("weight").value = suggestWeight();
}

function deleteWorkout(index) {
  workouts.splice(index, 1);
  save();
  render();
}

function render() {
  const container = document.getElementById("workouts");
  container.innerHTML = "";

  let totalWeight = 0;

  workouts.forEach((w, i) => {
    totalWeight += w.reps * w.weight;

    container.innerHTML += `
      <div class="workout">
        <strong>${w.exercise}</strong><br>
        ${w.reps} reps × ${w.weight} kg<br>
        <small>${w.date}</small>
        <button onclick="deleteWorkout(${i})">Delete</button>
      </div>
    `;
  });

  document.getElementById("totalWorkouts").innerText =
    workouts.length + " workouts";

  document.getElementById("totalWeight").innerText =
    totalWeight + " kg lifted";

  updateDashboard();
}

function renderChart() {
  const ctx = document.getElementById("chart");

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
        label: "Progress",
        data,
        tension: 0.4
      }]
    }
  });
}

/* 🔥 AI-like Features */

function calculateStreak() {
  if (workouts.length === 0) return 0;

  const dates = [...new Set(workouts.map(w => w.date))];
  dates.sort();

  let streak = 1;

  for (let i = dates.length - 1; i > 0; i--) {
    const d1 = new Date(dates[i]);
    const d2 = new Date(dates[i - 1]);

    const diff = (d1 - d2) / (1000 * 60 * 60 * 24);

    if (diff === 1) streak++;
    else break;
  }

  return streak;
}

function calculateGoal() {
  let total = 0;
  workouts.forEach(w => total += w.reps * w.weight);
  return Math.round(total * 1.1);
}

function generateTip() {
  if (workouts.length < 3) return "Stay consistent 💪";

  const last = workouts[workouts.length - 1];
  const prev = workouts[workouts.length - 2];

  if (last.weight > prev.weight) {
    return "Great progress! Increase reps next 🚀";
  } else {
    return "Try adding 2.5kg next session 🔥";
  }
}

function suggestWeight() {
  if (workouts.length === 0) return 10;
  const last = workouts[workouts.length - 1];
  return Math.round(last.weight * 1.05);
}

function updateDashboard() {
  document.getElementById("streak").innerText = calculateStreak();
  document.getElementById("goal").innerText = calculateGoal();
  document.getElementById("tip").innerText = generateTip();
}

/* INIT */
render();
document.getElementById("weight").value = suggestWeight();

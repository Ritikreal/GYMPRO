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
  document.getElementById("weight").value = "";
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
        label: "Volume Progress",
        data,
        tension: 0.4
      }]
    }
  });
}

render();

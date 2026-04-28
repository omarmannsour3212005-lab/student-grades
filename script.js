let currentRole = "student";
let chart;

function setLoginMode(role) {
  currentRole = role;
}

function showSignup() {
  alert("Sign up not implemented yet");
}

function login() {
  const name = document.getElementById("loginName").value;
  const pass = document.getElementById("loginPassword").value;

  if (name === "") {
    alert("Enter name");
    return;
  }

  if (currentRole === "teacher" && pass !== "1234") {
    alert("Wrong password");
    return;
  }

  document.getElementById("loginPage").style.display = "none";
  document.getElementById("app").style.display = "flex";

  setRole(currentRole);
}

function setRole(role) {
  document.getElementById("studentArea").style.display =
    role === "student" ? "block" : "none";

  document.getElementById("teacherArea").style.display =
    role === "teacher" ? "block" : "none";
}

function showInputs() {
  const selected = document.querySelectorAll(".subjects input:checked");
  const div = document.getElementById("gradeInputs");

  div.innerHTML = "";

  selected.forEach(sub => {
    div.innerHTML += `
      <input type="number" class="grade" data-subject="${sub.value}" placeholder="${sub.value}">
    `;
  });

  div.innerHTML += `<button onclick="save()">Save</button>`;
}

function save() {
  const name = document.getElementById("name").value;
  const grades = document.querySelectorAll(".grade");

  let data = [];

  grades.forEach(g => {
    data.push({
      subject: g.dataset.subject,
      grade: Number(g.value)
    });
  });

  localStorage.setItem(name, JSON.stringify(data));
  alert("Saved");
}

function searchStudent() {
  const name = document.getElementById("name").value;
  const data = JSON.parse(localStorage.getItem(name));

  if (!data) {
    alert("No data");
    return;
  }

  let html = "<h3>Result</h3>";

  data.forEach(d => {
    html += `<p>${d.subject}: ${d.grade}</p>`;
  });

  document.getElementById("result").innerHTML = html;

  drawChart(data);
}

function drawChart(data) {
  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("gradesChart"), {
    type: "bar",
    data: {
      labels: data.map(d => d.subject),
      datasets: [{
        label: "Grades",
        data: data.map(d => d.grade)
      }]
    }
  });
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

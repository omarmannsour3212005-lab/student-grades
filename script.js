// 🔥 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBcX3RdUwQypWjLMAC4pQVT7VLUE6Pb_Ys",
  authDomain: "om-grade-system.firebaseapp.com",
  databaseURL: "https://om-grade-system-default-rtdb.firebaseio.com",
  projectId: "om-grade-system",
  storageBucket: "om-grade-system.firebasestorage.app",
  messagingSenderId: "1030779408678",
  appId: "1:1030779408678:web:40f10973f03902327971e7"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 🔐 Teacher login
function teacherEnter() {
  const password = document.getElementById("loginPassword").value;

  if (password !== "1234") {
    alert("Wrong password");
    return;
  }

  document.getElementById("loginPage").style.display = "none";
  document.getElementById("app").style.display = "flex";

  document.getElementById("teacherArea").style.display = "block";
}

// 👨‍🎓 Student login
function studentEnter() {
  const name = document.getElementById("studentLoginName").value.trim();

  if (name === "") {
    alert("Write your name");
    return;
  }

  document.getElementById("loginPage").style.display = "none";
  document.getElementById("app").style.display = "flex";

  document.getElementById("name").value = name;
  searchStudent();
}

// 📥 Save student
function saveStudent(studentData) {
  const key = studentData.name.toLowerCase();
  db.ref("students/" + key).set(studentData);
}

// 🔍 Search student
function searchStudent() {
  const name = document.getElementById("name").value.trim().toLowerCase();

  db.ref("students/" + name).once("value")
    .then(snapshot => {
      if (snapshot.exists()) {
        showResult(snapshot.val());
      } else {
        alert("Student not found ❌");
      }
    });
}

// 🧮 Create inputs
function showInputs() {
  const selected = document.querySelectorAll(".subjects input:checked");
  const div = document.getElementById("gradeInputs");

  div.innerHTML = "";

  selected.forEach(s => {
    div.innerHTML += `
      <input type="number" class="grade" data-subject="${s.value}" placeholder="${s.value}">
    `;
  });

  div.innerHTML += `<button onclick="calculate()">Save</button>`;
}

// 📊 Calculate
function calculate() {
  const name = document.getElementById("name").value.trim();
  const grades = document.querySelectorAll(".grade");

  let sum = 0;
  let subjects = [];

  grades.forEach(g => {
    sum += Number(g.value);
    subjects.push({
      subject: g.dataset.subject,
      grade: g.value
    });
  });

  const avg = sum / grades.length;

  const data = {
    name: name,
    subjects: subjects,
    average: avg.toFixed(2)
  };

  saveStudent(data);
  showResult(data);
}

// 📄 Show result
function showResult(student) {
  let html = `<h3>${student.name}</h3><ul>`;

  student.subjects.forEach(s => {
    html += `<li>${s.subject}: ${s.grade}</li>`;
  });

  html += `</ul><p>Average: ${student.average}</p>`;

  document.getElementById("result").innerHTML = html;
}

// 🌙 Dark mode
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

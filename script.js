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

let chart = null;
let currentTeacher = localStorage.getItem("currentTeacher") || null;

function showStudentLogin() {
  studentLoginBox.style.display = "block";
  teacherLoginBox.style.display = "none";
  signUpBox.style.display = "none";
}

function showTeacherLogin() {
  studentLoginBox.style.display = "none";
  teacherLoginBox.style.display = "block";
  signUpBox.style.display = "none";
}

function showSignUp() {
  studentLoginBox.style.display = "none";
  teacherLoginBox.style.display = "none";
  signUpBox.style.display = "block";
}

function signUpTeacher() {
  const username = teacherUsername.value.trim().toLowerCase();
  const password = newTeacherPassword.value.trim();

  if (!username || !password) {
    alert("Enter username and password");
    return;
  }

  db.ref("teachers/" + username).once("value").then(snap => {
    if (snap.exists()) {
      alert("Username already exists");
      return;
    }

    db.ref("teachers/" + username).set({
      password: password,
      students: {}
    }).then(() => {
      alert("Account created successfully ✅");
      showTeacherLogin();
    });
  });
}

function teacherEnter() {
  const username = loginUsername.value.trim().toLowerCase();
  const password = loginPassword.value;

  db.ref("teachers/" + username).once("value").then(snap => {
    if (!snap.exists()) {
      alert("User not found");
      return;
    }

    const teacher = snap.val();

    if (teacher.password !== password) {
      alert("Wrong password");
      return;
    }

    currentTeacher = username;
    localStorage.setItem("currentTeacher", currentTeacher);

    loginPage.style.display = "none";
    app.style.display = "flex";

    setRole("teacher");
    loadTeacherTable();
  });
}

function studentEnter() {
  const studentName = studentLoginName.value.trim();

  if (!studentName) {
    alert("Write your name");
    return;
  }

  loginPage.style.display = "none";
  app.style.display = "flex";

  name.value = studentName;
  setRole("student");
  searchStudent();
}

function setRole(role) {
  if (role === "teacher") {
    teacherArea.style.display = "block";
    studentArea.style.display = "none";
  } else {
    teacherArea.style.display = "none";
    studentArea.style.display = "block";
  }

  result.style.display = "none";
  pdfBtn.style.display = "none";
}

function showInputs() {
  const selected = document.querySelectorAll(".subjects input:checked");
  gradeInputs.innerHTML = "";

  if (selected.length === 0) {
    alert("Choose at least one subject");
    return;
  }

  selected.forEach(subject => {
    gradeInputs.innerHTML += `
      <input type="number" class="grade" data-subject="${subject.value}" placeholder="${subject.value} grade" min="0" max="100">
    `;
  });

  gradeInputs.innerHTML += `<button onclick="calculate()">Save Student Result</button>`;
}

function calculate() {
  const studentName = name.value.trim();
  const grades = document.querySelectorAll(".grade");

  if (!currentTeacher) {
    alert("Teacher must login first");
    return;
  }

  if (!studentName) {
    alert("Write student name first");
    return;
  }

  if (grades.length === 0) {
    alert("Choose subjects first");
    return;
  }

  let sum = 0;
  let subjects = [];

  for (let input of grades) {
    const grade = Number(input.value);

    if (input.value === "" || grade < 0 || grade > 100) {
      alert("Each grade must be between 0 and 100");
      return;
    }

    sum += grade;
    subjects.push({
      subject: input.dataset.subject,
      grade: grade
    });
  }

  const average = sum / grades.length;
  const level = getGradeLevel(average);

  const studentData = {
    name: studentName,
    teacher: currentTeacher,
    subjects: subjects,
    total: sum,
    average: average.toFixed(2),
    status: level.text,
    statusClass: level.className
  };

  const key = studentName.toLowerCase();

  db.ref("teachers/" + currentTeacher + "/students/" + key).set(studentData);
  db.ref("students/" + key).set(studentData).then(() => {
    showReport(studentData);
    loadTeacherTable();
    alert("Student saved online ✅");
  });
}

function searchStudent() {
  const studentName = name.value.trim().toLowerCase();

  if (!studentName) {
    alert("Write student name first");
    return;
  }

  db.ref("students/" + studentName).once("value").then(snap => {
    if (!snap.exists()) {
      result.style.display = "block";
      result.innerHTML = `
        <h3>Student not found ❌</h3>
        <p>Make sure you wrote the same name saved by the teacher.</p>
      `;
      pdfBtn.style.display = "none";
      return;
    }

    showReport(snap.val());
  });
}

function showReport(student) {
  let rows = "";

  student.subjects.forEach(item => {
    rows += `
      <tr>
        <td>${item.subject}</td>
        <td>${item.grade}</td>
      </tr>
    `;
  });

  result.style.display = "block";

  result.innerHTML = `
    <div id="pdfContent">
      <h3>Student Report</h3>
      <p><b>Name:</b> ${student.name}</p>

      <table>
        <tr>
          <th>Subject</th>
          <th>Grade</th>
        </tr>
        ${rows}
      </table>

      <p><b>Total:</b> ${student.total}</p>
      <p><b>Average:</b> ${student.average}</p>
      <p><b>Result:</b> <span class="${student.statusClass}">${student.status}</span></p>
    </div>
  `;

  drawChart(student);
  pdfBtn.style.display = "block";
}

function loadTeacherTable() {
  if (!currentTeacher) {
    teacherTable.innerHTML = "";
    return;
  }

  db.ref("teachers/" + currentTeacher + "/students").once("value").then(snap => {
    const students = snap.exists() ? snap.val() : {};

    let html = `
      <table>
        <tr>
          <th>Name</th>
          <th>Average</th>
          <th>Status</th>
        </tr>
    `;

    for (let key in students) {
      html += `
        <tr>
          <td>${students[key].name}</td>
          <td>${students[key].average}</td>
          <td class="${students[key].statusClass}">${students[key].status}</td>
        </tr>
      `;
    }

    html += `</table>`;
    teacherTable.innerHTML = html;
  });
}

function getGradeLevel(avg) {
  if (avg >= 90) return { text: "Excellent ⭐", className: "excellent" };
  if (avg >= 80) return { text: "Very Good ✅", className: "pass" };
  if (avg >= 70) return { text: "Good ✅", className: "pass" };
  if (avg >= 50) return { text: "Passed ✅", className: "pass" };
  return { text: "Failed ❌", className: "fail" };
}

function drawChart(student) {
  const ctx = document.getElementById("gradesChart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: student.subjects.map(s => s.subject),
      datasets: [{
        label: "Grades",
        data: student.subjects.map(s => s.grade)
      }]
    }
  });
}

function downloadPDF() {
  const content = document.getElementById("pdfContent");
  if (!content) {
    alert("No report to download");
    return;
  }

  html2pdf().from(content).save("student-report.pdf");
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

function changeLanguage() {}

showStudentLogin();
setRole("student");

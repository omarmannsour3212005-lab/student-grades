
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

let lastStudentData = null;
let chart = null;
let currentTeacher = localStorage.getItem("currentTeacher") || null;

const subjectTranslations = {
  en: {
    math: "Math", english: "English", arabic: "Arabic", hebrew: "Hebrew",
    physics: "Physics", chemistry: "Chemistry", biology: "Biology",
    history: "History", geography: "Geography", computer: "Computer",
    sport: "Sport", art: "Art", music: "Music", science: "Science",
    technology: "Technology", programming: "Programming",
    economics: "Economics", psychology: "Psychology"
  },
  ar: {
    math: "الرياضيات", english: "الإنجليزية", arabic: "العربية", hebrew: "العبرية",
    physics: "الفيزياء", chemistry: "الكيمياء", biology: "الأحياء",
    history: "التاريخ", geography: "الجغرافيا", computer: "الحاسوب",
    sport: "الرياضة", art: "الفنون", music: "الموسيقى", science: "العلوم",
    technology: "التكنولوجيا", programming: "البرمجة",
    economics: "الاقتصاد", psychology: "علم النفس"
  },
  he: {
    math: "מתמטיקה", english: "אנגלית", arabic: "ערבית", hebrew: "עברית",
    physics: "פיזיקה", chemistry: "כימיה", biology: "ביולוגיה",
    history: "היסטוריה", geography: "גיאוגרפיה", computer: "מחשבים",
    sport: "ספורט", art: "אמנות", music: "מוזיקה", science: "מדעים",
    technology: "טכנולוגיה", programming: "תכנות",
    economics: "כלכלה", psychology: "פסיכולוגיה"
  }
};

function showStudentLogin() {
  document.getElementById("studentLoginBox").style.display = "block";
  document.getElementById("teacherLoginBox").style.display = "none";
  document.getElementById("signUpBox").style.display = "none";
}

function showTeacherLogin() {
  document.getElementById("studentLoginBox").style.display = "none";
  document.getElementById("teacherLoginBox").style.display = "block";
  document.getElementById("signUpBox").style.display = "none";
}

function showSignUp() {
  document.getElementById("studentLoginBox").style.display = "none";
  document.getElementById("teacherLoginBox").style.display = "none";
  document.getElementById("signUpBox").style.display = "block";
}

function signUpTeacher() {
  const username = document.getElementById("teacherUsername").value.trim().toLowerCase();
  const password = document.getElementById("newTeacherPassword").value.trim();

  if (username === "" || password === "") {
    alert("Enter username and password");
    return;
  }

  db.ref("teachers/" + username).once("value")
    .then(snapshot => {
      if (snapshot.exists()) {
        alert("Username already exists");
        return;
      }

      return db.ref("teachers/" + username).set({
        password: password,
        students: {}
      });
    })
    .then(() => {
      showAlert("Account created successfully ✅", "success");
      showTeacherLogin();
    })
    .catch(error => {
      alert("Firebase error: " + error.message);
      console.error(error);
    });
}

function teacherEnter() {
  const username = document.getElementById("loginUsername").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  if (username === "" || password === "") {
    alert("Enter username and password");
    return;
  }

  db.ref("teachers/" + username).once("value")
    .then(snapshot => {
      if (!snapshot.exists()) {
        alert("User not found");
        return;
      }

      const teacher = snapshot.val();

      if (teacher.password !== password) {
        showAlert("Wrong password", "error")
        return;
      }

      currentTeacher = username;
      localStorage.setItem("currentTeacher", currentTeacher);

      document.getElementById("loginPage").style.display = "none";
      document.getElementById("app").style.display = "flex";

      setRole("teacher");
      loadTeacherTable();
    })
    .catch(error => {
      alert("Firebase error: " + error.message);
      console.error(error);
    });
}

function studentEnter() {
  const name = document.getElementById("studentLoginName").value.trim();

  if (name === "") {
    alert("Write your name");
    return;
  }

  document.getElementById("loginPage").style.display = "none";
  document.getElementById("app").style.display = "flex";

  document.getElementById("name").value = name;

  setRole("student");
  searchStudent();
}

function setRole(role) {
  const teacherArea = document.getElementById("teacherArea");
  const studentArea = document.getElementById("studentArea");

  if (role === "teacher") {
    teacherArea.style.display = "block";
    studentArea.style.display = "none";
  } else {
    teacherArea.style.display = "none";
    studentArea.style.display = "block";
  }

  document.getElementById("result").style.display = "none";
  document.getElementById("pdfBtn").style.display = "none";
}

function changeLanguage() {
  const lang = document.getElementById("language").value;

  document.querySelectorAll("[data-key]").forEach(el => {
    const key = el.getAttribute("data-key");
    el.innerText = subjectTranslations[lang][key];
  });

  if (lang === "ar") {
    document.getElementById("title").innerText = "نظام OM للعلامات";
    document.getElementById("subtitle").innerText = "نظام علامات للطلاب والمعلمين";
    document.getElementById("name").placeholder = "اسم الطالب";
    document.getElementById("studentBtn").innerText = "طالب";
    document.getElementById("teacherBtn").innerText = "معلم";
    document.getElementById("searchBtn").innerText = "ابحث عن الطالب";
    document.getElementById("nextBtn").innerText = "التالي";
    document.getElementById("dashboardTitle").innerText = "لوحة المعلم";
    document.getElementById("pdfBtn").innerText = "تحميل PDF";
  } else if (lang === "he") {
    document.getElementById("title").innerText = "מערכת ציונים OM";
    document.getElementById("subtitle").innerText = "מערכת ציונים לתלמידים ומורים";
    document.getElementById("name").placeholder = "שם התלמיד";
    document.getElementById("studentBtn").innerText = "תלמיד";
    document.getElementById("teacherBtn").innerText = "מורה";
    document.getElementById("searchBtn").innerText = "חפש תלמיד";
    document.getElementById("nextBtn").innerText = "הבא";
    document.getElementById("dashboardTitle").innerText = "לוח מורה";
    document.getElementById("pdfBtn").innerText = "הורד PDF";
  } else {
    document.getElementById("title").innerText = "OM Grade System";
    document.getElementById("subtitle").innerText = "Student & Teacher Grades System";
    document.getElementById("name").placeholder = "Student name";
    document.getElementById("studentBtn").innerText = "Student";
    document.getElementById("teacherBtn").innerText = "Teacher";
    document.getElementById("searchBtn").innerText = "Search Student";
    document.getElementById("nextBtn").innerText = "Next";
    document.getElementById("dashboardTitle").innerText = "Teacher Dashboard";
    document.getElementById("pdfBtn").innerText = "Download PDF";
  }

  document.body.dir = (lang === "ar" || lang === "he") ? "rtl" : "ltr";
}

function showInputs() {
  const selected = document.querySelectorAll(".subjects input:checked");
  const gradeInputs = document.getElementById("gradeInputs");

  gradeInputs.innerHTML = "";

  if (selected.length === 0) {
    alert("Choose at least one subject");
    return;
  }

  selected.forEach(subject => {
    gradeInputs.innerHTML += `
      <input 
        type="number" 
        class="grade" 
        data-subject="${subject.value}" 
        placeholder="${subject.value} grade"
        min="0"
        max="100"
      >
    `;
  });

  gradeInputs.innerHTML += `
    <button onclick="calculate()">Save Student Result</button>
  `;
}

function calculate() {
  const name = document.getElementById("name").value.trim();
  const grades = document.querySelectorAll(".grade");

  if (!currentTeacher) {
    alert("Teacher must login first");
    return;
  }

  if (name === "") {
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
    const subject = input.getAttribute("data-subject");
    const grade = Number(input.value);

    if (input.value === "" || grade < 0 || grade > 100) {
      alert("Each grade must be between 0 and 100");
      return;
    }

    sum += grade;
    subjects.push({ subject, grade });
  }

  const average = sum / grades.length;
  const level = getGradeLevel(average);

  const studentData = {
    name: name,
    teacher: currentTeacher,
    subjects: subjects,
    total: sum,
    average: average.toFixed(2),
    status: level.text,
    statusClass: level.className
  };

  saveStudent(studentData);
  showReport(studentData);
  loadTeacherTable();

  alert("Student result saved online");
}

function getGradeLevel(avg) {
  if (avg >= 90) return { text: "Excellent ⭐", className: "excellent" };
  if (avg >= 80) return { text: "Very Good ✅", className: "pass" };
  if (avg >= 70) return { text: "Good ✅", className: "pass" };
  if (avg >= 50) return { text: "Passed ✅", className: "pass" };
  return { text: "Failed ❌", className: "fail" };
}

function saveStudent(studentData) {
  const key = studentData.name.toLowerCase();

  db.ref("teachers/" + currentTeacher + "/students/" + key).set(studentData);
  db.ref("students/" + key).set(studentData);
}

function searchStudent() {
  const name = document.getElementById("name").value.trim().toLowerCase();

  if (name === "") {
    alert("Write student name first");
    return;
  }

  db.ref("students/" + name).once("value").then(snapshot => {
    if (!snapshot.exists()) {
      document.getElementById("result").style.display = "block";
      document.getElementById("result").innerHTML = `
        <h3>Student not found ❌</h3>
        <p>Make sure you wrote the same name saved by the teacher.</p>
      `;
      document.getElementById("pdfBtn").style.display = "none";
      return;
    }

    showReport(snapshot.val());
  });
}

function showReport(student) {
  lastStudentData = student;

  let rows = "";

  student.subjects.forEach(item => {
    rows += `
      <tr>
        <td>${item.subject}</td>
        <td>${item.grade}</td>
      </tr>
    `;
  });

  const result = document.getElementById("result");
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
  document.getElementById("pdfBtn").style.display = "block";
}

function loadTeacherTable() {
  const teacherTable = document.getElementById("teacherTable");

  if (!currentTeacher) {
    teacherTable.innerHTML = "";
    return;
  }

  db.ref("teachers/" + currentTeacher + "/students").once("value").then(snapshot => {
    let students = snapshot.exists() ? snapshot.val() : {};

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

function drawChart(student) {
  const ctx = document.getElementById("gradesChart");

  if (chart) {
    chart.destroy();
  }

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

  html2pdf()
    .from(content)
    .save("student-report.pdf");
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

showStudentLogin();

function showAlert(message, type = "info") {
  const overlay = document.getElementById("customAlert");
  const title = document.getElementById("alertTitle");
  const text = document.getElementById("alertMessage");

  text.innerText = message;

  if (type === "success") title.innerText = "Success ✅";
  else if (type === "error") title.innerText = "Error ❌";
  else title.innerText = "Notice ℹ️";

  overlay.classList.add("show");
}

function closeAlert() {
  document.getElementById("customAlert").classList.remove("show");
}

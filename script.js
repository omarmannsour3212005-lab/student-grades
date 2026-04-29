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
    economics: "Economics", psychology: "Psychology",
    report: "Student Report", subject: "Subject", grade: "Grade",
    name: "Name", total: "Total", average: "Average",
    result: "Result", status: "Status", dashboard: "Teacher Dashboard"
  },

  ar: {
    math: "الرياضيات", english: "الإنجليزية", arabic: "العربية", hebrew: "العبرية",
    physics: "الفيزياء", chemistry: "الكيمياء", biology: "الأحياء",
    history: "التاريخ", geography: "الجغرافيا", computer: "الحاسوب",
    sport: "الرياضة", art: "الفنون", music: "الموسيقى", science: "العلوم",
    technology: "التكنولوجيا", programming: "البرمجة",
    economics: "الاقتصاد", psychology: "علم النفس",
    report: "تقرير الطالب", subject: "المادة", grade: "العلامة",
    name: "الاسم", total: "المجموع", average: "المعدل",
    result: "النتيجة", status: "الحالة", dashboard: "لوحة المعلم"
  },

  he: {
    math: "מתמטיקה", english: "אנגלית", arabic: "ערבית", hebrew: "עברית",
    physics: "פיזיקה", chemistry: "כימיה", biology: "ביולוגיה",
    history: "היסטוריה", geography: "גיאוגרפיה", computer: "מחשבים",
    sport: "ספורט", art: "אמנות", music: "מוזיקה", science: "מדעים",
    technology: "טכנולוגיה", programming: "תכנות",
    economics: "כלכלה", psychology: "פסיכולוגיה",
    report: "דוח תלמיד", subject: "מקצוע", grade: "ציון",
    name: "שם", total: "סך הכל", average: "ממוצע",
    result: "תוצאה", status: "סטטוס", dashboard: "לוח מורה"
  }
};

function getT() {
  const lang = document.getElementById("language")?.value || "en";
  return subjectTranslations[lang];
}

function translateSubject(subject) {
  const lang = document.getElementById("language")?.value || "en";
  const key = subject.toLowerCase();
  return subjectTranslations[lang][key] || subject;
}

function translateStatus(status) {
  const lang = document.getElementById("language")?.value || "en";

  const map = {
    en: {
      "Excellent ⭐": "⭐ Excellent",
      "Very Good ✅": "✅ Very Good",
      "Good ✅": "✅ Good",
      "Passed ✅": "✅ Passed",
      "Failed ❌": "❌ Failed"
    },
    ar: {
      "Excellent ⭐": "⭐ ممتاز",
      "Very Good ✅": "✅ جيد جداً",
      "Good ✅": "✅ جيد",
      "Passed ✅": "✅ ناجح",
      "Failed ❌": "❌ راسب"
    },
    he: {
      "Excellent ⭐": "⭐ מצוין",
      "Very Good ✅": "✅ טוב מאוד",
      "Good ✅": "✅ טוב",
      "Passed ✅": "✅ עבר",
      "Failed ❌": "❌ נכשל"
    }
  };

  return map[lang][status] || status;
}

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
    showAlert("Enter username and password", "error");
    return;
  }

  db.ref("teachers/" + username).once("value")
    .then(snapshot => {
      if (snapshot.exists()) {
        showAlert("Username already exists", "error");
        return;
      }

      return db.ref("teachers/" + username).set({
        password: password,
        students: {}
      });
    })
    .then(() => {
      showAlert("Account created successfully", "success");
      showTeacherLogin();
    })
    .catch(error => {
      showAlert("Firebase error: " + error.message, "error");
      console.error(error);
    });
}

function teacherEnter() {
  const username = document.getElementById("loginUsername").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  if (username === "" || password === "") {
    showAlert("Enter username and password", "error");
    return;
  }

  db.ref("teachers/" + username).once("value")
    .then(snapshot => {
      if (!snapshot.exists()) {
        showAlert("User not found", "error");
        return;
      }

      const teacher = snapshot.val();

      if (teacher.password !== password) {
        showAlert("Wrong password", "error");
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
      showAlert("Firebase error: " + error.message, "error");
      console.error(error);
    });
}

function studentEnter() {
  const name = document.getElementById("studentLoginName").value.trim();

  if (name === "") {
    showAlert("Write your name", "error");
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
  const t = subjectTranslations[lang];

  document.querySelectorAll("[data-key]").forEach(el => {
    const key = el.getAttribute("data-key");
    el.innerText = t[key];
  });

  if (lang === "ar") {
    document.getElementById("title").innerText = "نظام OM للعلامات";
    document.getElementById("subtitle").innerText = "نظام علامات للطلاب والمعلمين";
    document.getElementById("name").placeholder = "اسم الطالب";
    document.getElementById("studentBtn").innerText = "طالب";
    document.getElementById("teacherBtn").innerText = "معلم";
    document.getElementById("searchBtn").innerText = "ابحث عن الطالب";
    document.getElementById("nextBtn").innerText = "التالي";
    document.getElementById("pdfBtn").innerText = "تحميل PDF";
  } else if (lang === "he") {
    document.getElementById("title").innerText = "מערכת ציונים OM";
    document.getElementById("subtitle").innerText = "מערכת ציונים לתלמידים ומורים";
    document.getElementById("name").placeholder = "שם התלמיד";
    document.getElementById("studentBtn").innerText = "תלמיד";
    document.getElementById("teacherBtn").innerText = "מורה";
    document.getElementById("searchBtn").innerText = "חפש תלמיד";
    document.getElementById("nextBtn").innerText = "הבא";
    document.getElementById("pdfBtn").innerText = "הורד PDF";
  } else {
    document.getElementById("title").innerText = "OM Grade System";
    document.getElementById("subtitle").innerText = "Student & Teacher Grades System";
    document.getElementById("name").placeholder = "Student name";
    document.getElementById("studentBtn").innerText = "Student";
    document.getElementById("teacherBtn").innerText = "Teacher";
    document.getElementById("searchBtn").innerText = "Search Student";
    document.getElementById("nextBtn").innerText = "Next";
    document.getElementById("pdfBtn").innerText = "Download PDF";
  }

  document.getElementById("dashboardTitle").innerText = t.dashboard;
  document.body.dir = (lang === "ar" || lang === "he") ? "rtl" : "ltr";

  if (lastStudentData) showReport(lastStudentData);
  loadTeacherTable();
}

function showInputs() {
  const selected = document.querySelectorAll(".subjects input:checked");
  const gradeInputs = document.getElementById("gradeInputs");

  gradeInputs.innerHTML = "";

  if (selected.length === 0) {
    showAlert("Choose at least one subject", "error");
    return;
  }

  selected.forEach(subject => {
    gradeInputs.innerHTML += `
      <input 
        type="number" 
        class="grade" 
        data-subject="${subject.value}" 
        placeholder="${translateSubject(subject.value)} grade"
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
    showAlert("Teacher must login first", "error");
    return;
  }

  if (name === "") {
    showAlert("Write student name first", "error");
    return;
  }

  if (grades.length === 0) {
    showAlert("Choose subjects first", "error");
    return;
  }

  let sum = 0;
  let subjects = [];

  for (let input of grades) {
    const subject = input.getAttribute("data-subject");
    const grade = Number(input.value);

    if (input.value === "" || grade < 0 || grade > 100) {
      showAlert("Each grade must be between 0 and 100", "error");
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

  showAlert("Student result saved online", "success");
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
    showAlert("Write student name first", "error");
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

  const t = getT();
  let rows = "";

  student.subjects.forEach(item => {
    rows += `
      <tr>
        <td>${translateSubject(item.subject)}</td>
        <td>${item.grade}</td>
      </tr>
    `;
  });

  const result = document.getElementById("result");
  result.style.display = "block";

  result.innerHTML = `
    <div id="pdfContent">
      <h3>${t.report}</h3>
      <p><b>${t.name}:</b> ${student.name}</p>

      <table>
        <tr>
          <th>${t.subject}</th>
          <th>${t.grade}</th>
        </tr>
        ${rows}
      </table>

      <p><b>${t.total}:</b> ${student.total}</p>
      <p><b>${t.average}:</b> ${student.average}</p>
      <p><b>${t.result}:</b> <span class="${student.statusClass}">${translateStatus(student.status)}</span></p>
    </div>
  `;

  drawChart(student);
  document.getElementById("pdfBtn").style.display = "block";
}

function loadTeacherTable() {
  const teacherTable = document.getElementById("teacherTable");
  const t = getT();

  if (!currentTeacher) {
    teacherTable.innerHTML = "";
    return;
  }

  db.ref("teachers/" + currentTeacher + "/students").once("value").then(snapshot => {
    let students = snapshot.exists() ? snapshot.val() : {};

    let html = `
      <table>
        <tr>
          <th>${t.status}</th>
          <th>${t.average}</th>
          <th>${t.name}</th>
        </tr>
    `;

    for (let key in students) {
      html += `
        <tr>
          <td class="${students[key].statusClass}">
            ${translateStatus(students[key].status)}
          </td>
          <td>${students[key].average}</td>
          <td>${students[key].name}</td>
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
      labels: student.subjects.map(s => translateSubject(s.subject)),
      datasets: [{
        label: getT().grade,
        data: student.subjects.map(s => s.grade)
      }]
    }
  });
}

function downloadPDF() {
  const content = document.getElementById("pdfContent");

  if (!content) {
    showAlert("No report to download", "error");
    return;
  }

  html2pdf().from(content).save("student-report.pdf");
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

function showAlert(message, type = "info") {
  const overlay = document.getElementById("customAlert");
  const title = document.getElementById("alertTitle");
  const text = document.getElementById("alertMessage");
  const icon = document.getElementById("alertIcon");

  if (!overlay) return;

  text.innerText = message;

  if (type === "success") {
    title.innerText = "Success";
    icon.innerText = "✅";
  } else if (type === "error") {
    title.innerText = "Error";
    icon.innerText = "❌";
  } else {
    title.innerText = "Notice";
    icon.innerText = "ℹ️";
  }

  overlay.classList.add("show");
}

function closeAlert() {
  document.getElementById("customAlert").classList.remove("show");
}

showStudentLogin();
changeLanguage();

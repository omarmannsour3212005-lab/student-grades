// FIREBASE
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

// SWITCH
function showStudentLogin() {
  document.getElementById("studentBox").style.display = "block";
  document.getElementById("teacherBox").style.display = "none";
  document.getElementById("signupBox").style.display = "none";
}

function showTeacherLogin() {
  document.getElementById("studentBox").style.display = "none";
  document.getElementById("teacherBox").style.display = "block";
  document.getElementById("signupBox").style.display = "none";
}

function showSignUp() {
  document.getElementById("studentBox").style.display = "none";
  document.getElementById("teacherBox").style.display = "none";
  document.getElementById("signupBox").style.display = "block";
}

// STUDENT
function studentEnter() {
  const name = document.getElementById("studentName").value.toLowerCase();

  db.ref("students/" + name).once("value")
    .then(snap => {
      if (!snap.exists()) {
        alert("Student not found ❌");
        return;
      }

      const data = snap.val();
      let html = `<h3>${data.name}</h3>`;

      data.subjects.forEach(s => {
        html += `<p>${s.subject}: ${s.grade}</p>`;
      });

      html += `<p>Average: ${data.average}</p>`;

      document.getElementById("result").innerHTML = html;
    });
}

// TEACHER
function teacherEnter() {
  const pass = document.getElementById("teacherPassword").value;

  if (pass !== "1234") {
    alert("Wrong password");
    return;
  }

  alert("Teacher mode enabled");

  // example add student
  const student = {
    name: "omar",
    subjects: [
      {subject: "Math", grade: 90},
      {subject: "English", grade: 85}
    ],
    average: 87.5
  };

  db.ref("students/omar").set(student);
}

// SIGN UP
function signUp() {
  alert("Sign up saved (demo)");
}

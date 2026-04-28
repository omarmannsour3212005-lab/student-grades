function calculate() {
  let name = document.getElementById("name").value;

  let arabic = Number(document.getElementById("arabic").value);
  let english = Number(document.getElementById("english").value);
  let math = Number(document.getElementById("math").value);
  let physics = Number(document.getElementById("physics").value);
  let chemistry = Number(document.getElementById("chemistry").value);
  let sport = Number(document.getElementById("sport").value);
  let biology = Number(document.getElementById("biology").value);

  let sum = arabic + english + math + physics + chemistry + sport + biology;
  let average = sum / 7;

 let color = average >= 50 ? "green" : "red";

document.getElementById("result").innerHTML = `
  <h3>Student Report</h3>
  <p><b>Name:</b> ${name}</p>
  <p><b>Sum:</b> ${sum}</p>
  <p><b>Average:</b> ${average.toFixed(2)}</p>
  <p style="color:${color};"><b>Result:</b> ${result}</p>
`;
}
let result;

if (average >= 50) {
  result = "Pass ✅";
} else {
  result = "Fail ❌";
}
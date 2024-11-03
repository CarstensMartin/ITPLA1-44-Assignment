// Array to store student data
let students = [];

// Load data from selected file
function loadData() {
  const fileInput = document.getElementById("fileInput").files[0];
  if (!fileInput) {
    return alert("Please select a file to load.");
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const lines = event.target.result.split("\n");
    students = lines.map((line) => {
      const [id, firstName, lastName, courses, attendance] = line.split(",");

      // Split the courses field into an array
      const coursesArray = courses ? courses.split(";") : [];

      // Parse attendance into an object (e.g. { ITPLA1-44: 3, ITCNA1-44: 2 })
      const attendanceObj = {};
      if (attendance) {
        attendance.split(";").forEach((entry) => {
          const [course, count] = entry.split(":");
          attendanceObj[course] = parseInt(count, 10);
        });
      }

      return {
        id,
        firstName,
        lastName,
        courses: coursesArray,
        attendance: attendanceObj,
      };
    });
    alert("Data loaded successfully!");
  };
  reader.readAsText(fileInput);
}

// Register a new student
function registerStudent() {
  const id = document.getElementById("studentId").value;
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const courses = document.getElementById("courses").value.split(",");

  if (!id || !firstName || !lastName) {
    return alert("Please fill out all fields.");
  }

  students.push({ id, firstName, lastName, courses, attendance: {} });

  // Clear the input fields
  document.getElementById("studentId").value = "";
  document.getElementById("firstName").value = "";
  document.getElementById("lastName").value = "";
  document.getElementById("courses").value = "";

  alert("Student registered successfully!");
}

// Add courses to an existing student
function addCourses() {
  const id = document.getElementById("studentIdCourse").value;
  const newCourses = document.getElementById("newCourses").value.split(",");

  const student = students.find((s) => s.id === id);
  if (!student) {
    return alert("Student not found.");
  }

  student.courses.push(...newCourses);

  // Clear the input fields
  document.getElementById("studentIdCourse").value = "";
  document.getElementById("newCourses").value = "";

  alert("Courses added successfully!");
}

// Mark attendance for a course
function markAttendance() {
  const courseName = document.getElementById("courseAttendance").value;
  const studentId = document.getElementById("studentIdAttendance").value;

  const student = students.find((s) => s.id === studentId);
  if (!student) {
    return alert("Student not found.");
  }

  if (!student.courses.includes(courseName)) {
    return alert("Student is not enrolled in this course.");
  }

  if (!student.attendance[courseName]) {
    student.attendance[courseName] = 0;
  }

  student.attendance[courseName] += 1;

  // Clear the input fields
  document.getElementById("courseAttendance").value = "";
  document.getElementById("studentIdAttendance").value = "";

  alert("Attendance marked!");
}

// Generate attendance report

function generateReport() {
  const reportContainer = document.getElementById("reportContainer");
  reportContainer.innerHTML = ""; // Clear previous report

  if (students.length === 0) {
    reportContainer.innerHTML =
      "<p>No data available to generate a report.</p>";
    return;
  }

  const table = document.createElement("table");
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = `<th>ID Number</th><th>First Name</th><th>Last Name</th><th>Course</th><th>Attendance Count</th>`;
  table.appendChild(headerRow);

  students.forEach((student) => {
    // Loop over each course the student is registered for
    student.courses.forEach((course) => {
      // Check attendance count for the course (default to 0 if not found)
      const attendanceCount = student.attendance[course] || 0;

      // Create a row for each course with attendance information
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${student.id}</td>
        <td>${student.firstName}</td>
        <td>${student.lastName}</td>
        <td>${course}</td>
        <td>${attendanceCount}</td>
      `;
      table.appendChild(row);
    });
  });

  reportContainer.appendChild(table);
}

// Save data to a local file
function saveData() {
  // Create a string to save the data
  const data = students
    .map((student) => {
      const courseStr = student.courses.join(";");
      const attendanceStr = Object.entries(student.attendance)
        .map(([course, count]) => `${course}:${count}`)
        .join(";");
      return `${student.id},${student.firstName},${student.lastName},${courseStr},${attendanceStr}`;
    })
    .join("\n");

  // Get today' date to be added to the saved file name
  const currentDate = new Date();
  const today = currentDate.toDateString();

  // Download the text document to the user' computer
  const blob = new Blob([data], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `students file ` + today + `.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
  alert(`Data saved to students file ` + today + `.txt`);
}

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
      const [id, firstName, lastName, courses, attendance, completion] =
        line.split(",");

      // Split the courses field into an array
      const coursesArray = courses ? courses.split(";") : [];

      // Parse attendance into an object (e.g., { ITPLA: 3, ITCNA: 2 })
      const attendanceObj = {};
      if (attendance) {
        attendance.split(";").forEach((entry) => {
          const [course, count] = entry.split(":");
          attendanceObj[course] = parseInt(count, 10);
        });
      }

      // Parse completion into an object (e.g., { ITPLA: true, ITCNA: false })
      const completionObj = {};
      if (completion) {
        completion.split(";").forEach((entry) => {
          const [course, status] = entry.split(":");
          completionObj[course] = status === "true";
        });
      }

      return {
        id,
        firstName,
        lastName,
        courses: coursesArray,
        attendance: attendanceObj,
        completed: completionObj,
      };
    });
    alert("Data loaded successfully!");
  };
  reader.readAsText(fileInput);
}

// Register a new student
function registerStudent() {
  const id = document.getElementById("studentId").value.trim();
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const courses = document.getElementById("courses").value.split(",");

  if (!id || !firstName || !lastName) {
    return alert("Please fill out all fields.");
  }

  students.push({ id, firstName, lastName, courses, attendance: {} });

  // Clear the input fields to avoid confusion
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

// Mark course completion for a student
function markCompletion() {
  const studentId = document.getElementById("studentIdCompletion").value;
  const courseName = document.getElementById("courseCompletion").value;
  // Convert Drop down field input to boolean
  const isCompleted = document.getElementById("isCompleted").value === "true";

  const student = students.find((s) => s.id === studentId);
  if (!student) {
    return alert("Student not found.");
  }

  // Check if the student is registered for the course
  if (!student.courses.includes(courseName)) {
    return alert("Student is not enrolled in this course.");
  }

  // Initialize the completed object if it doesn’t exist
  if (!student.completed) student.completed = {};

  // Set the completion status for the course
  student.completed[courseName] = isCompleted;
  alert(
    `Completion status for course "${courseName}" has been set to ${
      isCompleted ? "completed" : "not completed"
    }.`
  );

  // Clear the input fields
  document.getElementById("studentIdCompletion").value = "";
  document.getElementById("courseCompletion").value = "";
  document.getElementById("isCompleted").value = "t";
}

// Check eligibility for a course based on age, attendance, and prerequisite completion
function checkEligibility() {
  const studentId = document.getElementById("eligibilityStudentId").value;
  const prereqCourse = document.getElementById("eligibilityPrereqCourse").value;
  const totalClasses = parseInt(
    document.getElementById("eligibilityTotalClasses").value,
    10
  );

  // Find the student by ID
  const student = students.find((s) => s.id === studentId);
  if (!student) {
    document.getElementById("eligibilityResult").textContent =
      "Student not found.";
    return;
  }

  // Calculate student's age
  const birthYear = parseInt(studentId.slice(0, 2), 10);
  const birthMonth = parseInt(studentId.slice(2, 4), 10) - 1; // Months are zero-indexed in JavaScript
  const birthDay = parseInt(studentId.slice(4, 6), 10);
  const currentDate = new Date();
  // To be revised in 2050
  const birthDate = new Date(
    birthYear < 50 ? 2000 + birthYear : 1900 + birthYear,
    birthMonth,
    birthDay
  );

  let age = currentDate.getFullYear() - birthDate.getFullYear();
  if (
    currentDate <
    new Date(
      currentDate.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    )
  ) {
    age--;
  }

  // Age criteria check
  if (age < 18 || age > 35) {
    document.getElementById(
      "eligibilityResult"
    ).textContent = `Ineligible due to age. Age: ${age}`;
    return;
  }

  // Attendance check (75% attendance in prerequisite course)
  const attendanceCount = student.attendance[prereqCourse] || 0;
  const attendanceRate = (attendanceCount / totalClasses) * 100;
  if (attendanceRate < 75) {
    document.getElementById(
      "eligibilityResult"
    ).textContent = `Ineligible due to attendance. Attendance rate: ${attendanceRate.toFixed(
      2
    )}%`;
    return;
  }

  // Completion check (must have successfully completed the prerequisite course)
  const hasCompletedCourse =
    student.completed && student.completed[prereqCourse];
  if (!hasCompletedCourse) {
    document.getElementById(
      "eligibilityResult"
    ).textContent = `Ineligible due to incomplete prerequisite course: ${prereqCourse}`;
    return;
  }

  // If all criteria are met
  document.getElementById("eligibilityResult").textContent =
    "The student is eligible for the course.";
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
  headerRow.innerHTML = `<th>ID Number</th><th>First Name</th><th>Last Name</th><th>Course</th><th>Attendance Count</th><th>Attendance %</th><th>Completed</th>`;
  table.appendChild(headerRow);

  students.forEach((student) => {
    student.courses.forEach((course) => {
      const attendanceCount = student.attendance[course] || 0;
      const completionStatus =
        student.completed && student.completed[course] ? "Yes" : "No";

      const row = document.createElement("tr");
      // Attendance % is based on each module is 1 quarter and 7 classes as Eduvos as 7 classes in a quarter
      row.innerHTML = `
          <td>${student.id}</td>
          <td>${student.firstName}</td>
          <td>${student.lastName}</td>
          <td>${course}</td>
          <td>${attendanceCount}</td>
          <td>${((attendanceCount / 7) * 100).toFixed(2)}%</td>
          <td>${completionStatus}</td>
        `;
      table.appendChild(row);
    });
  });

  reportContainer.appendChild(table);
}

// Generate performance report for each student, showing attendance percentage and performance level

function generatePerformanceReport() {
  // Total classes per course As per Eduvos Classes per quarter
  const totalClasses = 7;
  const reportContainer = document.getElementById("performanceReportContainer");
  reportContainer.innerHTML = ""; // Clear previous report

  if (students.length === 0) {
    reportContainer.innerHTML =
      "<p>No data available to generate a report.</p>";
    return;
  }

  const table = document.createElement("table");
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = `<th>ID Number</th><th>First Name</th><th>Last Name</th><th>Average Attendance %</th><th>Performance</th>`;
  table.appendChild(headerRow);

  // Outer loop: Iterate through each student
  students.forEach((student) => {
    if (student.courses.length === 0) {
      return; // Skip students with no courses
    }

    // Calculate the average attendance across all courses
    let totalAttendance = 0;
    student.courses.forEach((course) => {
      totalAttendance += student.attendance[course] || 0; // Attendance count for this course (default to 0 if undefined)
    });
    const averageAttendance =
      (totalAttendance / (student.courses.length * totalClasses)) * 100;

    // Determine performance level based on average attendance percentage
    let performance;
    if (averageAttendance > 90) {
      performance = "Excellent";
    } else if (averageAttendance > 70) {
      performance = "Good";
    } else if (averageAttendance > 50) {
      performance = "Average";
    } else {
      performance = "Needs Improvement";
    }

    // Create a row for each student with average attendance
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${student.id}</td>
        <td>${student.firstName}</td>
        <td>${student.lastName}</td>
        <td>${averageAttendance.toFixed(2)}%</td>
        <td>${performance}</td>
      `;
    table.appendChild(row);
  });

  reportContainer.appendChild(table);
}

// Generate a report listing all students registered for a specific module
function generateModuleReport() {
  const moduleName = document.getElementById("moduleNameInput").value.trim();
  const reportContainer = document.getElementById("moduleReportContainer");
  reportContainer.innerHTML = ""; // Clear previous report

  // Error handling: Check if the module name is provided
  if (!moduleName) {
    alert(`Error: Please enter a course name.`);
    return;
  }

  // Filter students who are registered for the specified module
  const registeredStudents = students.filter((student) =>
    student.courses.includes(moduleName)
  );

  // Error handling: Check if any students are registered for the module
  if (registeredStudents.length === 0) {
    reportContainer.innerHTML = `<p>No students found for the course: ${moduleName}</p>`;
    return;
  }

  // Create a table for the report
  const table = document.createElement("table");
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = `<th>ID Number</th><th>First Name</th><th>Last Name</th>`;
  table.appendChild(headerRow);

  // Populate the table with students registered for the module
  registeredStudents.forEach((student) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${student.id}</td>
        <td>${student.firstName}</td>
        <td>${student.lastName}</td>
      `;
    table.appendChild(row);
  });

  // Display the report
  reportContainer.appendChild(table);
}

// Save data to a local file
function saveData() {
  // Create a string to save the data
  let data = students
    .map((student) => {
      // Join courses into a single string separated by `;`
      const coursesStr = student.courses.join(";");

      // Convert attendance to `course:count` format
      const attendanceStr = Object.entries(student.attendance || {})
        .map(([course, count]) => `${course}:${count}`)
        .join(";");

      // Convert completion status to `course:status` format
      const completionStr = Object.entries(student.completed || {})
        .map(([course, status]) => `${course}:${status}`)
        .join(";");

      // Construct a line of data for each student
      return `${student.id},${student.firstName},${student.lastName},${coursesStr},${attendanceStr},${completionStr}`;
    })
    .join("\n");

  // Get today' date to be added to the saved file name
  const currentDate = new Date();
  const today = currentDate.toDateString();

  // Download the text document to the user' computer
  const blob = new Blob([data], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `students file ` + today + `.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  alert(`Data saved to students file ` + today + `.csv`);
}

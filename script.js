import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, query, where, getDocs, limit, Timestamp, updateDoc, doc 
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { 
  getAuth, signInWithEmailAndPassword, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDL56ekmdndk3wd099KuJWUyogRUa3bwW8",
  authDomain: "kidstars-7434d.firebaseapp.com",
  projectId: "kidstars-7434d",
  storageBucket: "kidstars-7434d.appspot.com",
  messagingSenderId: "616350873520",
  appId: "1:616350873520:web:9d765d0bf5a483fa964875",
  measurementId: "G-FJMK0F1LRN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

//
// Authentication Functions
//

// Login user
window.loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Login successful:", userCredential.user);
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("app").style.display = "block";
  } catch (error) {
    console.error("Login error:", error.message);
    alert("Login failed: " + error.message);
  }
};

// Check authentication state
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is logged in:", user);
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("app").style.display = "block";
  } else {
    console.log("User is not logged in.");
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("app").style.display = "none";
  }
});

//
// Section Navigation
//

window.showSection = (sectionId) => {
  document.querySelectorAll(".section").forEach((section) => section.classList.add("hidden"));
  document.getElementById(sectionId).classList.remove("hidden");
};

//
// Attendance Functions
//

// Mark attendance
window.markAttendance = async () => {
  const name = document.getElementById("student-name").value.trim();
  const time = new Date(document.getElementById("attendance-time").value);
  const selectedClass = document.getElementById("attendance-class").value;
  const content = document.getElementById("attendance-content").value.trim();
  const isAbsent = document.getElementById("absent-checkbox").checked;

  if (!name || isNaN(time) || !selectedClass) {
    alert("Please fill out all required fields.");
    return;
  }

  try {
    const studentQuery = query(collection(db, "students"), where("name", "==", name), limit(1));
    const studentSnapshot = await getDocs(studentQuery);

    if (studentSnapshot.empty) {
      alert("Student not found!");
      return;
    }

    const studentDoc = studentSnapshot.docs[0];
    const studentData = studentDoc.data();
    let numberOfLessons = studentData.numberOfLessons || 0;

    if (!isAbsent && numberOfLessons > 0) {
      numberOfLessons--;
    }

    await addDoc(collection(db, "attendance"), {
      name,
      date: Timestamp.fromDate(time),
      classes: [selectedClass],
      content,
      absent: isAbsent,
    });

    await updateDoc(doc(db, "students", studentDoc.id), { numberOfLessons });

    const statusMessage = isAbsent
      ? "Marked absent successfully."
      : `Attendance marked successfully. Remaining lessons: ${numberOfLessons}`;
    alert(statusMessage);

  } catch (error) {
    console.error("Error marking attendance:", error.message);
    alert("Failed to mark attendance.");
  }
};

//
// Add New Student
//

window.addStudent = async () => {
  const name = document.getElementById("new-student-name").value.trim();
  const numberOfLessons = parseInt(document.getElementById("number-of-lessons").value, 10);
  const classes = ["Piano", "Guitar", "Vocal", "Drawing", "Dance", "MC"].filter(
    (classType) => document.getElementById(classType.toLowerCase()).checked
  );

  if (!name || classes.length === 0 || isNaN(numberOfLessons) || numberOfLessons < 1) {
    alert("Please enter valid name, classes, and lesson count.");
    return;
  }

  try {
    await addDoc(collection(db, "students"), { name, classes, numberOfLessons });
    alert("Student added successfully!");
  } catch (error) {
    console.error("Error adding student:", error.message);
    alert("Failed to add student.");
  }
};

//
// Query Functions
//

// Query student records
window.queryStudent = async () => {
  const name = document.getElementById("query-student-name").value.trim();
  const startDate = new Date(document.getElementById("query-student-start-date").value);
  const endDate = new Date(document.getElementById("query-student-end-date").value);

  if (!name || isNaN(startDate) || isNaN(endDate)) {
    alert("Please provide valid name and date range.");
    return;
  }

  try {
    const studentQuery = query(
      collection(db, "attendance"),
      where("name", "==", name),
      where("date", ">=", Timestamp.fromDate(startDate)),
      where("date", "<=", Timestamp.fromDate(endDate)),
      limit(50)
    );

    const querySnapshot = await getDocs(studentQuery);
    displayResults(querySnapshot, "query-student-result");

  } catch (error) {
    console.error("Error querying student records:", error.message);
    alert("Failed to query records.");
  }
};

// Query attendance by time range
window.queryByTime = async () => {
  const startDate = new Date(document.getElementById("query-time-start-date").value);
  const endDate = new Date(document.getElementById("query-time-end-date").value);
  const selectedClass = document.getElementById("query-time-class").value;

  if (isNaN(startDate) || isNaN(endDate)) {
    alert("Please provide valid date range.");
    return;
  }

  try {
    const attendanceQuery = query(
      collection(db, "attendance"),
      where("date", ">=", Timestamp.fromDate(startDate)),
      where("date", "<=", Timestamp.fromDate(endDate)),
      ...(selectedClass ? [where("classes", "array-contains", selectedClass)] : []),
      limit(50)
    );

    const querySnapshot = await getDocs(attendanceQuery);
    displayResults(querySnapshot, "query-time-result");

  } catch (error) {
    console.error("Error querying attendance by time:", error.message);
    alert("Failed to query attendance by time.");
  }
};

//
// Utility Functions
//

function displayResults(querySnapshot, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (querySnapshot.empty) {
    container.innerHTML = "<p>No results found.</p>";
    return;
  }

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const resultCard = `
      <div class="result-card">
        <h3>${data.name}</h3>
        <p><strong>Date:</strong> ${data.date.toDate().toLocaleString()}</p>
        <p><strong>Classes:</strong> ${data.classes.join(", ")}</p>
        <p><strong>Status:</strong> ${data.absent ? "Absent" : "Present"}</p>
        <p><strong>Content:</strong> ${data.content || "N/A"}</p>
      </div>`;
    container.innerHTML += resultCard;
  });
}

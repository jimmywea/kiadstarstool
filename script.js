import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, Timestamp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDL56ekmdndk3wd099KuJWUyogRUa3bwW8",
  authDomain: "kidstars-7434d.firebaseapp.com",
  projectId: "kidstars-7434d",
  storageBucket: "kidstars-7434d.appspot.com",
  messagingSenderId: "616350873520",
  appId: "1:616350873520:web:9d765d0bf5a483fa964875",
  measurementId: "G-FJMK0F1LRN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
}

async function markAttendance() {
  const name = document.getElementById('student-name').value;
  const time = new Date(document.getElementById('attendance-time').value);
  try {
    await addDoc(collection(db, 'attendance'), { name, date: Timestamp.fromDate(time), classes: ["Piano"] });
    document.getElementById('attendance-status').innerText = 'Điểm danh thành công';
  } catch (error) {
    document.getElementById('attendance-status').innerText = 'Điểm danh thất bại';
  }
}

async function queryStudent() {
  const name = document.getElementById('query-student-name').value;
  const date = document.getElementById('query-student-date').value;
  const studentQuery = query(collection(db, 'attendance'), where("name", "==", name));
  const querySnapshot = await getDocs(studentQuery);
  let result = '';

  querySnapshot.forEach(doc => {
    const data = doc.data();
    if (data.date.toDate().toISOString().startsWith(date)) {
      result += `${data.date.toDate().toLocaleString()} - ${data.classes.join(', ')}\n`;
    }
  });

  document.getElementById('query-student-result').innerText = result || 'Không có dữ liệu';
}

async function queryByTime() {
  const date = document.getElementById('query-time-date').value;
  const startTime = document.getElementById('query-start-time').value;
  const endTime = document.getElementById('query-end-time').value;
  const startTimestamp = new Date(`${date}T${startTime}`);
  const endTimestamp = new Date(`${date}T${endTime}`);

  const timeQuery = query(collection(db, 'attendance'), where("date", ">=", Timestamp.fromDate(startTimestamp)), where("date", "<=", Timestamp.fromDate(endTimestamp)));
  const querySnapshot = await getDocs(timeQuery);
  let result = '';

  querySnapshot.forEach(doc => {
    const data = doc.data();
    result += `${data.name} - ${data.date.toDate().toLocaleString()}\n`;
  });

  document.getElementById('query-time-result').innerText = result || 'Không có dữ liệu';
}

async function addStudent() {
  const name = document.getElementById('new-student-name').value;
  const subjects = [];
  ['piano', 'guitar', 'vocal', 'drawing', 'dance', 'mc'].forEach(id => {
    if (document.getElementById(id).checked) subjects.push(document.getElementById(id).value);
  });

  try {
    await addDoc(collection(db, 'students'), { name, classes: subjects });
    document.getElementById('add-student-status').innerText = 'Thêm học sinh thành công';
  } catch (error) {
    document.getElementById('add-student-status').innerText = 'Thêm học sinh thất bại';
  }
}

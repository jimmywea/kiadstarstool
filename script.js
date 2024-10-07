// Khởi tạo Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, Timestamp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDL56ekmdndk3wd099KuJWUyogRUa3bwW8",
  authDomain: "kidstars-7434d.firebaseapp.com",
  projectId: "kidstars-7434d",
  storageBucket: "kidstars-7434d.appspot.com",
  messagingSenderId: "616350873520",
  appId: "1:616350873520:web:9d765d0bf5a483fa964875",
  measurementId: "G-FJMK0F1LRN"
};

// Khởi tạo Firebase App và Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Hàm chuyển đổi các phần giao diện (toàn cục để dễ truy cập)
window.showSection = function(sectionId) {
  document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
}

// Hàm điểm danh học sinh
window.markAttendance = async function() {
  const name = document.getElementById('student-name').value;
  const time = new Date(document.getElementById('attendance-time').value);
  try {
    await addDoc(collection(db, 'attendance'), { 
      name, 
      date: Timestamp.fromDate(time),
      classes: ["Piano"] // Thêm phần môn học tùy chọn theo yêu cầu của bạn
    });
    document.getElementById('attendance-status').innerText = 'Điểm danh thành công';
  } catch (error) {
    console.error("Lỗi khi điểm danh: ", error);
    document.getElementById('attendance-status').innerText = 'Điểm danh thất bại';
  }
}

// Hàm truy vấn học sinh cụ thể theo ngày
window.queryStudent = async function() {
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

// Hàm truy vấn theo thời gian cụ thể
window.queryByTime = async function() {
  const date = document.getElementById('query-time-date').value;
  const startTime = document.getElementById('query-start-time').value;
  const endTime = document.getElementById('query-end-time').value;
  const startTimestamp = new Date(`${date}T${startTime}`);
  const endTimestamp = new Date(`${date}T${endTime}`);

  const timeQuery = query(
    collection(db, 'attendance'), 
    where("date", ">=", Timestamp.fromDate(startTimestamp)), 
    where("date", "<=", Timestamp.fromDate(endTimestamp))
  );
  
  const querySnapshot = await getDocs(timeQuery);
  let result = '';

  querySnapshot.forEach(doc => {
    const data = doc.data();
    result += `${data.name} - ${data.date.toDate().toLocaleString()}\n`;
  });

  document.getElementById('query-time-result').innerText = result || 'Không có dữ liệu';
}

// Hàm thêm học sinh mới
window.addStudent = async function() {
  const name = document.getElementById('new-student-name').value;
  const subjects = [];
  ['piano', 'guitar', 'vocal', 'drawing', 'dance', 'mc'].forEach(id => {
    if (document.getElementById(id).checked) subjects.push(document.getElementById(id).value);
  });

  try {
    await addDoc(collection(db, 'students'), { name, classes: subjects });
    document.getElementById('add-student-status').innerText = 'Thêm học sinh thành công';
  } catch (error) {
    console.error("Lỗi khi thêm học sinh mới: ", error);
    document.getElementById('add-student-status').innerText = 'Thêm học sinh thất bại';
  }
}

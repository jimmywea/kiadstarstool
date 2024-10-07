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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Chuyển đổi giữa các phần trong ứng dụng
window.showSection = function(sectionId) {
  document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
}

// Hàm điểm danh học sinh, bao gồm cả nội dung buổi học
window.markAttendance = async function() {
  const name = document.getElementById('student-name').value;
  const time = new Date(document.getElementById('attendance-time').value);
  const selectedClass = document.getElementById('attendance-class').value;
  const content = document.getElementById('attendance-content').value; // Lấy nội dung buổi học

  try {
    await addDoc(collection(db, 'attendance'), { 
      name, 
      date: Timestamp.fromDate(time),
      classes: [selectedClass],
      content // Lưu nội dung buổi học vào Firestore
    });
    document.getElementById('attendance-status').innerText = 'Điểm danh thành công';
  } catch (error) {
    console.error("Lỗi khi điểm danh: ", error);
    document.getElementById('attendance-status').innerText = 'Điểm danh thất bại';
  }
}

// Gợi ý tên học sinh kèm môn học để dễ phân biệt
window.suggestStudentNames = async function(inputId, suggestionsId) {
  const input = document.getElementById(inputId);
  const queryText = input.value.trim().toLowerCase();
  const suggestionsList = document.getElementById(suggestionsId);

  suggestionsList.innerHTML = '';

  if (queryText.length === 0) return;

  const studentQuery = query(collection(db, 'students'));
  const querySnapshot = await getDocs(studentQuery);

  querySnapshot.forEach(doc => {
    const studentData = doc.data();
    const studentName = studentData.name.toLowerCase();

    if (studentName.includes(queryText)) {
      const suggestionItem = document.createElement('li');
      const classes = studentData.classes.join(', ');
      suggestionItem.textContent = `${studentData.name} - ${classes}`;
      
      suggestionItem.onclick = () => {
        input.value = studentData.name;
        suggestionsList.innerHTML = '';
      };

      suggestionsList.appendChild(suggestionItem);
    }
  });
}

// Truy vấn điểm danh của một học sinh theo khoảng thời gian
window.queryStudent = async function() {
  const name = document.getElementById('query-student-name').value;
  const startDate = new Date(document.getElementById('query-student-start-date').value);
  const endDate = new Date(document.getElementById('query-student-end-date').value);

  const studentQuery = query(
    collection(db, 'attendance'), 
    where("name", "==", name), 
    where("date", ">=", Timestamp.fromDate(startDate)), 
    where("date", "<=", Timestamp.fromDate(endDate))
  );

  const querySnapshot = await getDocs(studentQuery);
  let result = '';
  let totalSessions = 0;
  const classDetails = {};

  querySnapshot.forEach(doc => {
    const data = doc.data();
    const className = data.classes[0];
    const date = data.date.toDate().toLocaleString();
    const content = data.content || 'Không có';
    if (!classDetails[className]) {
      classDetails[className] = [];
    }
    classDetails[className].push({date, content});
    totalSessions++;
  });

  for (const [className, sessions] of Object.entries(classDetails)) {
    result += `${className}: ${sessions.length} buổi\n`;
    sessions.forEach(session => {
      result += ` - ${session.date} - Nội dung: ${session.content}\n`;
    });
  }
  result += `Tổng số buổi: ${totalSessions}`;
  
  document.getElementById('query-student-result').innerText = result || 'Không có dữ liệu';
}

// Truy vấn điểm danh theo khoảng thời gian cụ thể
window.queryByTime = async function() {
  const startDate = new Date(document.getElementById('query-time-start-date').value);
  const endDate = new Date(document.getElementById('query-time-end-date').value);
  const startTime = document.getElementById('query-start-time').value;
  const endTime = document.getElementById('query-end-time').value;

  const startTimestamp = new Date(`${startDate.toISOString().split('T')[0]}T${startTime}`);
  const endTimestamp = new Date(`${endDate.toISOString().split('T')[0]}T${endTime}`);

  const timeQuery = query(
    collection(db, 'attendance'), 
    where("date", ">=", Timestamp.fromDate(startTimestamp)), 
    where("date", "<=", Timestamp.fromDate(endTimestamp))
  );

  const querySnapshot = await getDocs(timeQuery);
  let result = '';

  querySnapshot.forEach(doc => {
    const data = doc.data();
    result += `${data.name} - ${data.date.toDate().toLocaleString()} - ${data.classes.join(', ')} - Nội dung: ${data.content || 'Không có'}\n`;
  });

  document.getElementById('query-time-result').innerText = result || 'Không có dữ liệu';
}

// Thêm học sinh mới vào cơ sở dữ liệu
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

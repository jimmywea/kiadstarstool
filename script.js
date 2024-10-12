// Import các thư viện Firebase cần thiết
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

// Hàm để hiển thị các phần khác nhau
window.showSection = function(sectionId) {
  document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');

  if (sectionId === 'schedule') loadStudentCheckboxes();
};

// Hàm load danh sách học sinh vào checkbox
window.loadStudentCheckboxes = async function() {
  const studentList = document.getElementById('schedule-student-list');
  const studentQuery = query(collection(db, 'students'));
  const querySnapshot = await getDocs(studentQuery);

  studentList.innerHTML = ''; // Xóa danh sách cũ

  querySnapshot.forEach(doc => {
    const studentData = doc.data();
    const studentCheckbox = document.createElement('label');
    studentCheckbox.innerHTML = `
      <input type="checkbox" value="${studentData.name}"> ${studentData.name}
    `;
    studentList.appendChild(studentCheckbox);
  });
};

// Hàm thêm lịch học mới
window.addSchedule = async function() {
  const day = document.getElementById('schedule-day').value;
  const time = document.getElementById('schedule-time').value;
  const subject = document.getElementById('schedule-subject').value;
  
  const selectedStudents = [];
  document.querySelectorAll('#schedule-student-list input:checked').forEach(checkbox => {
    selectedStudents.push(checkbox.value);
  });

  try {
    await addDoc(collection(db, 'schedule'), { 
      day, 
      time, 
      subject, 
      students: selectedStudents 
    });
    document.getElementById('schedule-status').innerText = 'Thêm lịch học thành công';
  } catch (error) {
    console.error("Lỗi khi thêm lịch học: ", error);
    document.getElementById('schedule-status').innerText = 'Thêm lịch học thất bại';
  }
};

// Các hàm chức năng cũ như điểm danh, truy vấn vẫn giữ nguyên

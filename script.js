import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, limit, Timestamp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

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

window.showSection = function(sectionId) {
  document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.className = "toast show";
  setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}

window.markAttendance = async function() {
  const name = document.getElementById('student-name').value;
  const time = new Date(document.getElementById('attendance-time').value);
  const selectedClass = document.getElementById('attendance-class').value;
  const content = document.getElementById('attendance-content').value;
  const isAbsent = document.getElementById('absent-checkbox').checked;

  try {
    await addDoc(collection(db, 'attendance'), { 
      name, 
      date: Timestamp.fromDate(time),
      classes: [selectedClass],
      content,
      absent: isAbsent
    });

    const statusMessage = isAbsent ? 'Đã đánh dấu vắng mặt cho ' : 'Điểm danh thành công cho ';
    document.getElementById('attendance-status').innerText = statusMessage + name;
    
    showToast(statusMessage + name);
  } catch (error) {
    console.error("Lỗi khi điểm danh: ", error);
    document.getElementById('attendance-status').innerText = 'Điểm danh thất bại';
    showToast("Lỗi: Không thể điểm danh. Vui lòng thử lại.");
  }
}

window.exportToExcel = function() {
  const data = document.getElementById('query-time-result').innerText.trim().split('\n');
  
  const formattedData = data.map(row => {
    const parts = row.split(' - ');
    const name = parts[0];
    const date = parts[1];
    const className = parts[2];
    const status = parts[3].split(': ')[1];
    const content = parts[4].split(': ')[1];
    return [name, date, className, status, content];
  });
  
  const worksheetData = [
    ['Tên Học Sinh', 'Thời Gian', 'Môn Học', 'Trạng Thái', 'Nội Dung'],
    ...formattedData
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Lịch Sử Điểm Danh');

  XLSX.writeFile(workbook, 'LichSuDiemDanh.xlsx');
}

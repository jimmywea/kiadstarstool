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

window.showSection = function(sectionId) {
  document.querySelectorAll('.section').forEach(section => section.classList.add('hidden'));
  document.getElementById(sectionId).classList.remove('hidden');
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
    const statusElement = document.getElementById('attendance-status');
    statusElement.innerText = isAbsent ? 'Đã đánh dấu vắng mặt' : 'Điểm danh thành công';
    statusElement.style.visibility = 'visible'; 
    statusElement.style.opacity = '1'; 

    setTimeout(() => {
      statusElement.style.opacity = '0'; 
      setTimeout(() => {
        statusElement.style.visibility = 'hidden'; 
      }, 500); 
    }, 3000); 

  } catch (error) {
    console.error("Lỗi khi điểm danh: ", error);
    const statusElement = document.getElementById('attendance-status');
    statusElement.innerText = 'Điểm danh thất bại';
    statusElement.style.visibility = 'visible'; 
    statusElement.style.opacity = '1'; 

    setTimeout(() => {
      statusElement.style.opacity = '0'; 
      setTimeout(() => {
        statusElement.style.visibility = 'hidden'; 
      }, 500); 
    }, 3000); 
  }
}

// Hàm thêm học sinh mới
window.addStudent = async function() {
  const name = document.getElementById('new-student-name').value;
  
  // Lấy danh sách các môn học mà học sinh tham gia
  const classes = [];
  if (document.getElementById('piano').checked) classes.push('Piano');
  if (document.getElementById('guitar').checked) classes.push('Guitar');
  if (document.getElementById('vocal').checked) classes.push('Thanh nhạc');
  if (document.getElementById('drawing').checked) classes.push('Vẽ');
  if (document.getElementById('dance').checked) classes.push('Nhảy');
  if (document.getElementById('mc').checked) classes.push('MC');

  // Kiểm tra nếu tên học sinh bị trống hoặc không chọn môn học nào
  if (name.trim() === '' || classes.length === 0) {
    document.getElementById('add-student-status').innerText = 'Vui lòng nhập tên và chọn ít nhất một môn học.';
    return;
  }

  try {
    await addDoc(collection(db, 'students'), {
      name: name,
      classes: classes
    });
    document.getElementById('add-student-status').innerText = 'Thêm học sinh thành công!';
  } catch (error) {
    console.error("Lỗi khi thêm học sinh: ", error);
    document.getElementById('add-student-status').innerText = 'Thêm học sinh thất bại.';
  }
}

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
  const results = [];

  querySnapshot.forEach(doc => {
    const data = doc.data();
    const status = data.absent ? 'Vắng mặt' : 'Có mặt';
    results.push({
      name: data.name,
      date: data.date.toDate(),
      classes: data.classes,
      status: status,
      content: data.content || 'Không có'
    });
  });

  let resultTable = '';
  if (results.length > 0) {
    resultTable = '<table border="1" style="width:100%; border-collapse:collapse;">';
    resultTable += '<tr><th>Tên Học Sinh</th><th>Thời Gian</th><th>Môn Học</th><th>Trạng Thái</th><th>Nội Dung</th></tr>';

    results.forEach(data => {
      resultTable += `<tr>
        <td>${data.name}</td>
        <td>${data.date.toLocaleString()}</td>
        <td>${data.classes.join(', ')}</td>
        <td>${data.status}</td>
        <td>${data.content}</td>
      </tr>`;
    });

    resultTable += '</table>';
  } else {
    resultTable = 'Không có dữ liệu';
  }

  document.getElementById('query-student-result').innerHTML = resultTable;

  if (results.length > 0) {
    document.getElementById('export-student-excel').style.display = 'block';
  } else {
    document.getElementById('export-student-excel').style.display = 'none';
  }
}

window.exportStudentToExcel = function() {
  const table = document.querySelector("#query-student-result table");
  
  if (!table) {
    alert("Không có dữ liệu để xuất.");
    return;
  }
  
  const worksheet = XLSX.utils.table_to_sheet(table);
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Lịch Sử Học Sinh');
  
  XLSX.writeFile(workbook, 'LichSuHocSinh.xlsx');
}

window.queryByTime = async function() {
  const startDate = new Date(document.getElementById('query-time-start-date').value);
  const endDate = new Date(document.getElementById('query-time-end-date').value);
  const startTime = document.getElementById('query-start-time').value;
  const endTime = document.getElementById('query-end-time').value;
  const selectedClass = document.getElementById('query-time-class').value;

  const startTimestamp = new Date(`${startDate.toISOString().split('T')[0]}T${startTime}`);
  const endTimestamp = new Date(`${endDate.toISOString().split('T')[0]}T${endTime}`);

  let conditions = [
    where("date", ">=", Timestamp.fromDate(startTimestamp)),
    where("date", "<=", Timestamp.fromDate(endTimestamp))
  ];

  if (selectedClass) {
    conditions.push(where("classes", "array-contains", selectedClass));
  }

  const timeQuery = query(collection(db, 'attendance'), ...conditions);
  const querySnapshot = await getDocs(timeQuery);
  const results = [];

  querySnapshot.forEach(doc => {
    const data = doc.data();
    results.push({
      name: data.name,
      date: data.date.toDate(),
      classes: data.classes,
      status: data.absent ? 'Vắng mặt' : 'Có mặt',
      content: data.content || 'Không có'
    });
  });

  results.sort((a, b) => new Date(a.date) - new Date(b.date));

  let resultTable = '<table border="1" style="width:100%; border-collapse:collapse;">';
  resultTable += '<tr><th>Tên Học Sinh</th><th>Thời Gian</th><th>Môn Học</th><th>Trạng Thái</th><th>Nội Dung</th></tr>';
  
  results.forEach(data => {
    resultTable += `<tr>
      <td>${data.name}</td>
      <td>${data.date.toLocaleString()}</td>
      <td>${data.classes.join(', ')}</td>
      <td>${data.status}</td>
      <td>${data.content}</td>
    </tr>`;
  });

  resultTable += '</table>';

  document.getElementById('query-time-result').innerHTML = resultTable || 'Không có dữ liệu';
  document.querySelectorAll('.section').forEach(section => section.classList.add('hidden'));
  document.getElementById('query-time').classList.remove('hidden');
}

window.exportToExcel = function() {
  const table = document.querySelector("#query-time-result table");
  
  if (!table) {
    alert("Không có dữ liệu để xuất.");
    return;
  }
  
  const worksheet = XLSX.utils.table_to_sheet(table);
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Lịch Sử Điểm Danh');
  
  XLSX.writeFile(workbook, 'LichSuDiemDanh.xlsx');
}

window.suggestStudentNames = async function(inputId, suggestionsId) {
  const input = document.getElementById(inputId);
  const queryText = input.value.trim().toLowerCase();
  const suggestionsList = document.getElementById(suggestionsId);

  suggestionsList.innerHTML = '';

  if (queryText.length === 0) {
    return;
  }

  const studentQuery = query(collection(db, 'students'));
  const querySnapshot = await getDocs(studentQuery);

  querySnapshot.forEach(doc => {
    const studentData = doc.data();
    const studentName = studentData.name.toLowerCase();

    if (studentName.includes(queryText)) {
      const suggestionItem = document.createElement('li');
      suggestionItem.textContent = studentData.name;
      
      suggestionItem.onclick = () => {
        input.value = studentData.name;
        suggestionsList.innerHTML = '';
      };

      suggestionsList.appendChild(suggestionItem);
    }
  });
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, limit, Timestamp, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

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
const auth = getAuth(app);

// Hàm đăng nhập
window.loginUser = async function (email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Đăng nhập thành công:", userCredential.user);
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('app').style.display = 'block';
  } catch (error) {
    alert("Đăng nhập thất bại: " + error.message);
  }
};

// Kiểm tra trạng thái đăng nhập
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('app').style.display = 'block';
  } else {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('app').style.display = 'none';
  }
});

// Hiển thị từng section
window.showSection = function (sectionId) {
  document.querySelectorAll('.section').forEach((section) => section.classList.add('hidden'));
  document.getElementById(sectionId).classList.remove('hidden');
};

// Điểm danh học sinh
window.markAttendance = async function () {
  const name = document.getElementById('student-name').value.trim();
  const time = document.getElementById('attendance-time').value;
  const selectedClass = document.getElementById('attendance-class').value;
  const content = document.getElementById('attendance-content').value.trim();
  const isAbsent = document.getElementById('absent-checkbox').checked;

  if (!name || !time || !selectedClass) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  try {
    const studentQuery = query(collection(db, 'students'), where("name", "==", name), limit(1));
    const studentSnapshot = await getDocs(studentQuery);

    if (studentSnapshot.empty) {
      alert("Không tìm thấy học sinh!");
      return;
    }

    const studentDoc = studentSnapshot.docs[0];
    let numberOfLessons = studentDoc.data().numberOfLessons || 0;

    if (numberOfLessons > 0 && !isAbsent) numberOfLessons--;

    await addDoc(collection(db, 'attendance'), {
      name,
      date: Timestamp.fromDate(new Date(time)),
      classes: [selectedClass],
      content,
      absent: isAbsent,
    });

    await updateDoc(doc(db, 'students', studentDoc.id), { numberOfLessons });

    const statusElement = document.getElementById('attendance-status');
    statusElement.textContent = isAbsent
      ? `Học sinh ${name} đã được đánh dấu vắng mặt.`
      : `Điểm danh thành công! Số buổi học còn lại: ${numberOfLessons}`;
    statusElement.className = 'success';
  } catch (error) {
    alert("Điểm danh thất bại.");
  }
};

// Hàm thêm học sinh mới
window.addStudent = async function () {
  const name = document.getElementById('new-student-name').value.trim();
  const numberOfLessons = parseInt(document.getElementById('number-of-lessons').value, 10);
  const classes = [];
  if (document.getElementById('piano').checked) classes.push('Piano');
  if (document.getElementById('guitar').checked) classes.push('Guitar');
  if (document.getElementById('vocal').checked) classes.push('Thanh nhạc');
  if (document.getElementById('drawing').checked) classes.push('Vẽ');
  if (document.getElementById('dance').checked) classes.push('Nhảy');
  if (document.getElementById('mc').checked) classes.push('MC');

  if (!name || classes.length === 0 || isNaN(numberOfLessons) || numberOfLessons < 1) {
    alert("Vui lòng nhập tên, chọn môn học và số buổi hợp lệ.");
    return;
  }

  try {
    await addDoc(collection(db, 'students'), { name, classes, numberOfLessons });
    alert('Thêm học sinh thành công!');
  } catch (error) {
    alert('Thêm học sinh thất bại.');
  }
};

// Truy vấn học sinh
window.queryStudent = async function () {
  const name = document.getElementById('query-student-name').value.trim();
  const startDate = new Date(document.getElementById('query-student-start-date').value);
  const endDate = new Date(document.getElementById('query-student-end-date').value);

  if (!name || !startDate || !endDate) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  try {
    const studentQuery = query(
      collection(db, 'attendance'),
      where("name", "==", name),
      where("date", ">=", Timestamp.fromDate(startDate)),
      where("date", "<=", Timestamp.fromDate(endDate))
    );

    const querySnapshot = await getDocs(studentQuery);
    const results = querySnapshot.docs.map((doc) => doc.data());

    const table = results
      .map((data) => `<tr>
        <td>${data.name}</td>
        <td>${new Date(data.date.toDate()).toLocaleString()}</td>
        <td>${data.classes.join(', ')}</td>
        <td>${data.absent ? 'Vắng mặt' : 'Có mặt'}</td>
        <td>${data.content || 'Không có'}</td>
      </tr>`)
      .join('');

    document.getElementById('query-student-result').innerHTML = table || '<tr><td colspan="5">Không có dữ liệu</td></tr>';
  } catch (error) {
    alert("Truy vấn thất bại.");
  }
};

// Hàm xuất Excel
window.exportToExcel = function () {
  const table = document.querySelector("#query-student-result");
  if (!table) {
    alert("Không có dữ liệu để xuất.");
    return;
  }
  const worksheet = XLSX.utils.table_to_sheet(table);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Lịch Sử Điểm Danh');
  XLSX.writeFile(workbook, 'LichSuDiemDanh.xlsx');
};

// Gợi ý tên học sinh
window.suggestStudentNames = async function (inputId, suggestionsId) {
  const input = document.getElementById(inputId);
  const queryText = input.value.trim().toLowerCase();
  const suggestionsList = document.getElementById(suggestionsId);

  suggestionsList.innerHTML = '';

  if (!queryText) return;

  try {
    const studentQuery = query(collection(db, 'students'));
    const querySnapshot = await getDocs(studentQuery);

    let matches = 0;

    querySnapshot.forEach((doc) => {
      const studentData = doc.data();
      const studentName = studentData.name.toLowerCase();

      if (studentName.startsWith(queryText) && matches < 10) {
        const suggestionItem = document.createElement('div');
        suggestionItem.textContent = studentData.name;
        suggestionItem.className = 'suggestion-item';

        suggestionItem.onclick = () => {
          input.value = studentData.name;
          suggestionsList.innerHTML = '';
        };

        suggestionsList.appendChild(suggestionItem);
        matches++;
      }
    });

    if (matches === 0) {
      const noResultItem = document.createElement('div');
      noResultItem.textContent = 'Không tìm thấy kết quả';
      noResultItem.className = 'no-result';
      suggestionsList.appendChild(noResultItem);
    }
  } catch (error) {
    alert("Lỗi khi gợi ý tên học sinh.");
  }
};

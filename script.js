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
window.loginUser = function(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("Đăng nhập thành công:", userCredential.user);
      document.getElementById('auth-section').style.display = 'none';
      document.getElementById('app').style.display = 'block';
    })
    .catch((error) => {
      console.error("Lỗi khi đăng nhập:", error.message);
      alert("Đăng nhập thất bại: " + error.message);
    });
};

// Kiểm tra trạng thái đăng nhập
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Người dùng đã đăng nhập:", user);
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('app').style.display = 'block';
  } else {
    console.log("Người dùng chưa đăng nhập");
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('app').style.display = 'none';
  }
});

// Hiển thị từng section khi bấm nút
window.showSection = function(sectionId) {
  document.querySelectorAll('.section').forEach(section => section.classList.add('hidden'));
  document.getElementById(sectionId).classList.remove('hidden');
}

// Hàm thêm học sinh mới
window.addStudent = async function() {
  const name = document.getElementById('new-student-name').value;
  const numberOfLessons = parseInt(document.getElementById('number-of-lessons').value, 10);
  const classes = [];

  if (document.getElementById('piano').checked) classes.push('Piano');
  if (document.getElementById('guitar').checked) classes.push('Guitar');
  if (document.getElementById('vocal').checked) classes.push('Thanh nhạc');
  if (document.getElementById('drawing').checked) classes.push('Vẽ');
  if (document.getElementById('dance').checked) classes.push('Nhảy');
  if (document.getElementById('mc').checked) classes.push('MC');

  if (name.trim() === '' || classes.length === 0 || isNaN(numberOfLessons) || numberOfLessons < 1) {
    document.getElementById('add-student-status').innerText = 'Vui lòng nhập tên, chọn môn học và số buổi hợp lệ.';
    return;
  }

  try {
    await addDoc(collection(db, 'students'), { name, classes, numberOfLessons });
    document.getElementById('add-student-status').innerText = 'Thêm học sinh thành công!';
  } catch (error) {
    console.error("Lỗi khi thêm học sinh: ", error);
    document.getElementById('add-student-status').innerText = 'Thêm học sinh thất bại.';
  }
}

// Điểm danh học sinh
window.markAttendance = async function() {
  const name = document.getElementById('student-name').value;
  const time = new Date(document.getElementById('attendance-time').value);
  const selectedClass = document.getElementById('attendance-class').value;
  const content = document.getElementById('attendance-content').value;
  const isAbsent = document.getElementById('absent-checkbox').checked;

  if (!name || !selectedClass || !time) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  try {
    const studentRef = collection(db, 'students');
    const studentQuery = query(studentRef, where("name", "==", name), limit(1));
    const studentSnapshot = await getDocs(studentQuery);

    if (studentSnapshot.empty) {
      alert("Không tìm thấy học sinh!");
      return;
    }

    const studentDoc = studentSnapshot.docs[0];
    const studentData = studentDoc.data();
    let numberOfLessons = studentData.numberOfLessons || 0;

    if (numberOfLessons > 0 && !isAbsent) {
      numberOfLessons--; // Giảm số buổi học
    }

    await addDoc(collection(db, 'attendance'), { 
      name, 
      date: Timestamp.fromDate(time),
      classes: [selectedClass],
      content,
      absent: isAbsent
    });

    // Cập nhật số buổi học còn lại
    const studentDocRef = doc(db, 'students', studentDoc.id);
    await updateDoc(studentDocRef, { numberOfLessons });

    const statusElement = document.getElementById('attendance-status');
    statusElement.innerText = isAbsent 
      ? 'Đã đánh dấu vắng mặt' 
      : `Điểm danh thành công. Số buổi học còn lại: ${numberOfLessons}`;
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

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, Timestamp, limit, orderBy } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDL56ekm...",
  authDomain: "example.firebaseapp.com",
  projectId: "example",
  storageBucket: "example.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcd1234",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Đăng nhập
window.loginUser = async function (email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Đăng nhập thành công:", userCredential.user);
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("app").style.display = "block";
  } catch (error) {
    alert("Đăng nhập thất bại: " + error.message);
  }
};

// Kiểm tra trạng thái đăng nhập
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("app").style.display = "block";
  } else {
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("app").style.display = "none";
  }
});

// Hiển thị Section
window.showSection = function (sectionId) {
  document.querySelectorAll(".section").forEach((section) => section.classList.add("hidden"));
  document.getElementById(sectionId).classList.remove("hidden");
};

// Gợi ý tên học sinh
window.suggestStudentNames = async function (inputId, suggestionsId) {
  const input = document.getElementById(inputId);
  const queryText = input.value.trim().toLowerCase();
  const suggestionsList = document.getElementById(suggestionsId);
  suggestionsList.innerHTML = "";

  if (queryText.length === 0) return;

  try {
    const studentQuery = query(collection(db, "students"), limit(10));
    const querySnapshot = await getDocs(studentQuery);

    querySnapshot.forEach((doc) => {
      const studentData = doc.data();
      if (studentData.name.toLowerCase().includes(queryText)) {
        const suggestion = document.createElement("li");
        suggestion.textContent = studentData.name;
        suggestion.onclick = () => {
          input.value = studentData.name;
          suggestionsList.innerHTML = "";
        };
        suggestionsList.appendChild(suggestion);
      }
    });
  } catch (error) {
    console.error("Lỗi khi gợi ý:", error);
  }
};

// Các hàm điểm danh, truy vấn, và thêm học sinh giống như đã tối ưu trong các phần trước.

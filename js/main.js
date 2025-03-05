function loadExamCodes() {
  const subject = document.getElementById("subject").value;
  const examCodeSelect = document.getElementById("examCode");
  const examInfo = document.getElementById("examInfo");
  const startBtn = document.getElementById("startBtn");
  const searchInput = document.getElementById("searchInput");

  // Reset everything
  examCodeSelect.innerHTML = '<option value="">-- Chọn mã đề --</option>';
  examCodeSelect.disabled = !subject;
  examInfo.style.display = "none";
  startBtn.disabled = true;

  if (subject && quizData[subject]) {
    Object.entries(quizData[subject]).forEach(([code, exam]) => {
      addExamOption(examCodeSelect, code, exam);
    });
  }

  // Nếu đang có từ khóa tìm kiếm thì thực hiện tìm kiếm lại
  if (searchInput.value.trim() !== "") {
    searchExams();
  }
}

function searchExams() {
  const searchText = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();
  const searchResults = document.getElementById("searchResults");

  // Xóa kết quả cũ
  searchResults.innerHTML = "";

  if (searchText === "") {
    searchResults.style.display = "none";
    return;
  }

  let found = false;
  let resultsHtml = "";

  // Tìm kiếm trong tất cả các môn
  Object.entries(quizData).forEach(([subject, subjectData]) => {
    Object.entries(subjectData).forEach(([code, exam]) => {
      if (matchesSearch(code, exam, searchText)) {
        found = true;
        resultsHtml += `
                    <div class="search-result-item" onclick="selectExam('${subject}', '${code}')">
                        <div class="exam-title">${exam.title}</div>
                        <div class="exam-subject">Môn: ${getSubjectName(
                          subject
                        )} | Mã đề: ${code}</div>
                    </div>
                `;
      }
    });
  });

  if (found) {
    searchResults.innerHTML = resultsHtml;
  } else {
    searchResults.innerHTML =
      '<div class="no-results">Không tìm thấy kết quả</div>';
  }

  searchResults.style.display = "block";
}

function getSubjectName(subject) {
  const subjects = {
    toan: "Toán học",
    ly: "Vật lý",
    hoa: "Hóa học",
  };
  return subjects[subject] || subject;
}

function selectExam(subject, code) {
  // Chọn môn học
  const subjectSelect = document.getElementById("subject");
  subjectSelect.value = subject;
  loadExamCodes();

  // Chọn mã đề
  const examCodeSelect = document.getElementById("examCode");
  examCodeSelect.value = code;
  updateExamInfo();

  // Ẩn kết quả tìm kiếm
  document.getElementById("searchResults").style.display = "none";
  document.getElementById("searchInput").value = "";
}

// Thêm sự kiện click bên ngoài để đóng kết quả tìm kiếm
document.addEventListener("click", function (event) {
  const searchBox = document.querySelector(".search-box");
  const searchResults = document.getElementById("searchResults");

  if (!searchBox.contains(event.target)) {
    searchResults.style.display = "none";
  }
});

// Hàm kiểm tra điều kiện tìm kiếm
function matchesSearch(code, exam, searchText) {
  return (
    code.toLowerCase().includes(searchText) ||
    exam.title.toLowerCase().includes(searchText) ||
    exam.questions.some((q) => q.question.toLowerCase().includes(searchText))
  );
}

// Hàm thêm option vào select
function addExamOption(select, code, exam, subjectName = "") {
  const option = document.createElement("option");
  option.value = code;
  option.textContent = subjectName
    ? `[${subjectName.toUpperCase()}] ${exam.title}`
    : exam.title;
  select.appendChild(option);
}

function updateExamInfo() {
  const subject = document.getElementById("subject").value;
  const examCode = document.getElementById("examCode").value;
  const examInfo = document.getElementById("examInfo");
  const startBtn = document.getElementById("startBtn");

  if (subject && examCode && quizData[subject][examCode]) {
    const exam = quizData[subject][examCode];
    document.getElementById("examTitle").textContent = exam.title;
    document.getElementById("examTime").textContent = exam.time;
    document.getElementById("questionCount").textContent =
      exam.questions.length;
    examInfo.style.display = "block";
    startBtn.disabled = false;
  } else {
    examInfo.style.display = "none";
    startBtn.disabled = true;
  }
}

function startExam() {
  const subject = document.getElementById("subject").value;
  const examCode = document.getElementById("examCode").value;

  if (!subject || !examCode) {
    alert("Vui lòng chọn môn thi và mã đề!");
    return;
  }

  // Lưu thông tin đề thi vào localStorage
  const examData = {
    subject: subject,
    examCode: examCode,
    startTime: new Date().getTime(),
    examInfo: quizData[subject][examCode],
  };

  localStorage.setItem("currentExam", JSON.stringify(examData));

  // Chuyển đến trang làm bài
  window.location.href = "pages/quiz.html";
}

// Thêm event listener khi trang được tải
document.addEventListener("DOMContentLoaded", function () {
  // Khởi tạo các select
  const examCodeSelect = document.getElementById("examCode");
  examCodeSelect.addEventListener("change", updateExamInfo);

  // Reset form
  document.getElementById("subject").value = "";
  examCodeSelect.innerHTML = '<option value="">-- Chọn mã đề --</option>';
  examCodeSelect.disabled = true;
  document.getElementById("startBtn").disabled = true;
});

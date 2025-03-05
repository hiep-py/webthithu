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
  const grade = document.getElementById("grade").value;

  if (searchText.length < 2) {
    searchResults.style.display = "none";
    return;
  }

  let results = [];

  // Tìm kiếm trong tất cả đề thi
  Object.entries(quizData).forEach(([subject, subjectData]) => {
    Object.entries(subjectData).forEach(([code, exam]) => {
      if (matchesSearch(exam, code, searchText, grade)) {
        results.push({
          subject,
          code,
          exam,
        });
      }
    });
  });

  // Hiển thị kết quả
  displaySearchResults(results);
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
function matchesSearch(exam, code, searchText, selectedGrade) {
  // Nếu đã chọn lớp, chỉ tìm trong lớp đó
  if (selectedGrade && exam.grade !== parseInt(selectedGrade)) {
    return false;
  }

  return (
    exam.title.toLowerCase().includes(searchText) ||
    code.toLowerCase().includes(searchText) ||
    exam.description?.toLowerCase().includes(searchText)
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
  const grade = document.getElementById("grade").value;
  const subject = document.getElementById("subject").value;
  const examCode = document.getElementById("examCode").value;

  if (!grade) {
    alert("Vui lòng chọn lớp!");
    return;
  }
  if (!subject) {
    alert("Vui lòng chọn môn học!");
    return;
  }
  if (!examCode) {
    alert("Vui lòng chọn đề thi!");
    return;
  }

  // Lưu thông tin và chuyển trang
  localStorage.setItem(
    "currentExam",
    JSON.stringify({
      grade: grade,
      subject: subject,
      examCode: examCode,
      startTime: new Date().getTime(),
      examInfo: quizData[subject][examCode],
    })
  );

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

function loadSubjects() {
  const grade = document.getElementById("grade").value;
  const subjectSelect = document.getElementById("subject");
  const examCodeSelect = document.getElementById("examCode");
  const startBtn = document.getElementById("startBtn");

  subjectSelect.innerHTML = '<option value="">-- Chọn môn học --</option>';
  examCodeSelect.innerHTML = '<option value="">-- Chọn đề thi --</option>';

  if (!grade) {
    subjectSelect.disabled = true;
    examCodeSelect.disabled = true;
    startBtn.disabled = true;
    return;
  }

  // Thêm các môn học
  const subjects = {
    toan: "Toán học",
    ly: "Vật lý",
    hoa: "Hóa học",
    sinh: "Sinh học",
    van: "Ngữ văn",
    anh: "Tiếng Anh",
  };

  Object.entries(subjects).forEach(([value, text]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    subjectSelect.appendChild(option);
  });

  subjectSelect.disabled = false;
  examCodeSelect.disabled = true;
  startBtn.disabled = true;
}

function displaySearchResults(results) {
  const searchResults = document.getElementById("searchResults");

  if (results.length === 0) {
    searchResults.innerHTML =
      '<div class="search-result-item">Không tìm thấy đề thi phù hợp</div>';
  } else {
    searchResults.innerHTML = results
      .map(
        (result) => `
          <div class="search-result-item" onclick="selectExam('${
            result.subject
          }', '${result.code}')">
              <div class="exam-title">${result.exam.title}</div>
              <div class="exam-info">
                  <span>Lớp ${result.exam.grade}</span> |
                  <span>${getSubjectName(result.subject)}</span> |
                  <span>${result.exam.time} phút</span>
              </div>
          </div>
      `
      )
      .join("");
  }

  searchResults.style.display = "block";
}

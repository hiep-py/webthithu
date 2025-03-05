document.addEventListener("DOMContentLoaded", function () {
  // Extract tags from quiz data
  const tags = extractTags();
  displayTags(tags);

  // Add event listeners
  document
    .getElementById("searchInput")
    .addEventListener("input", debounce(performSearch, 300));
  document
    .getElementById("gradeFilter")
    .addEventListener("change", performSearch);
  document
    .getElementById("subjectFilter")
    .addEventListener("change", performSearch);
});

function extractTags() {
  const tags = new Set();

  Object.values(quizData).forEach((subjectData) => {
    Object.values(subjectData).forEach((quiz) => {
      // Extract words from title and description
      const words = [...(quiz.title.toLowerCase().match(/\b\w+\b/g) || [])];
      if (quiz.description) {
        words.push(...(quiz.description.toLowerCase().match(/\b\w+\b/g) || []));
      }

      // Add relevant words as tags
      words.forEach((word) => {
        if (word.length > 3 && !stopWords.includes(word)) {
          tags.add(word);
        }
      });
    });
  });

  return Array.from(tags);
}

function displayTags(tags) {
  const tagsContainer = document.getElementById("searchTags");
  tags.sort().forEach((tag) => {
    const tagElement = document.createElement("span");
    tagElement.className = "tag";
    tagElement.textContent = tag;
    tagElement.onclick = () => addToSearch(tag);
    tagsContainer.appendChild(tagElement);
  });
}

function performSearch() {
  const searchText = document.getElementById("searchInput").value.toLowerCase();
  const gradeFilter = document.getElementById("gradeFilter").value;
  const subjectFilter = document.getElementById("subjectFilter").value;

  const results = [];

  Object.entries(quizData).forEach(([subject, subjectData]) => {
    if (subjectFilter && subject !== subjectFilter) return;

    Object.entries(subjectData).forEach(([code, quiz]) => {
      if (gradeFilter && quiz.grade !== parseInt(gradeFilter)) return;

      if (matchesSearch(quiz, searchText)) {
        results.push({ subject, code, quiz });
      }
    });
  });

  displayResults(results);
}

function matchesSearch(quiz, searchText) {
  if (!searchText) return true;

  const searchTerms = searchText.split(" ").filter((term) => term.length > 0);

  return searchTerms.every(
    (term) =>
      quiz.title.toLowerCase().includes(term) ||
      quiz.description?.toLowerCase().includes(term)
  );
}

function displayResults(results) {
  const container = document.getElementById("searchResults");

  if (results.length === 0) {
    container.innerHTML =
      '<div class="no-results">Không tìm thấy đề thi phù hợp</div>';
    return;
  }

  container.innerHTML = results
    .map(
      ({ subject, code, quiz }) => `
        <div class="quiz-card" onclick="startQuiz('${subject}', '${code}')">
            <div class="title">${quiz.title}</div>
            <div class="meta">
                <span>Lớp ${quiz.grade}</span> |
                <span>${getSubjectName(subject)}</span> |
                <span>${quiz.time} phút</span>
            </div>
            ${
              quiz.description
                ? `<div class="description">${quiz.description}</div>`
                : ""
            }
            <div class="tags">
                ${extractKeywords(quiz)
                  .map(
                    (tag) => `
                    <span class="tag">${tag}</span>
                `
                  )
                  .join("")}
            </div>
        </div>
    `
    )
    .join("");
}

function startQuiz(subject, code) {
  localStorage.setItem(
    "currentExam",
    JSON.stringify({
      subject: subject,
      examCode: code,
      startTime: new Date().getTime(),
      examInfo: quizData[subject][code],
    })
  );

  window.location.href = "quiz.html";
}

const stopWords = ["của", "và", "các", "cho", "trong", "với", "là", "có"];

function extractKeywords(quiz) {
  const text = `${quiz.title} ${quiz.description || ""}`;
  return [
    ...new Set(
      text
        .toLowerCase()
        .match(/\b\w+\b/g)
        ?.filter((word) => word.length > 3 && !stopWords.includes(word))
    ),
  ].slice(0, 5);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function addToSearch(tag) {
  const searchInput = document.getElementById("searchInput");
  const currentSearch = searchInput.value;
  searchInput.value = currentSearch ? `${currentSearch} ${tag}` : tag;
  performSearch();
}

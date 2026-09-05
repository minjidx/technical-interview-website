const starterQuestions = [
  { category: "PROGRAMMING BASICS", question: "변수란 무엇인가요?", modelAnswer: "변수는 값을 저장하기 위한 이름이 있는 공간입니다. 프로그램은 변수에 데이터를 넣고 필요할 때 다시 읽거나 바꿀 수 있습니다. 자료형에 따라 저장할 수 있는 값의 종류가 달라집니다.", keywords: ["데이터 저장", "이름", "자료형"], hint: "값을 저장하고 다시 사용하는 상자를 떠올려 보세요." },
  { category: "PROGRAMMING BASICS", question: "함수란 무엇이고 왜 사용하나요?", modelAnswer: "함수는 특정 작업을 수행하도록 묶은 코드입니다. 반복되는 코드를 함수로 만들면 재사용하기 쉽고, 코드의 역할이 분명해집니다. 입력값을 받아 결과값을 반환할 수도 있습니다.", keywords: ["재사용", "매개변수", "반환값"], hint: "반복 작업을 한 곳에 모으는 이유를 생각해 보세요." },
  { category: "CS FUNDAMENTALS", question: "Array와 Linked List의 차이를 설명해주세요.", modelAnswer: "배열은 메모리에서 연속된 공간을 사용하므로 인덱스로 빠르게 접근할 수 있습니다. 연결 리스트는 각 노드가 다음 노드를 가리키며, 중간 삽입과 삭제가 유리합니다. 대신 특정 위치에 접근하려면 앞에서부터 순회해야 합니다.", keywords: ["연속 메모리", "인덱스 접근", "삽입/삭제", "노드"], hint: "접근 속도와 중간 삽입·삭제를 비교해 보세요." },
  { category: "CS FUNDAMENTALS", question: "프로세스와 스레드의 차이는 무엇인가요?", modelAnswer: "프로세스는 실행 중인 프로그램의 독립된 단위이며 각자 메모리 공간을 가집니다. 스레드는 프로세스 안에서 실행되는 흐름으로, 같은 프로세스의 자원을 공유합니다. 공유 덕분에 가볍지만 동기화 문제가 생길 수 있습니다.", keywords: ["독립 메모리", "자원 공유", "동기화"], hint: "메모리를 공유하는지부터 설명해 보세요." }
];

const questions = [...starterQuestions];
const answers = new Map();
let currentIndex = 0;
const STORAGE_KEY = "tech-interview-bookmarks";

const $ = (id) => document.getElementById(id);
const elements = { progress: $("progress"), category: $("category"), question: $("question"), answer: $("answer"), hint: $("hint"), result: $("result"), modelAnswer: $("model-answer"), keywords: $("keywords"), previous: $("previous-button"), next: $("next-button"), check: $("check-button"), hintButton: $("hint-button"), generate: $("generate-button"), aiCategory: $("ai-category"), aiDifficulty: $("ai-difficulty") };
const elements = { progress: $("progress"), category: $("category"), question: $("question"), answer: $("answer"), hint: $("hint"), result: $("result"), modelAnswer: $("model-answer"), keywords: $("keywords"), previous: $("previous-button"), next: $("next-button"), check: $("check-button"), hintButton: $("hint-button"), bookmark: $("bookmark-button"), generate: $("generate-button"), aiCategory: $("ai-category"), aiDifficulty: $("ai-difficulty") };

function questionId(item) {
  return item.id || `${item.category}::${item.question}`;
}

function getBookmarks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}

function updateBookmarkButton() {
  const saved = getBookmarks().some((item) => item.id === questionId(questions[currentIndex]));
  elements.bookmark.textContent = saved ? "★ 복습에 저장됨" : "☆ 복습에 추가";
  elements.bookmark.setAttribute("aria-pressed", String(saved));
}

function renderQuestion() {
  const item = questions[currentIndex];
  elements.progress.textContent = `Question ${String(currentIndex + 1).padStart(2, "0")} / ${questions.length}${item.isAi ? " · AI" : ""}`;
  elements.category.textContent = item.category;
  elements.question.textContent = item.question;
  elements.answer.value = answers.get(currentIndex) || "";
  elements.hint.textContent = item.hint;
  elements.hint.classList.add("hidden");
  elements.result.classList.add("hidden");
  elements.modelAnswer.textContent = item.modelAnswer;
  elements.keywords.replaceChildren(...item.keywords.map((keyword) => { const tag = document.createElement("span"); tag.textContent = keyword; return tag; }));
  elements.previous.disabled = currentIndex === 0;
  elements.next.disabled = currentIndex === questions.length - 1;
  updateBookmarkButton();
}

elements.answer.addEventListener("input", () => answers.set(currentIndex, elements.answer.value));
elements.answer.addEventListener("input", () => {
  answers.set(currentIndex, elements.answer.value);
  const id = questionId(questions[currentIndex]);
  const bookmarks = getBookmarks();
  const savedIndex = bookmarks.findIndex((item) => item.id === id);
  if (savedIndex >= 0) {
    bookmarks[savedIndex].answer = elements.answer.value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }
});
elements.hintButton.addEventListener("click", () => elements.hint.classList.toggle("hidden"));
elements.check.addEventListener("click", () => elements.result.classList.remove("hidden"));
elements.bookmark.addEventListener("click", () => {
  const item = questions[currentIndex];
  const id = questionId(item);
  const bookmarks = getBookmarks();
  const savedIndex = bookmarks.findIndex((bookmark) => bookmark.id === id);
  if (savedIndex >= 0) {
    bookmarks.splice(savedIndex, 1);
  } else {
    bookmarks.push({ ...item, id, answer: elements.answer.value, savedAt: new Date().toISOString() });
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  updateBookmarkButton();
});
elements.previous.addEventListener("click", () => { if (currentIndex > 0) { currentIndex--; renderQuestion(); } });
elements.next.addEventListener("click", () => { if (currentIndex < questions.length - 1) { currentIndex++; renderQuestion(); } });

elements.generate.addEventListener("click", async () => {
  const originalText = elements.generate.textContent;
  elements.generate.disabled = true;
  elements.generate.textContent = "문제 만드는 중…";
  try {
    const baseUrl = window.APP_CONFIG?.API_BASE_URL || "";
    const response = await fetch(`${baseUrl}/api/questions/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: elements.aiCategory.value,
        difficulty: elements.aiDifficulty.value,
        recentQuestions: questions.slice(-12).map((item) => item.question)
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "AI 문제 생성에 실패했습니다.");
    questions.push({ ...data, isAi: true });
    questions.push({ ...data, id: `ai-${crypto.randomUUID()}`, isAi: true });
    currentIndex = questions.length - 1;
    renderQuestion();
  } catch (error) {
    alert(error.message);
  } finally {
    elements.generate.disabled = false;
    elements.generate.textContent = originalText;
  }
});

const reviewId = new URLSearchParams(window.location.search).get("review");
if (reviewId) {
  const saved = getBookmarks().find((item) => item.id === reviewId);
  if (saved) {
    questions.push(saved);
    currentIndex = questions.length - 1;
    if (saved.answer) answers.set(currentIndex, saved.answer);
  }
}

renderQuestion();

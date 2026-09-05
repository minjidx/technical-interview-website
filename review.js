const STORAGE_KEY = "tech-interview-bookmarks";
const reviewList = document.getElementById("review-list");

function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveBookmarks(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function render() {
  const bookmarks = getBookmarks();
  reviewList.replaceChildren();

  if (!bookmarks.length) {
    const empty = document.createElement("div");
    empty.className = "empty-review";
    empty.innerHTML = "<p>아직 저장한 문제가 없어요.</p><a href=\"index.html\">문제 풀러 가기 →</a>";
    reviewList.append(empty);
    return;
  }

  bookmarks.slice().reverse().forEach((item) => {
    const card = document.createElement("article");
    card.className = "review-card";
    const category = document.createElement("p");
    category.className = "category";
    category.textContent = item.category;
    const title = document.createElement("h2");
    const answer = document.createElement("p");
    answer.className = "saved-answer";
    card.append(category, title, answer);
    title.textContent = item.question;
    answer.textContent = item.answer ? `내 답변: ${item.answer}` : "작성한 답변 없음";

    const actions = document.createElement("div");
    actions.className = "review-card-actions";
    const practice = document.createElement("a");
    practice.className = "primary review-button";
    practice.href = `index.html?review=${encodeURIComponent(item.id)}`;
    practice.textContent = "다시 연습하기";
    const remove = document.createElement("button");
    remove.className = "remove-button";
    remove.textContent = "삭제";
    remove.addEventListener("click", () => {
      saveBookmarks(getBookmarks().filter((bookmark) => bookmark.id !== item.id));
      render();
    });
    actions.append(practice, remove);
    card.append(actions);
    reviewList.append(card);
  });
}

render();

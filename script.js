alert("JavaScript 연결 성공!");

const checkButton = document.getElementById("check-button");
const result = document.getElementById("result");

checkButton.addEventListener("click", function () {
    result.classList.remove("hidden");
});

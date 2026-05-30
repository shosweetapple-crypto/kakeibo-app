let data = JSON.parse(localStorage.getItem("kakeibo")) || [];

function addData() {
  const date = document.getElementById("date").value;
  const item = document.getElementById("item").value;
  const amount = Number(document.getElementById("amount").value);

  if (!date || !item || !amount) {
    alert("日付・内容・金額を入力してください");
    return;
  }

  data.push({ date, item, amount });
  localStorage.setItem("kakeibo", JSON.stringify(data));

  showData();
}

function showData() {
  const list = document.getElementById("list");
  const total = document.getElementById("total");

  list.innerHTML = "";
  let sum = 0;

  data.forEach((d) => {
    sum += d.amount;
    const li = document.createElement("li");
    li.textContent = `${d.date}　${d.item}　${d.amount}円`;
    list.appendChild(li);
  });

  total.textContent = sum;
}

showData();

let data = JSON.parse(localStorage.getItem("kakeibo")) || [];

function addData() {
  const date = document.getElementById("date").value;
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const person = document.getElementById("person").value;
  const item = document.getElementById("item").value;
  const amount = Number(document.getElementById("amount").value);

  if (!date || !item || !amount) {
    alert("日付・内容・金額を入力してください");
    return;
  }

  data.push({ date, type, category, person, item, amount });
  saveData();
  showData();
}

function saveData() {
  localStorage.setItem("kakeibo", JSON.stringify(data));
}

function deleteData(index) {
  data.splice(index, 1);
  saveData();
  showData();
}

function showData() {
  const list = document.getElementById("list");
  const income = document.getElementById("income");
  const expense = document.getElementById("expense");
  const balance = document.getElementById("balance");
  const graph = document.getElementById("graph");

  list.innerHTML = "";
  graph.innerHTML = "";

  const thisMonth = new Date().toISOString().slice(0, 7);

  let incomeTotal = 0;
  let expenseTotal = 0;
  let categoryTotal = {};

  data.forEach((d, index) => {
    if (d.date.slice(0, 7) === thisMonth) {
      if (d.type === "収入") {
        incomeTotal += d.amount;
      } else {
        expenseTotal += d.amount;
        categoryTotal[d.category] = (categoryTotal[d.category] || 0) + d.amount;
      }
    }

    const li = document.createElement("li");
    li.innerHTML = `
      ${d.date}<br>
      ${d.type} / ${d.category} / ${d.person}<br>
      ${d.item}：${d.amount}円
      <button class="delete" onclick="deleteData(${index})">削除</button>
    `;
    list.appendChild(li);
  });

  income.textContent = incomeTotal;
  expense.textContent = expenseTotal;
  balance.textContent = incomeTotal - expenseTotal;

  const max = Math.max(...Object.values(categoryTotal), 1);

  for (let category in categoryTotal) {
    const bar = document.createElement("div");
    const width = categoryTotal[category] / max * 100;
    bar.className = "bar";
    bar.style.width = width + "%";
    bar.textContent = `${category}：${categoryTotal[category]}円`;
    graph.appendChild(bar);
  }
}

function downloadCSV() {
  let csv = "日付,種類,カテゴリ,担当,内容,金額\n";

  data.forEach(d => {
    csv += `${d.date},${d.type},${d.category},${d.person},${d.item},${d.amount}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "kakeibo.csv";
  link.click();
}

showData();

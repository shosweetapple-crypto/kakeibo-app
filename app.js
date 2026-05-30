let data = JSON.parse(localStorage.getItem("kakeibo")) || [];
let selectedMonth = getThisMonth();

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

function getMonth(date) {
  return date.slice(0, 7);
}

function getThisMonth() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getPreviousMonth(monthText) {
  const [year, month] = monthText.split("-").map(Number);

  let prevYear = year;
  let prevMonth = month - 1;

  if (prevMonth === 0) {
    prevYear -= 1;
    prevMonth = 12;
  }

  return `${prevYear}-${String(prevMonth).padStart(2, "0")}`;
}

function getNextMonth(monthText) {
  const [year, month] = monthText.split("-").map(Number);

  let nextYear = year;
  let nextMonth = month + 1;

  if (nextMonth === 13) {
    nextYear += 1;
    nextMonth = 1;
  }

  return `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
}

function previousMonth() {
  selectedMonth = getPreviousMonth(selectedMonth);
  showData();
}

function nextMonth() {
  selectedMonth = getNextMonth(selectedMonth);
  showData();
}

function showData() {
  const displayMonth = selectedMonth;

  const currentMonthDisplay =
    document.getElementById("currentMonthDisplay");

  const list = document.getElementById("list");
  const income = document.getElementById("income");
  const expense = document.getElementById("expense");
  const balance = document.getElementById("balance");
  const graph = document.getElementById("graph");
  const husbandDeposit = document.getElementById("husbandDeposit");
  const wifeDeposit = document.getElementById("wifeDeposit");
  const monthlyDeposits = document.getElementById("monthlyDeposits");

  if (currentMonthDisplay) {
    currentMonthDisplay.textContent = displayMonth;
  }

  list.innerHTML = "";
  graph.innerHTML = "";
  monthlyDeposits.innerHTML = "";

  let incomeTotal = 0;
  let expenseTotal = 0;
  let categoryTotal = {};

  let husbandIncome = 0;
  let wifeIncome = 0;

  let husbandExpense = 0;
  let wifeExpense = 0;

  data.forEach((d, index) => {
    const dataMonth = getMonth(d.date);

    if (dataMonth === displayMonth) {
      if (d.type === "収入") {
        incomeTotal += d.amount;

        if (d.person === "夫") {
          husbandIncome += d.amount;
        }

        if (d.person === "妻") {
          wifeIncome += d.amount;
        }
      }

      if (d.type === "支出") {
        expenseTotal += d.amount;
        categoryTotal[d.category] =
          (categoryTotal[d.category] || 0) + d.amount;
      }

      const li = document.createElement("li");
      li.innerHTML = `
        ${d.date}<br>
        ${d.type} / ${d.category} / ${d.person}<br>
        ${d.item}：${d.amount.toLocaleString()}円
        <button class="delete" onclick="deleteData(${index})">削除</button>
      `;
      list.appendChild(li);
    }

    if (dataMonth === displayMonth && d.type === "支出") {
      if (d.person === "夫") {
        husbandExpense += d.amount;
      }

      if (d.person === "妻") {
        wifeExpense += d.amount;
      }

      if (d.person === "共通") {
        husbandExpense += d.amount / 2;
        wifeExpense += d.amount / 2;
      }
    }
  });

  const husbandAmount = husbandIncome / 2 - husbandExpense;
  const wifeAmount = wifeIncome / 2 - wifeExpense;
  const totalDeposit = husbandAmount + wifeAmount;

  income.textContent = incomeTotal.toLocaleString();
  expense.textContent = expenseTotal.toLocaleString();
  husbandDeposit.textContent = husbandAmount.toLocaleString();
  wifeDeposit.textContent = wifeAmount.toLocaleString();
  balance.textContent = totalDeposit.toLocaleString();

  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <strong>${displayMonth}</strong><br>
    夫の入金額：${husbandAmount.toLocaleString()}円<br>
    妻の入金額：${wifeAmount.toLocaleString()}円<br>
    合計入金額：${totalDeposit.toLocaleString()}円
  `;
  monthlyDeposits.appendChild(div);

  const max = Math.max(...Object.values(categoryTotal), 1);

  for (let category in categoryTotal) {
    const bar = document.createElement("div");
    const width = categoryTotal[category] / max * 100;

    bar.className = "bar";
    bar.style.width = width + "%";
    bar.textContent =
      `${category}：${categoryTotal[category].toLocaleString()}円`;

    graph.appendChild(bar);
  }
}

function downloadCSV() {
  let csv = "日付,種類,カテゴリ,担当,内容,金額\n";

  data.forEach(d => {
    csv += `${d.date},${d.type},${d.category},${d.person},${d.item},${d.amount}\n`;
  });

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "kakeibo.csv";
  link.click();
}

selectedMonth = getThisMonth();
showData();

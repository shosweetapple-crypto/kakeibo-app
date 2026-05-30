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

function showData() {
  const selectedMonthInput = document.getElementById("selectedMonth");

  if (selectedMonthInput && !selectedMonthInput.value) {
    selectedMonthInput.value = getThisMonth();
  }

  const displayMonth =
    selectedMonthInput && selectedMonthInput.value
      ? selectedMonthInput.value
      : getThisMonth();

  const previousMonth = getPreviousMonth(displayMonth);

  const list = document.getElementById("list");
  const income = document.getElementById("income");
  const expense = document.getElementById("expense");
  const balance = document.getElementById("balance");
  const graph = document.getElementById("graph");
  const husbandDeposit = document.getElementById("husbandDeposit");
  const wifeDeposit = document.getElementById("wifeDeposit");
  const monthlyDeposits = document.getElementById("monthlyDeposits");

  list.innerHTML = "";
  graph.innerHTML = "";
  monthlyDeposits.innerHTML = "";

  let incomeTotal = 0;
  let expenseTotal = 0;
  let categoryTotal = {};

  let husbandIncome = 0;
  let wifeIncome = 0;

  let husbandPrevExpense = 0;
  let wifePrevExpense = 0;

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
        ${d.item}：${d.amount}円
        <button class="delete" onclick="deleteData(${index})">削除</button>
      `;
      list.appendChild(li);
    }

    if (dataMonth === previousMonth && d.type === "支出") {
      if (d.person === "夫") {
        husbandPrevExpense += d.amount;
      }

      if (d.person === "妻") {
        wifePrevExpense += d.amount;
      }
    }
  });

  const husbandAmount = husbandIncome / 2 - husbandPrevExpense;
  const wifeAmount = wifeIncome / 2 - wifePrevExpense;
  const totalDeposit = husbandAmount + wifeAmount;

  income.textContent = incomeTotal;
  expense.textContent = expenseTotal;
  husbandDeposit.textContent = husbandAmount;
  wifeDeposit.textContent = wifeAmount;
  balance.textContent = totalDeposit;

  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <strong>${displayMonth}</strong><br>
    夫の入金額：${husbandAmount}円<br>
    妻の入金額：${wifeAmount}円<br>
    合計入金額：${totalDeposit}円
  `;
  monthlyDeposits.appendChild(div);

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

window.addEventListener("load", function () {
  const selectedMonthInput = document.getElementById("selectedMonth");

  if (selectedMonthInput) {
    selectedMonthInput.value = getThisMonth();

    selectedMonthInput.addEventListener("change", function () {
      showData();
    });
  }

  showData();
});

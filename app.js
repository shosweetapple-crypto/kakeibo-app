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

  const now = new Date();

  const updateTime =
    now.getFullYear() + "/" +
    String(now.getMonth() + 1).padStart(2, "0") + "/" +
    String(now.getDate()).padStart(2, "0") + " " +
    String(now.getHours()).padStart(2, "0") + ":" +
    String(now.getMinutes()).padStart(2, "0") + ":" +
    String(now.getSeconds()).padStart(2, "0");

  localStorage.setItem("lastUpdated", updateTime);
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
  const lastUpdated =
  document.getElementById("lastUpdated");
lastUpdated.textContent = localStorage.getItem("lastUpdated") || "未更新";
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

  const thisMonth = getThisMonth();
  const lastMonth = getPreviousMonth(thisMonth);

  let incomeTotal = 0;
  let expenseTotal = 0;
  let categoryTotal = {};

  let husbandIncome = 0;
  let wifeIncome = 0;

  let husbandLastExpense = 0;
  let wifeLastExpense = 0;

  const months = {};

  data.forEach((d, index) => {
    const dataMonth = getMonth(d.date);

    if (!months[dataMonth]) {
      months[dataMonth] = {
        husbandIncome: 0,
        wifeIncome: 0
      };
    }

    if (d.type === "収入") {
      if (d.person === "夫") {
        months[dataMonth].husbandIncome += d.amount;
      }

      if (d.person === "妻") {
        months[dataMonth].wifeIncome += d.amount;
      }
    }

    if (dataMonth === thisMonth) {
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
    }

    if (dataMonth === lastMonth && d.type === "支出") {
      if (d.person === "夫") {
        husbandLastExpense += d.amount;
      }

      if (d.person === "妻") {
        wifeLastExpense += d.amount;
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

  const husbandAmount = husbandIncome / 2 - husbandLastExpense;
  const wifeAmount = wifeIncome / 2 - wifeLastExpense;
  const totalDeposit = husbandAmount + wifeAmount;

  income.textContent = incomeTotal;
  expense.textContent = expenseTotal;

  husbandDeposit.textContent = husbandAmount;
  wifeDeposit.textContent = wifeAmount;

  balance.textContent = totalDeposit;

  const sortedMonths = Object.keys(months).sort();

  sortedMonths.forEach(month => {
    const prevMonth = getPreviousMonth(month);

    let prevHusbandExpense = 0;
    let prevWifeExpense = 0;

    data.forEach(d => {
      if (getMonth(d.date) === prevMonth && d.type === "支出") {
        if (d.person === "夫") {
          prevHusbandExpense += d.amount;
        }

        if (d.person === "妻") {
          prevWifeExpense += d.amount;
        }
      }
    });

    const husband =
      months[month].husbandIncome / 2 - prevHusbandExpense;

    const wife =
      months[month].wifeIncome / 2 - prevWifeExpense;

    const total = husband + wife;

    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <strong>${month}</strong><br>
      夫の入金額：${husband}円<br>
      妻の入金額：${wife}円<br>
      合計入金額：${total}円
    `;
    monthlyDeposits.appendChild(div);
  });

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

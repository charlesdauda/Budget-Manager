document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("budget-form");
  const description = document.getElementById("description");
  const amount = document.getElementById("amount");
  const type = document.getElementById("type");
  const category = document.getElementById("category");
  const transactionList = document.getElementById("transaction-list");
  const totalIncome = document.getElementById("total-income");
  const totalExpense = document.getElementById("total-expense");
  const balanceDisplay = document.getElementById("balance");
  const chartCanvas = document.getElementById("budgetChart");

  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  let chart;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (amount.value <= 0) return; // safety check

    const transaction = {
      id: Date.now(),
      description: description.value,
      amount: parseFloat(amount.value),
      type: type.value,
      category: category.value
    };

    transactions.push(transaction);
    saveAndRender();
    form.reset();
  });

  function saveAndRender() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    renderTransactions();
    renderSummary();
    renderChart();
  }

  function renderTransactions() {
    transactionList.innerHTML = "";

    transactions.forEach(tx => {
      const li = document.createElement("li");
      li.className = tx.type === "income" ? "income-item" : "expense-item";
      li.innerHTML = `
        <strong>${tx.description}</strong> (${tx.category}) - ₵${tx.amount.toFixed(2)}
        <button data-id="${tx.id}">✖</button>
      `;
      transactionList.appendChild(li);
    });
  }

  transactionList.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      const id = Number(e.target.dataset.id);
      transactions = transactions.filter(tx => tx.id !== id);
      saveAndRender();
    }
  });

  function renderSummary() {
    const income = transactions
      .filter(tx => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const expense = transactions
      .filter(tx => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);

    totalIncome.textContent = `₵${income.toFixed(2)}`;
    totalExpense.textContent = `₵${expense.toFixed(2)}`;
    balanceDisplay.textContent = `₵${(income - expense).toFixed(2)}`;
  }

  function renderChart() {
    const categories = ["Food", "Transport", "Bills", "General"];
    const expenseData = categories.map(cat =>
      transactions
        .filter(tx => tx.type === "expense" && tx.category === cat)
        .reduce((sum, tx) => sum + tx.amount, 0)
    );

    if (chart) chart.destroy();

    chart = new Chart(chartCanvas, {
      type: "doughnut",
      data: {
        labels: categories,
        datasets: [{
          data: expenseData,
          backgroundColor: ["#f87171", "#facc15", "#60a5fa", "#a78bfa"]
        }]
      },
      options: {
        plugins: {
          legend: { position: "bottom" }
        }
      }
    });
  }

  saveAndRender();
});


const descriptionInput = document.querySelector("#description");
const amountInput = document.querySelector("#amount");
const typeInput = document.querySelector("#type");
const categoryInput = document.querySelector("#category");
const dateInput = document.querySelector("#date");
const addTransactionButton = document.querySelector("#add-transaction");
const transactionList = document.querySelector("#transaction-list");
const emptyState = document.querySelector("#empty-state");
const transactionCount = document.querySelector("#transaction-count");
const balance = document.querySelector("#balance");
const income = document.querySelector("#income");
const expenses = document.querySelector("#expenses");
const categoryBreakdown = document.querySelector("#category-breakdown");
const themeToggle = document.querySelector("#theme-toggle");
const searchInput = document.querySelector("#search-input");
const formMessage = document.querySelector("#form-message");

let transactions = JSON.parse(localStorage.getItem("edialeTransactions")) || [];

// Default date to today
if (dateInput && !dateInput.value) {
  dateInput.value = new Date().toISOString().split("T")[0];
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN"
  }).format(amount);
}

function showFormMessage(text, isError) {
  if (!formMessage) return;

  formMessage.textContent = text;
  formMessage.className = isError ? "form-message error" : "form-message success";

  if (!isError) {
    setTimeout(function () {
      formMessage.textContent = "";
      formMessage.className = "form-message";
    }, 2500);
  }
}

function updateSummary() {
  var totalIncome = 0;
  var totalExpenses = 0;

  transactions.forEach(function (transaction) {
    if (transaction.type === "income") {
      totalIncome += Number(transaction.amount);
    } else {
      totalExpenses += Number(transaction.amount);
    }
  });

  balance.textContent = formatMoney(totalIncome - totalExpenses);
  income.textContent = formatMoney(totalIncome);
  expenses.textContent = formatMoney(totalExpenses);
}

function saveTransactions() {
  localStorage.setItem("edialeTransactions", JSON.stringify(transactions));
}

function updateTransactionCount() {
  var count = transactions.length;

  transactionCount.textContent =
    count + (count === 1 ? " transaction" : " transactions");

  if (emptyState) {
    emptyState.style.display = count === 0 ? "block" : "none";
  }
}

function createTransactionElement(transaction) {
  var transactionItem = document.createElement("li");
  transactionItem.classList.add("transaction", transaction.type);
  transactionItem.dataset.id = transaction.id;

  var sign = transaction.type === "income" ? "+" : "-";
  var amountText = sign + formatMoney(transaction.amount);

  transactionItem.innerHTML =
    '<div class="transaction-info">' +
      "<strong>" + transaction.description + "</strong>" +
      "<small>" + transaction.category + " • " + transaction.date + "</small>" +
    "</div>" +
    '<span class="transaction-amount">' + amountText + "</span>" +
    '<button class="delete-transaction" aria-label="Delete transaction">×</button>';

  transactionList.appendChild(transactionItem);

  transactionItem
    .querySelector(".delete-transaction")
    .addEventListener("click", function () {
      var index = transactions.findIndex(function (item) {
        return item.id === transaction.id;
      });

      if (index !== -1) {
        transactions.splice(index, 1);
      }

      transactionItem.remove();
      saveTransactions();
      updateSummary();
      updateTransactionCount();
      updateCategoryBreakdown();
    });
}

function updateCategoryBreakdown() {
  if (!categoryBreakdown) return;

  categoryBreakdown.innerHTML = "";

  var expensesByCategory = {};

  transactions.forEach(function (transaction) {
    if (transaction.type === "expense") {
      if (!expensesByCategory[transaction.category]) {
        expensesByCategory[transaction.category] = 0;
      }
      expensesByCategory[transaction.category] += Number(transaction.amount);
    }
  });

  var categories = Object.keys(expensesByCategory);

  if (categories.length === 0) {
    categoryBreakdown.innerHTML =
      '<p class="breakdown-empty">Add expenses to see your spending breakdown.</p>';
    return;
  }

  var highestAmount = Math.max.apply(null, Object.values(expensesByCategory));

  categories.forEach(function (category) {
    var amount = expensesByCategory[category];
    var percentage = (amount / highestAmount) * 100;

    var row = document.createElement("div");
    row.classList.add("category-row");

    row.innerHTML =
      '<span class="category-name">' + category + "</span>" +
      '<div class="category-bar">' +
        '<div class="category-fill" style="width: ' + percentage + '%"></div>' +
      "</div>" +
      '<span class="category-amount">' + formatMoney(amount) + "</span>";

    categoryBreakdown.appendChild(row);
  });
}

function addTransaction() {
  var description = descriptionInput.value.trim();
  var amount = Number(amountInput.value);
  var type = typeInput.value;
  var category = categoryInput.value;
  var date = dateInput.value;

  if (description === "") {
    showFormMessage("Please enter a description.", true);
    descriptionInput.focus();
    return;
  }

  if (!amount || amount <= 0) {
    showFormMessage("Please enter a valid amount greater than 0.", true);
    amountInput.focus();
    return;
  }

  if (date === "") {
    showFormMessage("Please select a date.", true);
    dateInput.focus();
    return;
  }

  var transaction = {
    id: Date.now(),
    description: description,
    amount: amount,
    type: type,
    category: category,
    date: date
  };

  transactions.push(transaction);
  saveTransactions();
  createTransactionElement(transaction);

  // Clear form fields
  descriptionInput.value = "";
  amountInput.value = "";
  dateInput.value = new Date().toISOString().split("T")[0];

  updateSummary();
  updateTransactionCount();
  updateCategoryBreakdown();
  showFormMessage("Transaction added successfully.", false);
}

if (addTransactionButton) {
  addTransactionButton.addEventListener("click", addTransaction);
}

if (descriptionInput) {
  descriptionInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") addTransaction();
  });
}

if (amountInput) {
  amountInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") addTransaction();
  });
}

function loadTransactions() {
  transactionList.innerHTML = "";

  var sortedTransactions = transactions.slice().sort(function (a, b) {
    return new Date(b.date + "T00:00:00") - new Date(a.date + "T00:00:00");
  });

  sortedTransactions.forEach(function (transaction) {
    createTransactionElement(transaction);
  });
}




// Theme toggle
if (themeToggle) {
  var savedTheme = localStorage.getItem("edialeExpenseTheme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️";
  }

  themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
    var isDark = document.body.classList.contains("dark-mode");

    if (isDark) {
      themeToggle.textContent = "☀️";
      localStorage.setItem("edialeExpenseTheme", "dark");
    } else {
      themeToggle.textContent = "🌙";
      localStorage.setItem("edialeExpenseTheme", "light");
    }
  });
}





// Search
if (searchInput) {
  searchInput.addEventListener("input", function () {
    var searchTerm = searchInput.value.toLowerCase().trim();
    var transactionElements = transactionList.querySelectorAll(".transaction");

    transactionElements.forEach(function (transactionElement) {
      var transactionId = Number(transactionElement.dataset.id);

      var transaction = transactions.find(function (item) {
        return item.id === transactionId;
      });

      if (!transaction) {
        transactionElement.style.display = "none";
        return;
      }

      var matches =
        transaction.description.toLowerCase().includes(searchTerm) ||
        transaction.category.toLowerCase().includes(searchTerm);

      transactionElement.style.display = matches ? "flex" : "none";
    });
  });
}

// Start app
loadTransactions();
updateSummary();
updateTransactionCount();
updateCategoryBreakdown();

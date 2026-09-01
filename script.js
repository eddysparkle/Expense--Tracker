const descriptionInput = document.querySelector("#description");
const amountInput = document.querySelector("#amount");
const typeInput = document.querySelector("#type");
const categoryInput = document.querySelector("#category");
const dateInput = document.querySelector("#date");

const addTransactionButton =
  document.querySelector("#add-transaction");

const transactionList =
  document.querySelector("#transaction-list");

const emptyState =
  document.querySelector("#empty-state");

const transactionCount =
  document.querySelector("#transaction-count");

const balance =
  document.querySelector("#balance");

const income =
  document.querySelector("#income");

const expenses =
  document.querySelector("#expenses");

const categoryBreakdown =
  document.querySelector("#category-breakdown");

const themeToggle =
  document.querySelector("#theme-toggle");

const searchInput =
  document.querySelector("#search-input");


let transactions =
  JSON.parse(localStorage.getItem("edialeTransactions")) || [];


// FORMAT MONEY

function formatMoney(amount) {

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN"
  }).format(amount);

}


// UPDATE SUMMARY

function updateSummary() {

  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach(function(transaction) {

    if (transaction.type === "income") {

      totalIncome += Number(transaction.amount);

    } else {

      totalExpenses += Number(transaction.amount);

    }

  });

  balance.textContent =
    formatMoney(totalIncome - totalExpenses);

  income.textContent =
    formatMoney(totalIncome);

  expenses.textContent =
    formatMoney(totalExpenses);

}


// SAVE

function saveTransactions() {

  localStorage.setItem(
    "edialeTransactions",
    JSON.stringify(transactions)
  );

}


// UPDATE COUNT

function updateTransactionCount() {

  const count = transactions.length;

  transactionCount.textContent =
    count +
    (count === 1 ? " transaction" : " transactions");

  if (count === 0) {

    emptyState.style.display = "block";

  } else {

    emptyState.style.display = "none";

  }

}


// CREATE TRANSACTION

function createTransactionElement(transaction) {

  const transactionItem =
    document.createElement("li");

  transactionItem.classList.add(
    "transaction",
    transaction.type
  );

  transactionItem.dataset.id =
    transaction.id;


  const sign =
    transaction.type === "income"
      ? "+"
      : "-";


  transactionItem.innerHTML = `

    <div class="transaction-info">

      <strong>
        ${transaction.description}
      </strong>

      <small>
        ${transaction.category} • ${transaction.date}
      </small>

    </div>

    <span class="transaction-amount">
      ${sign}${formatMoney(transaction.amount)}
    </span>

    <button
      class="delete-transaction"
      aria-label="Delete transaction"
    >
      ×
    </button>

  `;


  transactionList.appendChild(
    transactionItem
  );


  const deleteButton =
    transactionItem.querySelector(
      ".delete-transaction"
    );


  deleteButton.addEventListener(
    "click",
    function() {

      const transactionId =
        transaction.id;


      const index =
        transactions.findIndex(
          function(item) {

            return item.id === transactionId;

          }
        );


      if (index !== -1) {

        transactions.splice(index, 1);

      }


      transactionItem.remove();

      saveTransactions();

      updateSummary();

      updateTransactionCount();

      updateCategoryBreakdown();

    }
  );

}


// CATEGORY BREAKDOWN

function updateCategoryBreakdown() {

  categoryBreakdown.innerHTML = "";


  const expensesByCategory = {};


  transactions.forEach(function(transaction) {

    if (transaction.type === "expense") {

      if (
        !expensesByCategory[transaction.category]
      ) {

        expensesByCategory[transaction.category] = 0;

      }


      expensesByCategory[transaction.category] +=
        Number(transaction.amount);

    }

  });


  const categories =
    Object.keys(expensesByCategory);


  if (categories.length === 0) {

    categoryBreakdown.innerHTML = `
      <p class="breakdown-empty">
        Add expenses to see your spending breakdown.
      </p>
    `;

    return;

  }


  const highestAmount =
    Math.max(
      ...Object.values(expensesByCategory)
    );


  categories.forEach(function(category) {

    const amount =
      expensesByCategory[category];


    const percentage =
      (amount / highestAmount) * 100;


    const row =
      document.createElement("div");

    row.classList.add("category-row");


    row.innerHTML = `

      <span class="category-name">
        ${category}
      </span>

      <div class="category-bar">

        <div
          class="category-fill"
          style="width: ${percentage}%"
        ></div>

      </div>

      <span class="category-amount">
        ${formatMoney(amount)}
      </span>

    `;


    categoryBreakdown.appendChild(row);

  });

}


// ADD TRANSACTION

function addTransaction() {

  const description =
    descriptionInput.value.trim();

  const amount =
    Number(amountInput.value);

  const type =
    typeInput.value;

  const category =
    categoryInput.value;

  const date =
    dateInput.value;


  if (
    description === "" ||
    amount <= 0 ||
    date === ""
  ) {

    return;

  }


  const transaction = {

    id: Date.now(),

    description: description,

    amount: amount,

    type: type,

    category: category,

    date: date

  };


  transactions.push(
    transaction
  );


  saveTransactions();


  createTransactionElement(
    transaction
  );


  descriptionInput.value = "";

  amountInput.value = "";

  dateInput.value = "";


  updateSummary();

  updateTransactionCount();

  updateCategoryBreakdown();

}


// ADD BUTTON

addTransactionButton.addEventListener(
  "click",
  addTransaction
);


// ENTER KEY

descriptionInput.addEventListener(
  "keydown",
  function(event) {

    if (event.key === "Enter") {

      addTransaction();

    }

  }
);


// LOAD TRANSACTIONS

function loadTransactions() {

  transactionList.innerHTML = "";


  const sortedTransactions =
    [...transactions].sort(
      function(a, b) {

        return new Date(
          b.date + "T00:00:00"
        ) -
        new Date(
          a.date + "T00:00:00"
        );

      }
    );


  sortedTransactions.forEach(
    function(transaction) {

      createTransactionElement(
        transaction
      );

    }
  );

}


// THEME

const savedTheme =
  localStorage.getItem(
    "edialeExpenseTheme"
  );


if (savedTheme === "dark") {

  document.body.classList.add(
    "dark-mode"
  );

  themeToggle.textContent = "☀️";

}


themeToggle.addEventListener(
  "click",
  function() {

    document.body.classList.toggle(
      "dark-mode"
    );


    const isDark =
      document.body.classList.contains(
        "dark-mode"
      );


    if (isDark) {

      themeToggle.textContent = "☀️";

      localStorage.setItem(
        "edialeExpenseTheme",
        "dark"
      );

    } else {

      themeToggle.textContent = "🌙";

      localStorage.setItem(
        "edialeExpenseTheme",
        "light"
      );

    }

  }
);


// SEARCH

searchInput.addEventListener(
  "input",
  function() {

    const searchTerm =
      searchInput.value
        .toLowerCase()
        .trim();


    const transactionElements =
      transactionList.querySelectorAll(
        ".transaction"
      );


    transactionElements.forEach(
      function(transactionElement) {

        const transactionId =
          Number(
            transactionElement.dataset.id
          );


        const transaction =
          transactions.find(
            function(item) {

              return item.id === transactionId;

            }
          );


        if (!transaction) {

          transactionElement.style.display =
            "none";

          return;

        }


        const matches =
          transaction.description
            .toLowerCase()
            .includes(searchTerm) ||

          transaction.category
            .toLowerCase()
            .includes(searchTerm);


        transactionElement.style.display =
          matches ? "flex" : "none";

      }
    );

  }
);


// START APP

loadTransactions();

updateSummary();

updateTransactionCount();

updateCategoryBreakdown();

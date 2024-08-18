const addExpenseForm = document.getElementById('add-expense-form');
const expenseList = document.getElementById('expenses');
const categoryFilter = document.getElementById('category-filter');
const sortBy = document.getElementById('sort-by');
const totalExpenses = document.getElementById('total-expenses');
const categoryBreakdown = document.getElementById('category-breakdown');

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

function addExpense(event) {
    event.preventDefault();

    const name = document.getElementById('expense-name').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;
    const date = document.getElementById('expense-date').value;

    const expense = {
        id: Date.now(),
        name,
        amount,
        category,
        date
    };

    expenses.push(expense);
    updateLocalStorage();
    updateExpenseList();
    updateExpenseSummary();
    addExpenseForm.reset();
}

function updateExpenseList() {
    const filteredExpenses = filterExpenses();
    const sortedExpenses = sortExpenses(filteredExpenses);

    expenseList.innerHTML = '';
    sortedExpenses.forEach(expense => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${expense.name}</span>
            <span>$${expense.amount.toFixed(2)}</span>
            <span>${expense.category}</span>
            <span>${expense.date}</span>
            <button onclick="deleteExpense(${expense.id})">Delete</button>
        `;
        expenseList.appendChild(li);
    });
}

function deleteExpense(id) {
    expenses = expenses.filter(expense => expense.id !== id);
    updateLocalStorage();
    updateExpenseList();
    updateExpenseSummary();
}

function filterExpenses() {
    const selectedCategory = categoryFilter.value;
    return selectedCategory === 'all' ? expenses : expenses.filter(expense => expense.category === selectedCategory);
}

function sortExpenses(expensesToSort) {
    const selectedSort = sortBy.value;
    return expensesToSort.sort((a, b) => {
        if (selectedSort === 'date') {
            return new Date(b.date) - new Date(a.date);
        } else if (selectedSort === 'amount') {
            return b.amount - a.amount;
        } else if (selectedSort === 'category') {
            return a.category.localeCompare(b.category);
        }
    });
}

function updateExpenseSummary() {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalExpenses.textContent = `Total Expenses: $${total.toFixed(2)}`;

    const categories = {};
    expenses.forEach(expense => {
        categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
    });

    categoryBreakdown.innerHTML = '<h3>Category Breakdown:</h3>';
    for (const [category, amount] of Object.entries(categories)) {
        categoryBreakdown.innerHTML += `<p>${category}: $${amount.toFixed(2)}</p>`;
    }
}

function updateLocalStorage() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

addExpenseForm.addEventListener('submit', addExpense);
categoryFilter.addEventListener('change', updateExpenseList);
sortBy.addEventListener('change', updateExpenseList);

updateExpenseList();
updateExpenseSummary();
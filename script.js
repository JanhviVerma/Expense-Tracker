const addExpenseForm = document.getElementById('add-expense-form');
const expenseList = document.getElementById('expenses-list');
const categoryFilter = document.getElementById('category-filter');
const sortBy = document.getElementById('sort-by');
const totalExpenses = document.getElementById('total-expenses');
const categoryBreakdown = document.getElementById('category-breakdown');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const budgetForm = document.getElementById('budget-form');
const budgetProgress = document.getElementById('budget-progress');
const searchInput = document.getElementById('search-input'); // New search input

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let currentPage = 1;
const expensesPerPage = 10;
let monthlyBudget = parseFloat(localStorage.getItem('monthlyBudget')) || 0;

addExpenseForm.addEventListener('submit', addExpense);
categoryFilter.addEventListener('change', updateExpenseList);
sortBy.addEventListener('change', updateExpenseList);
searchInput.addEventListener('input', updateExpenseList);
budgetForm.addEventListener('submit', setBudget);

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
    updateCharts();
    updateDashboard();
    addExpenseForm.reset();
}

function updateExpenseList() {
    const filteredExpenses = filterExpenses();
    const sortedExpenses = sortExpenses(filteredExpenses);
    const paginatedExpenses = paginateExpenses(sortedExpenses);

    expenseList.innerHTML = '';
    paginatedExpenses.forEach(expense => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${expense.name}</span>
            <span>$${expense.amount.toFixed(2)}</span>
            <span>${expense.category}</span>
            <span>${formatDate(expense.date)}</span>
            <button onclick="confirmDelete(${expense.id})">Delete</button>
            <button onclick="editExpense(${expense.id})">Edit</button>
        `;
        expenseList.appendChild(li);
    });

    updatePagination(sortedExpenses.length);
}

function confirmDelete(id) {
    const confirmation = confirm('Are you sure you want to delete this expense?');
    if (confirmation) {
        deleteExpense(id);
    }
}

function deleteExpense(id) {
    expenses = expenses.filter(expense => expense.id !== id);
    updateLocalStorage();
    updateExpenseList();
    updateExpenseSummary();
    updateCharts();
    updateDashboard();
}

function editExpense(id) {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
        document.getElementById('expense-name').value = expense.name;
        document.getElementById('expense-amount').value = expense.amount;
        document.getElementById('expense-category').value = expense.category;
        document.getElementById('expense-date').value = expense.date;

        expenses = expenses.filter(e => e.id !== id);
        updateLocalStorage();
        updateExpenseList();
        updateExpenseSummary();
        updateCharts();
        updateDashboard();
    }
}

function filterExpenses() {
    const selectedCategory = categoryFilter.value;
    const searchTerm = searchInput.value.toLowerCase();
    return expenses.filter(expense => {
        const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
        const matchesSearch = expense.name.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
    });
}

function sortExpenses(expenses) {
    const sortByValue = sortBy.value;
    return expenses.sort((a, b) => {
        if (sortByValue === 'date') {
            return new Date(a.date) - new Date(b.date);
        } else if (sortByValue === 'amount') {
            return a.amount - b.amount;
        } else if (sortByValue === 'category') {
            return a.category.localeCompare(b.category);
        }
    });
}

function paginateExpenses(expenses) {
    const startIndex = (currentPage - 1) * expensesPerPage;
    const endIndex = startIndex + expensesPerPage;
    return expenses.slice(startIndex, endIndex);
}

function updatePagination(totalExpensesCount) {
    const totalPages = Math.ceil(totalExpensesCount / expensesPerPage);
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

function formatDate(date) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
}

function updateLocalStorage() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function setBudget(event) {
    event.preventDefault();
    monthlyBudget = parseFloat(document.getElementById('budget-amount').value);
    localStorage.setItem('monthlyBudget', monthlyBudget);
    updateBudgetProgress();
    updateDashboard();
}

function updateExpenseSummary() {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalExpenses.textContent = `Total Expenses: $${total.toFixed(2)}`;
    updateCategoryBreakdown();
}

function updateCategoryBreakdown() {
    const categories = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {});

    categoryBreakdown.innerHTML = '';
    for (const [category, amount] of Object.entries(categories)) {
        const div = document.createElement('div');
        div.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)}: $${amount.toFixed(2)}`;
        categoryBreakdown.appendChild(div);
    }
}

function updateBudgetProgress() {
    const progress = (expenses.reduce((sum, expense) => sum + expense.amount, 0) / monthlyBudget) * 100;
    budgetProgress.textContent = `Budget Usage: ${progress.toFixed(2)}%`;
    budgetProgress.style.width = `${Math.min(progress, 100)}%`;
    budgetProgress.style.backgroundColor = progress > 100 ? '#dc3545' : '#28a745';
}

function updateDashboard() {
    // Example of updating dashboard elements. You can add more functionalities here.
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    document.getElementById('total-spent').textContent = `Total Spent: $${totalSpent.toFixed(2)}`;
    document.getElementById('budget-status').textContent = totalSpent > monthlyBudget ? 'Over Budget' : 'Within Budget';
    const topCategory = Object.entries(expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {})).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('top-category').textContent = `Top Category: ${topCategory ? topCategory[0].charAt(0).toUpperCase() + topCategory[0].slice(1) : 'None'}`;
    const recentExpenses = expenses.slice(-5).map(expense => `<div>${expense.name}: $${expense.amount.toFixed(2)} (${formatDate(expense.date)})</div>`).join('');
    document.getElementById('recent-expenses').innerHTML = `Recent Expenses: ${recentExpenses}`;
}

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        updateExpenseList();
    }
});

nextPageBtn.addEventListener('click', () => {
    const totalExpensesCount = filterExpenses().length;
    const totalPages = Math.ceil(totalExpensesCount / expensesPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        updateExpenseList();
    }
});

updateExpenseList();
updateExpenseSummary();
updateBudgetProgress();
updateDashboard();

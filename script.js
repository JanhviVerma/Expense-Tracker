const addExpenseForm = document.getElementById('add-expense-form');
const expenseList = document.getElementById('expenses');
const categoryFilter = document.getElementById('category-filter');
const sortBy = document.getElementById('sort-by');
const totalExpenses = document.getElementById('total-expenses');
const categoryBreakdown = document.getElementById('category-breakdown');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const budgetForm = document.getElementById('budget-form');
const budgetProgress = document.getElementById('budget-progress');

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let currentPage = 1;
const expensesPerPage = 10;
let monthlyBudget = parseFloat(localStorage.getItem('monthlyBudget')) || 0;

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
            <span>${expense.date}</span>
            <button onclick="deleteExpense(${expense.id})">Delete</button>
            <button onclick="editExpense(${expense.id})">Edit</button>
        `;
        expenseList.appendChild(li);
    });

    updatePagination(sortedExpenses.length);
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

function paginateExpenses(expensesToPaginate) {
    const startIndex = (currentPage - 1) * expensesPerPage;
    const endIndex = startIndex + expensesPerPage;
    return expensesToPaginate.slice(startIndex, endIndex);
}

function updatePagination(totalExpenses) {
    const totalPages = Math.ceil(totalExpenses / expensesPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
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

function updateCharts() {
    updateCategoryChart();
    updateTrendChart();
}

function updateCategoryChart() {
    const ctx = document.getElementById('category-chart').getContext('2d');
    const categories = {};
    expenses.forEach(expense => {
        categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
    });

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: ['#ffd700', '#ffa500', '#ff6347', '#98fb98', '#87cefa']
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Expenses by Category'
            }
        }
    });
}

function updateTrendChart() {
    const ctx = document.getElementById('trend-chart').getContext('2d');
    const dates = {};
    expenses.forEach(expense => {
        dates[expense.date] = (dates[expense.date] || 0) + expense.amount;
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(dates).sort(),
            datasets: [{
                label: 'Daily Expenses',
                data: Object.keys(dates).sort().map(date => dates[date]),
                borderColor: '#ffd700',
                fill: false
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Expense Trend'
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                }]
            }
        }
    });
}

function updateLocalStorage() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('monthlyBudget', monthlyBudget.toString());
}

function setBudget(event) {
    event.preventDefault();
    monthlyBudget = parseFloat(document.getElementById('budget-amount').value);
    updateLocalStorage();
    updateBudgetProgress();
    updateDashboard();
}

function updateBudgetProgress() {
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const percentageSpent = (totalSpent / monthlyBudget) * 100;
    
    budgetProgress.innerHTML = `
        <h3>Budget Progress</h3>
        <p>Monthly Budget: $${monthlyBudget.toFixed(2)}</p>
        <p>Total Spent: $${totalSpent.toFixed(2)}</p>
        <div class="progress-bar">
            <div class="progress" style="width: ${percentageSpent}%"></div>
        </div>
        <p>${percentageSpent.toFixed(2)}% of budget spent</p>
    `;
}

function updateDashboard() {
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const budgetStatus = monthlyBudget - totalSpent;
    const categories = {};
    expenses.forEach(expense => {
        categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
    });
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    const recentExpenses = expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    document.getElementById('total-spent').innerHTML = `
        <h3>Total Spent</h3>
        <p>$${totalSpent.toFixed(2)}</p>
    `;

    document.getElementById('budget-status').innerHTML = `
        <h3>Budget Status</h3>
        <p class="${budgetStatus >= 0 ? 'success' : 'danger'}">
            ${budgetStatus >= 0 ? 'Under' : 'Over'} budget by $${Math.abs(budgetStatus).toFixed(2)}
        </p>
    `;

    document.getElementById('top-category').innerHTML = `
        <h3>Top Spending Category</h3>
        <p>${topCategory ? `${topCategory[0]}: $${topCategory[1].toFixed(2)}` : 'N/A'}</p>
    `;

    const recentExpensesHtml = recentExpenses.map(expense => `
        <li>${expense.name}: $${expense.amount.toFixed(2)}</li>
    `).join('');

    document.getElementById('recent-expenses').innerHTML = `
        <h3>Recent Expenses</h3>
        <ul>${recentExpensesHtml}</ul>
    `;
}

addExpenseForm.addEventListener('submit', addExpense);
categoryFilter.addEventListener('change', updateExpenseList);
sortBy.addEventListener('change', updateExpenseList);
prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        updateExpenseList();
    }
});
nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filterExpenses().length / expensesPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        updateExpenseList();
    }
});
budgetForm.addEventListener('submit', setBudget);

updateExpenseList();
updateExpenseSummary();
updateCharts();
updateBudgetProgress();
updateDashboard();
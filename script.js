const addExpenseForm = document.getElementById('add-expense-form');
const expenseList = document.getElementById('expenses');
const categoryFilter = document.getElementById('category-filter');
const sortBy = document.getElementById('sort-by');
const totalExpenses = document.getElementById('total-expenses');
const categoryBreakdown = document.getElementById('category-breakdown');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let currentPage = 1;
const expensesPerPage = 10;

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

updateExpenseList();
updateExpenseSummary();
updateCharts();
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
let savingsGoals = JSON.parse(localStorage.getItem('savingsGoals')) || [];

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
    localStorage.setItem('savingsGoals', JSON.stringify(savingsGoals));
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

    updateRecentExpenses();
    updateExpenseAnalytics();
}

function updateRecentExpenses() {
    const recentExpensesList = document.getElementById('recent-expenses-list');
    const recentExpenses = expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    recentExpensesList.innerHTML = recentExpenses.map(expense => `
        <li>
            <strong>${expense.name}</strong>
            <span>$${expense.amount.toFixed(2)}</span>
            <span>${expense.date}</span>
        </li>
    `).join('');
}

function updateExpenseAnalytics() {
    updateMonthlyComparison();
    updateCategoryPercentage();
    updateExpenseForecast();
    updateExpenseHistoryChart();
}

function updateMonthlyComparison() {
    const currentMonth = new Date().getMonth();
    const currentYearExpenses = expenses.filter(expense => new Date(expense.date).getFullYear() === new Date().getFullYear());
    const thisMonthTotal = currentYearExpenses.filter(expense => new Date(expense.date).getMonth() === currentMonth)
        .reduce((sum, expense) => sum + expense.amount, 0);
    const lastMonthTotal = currentYearExpenses.filter(expense => new Date(expense.date).getMonth() === (currentMonth - 1 + 12) % 12)
        .reduce((sum, expense) => sum + expense.amount, 0);
    
    const difference = thisMonthTotal - lastMonthTotal;
    const percentageChange = lastMonthTotal !== 0 ? (difference / lastMonthTotal) * 100 : 100;
    
    document.getElementById('monthly-comparison').innerHTML = `
        <h3>Monthly Comparison</h3>
        <p>This Month: $${thisMonthTotal.toFixed(2)}</p>
        <p>Last Month: $${lastMonthTotal.toFixed(2)}</p>
        <p class="${difference >= 0 ? 'danger' : 'success'}">
            ${difference >= 0 ? 'Increase' : 'Decrease'} of ${Math.abs(percentageChange).toFixed(2)}%
        </p>
    `;
}

function updateCategoryPercentage() {
    const categories = {};
    const total = expenses.reduce((sum, expense) => {
        categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
        return sum + expense.amount;
    }, 0);
    
    const categoryPercentages = Object.entries(categories).map(([category, amount]) => ({
        category,
        percentage: (amount / total) * 100
    })).sort((a, b) => b.percentage - a.percentage);
    
    document.getElementById('category-percentage').innerHTML = `
        <h3>Category Breakdown</h3>
        ${categoryPercentages.map(item => `
            <p>${item.category}: ${item.percentage.toFixed(2)}%</p>
        `).join('')}
    `;
}

function updateExpenseForecast() {
    const monthlyAverage = expenses.reduce((sum, expense) => sum + expense.amount, 0) / 12;
    const projectedAnnualExpense = monthlyAverage * 12;
    
    document.getElementById('expense-forecast').innerHTML = `
        <h3>Expense Forecast</h3>
        <p>Monthly Average: $${monthlyAverage.toFixed(2)}</p>
        <p>Projected Annual: $${projectedAnnualExpense.toFixed(2)}</p>
    `;
}

function updateExpenseHistoryChart() {
    const ctx = document.getElementById('expense-history-chart').getContext('2d');
    const monthlyData = Array(12).fill(0);
    
    expenses.forEach(expense => {
        const month = new Date(expense.date).getMonth();
        monthlyData[month] += expense.amount;
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Monthly Expenses',
                data: monthlyData,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function addSavingsGoal(event) {
    event.preventDefault();
    const goalName = document.getElementById('goal-name').value;
    const goalAmount = parseFloat(document.getElementById('goal-amount').value);
    const goalDate = document.getElementById('goal-date').value;
    
    const newGoal = {
        id: Date.now(),
        name: goalName,
        targetAmount: goalAmount,
        targetDate: goalDate,
        currentAmount: 0
    };
    
    savingsGoals.push(newGoal);
    updateLocalStorage();
    updateSavingsGoalsList();
    document.getElementById('savings-goal-form').reset();
}

function updateSavingsGoalsList() {
    const savingsGoalsList = document.getElementById('savings-goals-list');
    savingsGoalsList.innerHTML = savingsGoals.map(goal => `
        <div class="savings-goal">
            <h4>${goal.name}</h4>
            <p>Target: $${goal.targetAmount.toFixed(2)} by ${goal.targetDate}</p>
            <p>Progress: $${goal.currentAmount.toFixed(2)} / $${goal.targetAmount.toFixed(2)}</p>
            <div class="goal-progress">
                <div class="goal-progress-bar" style="width: ${(goal.currentAmount / goal.targetAmount) * 100}%"></div>
            </div>
            <button onclick="contributeToGoal(${goal.id})">Contribute</button>
            <button onclick="deleteGoal(${goal.id})">Delete</button>
        </div>
    `).join('');
}

function contributeToGoal(goalId) {
    const amount = parseFloat(prompt('Enter contribution amount:'));
    if (isNaN(amount) || amount <= 0) return;
    
    const goal = savingsGoals.find(g => g.id === goalId);
    if (goal) {
        goal.currentAmount += amount;
        updateLocalStorage();
        updateSavingsGoalsList();
    }
}

function deleteGoal(goalId) {
    savingsGoals = savingsGoals.filter(goal => goal.id !== goalId);
    updateLocalStorage();
    updateSavingsGoalsList();
}

// Add to existing code

function aiCategorizeExpense(description) {
    // Simulated AI categorization logic
    const keywords = {
        food: ['grocery', 'restaurant', 'meal', 'dinner', 'lunch', 'breakfast'],
        transportation: ['gas', 'fuel', 'bus', 'train', 'taxi', 'uber'],
        utilities: ['electricity', 'water', 'internet', 'phone'],
        entertainment: ['movie', 'concert', 'game', 'book'],
    };

    description = description.toLowerCase();
    for (const [category, words] of Object.entries(keywords)) {
        if (words.some(word => description.includes(word))) {
            return category;
        }
    }
    return 'other';
}

document.getElementById('ai-categorize-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const description = document.getElementById('expense-description').value;
    const suggestedCategory = aiCategorizeExpense(description);
    document.getElementById('ai-suggestion').textContent = `Suggested category: ${suggestedCategory}`;
});

function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Amount,Category,Date\n";
    expenses.forEach(expense => {
        csvContent += `${expense.name},${expense.amount},${expense.category},${expense.date}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "expenses.csv");
    document.body.appendChild(link);
    link.click();
}

function exportToJSON() {
    const jsonContent = JSON.stringify(expenses, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "expenses.json");
    document.body.appendChild(link);
    link.click();
}

document.getElementById('export-csv').addEventListener('click', exportToCSV);
document.getElementById('export-json').addEventListener('click', exportToJSON);

// Enhance updateExpenseAnalytics function
function updateExpenseAnalytics() {
    updateMonthlyComparison();
    updateCategoryPercentage();
    updateExpenseForecast();
    updateExpenseHistoryChart();
    predictFutureExpenses();
}

function predictFutureExpenses() {
    const lastSixMonths = expenses
        .filter(expense => new Date(expense.date) >= new Date(Date.now() - 180 * 24 * 60 * 60 * 1000))
        .reduce((acc, expense) => {
            const month = new Date(expense.date).toISOString().slice(0, 7); // "YYYY-MM" format
            acc[month] = (acc[month] || 0) + expense.amount;
            return acc;
        }, {});

    const months = Object.keys(lastSixMonths);
    const totals = Object.values(lastSixMonths);
    
    if (months.length > 1) {
        const trend = totals.reduce((acc, curr, index, array) => {
            if (index === 0) return acc;
            const prev = array[index - 1];
            acc.push(curr - prev);
            return acc;
        }, []);
        
        const averageTrend = trend.reduce((acc, val) => acc + val, 0) / trend.length;

        const futurePredictions = [];
        const futureMonths = 6;
        let lastTotal = totals[totals.length - 1];
        
        for (let i = 1; i <= futureMonths; i++) {
            lastTotal += averageTrend;
            futurePredictions.push({
                month: addMonthsToDate(new Date(months[months.length - 1]), i),
                predictedExpense: lastTotal
            });
        }

        document.getElementById('expense-prediction').innerHTML = `
            <h3>Future Expense Predictions</h3>
            ${futurePredictions.map(pred => `
                <p>${pred.month}: $${pred.predictedExpense.toFixed(2)}</p>
            `).join('')}
        `;
    } else {
        document.getElementById('expense-prediction').innerHTML = `
            <h3>Future Expense Predictions</h3>
            <p>Not enough data to predict future expenses.</p>
        `;
    }
}

function addMonthsToDate(date, months) {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate.toISOString().slice(0, 7); // "YYYY-MM" format
}


// Call this function when updating the dashboard
updateExpenseAnalytics();

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
document.getElementById('savings-goal-form').addEventListener('submit', addSavingsGoal);

updateExpenseList();
updateExpenseSummary();
updateCharts();
updateBudgetProgress();
updateDashboard();
updateRecentExpenses();
updateExpenseAnalytics();
updateSavingsGoalsList();
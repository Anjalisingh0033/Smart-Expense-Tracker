let expenses = JSON.parse(localStorage.getItem("expense")) || [];
let chart;
let currentMonthFilter = "";
let balance = 0;

updateBalance();
renderExpense();
updateChart();
populateMonthFilter();

function addExpense() {
    const desc = document.getElementById("description").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    if (desc === "" || isNaN(amount) || category === "" || date === "") {
        alert("Please fill all fields correctly!");
        return;
    }

    const newExpense = {
        id: Date.now(),
        description: desc,
        amount: amount,
        category: category,
        date: date,
    };

    expenses.push(newExpense);
    saveExpenses();
    updateBalance();
    renderExpense();
    clearForm();
    updateChart();
    populateMonthFilter();
}

function saveExpenses() {
    localStorage.setItem("expense", JSON.stringify(expenses));
}

function getFilteredExpenses() {
    return currentMonthFilter
        ? expenses.filter(e => e.date.startsWith(currentMonthFilter))
        : expenses;
}

function updateBalance() {
    const filtered = getFilteredExpenses();
    balance = filtered.reduce((total, exp) => total - exp.amount, 0);
    document.getElementById("balance").innerText = `₹${Math.abs(balance).toFixed(2)}`;
}

function renderExpense() {
    const list = document.getElementById("expense-list");
    const filtered = getFilteredExpenses();
    list.innerHTML = "";

    filtered.forEach(exp => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${exp.description} (${exp.category}) -
            <span> ₹${exp.amount.toFixed(2)} </span>
            <button onclick="deleteExpense(${exp.id})">X</button>
        `;
        list.appendChild(li);
    });
}

function clearForm() {
    document.getElementById("description").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("category").value = "";
    document.getElementById("date").value = "";
}

function deleteExpense(id) {
    expenses = expenses.filter(e => e.id !== id);
    saveExpenses();
    updateBalance();
    renderExpense();
    updateChart();
    populateMonthFilter();
}

function updateChart() {
    const filtered = getFilteredExpenses();
    const categories = {};

    filtered.forEach(exp => {
        categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });

    const labels = Object.keys(categories);
    const data = Object.values(categories);

    if (chart) chart.destroy();
    if (labels.length ===0) return;

    chart = new Chart(document.getElementById("expense-chart"), {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                label: "Expenses",
                data: data,
                backgroundColor: [
                    "#ff6384", "#36a2eb", "#ffcd56", "#99ccff", "#ff9f40"
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio:false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Smart Expense Tracker Report", 20, 20);

    let y = 40;
    getFilteredExpenses().forEach((exp, index) => {
        doc.setFontSize(12);
        doc.text(`${index + 1}. ${exp.description} - ₹${exp.amount.toFixed(2)}`, 20, y);
        y += 10;
    });

    doc.setFontSize(14);
    doc.text(`Total Expenses: ₹${Math.abs(balance).toFixed(2)}`, 20, y + 10);

    doc.save("expense-report.pdf");
}

function populateMonthFilter() {
    const select = document.getElementById("month-filter");
    const months = [...new Set(expenses.map(exp => exp.date.slice(0, 7)))]; // "yyyy-mm"

    select.innerHTML = '<option value="">Show All Months</option>';
    months.forEach(month => {
        const option = document.createElement("option");
        option.value = month;
        const dateObj = new Date(`${month}-01`);
        option.innerText = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
        select.appendChild(option);
    });
}

function filterExpenseByMonth() {
    currentMonthFilter = document.getElementById("month-filter").value;
    updateBalance();
    renderExpense();
    updateChart();
}

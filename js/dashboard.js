// Gerenciamento do Dashboard

// Elementos do DOM
const balanceValue = document.getElementById('balance-value');
const incomeValue = document.getElementById('income-value');
const expenseValue = document.getElementById('expense-value');
const monthFilter = document.getElementById('month-filter');
const yearFilter = document.getElementById('year-filter');
const filterButton = document.getElementById('filter-button');
const recentTransactions = document.getElementById('recent-transactions');

// Gráficos
let financialChart;
let categoryChart;

// Inicializar filtros de data
function initDateFilters() {
    // Configurar o mês atual
    const currentDate = new Date();
    monthFilter.value = currentDate.getMonth();
    
    // Adicionar anos ao filtro (do ano atual até 3 anos atrás)
    const currentYear = currentDate.getFullYear();
    for (let i = 0; i < 4; i++) {
        const year = currentYear - i;
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    }
    yearFilter.value = currentYear;
    
    // Fazer o mesmo para o filtro de ano na seção de transações
    const yearFilter2 = document.getElementById('year-filter-2');
    if (yearFilter2) {
        for (let i = 0; i < 4; i++) {
            const year = currentYear - i;
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter2.appendChild(option);
        }
    }
}

// Carregar dados do dashboard
async function loadDashboardData() {
    // Verificar se o usuário está autenticado
    const userId = getCurrentUserId();
    if (!userId) return;
    
    try {
        // Obter mês e ano selecionados
        const selectedMonth = parseInt(monthFilter.value);
        const selectedYear = parseInt(yearFilter.value);
        
        // Calcular datas de início e fim do mês
        const startDate = new Date(selectedYear, selectedMonth, 1);
        const endDate = new Date(selectedYear, selectedMonth + 1, 0);
        
        // Formatar datas para consulta
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        
        // Consultar transações do mês
        const transactionsRef = getUserTransactionsRef();
        const snapshot = await transactionsRef
            .where('date', '>=', startDateStr)
            .where('date', '<=', endDateStr)
            .orderBy('date', 'desc')
            .get();
        
        // Processar dados
        let totalIncome = 0;
        let totalExpense = 0;
        const transactions = [];
        const categoryData = {};
        
        snapshot.forEach(doc => {
            const transaction = {
                id: doc.id,
                ...doc.data()
            };
            
            // Calcular totais
            if (transaction.type === 'receita') {
                totalIncome += parseFloat(transaction.value);
            } else {
                totalExpense += parseFloat(transaction.value);
            }
            
            // Agrupar por categoria
            if (!categoryData[transaction.category]) {
                categoryData[transaction.category] = {
                    income: 0,
                    expense: 0
                };
            }
            
            if (transaction.type === 'receita') {
                categoryData[transaction.category].income += parseFloat(transaction.value);
            } else {
                categoryData[transaction.category].expense += parseFloat(transaction.value);
            }
            
            transactions.push(transaction);
        });
        
        // Atualizar valores no dashboard
        const balance = totalIncome - totalExpense;
        
        balanceValue.textContent = formatCurrency(balance);
        incomeValue.textContent = formatCurrency(totalIncome);
        expenseValue.textContent = formatCurrency(totalExpense);
        
        // Atualizar gráficos
        updateFinancialChart(totalIncome, totalExpense);
        updateCategoryChart(categoryData);
        
        // Mostrar transações recentes (máximo 5)
        displayRecentTransactions(transactions.slice(0, 5));
        
    } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        showDashboardMessage('Erro ao carregar dados. Tente novamente.', 'danger');
    }
}

// Atualizar gráfico financeiro (receitas x despesas)
function updateFinancialChart(income, expense) {
    const ctx = document.getElementById('financial-chart').getContext('2d');
    
    // Destruir gráfico anterior se existir
    if (financialChart) {
        financialChart.destroy();
    }
    
    // Criar novo gráfico
    financialChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Receitas', 'Despesas'],
            datasets: [{
                label: 'Valor (R$)',
                data: [income, expense],
                backgroundColor: [
                    'rgba(16, 172, 132, 0.8)', // Verde para receitas
                    'rgba(238, 82, 83, 0.8)'   // Vermelho para despesas
                ],
                borderColor: [
                    'rgba(16, 172, 132, 1)',
                    'rgba(238, 82, 83, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'R$ ' + context.raw.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                        }
                    }
                }
            }
        }
    });
}

// Atualizar gráfico de categorias
function updateCategoryChart(categoryData) {
    const ctx = document.getElementById('category-chart').getContext('2d');
    
    // Preparar dados para o gráfico
    const categories = Object.keys(categoryData);
    const expenseData = categories.map(cat => categoryData[cat].expense);
    
    // Cores para as categorias
    const backgroundColors = [
        'rgba(255, 190, 118, 0.8)',
        'rgba(255, 121, 121, 0.8)',
        'rgba(186, 220, 88, 0.8)',
        'rgba(126, 214, 223, 0.8)',
        'rgba(224, 86, 253, 0.8)',
        'rgba(104, 109, 224, 0.8)',
        'rgba(149, 175, 192, 0.8)'
    ];
    
    // Destruir gráfico anterior se existir
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    // Criar novo gráfico
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: expenseData,
                backgroundColor: backgroundColors.slice(0, categories.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${context.label}: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Exibir transações recentes
function displayRecentTransactions(transactions) {
    // Limpar tabela
    recentTransactions.innerHTML = '';
    
    if (transactions.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" class="text-center">Nenhuma transação encontrada.</td>`;
        recentTransactions.appendChild(row);
        return;
    }
    
    // Adicionar transações à tabela
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        
        // Formatar data
        const date = new Date(transaction.date);
        const formattedDate = date.toLocaleDateString('pt-BR');
        
        // Formatar valor com classe de cor
        const valueClass = transaction.type === 'receita' ? 'transaction-income' : 'transaction-expense';
        const formattedValue = formatCurrency(transaction.value);
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${transaction.type === 'receita' ? 'Receita' : 'Despesa'}</td>
            <td>${transaction.category}</td>
            <td class="${valueClass}">${formattedValue}</td>
            <td>${transaction.note || '-'}</td>
        `;
        
        recentTransactions.appendChild(row);
    });
}

// Formatar valor como moeda
function formatCurrency(value) {
    return 'R$ ' + parseFloat(value).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Mostrar mensagem no dashboard
function showDashboardMessage(message, type = 'info') {
    // Implementar se necessário
}

// Evento para filtrar por mês/ano
filterButton.addEventListener('click', function() {
    loadDashboardData();
});

// Exportar gráfico como imagem
document.getElementById('export-chart').addEventListener('click', function() {
    // Implementado no arquivo export.js
    exportChartAsPNG();
});

// Inicializar filtros quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    initDateFilters();
});
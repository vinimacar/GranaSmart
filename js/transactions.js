// Gerenciamento de Transações

// Elementos do DOM
const transactionModal = new bootstrap.Modal(document.getElementById('transaction-modal'));
const transactionForm = document.getElementById('transaction-form');
const modalTitle = document.getElementById('modal-title');
const transactionId = document.getElementById('transaction-id');
const transactionValue = document.getElementById('transaction-value');
const transactionCategory = document.getElementById('transaction-category');
const transactionDate = document.getElementById('transaction-date');
const transactionNote = document.getElementById('transaction-note');
const saveTransactionBtn = document.getElementById('save-transaction');
const transactionsTable = document.getElementById('transactions-table');
const noTransactions = document.getElementById('no-transactions');

const deleteModal = new bootstrap.Modal(document.getElementById('delete-modal'));
const confirmDeleteBtn = document.getElementById('confirm-delete');

// Categorias disponíveis
const incomeCategories = [
    'Salário',
    'Freelance',
    'Investimentos',
    'Vendas',
    'Presentes',
    'Outros'
];

const expenseCategories = [
    'Alimentação',
    'Moradia',
    'Transporte',
    'Saúde',
    'Educação',
    'Lazer',
    'Vestuário',
    'Contas',
    'Outros'
];

// Variável para armazenar ID da transação a ser excluída
let transactionToDelete = null;

// Inicializar categorias no formulário
function initCategories() {
    // Limpar opções existentes
    transactionCategory.innerHTML = '';
    
    // Determinar quais categorias mostrar com base no tipo selecionado
    const isIncome = document.getElementById('type-income').checked;
    const categories = isIncome ? incomeCategories : expenseCategories;
    
    // Adicionar categorias ao select
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        transactionCategory.appendChild(option);
    });
}

// Carregar todas as transações para a tabela
async function loadAllTransactions() {
    // Verificar se o usuário está autenticado
    const userId = getCurrentUserId();
    if (!userId) return;
    
    try {
        // Obter filtros
        const monthFilter = document.getElementById('month-filter-2').value;
        const yearFilter = document.getElementById('year-filter-2').value;
        const typeFilter = document.getElementById('type-filter').value;
        const categoryFilter = document.getElementById('category-filter').value;
        
        // Construir consulta
        let query = getUserTransactionsRef().orderBy('date', 'desc');
        
        // Aplicar filtros se não forem 'all'
        if (monthFilter !== 'all' && yearFilter !== 'all') {
            const startDate = new Date(parseInt(yearFilter), parseInt(monthFilter), 1);
            const endDate = new Date(parseInt(yearFilter), parseInt(monthFilter) + 1, 0);
            
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];
            
            query = query.where('date', '>=', startDateStr).where('date', '<=', endDateStr);
        } else if (yearFilter !== 'all') {
            const startDate = new Date(parseInt(yearFilter), 0, 1);
            const endDate = new Date(parseInt(yearFilter), 11, 31);
            
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];
            
            query = query.where('date', '>=', startDateStr).where('date', '<=', endDateStr);
        }
        
        // Executar consulta
        const snapshot = await query.get();
        
        // Filtrar resultados por tipo e categoria (client-side filtering)
        let transactions = [];
        snapshot.forEach(doc => {
            const transaction = {
                id: doc.id,
                ...doc.data()
            };
            
            // Aplicar filtros de tipo e categoria
            if (
                (typeFilter === 'all' || transaction.type === typeFilter) &&
                (categoryFilter === 'all' || transaction.category === categoryFilter)
            ) {
                transactions.push(transaction);
            }
        });
        
        // Exibir transações na tabela
        displayTransactions(transactions);
        
        // Atualizar filtro de categorias
        updateCategoryFilter();
        
    } catch (error) {
        console.error('Erro ao carregar transações:', error);
        showTransactionMessage('Erro ao carregar transações. Tente novamente.', 'danger');
    }
}

// Exibir transações na tabela
function displayTransactions(transactions) {
    // Limpar tabela
    transactionsTable.innerHTML = '';
    
    if (transactions.length === 0) {
        // Mostrar mensagem de nenhuma transação
        noTransactions.classList.remove('d-none');
        return;
    }
    
    // Ocultar mensagem de nenhuma transação
    noTransactions.classList.add('d-none');
    
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
            <td>
                <div class="d-flex">
                    <i class="fas fa-edit action-icon me-2" data-id="${transaction.id}"></i>
                    <i class="fas fa-trash action-icon delete" data-id="${transaction.id}"></i>
                </div>
            </td>
        `;
        
        transactionsTable.appendChild(row);
    });
    
    // Adicionar event listeners para os botões de editar e excluir
    addTransactionActionListeners();
}

// Adicionar event listeners para ações de transação
function addTransactionActionListeners() {
    // Botões de editar
    const editButtons = document.querySelectorAll('.fa-edit');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            editTransaction(id);
        });
    });
    
    // Botões de excluir
    const deleteButtons = document.querySelectorAll('.fa-trash');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            confirmDelete(id);
        });
    });
}

// Abrir modal para editar transação
async function editTransaction(id) {
    try {
        // Obter dados da transação
        const transactionRef = getUserTransactionsRef().doc(id);
        const doc = await transactionRef.get();
        
        if (!doc.exists) {
            console.error('Transação não encontrada');
            return;
        }
        
        const transaction = doc.data();
        
        // Preencher formulário
        transactionId.value = id;
        
        // Definir tipo (receita/despesa)
        if (transaction.type === 'receita') {
            document.getElementById('type-income').checked = true;
        } else {
            document.getElementById('type-expense').checked = true;
        }
        
        // Atualizar categorias com base no tipo
        initCategories();
        
        transactionValue.value = transaction.value;
        transactionCategory.value = transaction.category;
        transactionDate.value = transaction.date;
        transactionNote.value = transaction.note || '';
        
        // Atualizar título do modal
        modalTitle.textContent = 'Editar Transação';
        
        // Abrir modal
        transactionModal.show();
        
    } catch (error) {
        console.error('Erro ao editar transação:', error);
        showTransactionMessage('Erro ao editar transação. Tente novamente.', 'danger');
    }
}

// Confirmar exclusão de transação
function confirmDelete(id) {
    transactionToDelete = id;
    deleteModal.show();
}

// Excluir transação
async function deleteTransaction() {
    if (!transactionToDelete) return;
    
    try {
        // Excluir do Firestore
        await getUserTransactionsRef().doc(transactionToDelete).delete();
        
        // Fechar modal
        deleteModal.hide();
        
        // Mostrar mensagem de sucesso
        showTransactionMessage('Transação excluída com sucesso!', 'success');
        
        // Recarregar transações
        loadAllTransactions();
        
        // Atualizar dashboard se estiver visível
        if (!document.getElementById('dashboard-section').classList.contains('d-none')) {
            loadDashboardData();
        }
        
    } catch (error) {
        console.error('Erro ao excluir transação:', error);
        showTransactionMessage('Erro ao excluir transação. Tente novamente.', 'danger');
    } finally {
        transactionToDelete = null;
    }
}

// Salvar transação (nova ou editada)
async function saveTransaction() {
    try {
        // Obter valores do formulário
        const id = transactionId.value;
        const type = document.querySelector('input[name="transaction-type"]:checked').value;
        const value = parseFloat(transactionValue.value);
        const category = transactionCategory.value;
        const date = transactionDate.value;
        const note = transactionNote.value;
        
        // Validar dados
        if (isNaN(value) || value <= 0) {
            showTransactionMessage('Por favor, informe um valor válido.', 'danger');
            return;
        }
        
        if (!category) {
            showTransactionMessage('Por favor, selecione uma categoria.', 'danger');
            return;
        }
        
        if (!date) {
            showTransactionMessage('Por favor, informe uma data.', 'danger');
            return;
        }
        
        // Preparar objeto de transação
        const transaction = {
            type,
            value,
            category,
            date,
            note
        };
        
        // Salvar no Firestore
        if (id) {
            // Atualizar transação existente
            await getUserTransactionsRef().doc(id).update(transaction);
            showTransactionMessage('Transação atualizada com sucesso!', 'success');
        } else {
            // Adicionar nova transação
            transaction.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await getUserTransactionsRef().add(transaction);
            showTransactionMessage('Transação adicionada com sucesso!', 'success');
        }
        
        // Fechar modal e resetar formulário
        transactionModal.hide();
        resetTransactionForm();
        
        // Recarregar dados
        if (!document.getElementById('transactions-section').classList.contains('d-none')) {
            loadAllTransactions();
        }
        
        // Atualizar dashboard se estiver visível
        if (!document.getElementById('dashboard-section').classList.contains('d-none')) {
            loadDashboardData();
        }
        
    } catch (error) {
        console.error('Erro ao salvar transação:', error);
        showTransactionMessage('Erro ao salvar transação. Tente novamente.', 'danger');
    }
}

// Resetar formulário de transação
function resetTransactionForm() {
    transactionId.value = '';
    document.getElementById('type-income').checked = true;
    transactionValue.value = '';
    initCategories(); // Reiniciar categorias para o tipo padrão (receita)
    transactionDate.value = new Date().toISOString().split('T')[0]; // Data atual
    transactionNote.value = '';
    modalTitle.textContent = 'Nova Transação';
}

// Atualizar filtro de categorias
async function updateCategoryFilter() {
    try {
        const categoryFilter = document.getElementById('category-filter');
        if (!categoryFilter) return;
        
        // Salvar categoria selecionada atualmente
        const currentValue = categoryFilter.value;
        
        // Limpar opções existentes, mantendo a opção "Todas"
        categoryFilter.innerHTML = '<option value="all">Todas</option>';
        
        // Obter todas as categorias usadas pelo usuário
        const snapshot = await getUserTransactionsRef().get();
        const categories = new Set();
        
        snapshot.forEach(doc => {
            const transaction = doc.data();
            categories.add(transaction.category);
        });
        
        // Adicionar categorias ao select
        Array.from(categories).sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
        
        // Restaurar valor selecionado
        categoryFilter.value = currentValue;
        
    } catch (error) {
        console.error('Erro ao atualizar filtro de categorias:', error);
    }
}

// Mostrar mensagem na seção de transações
function showTransactionMessage(message, type = 'info') {
    // Criar elemento de alerta
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show mb-4`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.id = 'transaction-message';
    
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;
    
    // Inserir no início da seção de transações
    const section = document.getElementById('transactions-section');
    section.insertBefore(alertDiv, section.firstChild);
    
    // Auto-fechar após 5 segundos para mensagens de sucesso
    if (type === 'success') {
        setTimeout(() => {
            const alert = document.getElementById('transaction-message');
            if (alert) {
                alert.remove();
            }
        }, 5000);
    }
}

// Event Listeners

// Alternar categorias quando o tipo de transação muda
document.querySelectorAll('input[name="transaction-type"]').forEach(radio => {
    radio.addEventListener('change', initCategories);
});

// Botão para abrir modal de nova transação
document.getElementById('add-transaction-btn').addEventListener('click', function() {
    resetTransactionForm();
    transactionModal.show();
});

document.getElementById('add-transaction-btn-2').addEventListener('click', function() {
    resetTransactionForm();
    transactionModal.show();
});

// Botão para salvar transação
saveTransactionBtn.addEventListener('click', saveTransaction);

// Botão para confirmar exclusão
confirmDeleteBtn.addEventListener('click', deleteTransaction);

// Botão para aplicar filtros
document.getElementById('apply-filters').addEventListener('click', loadAllTransactions);

// Inicializar data atual no formulário quando o modal é aberto
document.getElementById('transaction-modal').addEventListener('show.bs.modal', function() {
    if (!transactionDate.value) {
        transactionDate.value = new Date().toISOString().split('T')[0];
    }
});

// Inicializar categorias quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    initCategories();
});
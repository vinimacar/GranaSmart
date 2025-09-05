// Arquivo principal da aplicação

// Verificar se o documento está pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('GranaSmart - Inicializando...');
    
    // Verificar se o Firebase está configurado corretamente
    try {
        // Verificar se o Firebase foi inicializado
        if (!firebase.app()) {
            console.error('Firebase não foi inicializado corretamente.');
        } else {
            console.log('Firebase inicializado com sucesso.');
        }
    } catch (error) {
        console.error('Erro ao inicializar Firebase:', error);
    }
    
    // Inicializar componentes da interface
    initUI();
});

// Inicializar componentes da interface
function initUI() {
    // Definir data atual no formulário de transação
    const transactionDate = document.getElementById('transaction-date');
    if (transactionDate) {
        transactionDate.value = new Date().toISOString().split('T')[0];
    }
    
    // Adicionar ano atual ao footer
    const footerYear = document.querySelector('footer p');
    if (footerYear) {
        const currentYear = new Date().getFullYear();
        footerYear.textContent = `GranaSmart © ${currentYear}`;
    }
}

// Função para mostrar mensagem global
function showGlobalMessage(message, type = 'info') {
    // Criar elemento de alerta
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.maxWidth = '400px';
    
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;
    
    // Adicionar ao corpo do documento
    document.body.appendChild(alertDiv);
    
    // Auto-fechar após 5 segundos
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => {
            alertDiv.remove();
        }, 300);
    }, 5000);
}

// Verificar conexão com a internet
window.addEventListener('online', function() {
    showGlobalMessage('Conexão com a internet restaurada.', 'success');
});

window.addEventListener('offline', function() {
    showGlobalMessage('Sem conexão com a internet. Algumas funcionalidades podem não estar disponíveis.', 'warning');
});

// Detectar mudanças de tema do sistema
if (window.matchMedia) {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Verificar tema inicial
    if (darkModeMediaQuery.matches) {
        console.log('Tema escuro detectado');
        // Implementar mudanças para tema escuro se necessário
    }
    
    // Ouvir mudanças de tema
    darkModeMediaQuery.addEventListener('change', function(e) {
        if (e.matches) {
            console.log('Mudou para tema escuro');
            // Implementar mudanças para tema escuro se necessário
        } else {
            console.log('Mudou para tema claro');
            // Implementar mudanças para tema claro se necessário
        }
    });
}
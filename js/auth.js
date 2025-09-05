// Gerenciamento de autenticação

// Elementos do DOM
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const transactionsSection = document.getElementById('transactions-section');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');

const navLogin = document.getElementById('nav-login');
const navRegister = document.getElementById('nav-register');
const navDashboard = document.getElementById('nav-dashboard');
const navTransactions = document.getElementById('nav-transactions');
const navLogout = document.getElementById('nav-logout');

// Alternar entre formulários de login e cadastro
loginTab.addEventListener('click', function(e) {
    e.preventDefault();
    loginForm.classList.remove('d-none');
    registerForm.classList.add('d-none');
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
});

registerTab.addEventListener('click', function(e) {
    e.preventDefault();
    registerForm.classList.remove('d-none');
    loginForm.classList.add('d-none');
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
});

// Links da navbar para alternar entre login e cadastro
navLogin.addEventListener('click', function(e) {
    e.preventDefault();
    loginTab.click();
});

navRegister.addEventListener('click', function(e) {
    e.preventDefault();
    registerTab.click();
});

// Formulário de Login
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Mostrar loader ou mensagem de carregamento
    showMessage('Fazendo login...', 'info');
    
    // Autenticar com Firebase
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            // Login bem-sucedido
            clearMessage();
            loginForm.reset();
        })
        .catch(error => {
            // Erro no login
            console.error('Erro no login:', error);
            showMessage('Erro no login: ' + getErrorMessage(error), 'danger');
        });
});

// Formulário de Cadastro
registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Validar senha
    if (password !== confirmPassword) {
        showMessage('As senhas não coincidem', 'danger');
        return;
    }
    
    // Mostrar loader ou mensagem de carregamento
    showMessage('Criando conta...', 'info');
    
    // Criar usuário no Firebase
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            // Cadastro bem-sucedido
            const user = userCredential.user;
            
            // Atualizar o perfil do usuário com o nome
            return user.updateProfile({
                displayName: name
            }).then(() => {
                // Inicializar configurações do usuário
                return initUserSettings();
            });
        })
        .then(() => {
            clearMessage();
            registerForm.reset();
            showMessage('Conta criada com sucesso!', 'success');
            
            // Voltar para a aba de login após cadastro
            setTimeout(() => {
                loginTab.click();
                clearMessage();
            }, 2000);
        })
        .catch(error => {
            // Erro no cadastro
            console.error('Erro no cadastro:', error);
            showMessage('Erro no cadastro: ' + getErrorMessage(error), 'danger');
        });
});

// Logout
navLogout.addEventListener('click', function(e) {
    e.preventDefault();
    
    auth.signOut()
        .then(() => {
            // Logout bem-sucedido
            console.log('Usuário desconectado');
        })
        .catch(error => {
            // Erro no logout
            console.error('Erro ao desconectar:', error);
            showMessage('Erro ao desconectar: ' + error.message, 'danger');
        });
});

// Observar mudanças no estado de autenticação
auth.onAuthStateChanged(user => {
    if (user) {
        // Usuário está logado
        console.log('Usuário logado:', user.displayName || user.email);
        
        // Mostrar seções apropriadas
        authSection.classList.add('d-none');
        dashboardSection.classList.remove('d-none');
        
        // Atualizar navbar
        navLogin.classList.add('d-none');
        navRegister.classList.add('d-none');
        navDashboard.classList.remove('d-none');
        navTransactions.classList.remove('d-none');
        navLogout.classList.remove('d-none');
        
        // Carregar dados do dashboard
        loadDashboardData();
    } else {
        // Usuário está deslogado
        console.log('Usuário deslogado');
        
        // Mostrar seções apropriadas
        authSection.classList.remove('d-none');
        dashboardSection.classList.add('d-none');
        transactionsSection.classList.add('d-none');
        
        // Atualizar navbar
        navLogin.classList.remove('d-none');
        navRegister.classList.remove('d-none');
        navDashboard.classList.add('d-none');
        navTransactions.classList.add('d-none');
        navLogout.classList.add('d-none');
    }
});

// Função para mostrar mensagens de erro/sucesso
function showMessage(message, type = 'info') {
    // Remover mensagens anteriores
    clearMessage();
    
    // Criar elemento de alerta
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.id = 'auth-message';
    
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;
    
    // Inserir antes do formulário
    const activeForm = loginForm.classList.contains('d-none') ? registerForm : loginForm;
    activeForm.parentNode.insertBefore(alertDiv, activeForm);
    
    // Auto-fechar após 5 segundos para mensagens de sucesso
    if (type === 'success') {
        setTimeout(() => {
            const alert = document.getElementById('auth-message');
            if (alert) {
                alert.remove();
            }
        }, 5000);
    }
}

// Função para limpar mensagens
function clearMessage() {
    const existingAlert = document.getElementById('auth-message');
    if (existingAlert) {
        existingAlert.remove();
    }
}

// Função para obter mensagem de erro amigável
function getErrorMessage(error) {
    switch (error.code) {
        case 'auth/email-already-in-use':
            return 'Este e-mail já está sendo usado por outra conta.';
        case 'auth/invalid-email':
            return 'O e-mail fornecido é inválido.';
        case 'auth/weak-password':
            return 'A senha é muito fraca. Use pelo menos 6 caracteres.';
        case 'auth/user-not-found':
            return 'Não existe usuário com este e-mail.';
        case 'auth/wrong-password':
            return 'Senha incorreta.';
        default:
            return error.message;
    }
}

// Navegação entre seções
navDashboard.addEventListener('click', function(e) {
    e.preventDefault();
    dashboardSection.classList.remove('d-none');
    transactionsSection.classList.add('d-none');
    navDashboard.querySelector('.nav-link').classList.add('active');
    navTransactions.querySelector('.nav-link').classList.remove('active');
});

navTransactions.addEventListener('click', function(e) {
    e.preventDefault();
    dashboardSection.classList.add('d-none');
    transactionsSection.classList.remove('d-none');
    navTransactions.querySelector('.nav-link').classList.add('active');
    navDashboard.querySelector('.nav-link').classList.remove('active');
    
    // Carregar todas as transações
    loadAllTransactions();
});

document.getElementById('view-all-transactions').addEventListener('click', function(e) {
    e.preventDefault();
    navTransactions.click();
});
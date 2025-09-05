// Configuração do Firebase

// Inicialização do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA1nwaf7DJFNBwshN_zy5Vz0hMXtxP9wPE",
    authDomain: "granasmart-a2e75.firebaseapp.com",
    projectId: "granasmart-a2e75",
    storageBucket: "granasmart-a2e75.firebasestorage.app",
    messagingSenderId: "930644420674",
    appId: "1:930644420674:web:7fd1ebd7daee701314e5db",
    measurementId: "G-ZNHNESENRS"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referências para serviços do Firebase
const auth = firebase.auth();
const db = firebase.firestore();

// Configurações do Firestore
db.settings({ timestampsInSnapshots: true });

// Função para obter o ID do usuário atual
function getCurrentUserId() {
    const user = auth.currentUser;
    return user ? user.uid : null;
}

// Função para obter referência à coleção de transações do usuário atual
function getUserTransactionsRef() {
    const userId = getCurrentUserId();
    if (!userId) return null;
    return db.collection('users').doc(userId).collection('transactions');
}

// Função para obter referência às configurações do usuário atual
function getUserSettingsRef() {
    const userId = getCurrentUserId();
    if (!userId) return null;
    return db.collection('users').doc(userId).collection('settings').doc('preferences');
}

// Função para inicializar as configurações do usuário se não existirem
async function initUserSettings() {
    const userId = getCurrentUserId();
    if (!userId) return;
    
    const settingsRef = db.collection('users').doc(userId).collection('settings').doc('preferences');
    const settingsDoc = await settingsRef.get();
    
    if (!settingsDoc.exists) {
        // Configurações padrão
        await settingsRef.set({
            currency: 'BRL',
            theme: 'light',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
}
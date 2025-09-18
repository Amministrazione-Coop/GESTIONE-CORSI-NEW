// Credenziali di accesso
const VALID_CREDENTIALS = {
    username: 'admin',
    password: 'sicurezza2024'
};

// Controlla se l'utente è già loggato
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!isLoggedIn && currentPage !== 'index.html' && currentPage !== '') {
        window.location.href = 'index.html';
        return false;
    }
    
    if (isLoggedIn && (currentPage === 'index.html' || currentPage === '')) {
        window.location.href = 'main.html';
        return false;
    }
    
    return true;
}

// Gestione del login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    
    // Verifica credenziali
    if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
        // Login riuscito
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('username', username);
        
        // Animazione di successo
        document.querySelector('.btn-login').textContent = '✅ Accesso riuscito!';
        document.querySelector('.btn-login').style.background = 'linear-gradient(45deg, #28a745, #20c997)';
        
        // Reindirizza dopo un breve delay
        setTimeout(() => {
            window.location.href = 'main.html';
        }, 1000);
        
    } else {
        // Login fallito
        errorMessage.textContent = '❌ Username o password non corretti!';
        errorMessage.style.display = 'block';
        
        // Shake animation
        document.querySelector('.login-card').style.animation = 'shake 0.5s ease-in-out';
        
        // Pulisci i campi
        document.getElementById('password').value = '';
        
        // Rimuovi messaggio di errore dopo 3 secondi
        setTimeout(() => {
            errorMessage.style.display = 'none';
            document.querySelector('.login-card').style.animation = '';
        }, 3000);
    }
});

// Aggiungi animazione shake per errori
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// Controlla autenticazione all'avvio
checkAuth();
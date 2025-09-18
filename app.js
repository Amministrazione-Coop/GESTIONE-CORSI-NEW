// Controllo autenticazione all'avvio della pagina
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) {
        return;
    }
    
    // Inizializza l'applicazione
    initializeApp();
});

// Mostra/nasconde il campo P.IVA in base alla qualifica
function togglePartitaIva() {
    const qualifica = document.getElementById('qualifica').value;
    const partitaIvaGroup = document.getElementById('partitaIvaGroup');
    const partitaIvaInput = document.getElementById('partitaIva');
    
    if (qualifica === 'oss' || qualifica === 'ausiliario' || qualifica === 'piva') {
        partitaIvaGroup.style.display = 'flex';
        partitaIvaInput.required = true;
    } else {
        partitaIvaGroup.style.display = 'none';
        partitaIvaInput.required = false;
        partitaIvaInput.value = '';
    }
}

// Controllo autenticazione
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const username = sessionStorage.getItem('username');
    
    if (!isLoggedIn) {
        window.location.href = 'index.html';
        return false;
    }
    
    const welcomeElement = document.getElementById('welcomeUser');
    if (welcomeElement) {
        welcomeElement.textContent = `Benvenuto, ${username}`;
    }
    return true;
}

// Logout
function logout() {
    if (confirm('Sei sicuro di voler uscire?')) {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('username');
        window.location.href = 'index.html';
    }
}

// Variabili globali
let employees = JSON.parse(localStorage.getItem('employees') || '[]');
let editingIndex = -1;

// Inizializza l'applicazione
function initializeApp() {
    // Carica i dati e mostra la prima tab
    updateStats();
    displayEmployees();
    
    // Aggiungi event listener al form
    const form = document.getElementById('employeeForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    console.log('Applicazione inizializzata con', employees.length, 'dipendenti');
}

// Gestione submit del form
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const employeeData = {
        nome: formData.get('nome') || document.getElementById('nome').value,
        cognome: formData.get('cognome') || document.getElementById('cognome').value,
        dataAssunzione: formData.get('dataAssunzione') || document.getElementById('dataAssunzione').value,
        qualifica: document.getElementById('qualifica').value,
        partitaIva: document.getElementById('partitaIva').value,
        luogoLavoro: document.getElementById('luogoLavoro').value,
        coopA: document.getElementById('coopA').value,
        coopB: document.getElementById('coopB').value,
        tipoSicurezza: document.getElementById('tipoSicurezza').value,
        dataSicurezza: document.getElementById('dataSicurezza').value,
        dataAggiornamentoSicurezza: document.getElementById('dataAggiornamentoSicurezza').value,
        dataHACCP: document.getElementById('dataHACCP').value
    };
    
    // Validazione base
    if (!employeeData.nome || !employeeData.cognome || !employeeData.dataAssunzione) {
        alert('Inserisci almeno Nome, Cognome e Data Assunzione');
        return;
    }
    
    addEmployee(employeeData);
}

// Salva i dati nel localStorage
function saveData() {
    localStorage.setItem('employees', JSON.stringify(employees));
    console.log('Dati salvati:', employees.length, 'dipendenti');
}

// Gestione delle tab
function showTab(tabName) {
    // Rimuovi classe active da tutti i contenuti e tab
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Attiva il contenuto selezionato
    const targetContent = document.getElementById(tabName);
    if (targetContent) {
        targetContent.classList.add('active');
    }
    
    // Attiva la tab corrispondente
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach((tab, index) => {
        const tabText = tab.textContent.toLowerCase();
        if ((tabName === 'add' && tabText.includes('aggiungi')) ||
            (tabName === 'list' && tabText.includes('lista')) ||
            (tabName === 'scadenze' && tabText.includes('scadenze')) ||
            (tabName === 'stats' && tabText.includes('statistiche'))) {
            tab.classList.add('active');
        }
    });
    
    // Esegui azioni specifiche per ogni tab
    if (tabName === 'list') {
        displayEmployees();
        preparePrintTable();
    } else if (tabName === 'stats') {
        updateStats();
    } else if (tabName === 'scadenze') {
        displayScadenze();
        updateScadenzeStats();
    }
}

// Gestione upload file
async function handleFileUpload(file) {
    if (!file) return null;
    
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            resolve({
                name: file.name,
                size: file.size,
                type: file.type,
                data: e.target.result
            });
        };
        reader.readAsDataURL(file);
    });
}

// Aggiunta/Modifica dipendente
async function addEmployee(employeeData) {
    try {
        const attestatoSicurezza = document.getElementById('attestatoSicurezza').files[0];
        const attestatoAggiornamento = document.getElementById('attestatoAggiornamento').files[0];
        const attestatoHACCP = document.getElementById('attestatoHACCP').files[0];

        if (attestatoSicurezza) {
            employeeData.attestatoSicurezza = await handleFileUpload(attestatoSicurezza);
        }
        if (attestatoAggiornamento) {
            employeeData.attestatoAggiornamento = await handleFileUpload(attestatoAggiornamento);
        }
        if (attestatoHACCP) {
            employeeData.attestatoHACCP = await handleFileUpload(attestatoHACCP);
        }

        if (editingIndex >= 0) {
            employees[editingIndex] = employeeData;
            editingIndex = -1;
        } else {
            employees.push(employeeData);
        }
        
        saveData();
        showConfirmMessage();
        clearForm();
        updateStats();
        
        console.log('Dipendente aggiunto/modificato:', employeeData);
        
    } catch (error) {
        console.error('Errore nel salvataggio:', error);
        alert('Errore nel salvataggio del dipendente!');
    }
}

// Mostra messaggio di conferma
function showConfirmMessage() {
    const message = document.getElementById('confirmMessage');
    if (message) {
        message.classList.add('show');
        
        setTimeout(() => {
            message.classList.remove('show');
        }, 3000);
    }
}

// Funzione per ottenere il testo leggibile dei nuovi campi
function getReadableText(field, value) {
    const mappings = {
        qualifica: {
            'oss': 'OSS',
            'ausiliario': 'Ausiliario',
            'piva': 'P.IVA'
        },
        luogoLavoro: {
            'oic-padova': 'OIC Padova',
            'oic-thiene': 'OIC Thiene',
            'oic-vedelago': 'OIC Vedelago',
            'oic-dueville': 'OIC Dueville'
        }
    };
    
    return mappings[field] && mappings[field][value] ? mappings[field][value] : value || '-';
}

// Modifica dipendente
function editEmployee(index) {
    const employee = employees[index];
    editingIndex = index;
    
    document.getElementById('nome').value = employee.nome || '';
    document.getElementById('cognome').value = employee.cognome || '';
    document.getElementById('dataAssunzione').value = employee.dataAssunzione || '';
    
    document.getElementById('qualifica').value = employee.qualifica || '';
    togglePartitaIva();
    
    document.getElementById('partitaIva').value = employee.partitaIva || '';
    
    document.getElementById('luogoLavoro').value = employee.luogoLavoro || '';
    document.getElementById('coopA').value = employee.coopA || '';
    document.getElementById('coopB').value = employee.coopB || '';
    
    document.getElementById('tipoSicurezza').value = employee.tipoSicurezza || '';
    document.getElementById('dataSicurezza').value = employee.dataSicurezza || '';
    document.getElementById('dataAggiornamentoSicurezza').value = employee.dataAggiornamentoSicurezza || '';
    document.getElementById('dataHACCP').value = employee.dataHACCP || '';
    
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Aggiorna Dipendente';
        submitBtn.classList.add('btn-secondary');
    }
    
    showTab('add');
    window.scrollTo(0, 0);
}

// Elimina dipendente
function deleteEmployee(index) {
    if (confirm('Sei sicuro di voler eliminare questo dipendente?')) {
        employees.splice(index, 1);
        saveData();
        displayEmployees();
        updateStats();
        console.log('Dipendente eliminato, totale rimasti:', employees.length);
    }
}

// Pulisci form
function clearForm() {
    const form = document.getElementById('employeeForm');
    if (form) {
        form.reset();
    }
    
    document.getElementById('attestatoSicurezza').value = '';
    document.getElementById('attestatoAggiornamento').value = '';
    document.getElementById('attestatoHACCP').value = '';
    
    togglePartitaIva();
    
    editingIndex = -1;
    
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Aggiungi Dipendente';
        submitBtn.className = '';
    }
}

// Download file
function downloadFile(fileData, fileName) {
    if (!fileData || !fileData.data) {
        alert('File non disponibile!');
        return;
    }
    
    const link = document.createElement('a');
    link.href = fileData.data;
    link.download = fileName || fileData.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Visualizza dipendenti
function displayEmployees() {
    const listContainer = document.getElementById('employeeList');
    
    if (!listContainer) {
        console.error('Container employeeList non trovato');
        return;
    }
    
    if (employees.length === 0) {
        listContainer.innerHTML = '<div class="empty-state">Nessun dipendente inserito ancora.</div>';
        return;
    }
    
    console.log('Visualizzando dipendenti:', employees.length);
    
    listContainer.innerHTML = employees.map((employee, index) => {
        const courses = [];
        let totalHours = 0;
        
        if (employee.tipoSicurezza && employee.dataSicurezza) {
            const hours = employee.tipoSicurezza === 'alto' ? 16 : 8;
            courses.push({
                name: `Sicurezza ${employee.tipoSicurezza === 'alto' ? 'Alto' : 'Basso'} Rischio`,
                hours: hours,
                date: employee.dataSicurezza,
                attestato: employee.attestatoSicurezza,
                attestatoKey: 'attestatoSicurezza'
            });
            totalHours += hours;
        }
        
        if (employee.dataHACCP) {
            courses.push({
                name: 'HACCP',
                hours: 4,
                date: employee.dataHACCP,
                attestato: employee.attestatoHACCP,
                attestatoKey: 'attestatoHACCP'
            });
            totalHours += 4;
        }
        
        if (employee.dataAggiornamentoSicurezza) {
            courses.push({
                name: 'Aggiornamento Sicurezza',
                hours: 6,
                date: employee.dataAggiornamentoSicurezza,
                attestato: employee.attestatoAggiornamento,
                attestatoKey: 'attestatoAggiornamento'
            });
            totalHours += 6;
        }
        
        let coopInfo = '';
        if (employee.coopA === 'si' && employee.coopB === 'si') {
            coopInfo = 'COOP A + B';
        } else if (employee.coopA === 'si') {
            coopInfo = 'COOP A';
        } else if (employee.coopB === 'si') {
            coopInfo = 'COOP B';
        } else {
            coopInfo = 'Non assegnato';
        }
        
        return `
            <div class="employee-card">
                <div class="employee-header">
                    <div>
                        <div class="employee-name">${employee.nome} ${employee.cognome}</div>
                        <div class="employee-date">Assunto il: ${new Date(employee.dataAssunzione).toLocaleDateString('it-IT')}</div>
                        <div class="employee-date">Qualifica: ${getReadableText('qualifica', employee.qualifica)}</div>
                        <div class="employee-date">Luogo: ${getReadableText('luogoLavoro', employee.luogoLavoro)}</div>
                        <div class="employee-date">Sezione: ${coopInfo}</div>
                        ${(employee.qualifica === 'oss' || employee.qualifica === 'ausiliario' || employee.qualifica === 'piva') && employee.partitaIva ? 
                            `<div class="employee-date">P.IVA: ${employee.partitaIva}</div>` : 
                            (employee.qualifica === 'oss' || employee.qualifica === 'ausiliario' || employee.qualifica === 'piva') ? 
                            `<div class="employee-date" style="color: #dc3545;">P.IVA: Non inserita</div>` : ''
                        }
                        <div class="employee-date">Ore totali: ${totalHours}h</div>
                    </div>
                </div>
                
                <div class="courses-grid">
                    ${courses.length > 0 ? 
                        courses.map(course => `
                            <div class="course-item">
                                <div class="course-name">${course.name}</div>
                                <div class="course-hours">${course.hours} ore</div>
                                <div class="course-date">Completato: ${new Date(course.date).toLocaleDateString('it-IT')}</div>
                                ${course.attestato ? 
                                    `<div class="file-info">
                                        <span class="file-link" onclick="downloadFile(employees[${index}].${course.attestatoKey}, '${course.attestato.name}')">${course.attestato.name}</span>
                                    </div>` : 
                                    ''
                                }
                            </div>
                        `).join('') :
                        '<div class="course-item"><div class="course-name">Nessun corso completato</div></div>'
                    }
                </div>
                
                <div class="actions">
                    <button class="btn-secondary" onclick="editEmployee(${index})">Modifica</button>
                    <button class="btn-danger" onclick="deleteEmployee(${index})">Elimina</button>
                </div>
            </div>
        `;
    }).join('');
}

// Prepara tabella per la stampa
function preparePrintTable() {
    const tableBody = document.getElementById('printTableBody');
    const printDate = document.getElementById('printDate');
    
    if (!tableBody || !printDate) return;
    
    printDate.textContent = new Date().toLocaleDateString('it-IT');
    
    tableBody.innerHTML = employees.map(employee => {
        let totalHours = 0;
        let sicurezza = '-';
        let haccp = '-';
        let aggiornamento = '-';
        
        // Calcola informazioni sicurezza
        if (employee.tipoSicurezza && employee.dataSicurezza) {
            const hours = employee.tipoSicurezza === 'alto' ? 16 : 8;
            sicurezza = `${employee.tipoSicurezza === 'alto' ? 'Alto' : 'Basso'} (${hours}h)`;
            totalHours += hours;
        }
        
        // Calcola HACCP
        if (employee.dataHACCP) {
            haccp = 'Completato (4h)';
            totalHours += 4;
        }
        
        // Calcola aggiornamento
        if (employee.dataAggiornamentoSicurezza) {
            aggiornamento = 'Completato (6h)';
            totalHours += 6;
        }
        
        let coopInfo = '';
        if (employee.coopA === 'si' && employee.coopB === 'si') {
            coopInfo = 'A + B';
        } else if (employee.coopA === 'si') {
            coopInfo = 'A';
        } else if (employee.coopB === 'si') {
            coopInfo = 'B';
        } else {
            coopInfo = '-';
        }
        
        return `
            <tr>
                <td>${employee.nome} ${employee.cognome}</td>
                <td>${new Date(employee.dataAssunzione).toLocaleDateString('it-IT')}</td>
                <td>${getReadableText('qualifica', employee.qualifica)}</td>
                <td>${employee.partitaIva || '-'}</td>
                <td>${getReadableText('luogoLavoro', employee.luogoLavoro)}</td>
                <td>${coopInfo}</td>
                <td>${sicurezza}</td>
                <td>${haccp}</td>
                <td>${aggiornamento}</td>
                <td>${totalHours}h</td>
            </tr>
        `;
    }).join('');
}

// Stampa tabella
function printTable() {
    preparePrintTable();
    const printContent = document.getElementById('printableTable').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    
    // Reinizializza dopo la stampa
    initializeApp();
}

// Aggiorna statistiche
function updateStats() {
    const totalElement = document.getElementById('totalEmployees');
    const safetyElement = document.getElementById('completedSafety');
    const haccpElement = document.getElementById('completedHACCP');
    const hoursElement = document.getElementById('totalHours');
    
    if (!totalElement) return;
    
    const total = employees.length;
    const completedSafety = employees.filter(emp => emp.dataSicurezza).length;
    const completedHACCP = employees.filter(emp => emp.dataHACCP).length;
    
    let totalHours = 0;
    employees.forEach(employee => {
        if (employee.tipoSicurezza && employee.dataSicurezza) {
            totalHours += employee.tipoSicurezza === 'alto' ? 16 : 8;
        }
        if (employee.dataHACCP) totalHours += 4;
        if (employee.dataAggiornamentoSicurezza) totalHours += 6;
    });
    
    totalElement.textContent = total;
    safetyElement.textContent = completedSafety;
    haccpElement.textContent = completedHACCP;
    hoursElement.textContent = totalHours;
}

// Funzioni per le scadenze
function calculateExpiryDate(courseDate, courseType) {
    if (!courseDate) return null;
    
    const date = new Date(courseDate);
    const expiryMonths = {
        'sicurezza': 60,     // 5 anni (corso iniziale)
        'haccp': 24,         // 2 anni (più comune per HACCP)
        'aggiornamento': 60  // 5 anni (aggiornamento sicurezza)
    };
    
    date.setMonth(date.getMonth() + (expiryMonths[courseType] || 60));
    return date;
}

function getDaysUntilExpiry(expiryDate) {
    if (!expiryDate) return null;
    
    const today = new Date();
    const timeDiff = expiryDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

function displayScadenze() {
    const container = document.getElementById('scadenzeList');
    if (!container) return;
    
    if (employees.length === 0) {
        container.innerHTML = '<div class="empty-state">Nessun dipendente inserito ancora.</div>';
        return;
    }
    
    const scadenzeData = [];
    
    employees.forEach(employee => {
        // Sicurezza
        if (employee.dataSicurezza) {
            const expiry = calculateExpiryDate(employee.dataSicurezza, 'sicurezza');
            const days = getDaysUntilExpiry(expiry);
            scadenzeData.push({
                employee,
                course: 'Sicurezza',
                courseDate: employee.dataSicurezza,
                expiryDate: expiry,
                daysUntilExpiry: days
            });
        }
        
        // HACCP
        if (employee.dataHACCP) {
            const expiry = calculateExpiryDate(employee.dataHACCP, 'haccp');
            const days = getDaysUntilExpiry(expiry);
            scadenzeData.push({
                employee,
                course: 'HACCP',
                courseDate: employee.dataHACCP,
                expiryDate: expiry,
                daysUntilExpiry: days
            });
        }
        
        // Aggiornamento
        if (employee.dataAggiornamentoSicurezza) {
            const expiry = calculateExpiryDate(employee.dataAggiornamentoSicurezza, 'aggiornamento');
            const days = getDaysUntilExpiry(expiry);
            scadenzeData.push({
                employee,
                course: 'Aggiornamento Sicurezza',
                courseDate: employee.dataAggiornamentoSicurezza,
                expiryDate: expiry,
                daysUntilExpiry: days
            });
        }
    });
    
    // Ordina per scadenza
    scadenzeData.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
    
    container.innerHTML = scadenzeData.map(item => {
        const statusClass = item.daysUntilExpiry < 0 ? 'scaduta' : 
                           item.daysUntilExpiry <= 30 ? 'warning' : 'ok';
        const statusText = item.daysUntilExpiry < 0 ? 'SCADUTO' :
                          item.daysUntilExpiry <= 30 ? 'IN SCADENZA' : 'VALIDO';
        
        return `
            <div class="employee-card scadenza-card scadenza-${statusClass}">
                <div class="employee-header">
                    <div>
                        <div class="employee-name">${item.employee.nome} ${item.employee.cognome}</div>
                        <div class="employee-date">Corso: ${item.course}</div>
                        <div class="employee-date">Data corso: ${new Date(item.courseDate).toLocaleDateString('it-IT')}</div>
                        <div class="employee-date">Scadenza: ${item.expiryDate.toLocaleDateString('it-IT')}</div>
                        <div class="employee-date">Giorni rimasti: ${item.daysUntilExpiry}</div>
                        <span class="scadenza-status status-${statusClass.replace('scaduta', 'scaduto')}">${statusText}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateScadenzeStats() {
    const scadutiElement = document.getElementById('corsiBScaduti');
    const inScadenzaElement = document.getElementById('corsiInScadenza');
    const okElement = document.getElementById('corsiOk');
    
    if (!scadutiElement) return;
    
    let scaduti = 0;
    let inScadenza = 0;
    let validi = 0;
    
    employees.forEach(employee => {
        [
            { date: employee.dataSicurezza, type: 'sicurezza' },
            { date: employee.dataHACCP, type: 'haccp' },
            { date: employee.dataAggiornamentoSicurezza, type: 'aggiornamento' }
        ].forEach(course => {
            if (course.date) {
                const expiry = calculateExpiryDate(course.date, course.type);
                const days = getDaysUntilExpiry(expiry);
                
                if (days < 0) scaduti++;
                else if (days <= 30) inScadenza++;
                else validi++;
            }
        });
    });
    
    scadutiElement.textContent = scaduti;
    inScadenzaElement.textContent = inScadenza;
    okElement.textContent = validi;
}

function refreshScadenze() {
    displayScadenze();
    updateScadenzeStats();
}

function printScadenze() {
    // Implementazione stampa scadenze
    console.log('Stampa scadenze non ancora implementata');
}
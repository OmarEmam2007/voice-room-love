// **==========================================================**
// ** 1. CONFIGURATION: OMAR & ECRIN DREAM HOUSE DATA   **
// **==========================================================**
const TOTAL_DISTANCE = 4069;         // Distance between Egypt & Germany (km)
const TARGET_DATE_STRING = "2027-05-20"; // Date of next meeting
const RELATIONSHIP_START_DATE = "2025-11-26"; // Relationship start date
const DISTANCE_UNIT = "km"; 
const CLOSER_MESSAGE_TEMPLATE = "We closed **{percentage}%** of the distance today! ❤️ The countdown is real.";
// **==========================================================**

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const TARGET_DATE = new Date(TARGET_DATE_STRING); 
const START_DATE = new Date(RELATIONSHIP_START_DATE);

// Dynamic Variables
let currentUser = null; 

// --- User Selection Logic ---

function selectUser(userName) {
    currentUser = userName;
    localStorage.setItem('currentUser', userName);

    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('app-content').classList.remove('hidden');
    document.getElementById('current-user-name').textContent = userName;
    
    // Once logged in, load personalized content
    loadSharedLog();
    loadSongs();
}

function checkUser() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        selectUser(storedUser);
    } else {
        document.getElementById('start-screen').classList.remove('hidden');
        document.getElementById('app-content').classList.add('hidden');
    }
}


// --- Core Distance and Time Functions (Calculations remain the same) ---

function updateDistanceStatus() {
    // ... (Function code remains the same as in the previous version) ...
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const diffTime = TARGET_DATE.getTime() - today.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / MS_PER_DAY));

    let dailyCloserMessage = '';
    let semanticDistanceText = '';

    if (daysRemaining > 0) {
        // We calculate the total days from start to end for a smooth daily rate
        const totalDays = Math.ceil((TARGET_DATE.getTime() - START_DATE.getTime()) / MS_PER_DAY);
        const dailyDistanceClosed = TOTAL_DISTANCE / totalDays; 
        const dailyPercentageCloser = ((dailyDistanceClosed / TOTAL_DISTANCE) * 100).toFixed(2);
        
        const semanticDistance = (TOTAL_DISTANCE / daysRemaining).toFixed(2);
        
        dailyCloserMessage = CLOSER_MESSAGE_TEMPLATE.replace('{percentage}', dailyPercentageCloser);
        semanticDistanceText = `${semanticDistance} ${DISTANCE_UNIT} / Day Remaining`;

    } else {
        dailyCloserMessage = "The distance is ZERO! We are together! 🎉";
        semanticDistanceText = "0.00 " + DISTANCE_UNIT + " / Day";
    }

    document.getElementById('daily-closer-message').innerHTML = dailyCloserMessage;
    document.getElementById('semantic-distance').textContent = semanticDistanceText;
}

function updateCountdown() {
    // ... (Function code remains the same as in the previous version) ...
    const now = new Date().getTime();
    const distance = TARGET_DATE.getTime() - now;

    if (distance < 0) {
        document.getElementById("countdown").innerHTML = "The wait is over! ZERO distance!";
        return;
    }

    const days = Math.floor(distance / MS_PER_DAY);
    const hours = Math.floor((distance % MS_PER_DAY) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("countdown").innerHTML = 
        `${days} <span class="unit-label">D</span> | ${hours} <span class="unit-label">H</span> | ${minutes} <span class="unit-label">M</span> | ${seconds} <span class="unit-label">S</span>`;
}

function updateRelationshipDuration() {
    // ... (Function code remains the same as in the previous version) ...
    const now = new Date().getTime();
    const diff = now - START_DATE.getTime();

    const years = Math.floor(diff / (MS_PER_DAY * 365.25));
    const days = Math.floor((diff % (MS_PER_DAY * 365.25)) / MS_PER_DAY);

    document.getElementById('relationship-duration').textContent = 
        `${years} Years and ${days} Days`;
}


// --- Shared Log (Dynamic Content) Functions ---

function addLogEntry() {
    if (!currentUser) return alert('Please select your identity first!');
    const entryText = document.getElementById('log-entry-text').value.trim();
    if (!entryText) return;

    const log = JSON.parse(localStorage.getItem('dreamLog') || '[]');
    const newEntry = {
        text: entryText,
        author: currentUser,
        date: new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})
    };
    log.unshift(newEntry); // Add to the beginning
    localStorage.setItem('dreamLog', JSON.stringify(log.slice(0, 10))); // Keep max 10 entries

    document.getElementById('log-entry-text').value = '';
    loadSharedLog();
}

function loadSharedLog() {
    const log = JSON.parse(localStorage.getItem('dreamLog') || '[]');
    const ul = document.getElementById('dream-log');
    ul.innerHTML = '';
    
    if (log.length === 0) {
        ul.innerHTML = '<li>No shared dreams yet. Be the first to add one!</li>';
        return;
    }

    log.forEach(entry => {
        const li = document.createElement('li');
        const authorClass = entry.author === 'Omar' ? 'author-Omar' : 'author-Ecrin';
        li.innerHTML = `<span class="log-author ${authorClass}">${entry.author}</span>
                        ${entry.text}
                        <span class="log-date">${entry.date}</span>`;
        ul.appendChild(li);
    });
}

// --- Shared Songs List ---

function addSong() {
    if (!currentUser) return alert('Please select your identity first!');
    const songInput = document.getElementById('song-input');
    const songText = songInput.value.trim();
    if (!songText) return;

    const songs = JSON.parse(localStorage.getItem('favSongs') || '[]');
    const newSong = {
        text: songText,
        author: currentUser
    };
    songs.unshift(newSong); // Add to the beginning
    localStorage.setItem('favSongs', JSON.stringify(songs.slice(0, 5))); // Max 5 songs

    songInput.value = '';
    loadSongs();
}

function loadSongs() {
    const songs = JSON.parse(localStorage.getItem('favSongs') || '[]');
    const ul = document.getElementById('song-list');
    ul.innerHTML = '';

    if (songs.length === 0) {
        ul.innerHTML = '<li>Add a song that makes you think of me!</li>';
        return;
    }

    songs.forEach(song => {
        const li = document.createElement('li');
        const authorClass = song.author === 'Omar' ? 'author-Omar' : 'author-Ecrin';
        li.innerHTML = `<span class="log-author ${authorClass}">${song.author}</span> added: ${song.text}`;
        ul.appendChild(li);
    });
}


// --- Tic-Tac-Toe Game Logic (Same as before) ---
let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X"; 
let gameActive = true;
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]            
];

const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('game-status');
const resetButton = document.getElementById('reset-game');

function handleResultValidation() {
    // ... (Game logic remains the same) ...
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = board[winCondition[0]];
        let b = board[winCondition[1]];
        let c = board[winCondition[2]];
        if (a === '' || b === '' || c === '') continue;
        
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusDisplay.textContent = `${currentPlayer === 'X' ? 'Omar Wins!' : 'Ecrin Wins!'} 🎉`;
        gameActive = false;
        return;
    }

    if (!board.includes("")) {
        statusDisplay.textContent = "It's a Draw! 🤝";
        gameActive = false;
        return;
    }

    changePlayer();
}

function changePlayer() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusDisplay.textContent = `${currentPlayer === 'X' ? 'Omar' : 'Ecrin'}'s turn (${currentPlayer})`;
}

function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (board[clickedCellIndex] !== "" || !gameActive) return;

    board[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;

    handleResultValidation();
}

function handleRestartGame() {
    gameActive = true;
    currentPlayer = "X";
    board = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.textContent = "Omar's turn (X)";
    cells.forEach(cell => cell.textContent = "");
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', handleRestartGame);


// --- Initialization ---

function initApp() {
    checkUser(); // Check if user is already logged in
    updateDistanceStatus();
    updateRelationshipDuration();
    setInterval(updateCountdown, 1000); 
    setInterval(updateRelationshipDuration, 60000); 
    setInterval(updateDistanceStatus, 60000); 
}

initApp();
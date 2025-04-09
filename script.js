// Game state variables
let playerCards = [];
let dealerCards = [];
let deck = [];
let playerScore = 0;
let dealerScore = 0;
let playerBalance = 1000;
let currentBet = 25;
let gameInProgress = false;
let dealersTurn = false;

// DOM elements
const dealBtn = document.getElementById('deal-btn');
const hitBtn = document.getElementById('hit-btn');
const standBtn = document.getElementById('stand-btn');
const doubleBtn = document.getElementById('double-btn');
const increaseBtn = document.getElementById('increase-bet');
const decreaseBtn = document.getElementById('decrease-bet');
const addMoneyBtn = document.getElementById('add-money');
const cheatAmountInput = document.getElementById('cheat-amount');
const betValueSpan = document.getElementById('bet-value');
const balanceAmount = document.querySelector('.balance-amount');
const playerCardsEl = document.querySelector('.player-cards');
const dealerCardsEl = document.querySelector('.dealer-cards');
const playerScoreEl = document.querySelector('.player-score');
const dealerScoreEl = document.querySelector('.dealer-score');
const resultPopup = document.getElementById('result-popup');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');
const playAgainBtn = document.getElementById('play-again');

// Card suits and values
const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];

// Initialize the game
function initGame() {
    updateBalance();
    dealBtn.addEventListener('click', startGame);
    hitBtn.addEventListener('click', hit);
    standBtn.addEventListener('click', stand);
    doubleBtn.addEventListener('click', double);
    increaseBtn.addEventListener('click', increaseBet);
    decreaseBtn.addEventListener('click', decreaseBet);
    addMoneyBtn.addEventListener('click', addMoney);
    playAgainBtn.addEventListener('click', resetGame);
}

function startLetterFlicker() {
    const letters = document.querySelectorAll('.letter');

    function flickerLetter(letter) {
        // Add flicker class
        letter.classList.add('flicker');

        // Remove class after animation ends to allow retriggering
        letter.addEventListener('animationend', () => {
            letter.classList.remove('flicker');
        }, { once: true });
    }

    // Randomly flicker letters at intervals
    letters.forEach(letter => {
        setInterval(() => {
            // 20% chance to flicker every 2-5 seconds
            if (Math.random() < 0.2) {
                flickerLetter(letter);
            }
        }, Math.random() * 3000 + 2000); // Random interval between 2s and 5s
    });
}

function addSparkles() {
    const balanceAmount = document.querySelector('.balance-amount');
    const sparkleCount = 3; // Number of stars at a time

    function createSparkle() {
        const sparkle = document.createElement('span');
        sparkle.classList.add('sparkle');
        sparkle.textContent = '✦'; // Star symbol

        // Random position around the balance
        const x = Math.random() * 40 - 20; // -20px to 20px from center
        const y = Math.random() * 40 - 20;
        sparkle.style.left = `calc(50% + ${x}px)`;
        sparkle.style.top = `${y}px`;

        // Random size
        const size = Math.random() * 0.5 + 0.5; // 0.5rem to 1rem
        sparkle.style.fontSize = `${size}rem`;

        // Random animation duration
        const duration = Math.random() * 1 + 0.5; // 0.5s to 1.5s
        sparkle.style.animationDuration = `${duration}s`;

        balanceAmount.appendChild(sparkle);

        // Remove after animation
        sparkle.addEventListener('animationend', () => {
            sparkle.remove();
        });
    }

    // Create sparkles at intervals
    setInterval(() => {
        if (Math.random() > 0.3) { // 70% chance to spawn each interval
            createSparkle();
        }
    }, 300); // New sparkle every 300ms
}

// Create a deck of cards
function createDeck() {
    const newDeck = [];
    
    for (let suit of suits) {
        for (let value of values) {
            newDeck.push({
                suit: suit,
                value: value,
                imgName: `images/${value}_of_${suit}.png`
            });
        }
    }
    
    return newDeck;
}

// Shuffle the deck
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// Start a new game
function startGame() {
    if (currentBet > playerBalance) {
        alert("You don't have enough money!");
        return;
    }
    
    gameInProgress = true;
    dealersTurn = false;
    
    // Reset
    playerCards = [];
    dealerCards = [];
    playerCardsEl.innerHTML = '';
    dealerCardsEl.innerHTML = '';
    
    // Create and shuffle deck
    deck = shuffleDeck(createDeck());
    
    // Update balance
    playerBalance -= currentBet;
    updateBalance();
    
    // Deal initial cards
    dealCard(playerCards, playerCardsEl, true);
    dealCard(dealerCards, dealerCardsEl, true);
    dealCard(playerCards, playerCardsEl, true);
    dealCard(dealerCards, dealerCardsEl, false);
    
    // Update scores
    updateScores();
    
    // Update buttons
    dealBtn.disabled = true;
    hitBtn.disabled = false;
    standBtn.disabled = false;
    doubleBtn.disabled = playerBalance < currentBet ? true : false;
    increaseBtn.disabled = true;
    decreaseBtn.disabled = true;
    
    // Check for blackjack
    checkForBlackjack();
}

// Deal a card
function dealCard(hand, element, faceUp = true) {
    const card = deck.pop();
    hand.push(card);
    
    const cardEl = document.createElement('div');
    cardEl.classList.add('card');
    
    if (faceUp) {
        cardEl.style.backgroundImage = `url(${card.imgName})`;
    } else {
        cardEl.style.backgroundImage = 'url(images/back.png)';
        cardEl.dataset.hidden = 'true';
        cardEl.dataset.imgName = card.imgName;
    }
    
    element.appendChild(cardEl);
    
    // Animate the card
    setTimeout(() => {
        cardEl.classList.add('dealt');
    }, 50);
    
    return card;
}

// Calculate hand score
function calculateScore(hand) {
    let score = 0;
    let aces = 0;
    
    for (let card of hand) {
        if (card.value === 'ace') {
            aces++;
            score += 11;
        } else if (['jack', 'queen', 'king'].includes(card.value)) {
            score += 10;
        } else {
            score += parseInt(card.value);
        }
    }
    
    // Adjust for aces
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    
    return score;
}

// Update scores
function updateScores() {
    playerScore = calculateScore(playerCards);
    dealerScore = calculateScore(dealerCards);
    
    playerScoreEl.textContent = `Score: ${playerScore}`;
    
    // Only show dealer's score for face-up cards
    if (!dealersTurn) {
        const visibleDealerCards = dealerCards.slice(0, 1);
        dealerScoreEl.textContent = `Score: ${calculateScore(visibleDealerCards)}`;
    } else {
        dealerScoreEl.textContent = `Score: ${dealerScore}`;
    }
}

// Hit - get another card
function hit() {
    if (!gameInProgress) return;
    
    const card = dealCard(playerCards, playerCardsEl, true);
    updateScores();
    
    // Disable double after hit
    doubleBtn.disabled = true;
    
    // Check if player busts
    if (playerScore > 21) {
        endGame("bust");
    }
}

// Stand - end player's turn
function stand() {
    if (!gameInProgress) return;
    
    dealersTurn = true;
    
    // Flip dealer's hidden card
    const hiddenCard = dealerCardsEl.querySelector('[data-hidden="true"]');
    if (hiddenCard) {
        hiddenCard.classList.add('flip');
        setTimeout(() => {
            hiddenCard.style.backgroundImage = `url(${hiddenCard.dataset.imgName})`;
            hiddenCard.removeAttribute('data-hidden');
            updateScores();
            
            // Add additional delay before dealer starts drawing
            setTimeout(() => {
                dealerPlay();
            }, 700); // Match the delay used in dealerDraw
            
        }, 250);
    } else {
        dealerPlay();
    }
}

// Double - double the bet and get one more card
function double() {
    if (!gameInProgress || playerBalance < currentBet) return;
    
    playerBalance -= currentBet;
    currentBet *= 2;
    updateBalance();
    
    const card = dealCard(playerCards, playerCardsEl, true);
    updateScores();
    
    if (playerScore > 21) {
        endGame("bust");
    } else {
        stand();
    }
}

// Dealer's play
function dealerPlay() {
    if (playerScore > 21) {
        endGame("bust");
        return;
    }
    
    const dealerDraw = () => {
        if (dealerScore < 17) {
            dealCard(dealerCards, dealerCardsEl, true);
            updateScores();
            
            setTimeout(() => {
                dealerDraw();
            }, 700);
        } else {
            determineWinner();
        }
    };
    
    dealerDraw();
}

// Check for blackjack (natural 21)
function checkForBlackjack() {
    if (playerScore === 21 && playerCards.length === 2) {
        // Flip dealer's hidden card
        const hiddenCard = dealerCardsEl.querySelector('[data-hidden="true"]');
        if (hiddenCard) {
            hiddenCard.classList.add('flip');
            setTimeout(() => {
                hiddenCard.style.backgroundImage = `url(${hiddenCard.dataset.imgName})`;
                hiddenCard.removeAttribute('data-hidden');
                updateScores();
                
                if (dealerScore === 21 && dealerCards.length === 2) {
                    // Both have blackjack - push
                    endGame("push");
                } else {
                    // Player has blackjack, dealer doesn't
                    endGame("blackjack");
                }
            }, 250);
        }
    }
}

// Determine the winner
function determineWinner() {
    if (playerScore > 21) {
        endGame("bust");
    } else if (dealerScore > 21) {
        endGame("dealer_bust");
    } else if (playerScore > dealerScore) {
        endGame("win");
    } else if (playerScore < dealerScore) {
        endGame("lose");
    } else {
        endGame("push");
    }
}

// End the game
function endGame(result) {
    gameInProgress = false;
    
    let payout = 0;
    let title = "";
    let message = "";
    let popupClass = "";
    
    switch (result) {
        case "blackjack":
            payout = currentBet * 2.5;
            title = "Blackjack!";
            message = `Congratulations! You got a Blackjack and won $${payout.toFixed(2)}!`;
            popupClass = "win";
            break;
        case "win":
            payout = currentBet * 2;
            title = "You Win!";
            message = `You won $${payout.toFixed(2)}!`;
            popupClass = "win";
            break;
        case "dealer_bust":
            payout = currentBet * 2;
            title = "Dealer Busts!";
            message = `Dealer went over 21. You won $${payout.toFixed(2)}!`;
            popupClass = "win";
            break;
        case "lose":
            payout = 0;
            title = "You Lose";
            message = `Dealer wins with ${dealerScore} against your ${playerScore}.`;
            popupClass = "lose";
            break;
        case "bust":
            payout = 0;
            title = "Bust!";
            message = "You went over 21 and lost your bet.";
            popupClass = "lose";
            break;
        case "push":
            payout = currentBet;
            title = "Push";
            message = "It's a tie! Your bet has been returned.";
            popupClass = "";
            break;
    }
    
    playerBalance += payout;
    updateBalance();
    
    // Disable game buttons
    hitBtn.disabled = true;
    standBtn.disabled = true;
    doubleBtn.disabled = true;
    
    // Show popup after a short delay
    setTimeout(() => {
        resultTitle.textContent = title;
        resultMessage.textContent = message;
        resultPopup.className = "popup active " + popupClass;
        
        if (playerBalance < 5) {
            resultMessage.textContent += " You're running low on funds. Use the cheat panel to add more money!";
        }
    }, 1000);
}

// Reset game
function resetGame() {
    gameInProgress = false;
    dealersTurn = false;
    
    // Reset bet if necessary
    if (currentBet > playerBalance) {
        currentBet = Math.min(25, playerBalance);
    }
    
    // Enable buttons
    dealBtn.disabled = false;
    hitBtn.disabled = true;
    standBtn.disabled = true;
    doubleBtn.disabled = true;
    increaseBtn.disabled = false;
    decreaseBtn.disabled = false;
    
    // Update display
    updateBetDisplay();
    resultPopup.classList.remove('active');
}

// Increase bet
function increaseBet() {
    if (gameInProgress) return;
    
    const increments = [5, 25, 50, 100, 250, 500, 1000];
    let nextIncrement = 25;
    
    for (let inc of increments) {
        if (currentBet < inc) {
            nextIncrement = inc;
            break;
        }
    }
    
    if (currentBet < playerBalance) {
        currentBet = Math.min(nextIncrement, playerBalance);
        updateBetDisplay();
    }
}

// Decrease bet
function decreaseBet() {
    if (gameInProgress) return;
    
    const increments = [5, 25, 50, 100, 250, 500, 1000];
    let prevIncrement = 5;
    
    for (let i = increments.length - 1; i >= 0; i--) {
        if (currentBet > increments[i]) {
            prevIncrement = increments[i];
            break;
        }
    }
    
    if (currentBet > 5) {
        currentBet = Math.max(prevIncrement, 5);
        updateBetDisplay();
    }
}

// Add money (cheat)
function addMoney() {
    const amount = parseInt(cheatAmountInput.value) || 0;
    if (amount > 0) {
        playerBalance += amount;
        updateBalance();
        cheatAmountInput.value = '';
        
        // Apply pulse animation to balance
        balanceAmount.classList.add('pulse');
        setTimeout(() => {
            balanceAmount.classList.remove('pulse');
        }, 500);
    }
}

// Update bet display
function updateBetDisplay() {
    betValueSpan.textContent = currentBet;
}

// Update balance display
function updateBalance() {
    balanceAmount.textContent = playerBalance;
}

// Music Player functionality
const musicPlayer = (function() {
    // Playlist of casino jazz music from YouTube
    const playlist = [
        { title: "Casino Jazz", url: "https://www.youtube.com/watch?v=8w5ELqXNlvk" },
        
    ];
    
    // Variables
    let currentTrack = 0;
    let isPlaying = false;
    let audio = null;
    
    // DOM elements
    const playPauseBtn = document.getElementById('play-pause');
    const prevBtn = document.getElementById('prev-song');
    const nextBtn = document.getElementById('next-song');
    const volumeSlider = document.getElementById('volume-slider');
    const songTitle = document.querySelector('.song-title');
    
    // Extract YouTube ID from URL
    function getYouTubeID(url) {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : false;
    }
    
    // Initialize music player
    function init() {
        // Create YouTube IFrame API script
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        
        // Set up event listeners
        playPauseBtn.addEventListener('click', togglePlay);
        prevBtn.addEventListener('click', playPrevious);
        nextBtn.addEventListener('click', playNext);
        volumeSlider.addEventListener('input', setVolume);
        
        // Initialize with the first track
        updateSongTitle();
        
        // Global callback for when YouTube API is ready
        window.onYouTubeIframeAPIReady = function() {
            createPlayer();
        };
    }
    
    // Create YouTube player
    function createPlayer() {
        const videoId = getYouTubeID(playlist[currentTrack].url);
        
        // Create a hidden YouTube player
        const playerDiv = document.createElement('div');
        playerDiv.id = 'youtube-player';
        playerDiv.style.display = 'none';
        document.body.appendChild(playerDiv);
        
        // Initialize YouTube player
        audio = new YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: videoId,
            playerVars: {
                'autoplay': 0,
                'controls': 0,
                'disablekb': 1,
                'fs': 0,
                'rel': 0
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }
    
    // When player is ready
    function onPlayerReady(event) {
        setVolume();
    }
    
    // When player state changes
    function onPlayerStateChange(event) {
        // If video ended, play next
        if (event.data === YT.PlayerState.ENDED) {
            playNext();
        }
        
        // Update play/pause button
        if (event.data === YT.PlayerState.PLAYING) {
            playPauseBtn.classList.remove('play');
            isPlaying = true;
        } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
            playPauseBtn.classList.add('play');
            isPlaying = false;
        }
    }
    
    // Toggle play/pause
    function togglePlay() {
        if (!audio) return;
        
        if (isPlaying) {
            audio.pauseVideo();
        } else {
            audio.playVideo();
        }
    }
    
    // Play previous track
    function playPrevious() {
        if (!audio) return;
        
        currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
        loadTrack();
    }
    
    // Play next track
    function playNext() {
        if (!audio) return;
        
        currentTrack = (currentTrack + 1) % playlist.length;
        loadTrack();
    }
    
    // Load current track
    function loadTrack() {
        const videoId = getYouTubeID(playlist[currentTrack].url);
        audio.loadVideoById(videoId);
        updateSongTitle();
    }
    
    // Set volume
    function setVolume() {
        if (!audio) return;
        
        const volume = volumeSlider.value;
        audio.setVolume(volume);
    }
    
    // Update song title
    function updateSongTitle() {
        songTitle.textContent = playlist[currentTrack].title;
    }
    
    return {
        init: init
    };
})();

// Initialize the music player
window.addEventListener('DOMContentLoaded', function() {
    initGame();
    musicPlayer.init();
});

// Start flickering when the page loads
window.addEventListener('DOMContentLoaded', startLetterFlicker);

// Start sparkles when the page loads
window.addEventListener('DOMContentLoaded', addSparkles);
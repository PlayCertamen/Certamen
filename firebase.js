// ===================================
// FIREBASE CONFIGURATION & INITIALIZATION
// ===================================

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, onSnapshot, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAl7hOXx3QDTVbhEvRjyWl7YSsErcENLFM",
  authDomain: "playcertamen.firebaseapp.com",
  projectId: "playcertamen",
  storageBucket: "playcertamen.firebasestorage.app",
  messagingSenderId: "613965926520",
  appId: "1:613965926520:web:be5179705e8c2311f8dd8d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===================================
// MULTIPLAYER GAME STATE
// ===================================

const multiplayerState = {
  roomCode: null,
  isHost: false,
  playerId: null,
  playerName: null,
  roomRef: null,
  unsubscribe: null,
  gameStarted: false,      // Set when host clicks START GAME
  countdownStarted: false, // Set when countdown begins (synced)
  gameActive: false        // Set when game actually starts
};

// ===================================
// LISTENER REGISTRY - Track all active listeners for cleanup
// ===================================

const listenerRegistry = {
  listeners: [],
  
  // Register a new listener
  add(unsubscribeFn, name = 'unnamed') {
    this.listeners.push({ unsubscribe: unsubscribeFn, name, addedAt: Date.now() });
    console.log(`📡 Listener registered: ${name} (total: ${this.listeners.length})`);
  },
  
  // Remove a specific listener
  remove(unsubscribeFn) {
    const index = this.listeners.findIndex(l => l.unsubscribe === unsubscribeFn);
    if (index !== -1) {
      const listener = this.listeners[index];
      try {
        listener.unsubscribe();
      } catch (e) {
        console.warn(`⚠️ Error unsubscribing listener ${listener.name}:`, e);
      }
      this.listeners.splice(index, 1);
      console.log(`📡 Listener removed: ${listener.name} (remaining: ${this.listeners.length})`);
    }
  },
  
  // Clean up ALL listeners (call when leaving game)
  cleanupAll() {
    console.log(`🧹 Cleaning up ${this.listeners.length} Firebase listeners...`);
    this.listeners.forEach(listener => {
      try {
        listener.unsubscribe();
        console.log(`  ✅ Unsubscribed: ${listener.name}`);
      } catch (e) {
        console.warn(`  ⚠️ Error unsubscribing ${listener.name}:`, e);
      }
    });
    this.listeners = [];
    console.log('🧹 All listeners cleaned up');
  }
};

// Make registry available globally
window.listenerRegistry = listenerRegistry;

// ===================================
// FIREBASE UPDATE WRAPPER - Error handling & user feedback
// ===================================

let consecutiveFailures = 0;
const MAX_CONSECUTIVE_FAILURES = 3;

/**
 * Wrapper for Firebase updateDoc with error handling and optional retry
 * @param {DocumentReference} docRef - Firebase document reference
 * @param {Object} data - Data to update
 * @param {Object} options - Optional settings
 * @param {boolean} options.silent - Don't show error toast (default: false)
 * @param {boolean} options.critical - Show error immediately, no retries (default: false)
 * @returns {Promise<boolean>} - true if successful, false if failed
 */
async function safeUpdateDoc(docRef, data, options = {}) {
  const { silent = false, critical = false } = options;
  
  try {
    await updateDoc(docRef, data);
    consecutiveFailures = 0; // Reset on success
    return true;
  } catch (error) {
    consecutiveFailures++;
    console.error(`❌ Firebase update failed (attempt ${consecutiveFailures}):`, error.message);
    
    // Log what we were trying to update (for debugging)
    console.error('❌ Failed update data:', JSON.stringify(data).substring(0, 200));
    
    // Show user feedback for critical errors or repeated failures
    if (critical || (!silent && consecutiveFailures >= MAX_CONSECUTIVE_FAILURES)) {
      showFirebaseError(error);
    }
    
    return false;
  }
}

/**
 * Show user-friendly error message for Firebase failures
 */
function showFirebaseError(error) {
  let message = 'Connection issue - some updates may not sync';
  
  // Customize message based on error type
  if (error.code === 'permission-denied') {
    message = 'Permission denied - room may have closed';
  } else if (error.code === 'unavailable') {
    message = 'Server unavailable - check your connection';
  } else if (error.code === 'not-found') {
    message = 'Room not found - it may have been deleted';
  }
  
  // Show toast notification
  showToast(`⚠️ ${message}`, 4000);
  console.warn(`🔥 Firebase error shown to user: ${message}`);
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

// Generate a 6-digit room code
function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate a unique player ID
function generatePlayerId() {
  return 'player_' + Math.random().toString(36).substr(2, 9) + Date.now();
}

// Show custom modal for player name input
function showNameModal(title = "Enter Your Name", defaultName = "Player") {
  return new Promise((resolve) => {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'room-code-modal-overlay';
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'room-code-modal';
    modal.innerHTML = `
      <h2 class="room-code-modal-title">${title}</h2>
      <input 
        type="text" 
        class="room-code-input" 
        placeholder="${defaultName}"
        maxlength="20"
        autocomplete="off"
        style="letter-spacing: 0.05em; font-size: 1.2rem; font-family: 'Inter', sans-serif; font-weight: 500;"
      />
      <div class="modal-buttons">
        <button class="modal-btn modal-btn-cancel">Cancel</button>
        <button class="modal-btn modal-btn-confirm">Continue</button>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Get elements
    const input = modal.querySelector('.room-code-input');
    const cancelBtn = modal.querySelector('.modal-btn-cancel');
    const confirmBtn = modal.querySelector('.modal-btn-confirm');
    
    // Focus input
    setTimeout(() => input.focus(), 100);
    
    // Close modal function
    const closeModal = (value) => {
      overlay.style.animation = 'fadeOut 0.2s ease-in';
      setTimeout(() => {
        overlay.remove();
        resolve(value);
      }, 200);
    };
    
    // Cancel button
    cancelBtn.addEventListener('click', () => closeModal(null));
    
    // Confirm button
    confirmBtn.addEventListener('click', () => {
      const name = input.value.trim() || defaultName;
      closeModal(name);
    });
    
    // Enter key to confirm
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const name = input.value.trim() || defaultName;
        closeModal(name);
      }
    });
    
    // Click outside to cancel
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(null);
      }
    });
  });
}

// ===================================
// HOST GAME FUNCTIONS
// ===================================

async function hostGame(gameSettings = {}) {
  try {
    console.log('🏛️ HOST GAME clicked');
    
    // If no settings passed, read from localStorage (set by setup.js)
    if (!gameSettings.level || !gameSettings.categories) {
      console.log('📖 Reading game settings from localStorage...');
      const savedLevel = localStorage.getItem('multiplayer_selectedLevel');
      const savedCategories = localStorage.getItem('multiplayer_selectedCategories');
      
      gameSettings = {
        level: gameSettings.level || savedLevel || 'novice',
        categories: gameSettings.categories || (savedCategories ? savedCategories.split(',') : ['mythology', 'roman-history-daily-life', 'latin-grammar', 'derivatives', 'mottos', 'ancient-geography'])
      };
      
      console.log(`✅ Loaded from localStorage: Level=${gameSettings.level}, Categories=${gameSettings.categories}`);
    }
    
    console.log('🔍 DEBUG firebase.js: hostGame called with:', gameSettings);
    console.log('🔍 DEBUG firebase.js: gameSettings.level =', gameSettings.level);
    console.log('🔍 DEBUG firebase.js: gameSettings.categories =', gameSettings.categories);
    
    // Ask for player name first
    const playerName = await showNameModal("Enter Your Name", "Host");
    if (!playerName) {
      // User cancelled
      return null;
    }
    
    // Generate room code
    const roomCode = generateRoomCode();
    multiplayerState.roomCode = roomCode;
    multiplayerState.isHost = true;
    multiplayerState.playerId = generatePlayerId();
    multiplayerState.playerName = playerName;
    multiplayerState.teamIndex = 0; // Host is always team 0
    
    // Store game settings
    multiplayerState.level = gameSettings.level;
    multiplayerState.categories = gameSettings.categories;
    
    console.log('🔍 DEBUG firebase.js: multiplayerState.level =', multiplayerState.level);
    console.log('🔍 DEBUG firebase.js: multiplayerState.categories =', multiplayerState.categories);
    
    // Validate settings
    if (!multiplayerState.level) {
      console.error('❌ No difficulty level provided!');
      alert('Error: No difficulty level selected. Please refresh and try again.');
      return null;
    }
    
    // Create room in Firestore
    const roomRef = doc(db, "rooms", roomCode);
    multiplayerState.roomRef = roomRef;
    
    await setDoc(roomRef, {
      hostId: multiplayerState.playerId,
      createdAt: serverTimestamp(),
      gameStarted: false,
      gameSettings: {
        level: multiplayerState.level,
        categories: multiplayerState.categories
      },
      players: {
        [multiplayerState.playerId]: {
          name: playerName,
          teamIndex: 0,
          isHost: true,
          score: 0,
          joinedAt: serverTimestamp()
        }
      }
    });
    
    console.log(`✅ Room created with code: ${roomCode}`);
    
    // Show waiting room
    showWaitingRoom(roomCode);
    
    // Listen for players joining
    listenToRoom(roomCode);
    
    return roomCode;
    
  } catch (error) {
    console.error("Error creating room:", error);
    if (isQuotaExhaustedError(error)) {
      showServersRestingScreen();
    } else {
      alert("Failed to create room. Please try again.");
    }
    return null;
  }
}

// ===================================
// JOIN GAME FUNCTIONS
// ===================================

async function joinGame(roomCode, playerName) {
  try {
    // Validate room code
    if (!roomCode || roomCode.length !== 6) {
      showToast("⚠️ Please enter a valid 6-digit room code");
      return false;
    }
    
    // Check if room exists
    const roomRef = doc(db, "rooms", roomCode);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      showToast("❌ Room not found. Please check the code.");
      return false;
    }
    
    const roomData = roomSnap.data();
    
    // Check if game already started
    if (roomData.gameStarted) {
      showToast("❌ This game has already started.");
      return false;
    }
    
    // Auto-assign team index (0, 1, or 2)
    const existingPlayers = Object.keys(roomData.players || {});
    const teamIndex = existingPlayers.length;
    
    if (teamIndex >= 3) {
      showToast("❌ Room is full (3 players max)");
      return false;
    }
    
    multiplayerState.playerId = generatePlayerId();
    multiplayerState.playerName = playerName;
    multiplayerState.teamIndex = teamIndex;
    multiplayerState.roomCode = roomCode;
    multiplayerState.isHost = false;
    multiplayerState.roomRef = roomRef;
    
    // Add player to room
    await updateDoc(roomRef, {
      [`players.${multiplayerState.playerId}`]: {
        name: playerName,
        teamIndex: teamIndex,
        isHost: false,
        score: 0,
        joinedAt: serverTimestamp()
      }
    });
    
    console.log(`✅ Joined room: ${roomCode} as team ${teamIndex}`);
    
    // Show waiting room
    showWaitingRoom(roomCode);
    
    // Listen for room updates
    listenToRoom(roomCode);
    
    return true;
    
  } catch (error) {
    console.error("Error joining room:", error);
    if (isQuotaExhaustedError(error)) {
      showServersRestingScreen();
    } else {
      alert("Failed to join room. Please try again.");
    }
    return false;
  }
}

// ===================================
// ROOM LISTENING & UPDATES
// ===================================

function listenToRoom(roomCode) {
  const roomRef = doc(db, "rooms", roomCode);
  
  // Unsubscribe from previous listener if exists
  if (multiplayerState.unsubscribe) {
    listenerRegistry.remove(multiplayerState.unsubscribe);
    multiplayerState.unsubscribe = null;
  }
  
  // Listen to room changes in real-time
  multiplayerState.unsubscribe = onSnapshot(roomRef, (doc) => {
    if (!doc.exists()) {
      console.log("Room no longer exists");
      alert("The room has been closed.");
      leaveRoom();
      return;
    }
    
    const roomData = doc.data();
    console.log("Room updated:", roomData);
    
    // Update waiting room UI
    updateWaitingRoomUI(roomData);
    
    // Check if game started
    if (roomData.gameStarted && !multiplayerState.gameStarted) {
      startMultiplayerGame(roomData);
    }
  });
  
  // Register with listener registry
  listenerRegistry.add(multiplayerState.unsubscribe, 'room-listener');
}

// ===================================
// WAITING ROOM UI
// ===================================

function showWaitingRoom(roomCode) {
  // Hide multiplayer setup screen
  document.getElementById('multiplayer-setup').style.display = 'none';
  
  // Split room code into individual digits
  const roomCodeDigits = roomCode.split('').map(digit => `<span>${digit}</span>`).join('');
  
  // Create and show waiting room UI
  const waitingRoom = document.createElement('div');
  waitingRoom.id = 'waiting-room';
  waitingRoom.className = 'waiting-room-screen';
  waitingRoom.innerHTML = `
    <div class="waiting-room-container">
      <h1 class="waiting-room-title">Waiting Room</h1>
      
      <div class="room-code-display">
        <div class="room-code-label">Room Code</div>
        <div class="room-code-value">${roomCodeDigits}</div>
        <button class="copy-code-btn" onclick="copyRoomCode('${roomCode}')">📋 Copy Code</button>
      </div>
      
      <!-- Game Settings Display -->
      <div class="game-settings-display" id="game-settings-display">
        <div class="settings-label">Game Settings</div>
        <div class="settings-info" id="settings-info">
          <span class="setting-badge difficulty-badge" id="difficulty-badge">Loading...</span>
          <span class="setting-badge categories-badge" id="categories-badge"></span>
        </div>
      </div>
      
      <div class="players-section">
        <h2 class="players-title">Captains</h2>
        <div id="players-list" class="players-list"></div>
      </div>
      
      <div class="waiting-room-actions">
        ${multiplayerState.isHost ? 
          `<button class="start-game-btn" id="start-multiplayer-btn" disabled>
            <span class="split-top">START GAME</span>
            <span class="split-bottom">START GAME</span>
            <span class="split-reveal">BONAM FORTUNAM</span>
          </button>` : 
          '<div class="waiting-message">Waiting for host to start the game...</div>'
        }
        <button class="leave-room-btn" onclick="leaveRoom()">Exit Room</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(waitingRoom);
  
  // Add start game button listener if host
  if (multiplayerState.isHost) {
    setTimeout(() => {
      const startBtn = document.getElementById('start-multiplayer-btn');
      if (startBtn) {
        startBtn.addEventListener('click', startGameAsHost);
      }
    }, 100);
  }
}

function updateWaitingRoomUI(roomData) {
  const playersList = document.getElementById('players-list');
  if (!playersList) return;
  
  const players = roomData.players || {};
  const playerCount = Object.keys(players).length;
  
  // Update players list
  playersList.innerHTML = Object.entries(players).map(([id, player]) => `
    <div class="player-item ${id === multiplayerState.playerId ? 'current-player' : ''}">
      <span class="player-name">${player.name}</span>
      ${player.isHost ? '<span class="host-badge">HOST</span>' : ''}
    </div>
  `).join('');
  
  // Update game settings display
  const difficultyBadge = document.getElementById('difficulty-badge');
  const categoriesBadge = document.getElementById('categories-badge');
  
  if (difficultyBadge && roomData.gameSettings) {
    const level = roomData.gameSettings.level || 'novice';
    const levelEmoji = level === 'novice' ? '🌱' : level === 'intermediate' ? '⚡' : '🔥';
    const levelDisplay = level.charAt(0).toUpperCase() + level.slice(1);
    difficultyBadge.textContent = `${levelEmoji} ${levelDisplay}`;
    difficultyBadge.className = `setting-badge difficulty-badge difficulty-${level}`;
  }
  
  if (categoriesBadge && roomData.gameSettings) {
    const categories = roomData.gameSettings.categories || [];
    const categoryCount = categories.length;
    categoriesBadge.textContent = `📚 ${categoryCount} Categories`;
  }
  
  // Update start button (host only, need at least 2 players)
  if (multiplayerState.isHost) {
    const startBtn = document.getElementById('start-multiplayer-btn');
    if (startBtn) {
      startBtn.disabled = (playerCount < 2);
    }
  }
}

// ===================================
// GAME START FUNCTIONS
// ===================================

async function startGameAsHost() {
  try {
    await updateDoc(multiplayerState.roomRef, {
      gameStarted: true,
      startedAt: serverTimestamp()
    });
    console.log("✅ Game started!");
  } catch (error) {
    console.error("Error starting game:", error);
    alert("Failed to start game. Please try again.");
  }
}

function startMultiplayerGame(roomData) {
  console.log("Starting multiplayer game with data:", roomData);
  multiplayerState.gameStarted = true;
  
  // Store players data for game.js to use
  multiplayerState.players = roomData.players;
  
  // Store game settings
  if (roomData.gameSettings) {
    multiplayerState.level = roomData.gameSettings.level;
    multiplayerState.categories = roomData.gameSettings.categories;
  }
  
  // Hide waiting room
  const waitingRoom = document.getElementById('waiting-room');
  if (waitingRoom) {
    waitingRoom.remove();
  }
  
  // Show game start countdown
  showGameStartCountdown();
}

// Show game start countdown with rules
function showGameStartCountdown() {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'game-start-overlay';
  overlay.id = 'game-start-overlay';
  
  const content = document.createElement('div');
  content.className = 'game-start-content';
  content.innerHTML = `
    <div class="game-start-title">Certamen Rules</div>
    <div class="game-start-rules">
      <div class="game-start-rule">
        <span class="game-start-rule-icon">🔔</span>
        <span>Hyperbuzz anytime during toss-ups</span>
      </div>
      <div class="game-start-rule">
        <span class="game-start-rule-icon">⏰</span>
        <span>15 seconds to answer after buzzing</span>
      </div>
      <div class="game-start-rule">
        <span class="game-start-rule-icon">✓</span>
        <span>Correct toss-up = 2 bonus questions for your team</span>
      </div>
    </div>
    <div class="game-start-action-area">
      ${multiplayerState.isHost ? 
        '<button class="game-start-ready-btn" id="ready-btn">Ready!</button>' :
        '<div class="waiting-for-host" style="color: #fbbf24; font-size: 1.2rem; text-align: center; padding: 1rem;">⏳ Waiting for host to start...</div>'
      }
    </div>
  `;
  
  overlay.appendChild(content);
  document.body.appendChild(overlay);
  
  // HOST: Ready button writes to Firebase to start countdown for everyone
  if (multiplayerState.isHost) {
    const readyBtn = document.getElementById('ready-btn');
    readyBtn.addEventListener('click', async () => {
      console.log('🎮 HOST: Starting countdown for all players');
      readyBtn.disabled = true;
      readyBtn.textContent = 'Starting...';
      
      // Write countdown start to Firebase - this triggers all players
      await updateDoc(multiplayerState.roomRef, {
        gamePhase: 'countdown',
        countdownStartedAt: serverTimestamp()
      });
    });
  }
  
  // ALL PLAYERS (including host): Listen for gamePhase changes
  setupCountdownListener();
}

// Listen for countdown phase changes from Firebase
function setupCountdownListener() {
  if (!multiplayerState.roomRef) return;
  
  // Set up listener for game phase changes
  const unsubscribePhase = onSnapshot(multiplayerState.roomRef, (docSnap) => {
    if (!docSnap.exists()) return;
    
    const data = docSnap.data();
    
    // Countdown started - show countdown UI
    if (data.gamePhase === 'countdown' && !multiplayerState.countdownStarted) {
      multiplayerState.countdownStarted = true;
      console.log('🔔 Countdown started - synced from Firebase');
      showSyncedCountdown();
    }
    
    // Game is now active - start the game!
    if (data.gamePhase === 'active' && !multiplayerState.gameActive) {
      multiplayerState.gameActive = true;
      console.log('🎮 Game phase is ACTIVE - starting game');
      
      // Remove from registry and unsubscribe
      listenerRegistry.remove(unsubscribePhase);
      
      // Remove overlay and start game
      const overlay = document.getElementById('game-start-overlay');
      if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s ease-in';
        setTimeout(() => {
          overlay.remove();
          if (typeof game !== 'undefined' && game.startMultiplayerGame) {
            game.startMultiplayerGame(multiplayerState);
          } else {
            console.error('❌ game.startMultiplayerGame is not available!');
          }
        }, 300);
      }
    }
  });
  
  // Register with listener registry (will be auto-cleaned if game abandoned)
  listenerRegistry.add(unsubscribePhase, 'phase-listener');
}

// Show synchronized countdown (all players see the same countdown)
function showSyncedCountdown() {
  const overlay = document.getElementById('game-start-overlay');
  if (!overlay) return;
  
  const actionArea = overlay.querySelector('.game-start-action-area');
  if (!actionArea) return;
  
  // Replace button/waiting message with countdown
  actionArea.innerHTML = `
    <div class="game-start-countdown" id="countdown-number">3</div>
  `;
  
  // Run local countdown (all players start at roughly the same time due to Firebase sync)
  let count = 3;
  const countdownElement = document.getElementById('countdown-number');
  
  const countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownElement.textContent = count;
      // Restart animation
      countdownElement.style.animation = 'none';
      setTimeout(() => {
        countdownElement.style.animation = 'countdownPulse 1s ease-in-out';
      }, 10);
    } else {
      clearInterval(countdownInterval);
      countdownElement.textContent = 'GO!';
      
      // HOST: Signal that game is now active
      if (multiplayerState.isHost) {
        console.log('🎮 HOST: Countdown complete, setting game phase to ACTIVE');
        updateDoc(multiplayerState.roomRef, {
          gamePhase: 'active'
        });
      }
      // Non-hosts will start when they receive gamePhase: 'active' from Firebase
    }
  }, 1000);
}

// ===================================
// LEAVE ROOM FUNCTION
// ===================================

async function leaveRoom() {
  try {
    // 🧹 Clean up ALL Firebase listeners using registry
    listenerRegistry.cleanupAll();
    multiplayerState.unsubscribe = null;
    
    if (multiplayerState.roomRef && multiplayerState.playerId) {
      // Remove player from room
      const roomSnap = await getDoc(multiplayerState.roomRef);
      if (roomSnap.exists()) {
        const players = roomSnap.data().players || {};
        delete players[multiplayerState.playerId];
        
        // If last player or host leaving, delete room
        if (Object.keys(players).length === 0 || multiplayerState.isHost) {
          await deleteDoc(multiplayerState.roomRef);
          console.log("Room deleted");
        } else {
          await updateDoc(multiplayerState.roomRef, { players });
        }
      }
    }
    
    // Reset state
    multiplayerState.roomCode = null;
    multiplayerState.isHost = false;
    multiplayerState.playerId = null;
    multiplayerState.playerName = null;
    multiplayerState.roomRef = null;
    multiplayerState.gameStarted = false;
    multiplayerState.countdownStarted = false;
    multiplayerState.gameActive = false;
    
    // Remove waiting room UI
    const waitingRoom = document.getElementById('waiting-room');
    if (waitingRoom) {
      waitingRoom.remove();
    }
    
    // Show multiplayer setup again
    document.getElementById('multiplayer-setup').style.display = 'flex';
    
  } catch (error) {
    console.error("Error leaving room:", error);
  }
}

// ===================================
// UTILITY FUNCTIONS FOR UI
// ===================================

// Show toast notification
function showToast(message, duration = 2500) {
  const toast = document.createElement('div');
  toast.className = 'copy-toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, duration);
}

window.copyRoomCode = function(code) {
  // Get the copy button element
  const button = document.querySelector('.copy-code-btn');
  
  // Create and animate bubbles
  if (button) {
    // Remove any existing bubbles
    const existingBubbles = button.querySelectorAll('.bubble-wrapper');
    existingBubbles.forEach(b => b.remove());
    
    // Create top bubbles
    const topBubbles = document.createElement('div');
    topBubbles.className = 'bubble-wrapper top';
    button.appendChild(topBubbles);
    
    // Create bottom bubbles
    const bottomBubbles = document.createElement('div');
    bottomBubbles.className = 'bubble-wrapper bottom';
    button.appendChild(bottomBubbles);
    
    // Remove bubbles after animation completes
    setTimeout(() => {
      topBubbles.remove();
      bottomBubbles.remove();
    }, 750);
    
    // Button press effect
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = '';
    }, 100);
  }
  
  // Copy to clipboard
  navigator.clipboard.writeText(code).then(() => {
    showToast(`✓ Room code ${code} copied!`);
  }).catch(err => {
    console.error('Failed to copy:', err);
    showToast('❌ Failed to copy code. Please try again.');
  });
};

window.leaveRoom = leaveRoom;

// Make Firebase functions available globally for game.js
// updateFirebaseDoc: Use safeUpdateDoc for error handling, raw updateDoc for backward compatibility
window.updateFirebaseDoc = updateDoc;  // Keep for backward compatibility
window.safeUpdateFirebaseDoc = safeUpdateDoc;  // New: with error handling
window.onSnapshot = onSnapshot;

// ===================================
// GAME STATE INITIALIZATION
// ===================================

async function initializeGameState(roomRef) {
  try {
    await updateDoc(roomRef, {
      'gameState': {
        currentQuestionIndex: 0,
        currentQuestionData: null,
        phase: 'loading',
        teamBuzzedIn: null,
        buzzAttempts: {},
        eliminatedTeams: [false, false, false],
        bonusState: null,
        bonusWinningTeam: null,
        currentBonusIndex: 0,
        timer: { remaining: 0, type: 'none' },
        wordIndex: 0,
        readingActive: false,
        submittedAnswer: null
      }
    });
    console.log('✅ Game state initialized in Firebase');
  } catch (error) {
    console.error('Error initializing game state:', error);
  }
}

// ===================================
// SERVERS RESTING SCREEN (Quota Exhausted)
// ===================================

// Show the servers resting screen
function showServersRestingScreen() {
  const overlay = document.getElementById('servers-resting-overlay');
  if (!overlay) {
    console.error('Servers resting overlay not found');
    return;
  }
  
  // Add visible class
  overlay.classList.add('visible');
  
  // Generate stars if not already done
  const starsContainer = document.getElementById('rest-stars');
  if (starsContainer && starsContainer.children.length === 0) {
    const starCount = 80;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'rest-star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      const size = Math.random() * 2 + 1;
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.setProperty('--duration', (Math.random() * 3 + 2) + 's');
      star.style.animationDelay = Math.random() * 5 + 's';
      starsContainer.appendChild(star);
    }
  }
  
  console.log('🌙 Showing servers resting screen');
}

// Check if error is a quota exhausted error
function isQuotaExhaustedError(error) {
  if (!error) return false;
  const errorCode = error.code || '';
  const errorMessage = error.message || '';
  return errorCode.includes('resource-exhausted') || 
         errorCode.includes('RESOURCE_EXHAUSTED') ||
         errorMessage.includes('resource-exhausted') ||
         errorMessage.includes('quota');
}

// Make available globally
window.showServersRestingScreen = showServersRestingScreen;
window.isQuotaExhaustedError = isQuotaExhaustedError;

// Check for test mode on page load
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('testQuotaError') === 'true') {
    console.log('🧪 Test mode: Showing servers resting screen');
    setTimeout(() => showServersRestingScreen(), 500);
  }
});

// ===================================
// PAGE UNLOAD CLEANUP
// ===================================

// Clean up Firebase listeners when page is refreshed or closed
window.addEventListener('beforeunload', () => {
  console.log('🧹 Page unloading - cleaning up Firebase listeners');
  listenerRegistry.cleanupAll();
});

// Also clean up on visibility change (tab hidden for long period)
let hiddenTime = null;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    hiddenTime = Date.now();
  } else if (hiddenTime) {
    const hiddenDuration = Date.now() - hiddenTime;
    // If tab was hidden for more than 5 minutes, listeners may be stale
    if (hiddenDuration > 5 * 60 * 1000) {
      console.log(`⚠️ Tab was hidden for ${Math.round(hiddenDuration / 1000)}s - listeners may be stale`);
    }
    hiddenTime = null;
  }
});

// ===================================
// EXPORT FUNCTIONS
// ===================================

export { hostGame, joinGame, leaveRoom, multiplayerState, initializeGameState };

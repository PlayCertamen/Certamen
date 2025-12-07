// ===================================
// MULTIPLAYER UI HANDLERS
// ===================================

import { hostGame, joinGame } from './firebase.js';

// Function to show custom room code input modal with name
function showRoomCodeModal() {
  return new Promise((resolve) => {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'room-code-modal-overlay';
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'room-code-modal';
    modal.innerHTML = `
      <h2 class="room-code-modal-title">Join Game</h2>
      <p class="room-code-modal-subtitle">Enter the 6-digit room code:</p>
      <input 
        type="text" 
        class="room-code-input" 
        id="join-room-code"
        placeholder="000000"
        maxlength="6"
        inputmode="numeric"
        pattern="[0-9]*"
        autocomplete="off"
      />
      <p class="input-error-text" id="code-error" style="display: none;">Room code required</p>
      <p class="room-code-modal-subtitle" style="margin-top: 1rem;">Team Captain:</p>
      <input 
        type="text" 
        class="room-code-input" 
        id="join-player-name"
        placeholder="Enter captain name"
        maxlength="20"
        autocomplete="off"
        style="letter-spacing: 0.05em; font-size: 1.1rem; font-family: 'Inter', sans-serif; font-weight: 500;"
      />
      <p class="input-error-text" id="name-error" style="display: none;">Captain name required</p>
      <div class="modal-buttons">
        <button class="modal-btn modal-btn-cancel">Cancel</button>
        <button class="modal-btn modal-btn-confirm">Join Game</button>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Get elements
    const codeInput = modal.querySelector('#join-room-code');
    const nameInput = modal.querySelector('#join-player-name');
    const codeError = modal.querySelector('#code-error');
    const nameError = modal.querySelector('#name-error');
    const cancelBtn = modal.querySelector('.modal-btn-cancel');
    const confirmBtn = modal.querySelector('.modal-btn-confirm');
    
    // Focus code input first
    setTimeout(() => codeInput.focus(), 100);
    
    // Helper to show/hide error state
    const showError = (input, errorEl) => {
      input.classList.add('input-error');
      errorEl.style.display = 'block';
    };
    
    const clearError = (input, errorEl) => {
      input.classList.remove('input-error');
      errorEl.style.display = 'none';
    };
    
    // Clear errors as user types
    codeInput.addEventListener('input', () => {
      if (codeInput.value.trim()) {
        clearError(codeInput, codeError);
      }
    });
    
    nameInput.addEventListener('input', () => {
      if (nameInput.value.trim()) {
        clearError(nameInput, nameError);
      }
    });
    
    // Validation function
    const validateAndSubmit = () => {
      const code = codeInput.value.trim();
      const name = nameInput.value.trim();
      let isValid = true;
      
      // Validate room code
      if (!code) {
        showError(codeInput, codeError);
        isValid = false;
      }
      
      // Validate captain name
      if (!name) {
        showError(nameInput, nameError);
        isValid = false;
      }
      
      if (isValid) {
        closeModal({ code, name });
      }
    };
    
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
    confirmBtn.addEventListener('click', validateAndSubmit);
    
    // Enter key to confirm
    const handleEnter = (e) => {
      if (e.key === 'Enter') {
        validateAndSubmit();
      }
    };
    
    codeInput.addEventListener('keypress', handleEnter);
    nameInput.addEventListener('keypress', handleEnter);
    
    // Click outside to cancel
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(null);
      }
    });
  });
}

// Wire up HOST GAME button
document.getElementById('host-game-btn').addEventListener('click', async function() {
  console.log('🏛️ HOST GAME clicked');
  
  // 🛡️ DEBOUNCE: Prevent rapid double-clicks creating multiple rooms
  if (window.buttonClickTracker && !window.buttonClickTracker.canClick('host-game', 2000)) {
    return; // Ignore rapid repeated clicks
  }
  
  // Disable button while processing
  this.disabled = true;
  
  // Get game settings from window (set in game.js)
  console.log('🔍 DEBUG: window.selectedLevel =', window.selectedLevel);
  console.log('🔍 DEBUG: window.selectedCategories =', window.selectedCategories);
  
  const gameSettings = {
    level: window.selectedLevel,
    categories: window.selectedCategories
  };
  
  console.log('🔍 DEBUG: gameSettings =', gameSettings);
  
  try {
    const roomCode = await hostGame(gameSettings);
    if (roomCode) {
      console.log(`Room created: ${roomCode}`);
    }
  } catch (error) {
    console.error('❌ Error hosting game:', error);
  } finally {
    // Re-enable button after a delay
    setTimeout(() => { this.disabled = false; }, 1000);
  }
});

// Wire up JOIN GAME button  
document.getElementById('join-game-btn').addEventListener('click', async function() {
  console.log('🚪 JOIN GAME clicked');
  
  // 🛡️ DEBOUNCE: Prevent rapid double-clicks
  if (window.buttonClickTracker && !window.buttonClickTracker.canClick('join-game', 2000)) {
    return; // Ignore rapid repeated clicks
  }
  
  // Show custom modal that gets both code and name
  const result = await showRoomCodeModal();
  
  if (result) {
    const { code, name } = result;
    
    // Disable button while joining
    this.disabled = true;
    
    try {
      const success = await joinGame(code, name);
      if (success) {
        console.log(`Joined room: ${code}`);
      }
    } catch (error) {
      console.error('❌ Error joining game:', error);
    } finally {
      // Re-enable button after a delay
      setTimeout(() => { this.disabled = false; }, 1000);
    }
  }
});

console.log('✅ Multiplayer handlers loaded');

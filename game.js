console.log("JavaScript is working!");

// ===== DEBUG MODE TOGGLE =====
const DEBUG_MODE = true; // Set to true to enable debug logging, false to hide it

// ===== DEBUG TOOL - ADD THIS TO TOP OF GAME.JS =====

// Create debug panel
function createDebugPanel() {
    if (!DEBUG_MODE) return; // Don't create panel if debug mode is off
    
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.cssText = `
        position: fixed; top: 10px; right: 10px; width: 400px; max-height: 80vh;
        background: rgba(0,0,0,0.9); border: 2px solid #333; border-radius: 8px;
        padding: 15px; overflow-y: auto; z-index: 10000; font-family: monospace;
        font-size: 12px; color: white;
    `;
    panel.innerHTML = `
        <div style="color: #4CAF50; font-weight: bold; margin-bottom: 10px;">🔧 Debug Console</div>
        <button onclick="document.getElementById('debug-output').innerHTML=''" 
                style="background: #f44336; color: white; border: none; padding: 5px 10px; margin-bottom: 10px;">Clear</button>
        <div id="debug-output"></div>
    `;
    document.body.appendChild(panel);
}

// Add debug message
function addDebugEntry(message, type = 'log') {
    if (!DEBUG_MODE) return; // Don't log if debug mode is off
    
    let output = document.getElementById('debug-output');
    if (!output) {
        createDebugPanel();
        output = document.getElementById('debug-output');
    }
    
    const timestamp = new Date().toLocaleTimeString();
    const colors = { log: '#4CAF50', error: '#f44336', warn: '#ff9800' };
    const entry = document.createElement('div');
    entry.style.cssText = `
        margin: 5px 0; padding: 5px; border-left: 3px solid ${colors[type]};
        background: rgba(${type === 'error' ? '244,67,54' : type === 'warn' ? '255,152,0' : '76,175,80'}, 0.1);
    `;
    entry.innerHTML = `<div style="color: #888; font-size: 10px;">${timestamp}</div><div>${message}</div>`;
    output.appendChild(entry);
    output.scrollTop = output.scrollHeight;
}

// Override console functions (only if debug mode is on)
const originalLog = console.log;
console.log = function(...args) {
    if (DEBUG_MODE) addDebugEntry(args.join(' '), 'log');
    originalLog.apply(console, args);
};

const originalError = console.error;
console.error = function(...args) {
    if (DEBUG_MODE) addDebugEntry(args.join(' '), 'error');
    originalError.apply(console, args);
};

// Catch JavaScript errors
window.onerror = function(message, source, lineno, colno, error) {
    if (DEBUG_MODE) addDebugEntry(`ERROR: ${message} at line ${lineno}`, 'error');
    return false;
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    if (DEBUG_MODE) addDebugEntry('Debug console initialized', 'log');
});

// ===== END DEBUG TOOL =====


// ===================================
// DEBOUNCE UTILITIES
// ===================================
// Prevents rapid double-clicks from causing duplicate actions

/**
 * Creates a debounced version of a function that won't fire again
 * until `delay` milliseconds have passed since the last call.
 */
function debounce(func, delay = 300) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Creates a throttled version of a function that can only fire once
 * every `limit` milliseconds. First call fires immediately.
 */
function throttle(func, limit = 300) {
  let lastCall = 0;
  let lastResult;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      lastResult = func.apply(this, args);
    }
    return lastResult;
  };
}

/**
 * Track button states to prevent double-clicks.
 * Maps button identifiers to their last click timestamp.
 */
const buttonClickTracker = {
  lastClicks: {},
  
  // Check if enough time has passed since last click (default 500ms)
  canClick(buttonId, cooldownMs = 500) {
    const now = Date.now();
    const lastClick = this.lastClicks[buttonId] || 0;
    if (now - lastClick < cooldownMs) {
      console.log(`⏳ Button "${buttonId}" click blocked - cooldown active (${cooldownMs - (now - lastClick)}ms remaining)`);
      return false;
    }
    this.lastClicks[buttonId] = now;
    return true;
  },
  
  // Reset a specific button's cooldown
  reset(buttonId) {
    delete this.lastClicks[buttonId];
  },
  
  // Reset all cooldowns (e.g., when moving to next question)
  resetAll() {
    this.lastClicks = {};
  }
};

// Make available globally for multiplayer.js
window.buttonClickTracker = buttonClickTracker;

// ===== END DEBOUNCE UTILITIES =====


// ===================================
// TEAM NAME SETS FOR CERTAMEN
// ===================================
const TEAM_NAME_SETS = [
  ['Furies', 'Harpies', 'Keres'],
  ['Invictus', 'Audax', 'Ferox'],
  ['Olympians', 'Titans', 'Muses'],
  ['Cohors', 'Manipulus', 'Centuria'],
  ['Saturnalia', 'Lupercalia', 'Floralia'],
  ['Aquilo', 'Auster', 'Favonius'],
  ['Tarquinii', 'Julii', 'Flavii'],
  ['Stoici', 'Epicurei', 'Peripatetici']
];

function getRandomTeamNames() {
  const randomIndex = Math.floor(Math.random() * TEAM_NAME_SETS.length);
  const selectedSet = TEAM_NAME_SETS[randomIndex];
  console.log(`Selected team name set ${randomIndex + 1}:`, selectedSet);
  return selectedSet;
}

// ===================================
// CERTAMEN REPEAT-PREVENTION CONFIG
// ===================================
const CERTAMEN_TRACKING = {
  GAMES_TO_TRACK: 5,           // Track last 5 games (reduced from 15)
  TRIADS_PER_GAME: 20,         // Number of triads per game (20 triads = 60 questions)
  MIN_FRESH_TRIADS: 30,        // Minimum fresh triads needed (reduced from 50)
  STORAGE_KEY: 'recentCertamenPassages'
};

// Calculate total passages to block (now 5 * 20 = 100 instead of 300)
CERTAMEN_TRACKING.MAX_BLOCKED = CERTAMEN_TRACKING.GAMES_TO_TRACK * CERTAMEN_TRACKING.TRIADS_PER_GAME;

// ===================================
// PRACTICE MODE REPEAT-PREVENTION CONFIG
// ===================================
const PRACTICE_TRACKING = {
  QUESTIONS_PER_CATEGORY: 50,      // Track last 50 questions per category
  MIN_FRESH_QUESTIONS: 10,         // Minimum fresh questions needed per category
  STORAGE_KEY: 'certamen-recent-questions'
};

// ===================================
// INTRO PAGE FUNCTIONALITY
// ===================================

// Create animated background particles
function createParticles() {
  const particleContainer = document.querySelector('.bg-particles');
  const titleParticleContainer = document.querySelector('.title-particles');
  const particleCount = 30;
  const titleParticleCount = 20;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 8 + 's';
    particleContainer.appendChild(particle);
  }
  
  for (let i = 0; i < titleParticleCount; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = (20 + Math.random() * 60) + '%';
    sparkle.style.top = (20 + Math.random() * 60) + '%';
    sparkle.style.animationDelay = Math.random() * 4 + 's';
    titleParticleContainer.appendChild(sparkle);
  }
}

// ✨ ENHANCED MULTI-SELECTION STATE
let selectedCategories = []; // Changed from single selectedCategory to array
let selectedLevel = null;
let selectedMode = null;

// Reset function - force DOM reset to override browser caching
function resetGameState() {
  window.selectedCategories = [];
  window.selectedLevel = null;
  window.selectedMode = null;
  selectedCategories = [];
  selectedLevel = null;
  selectedMode = null;
  
  // Force remove all selected classes
  document.querySelectorAll('.option-card').forEach(card => {
    card.className = card.className.replace('selected', '').trim();
    card.removeAttribute('data-selected');
  });
  
  // Force reset text content
  const categoryEl = document.getElementById('selected-category');
  const levelEl = document.getElementById('selected-level');
  const modeEl = document.getElementById('selected-mode');
  
  if (categoryEl) categoryEl.innerHTML = 'None';
  if (levelEl) levelEl.innerHTML = 'None';
  if (modeEl) modeEl.innerHTML = 'None';
  
  // Force hide literature message
  const literatureMsg = document.getElementById('literature-message');
  if (literatureMsg) {
    literatureMsg.style.display = 'none';
    literatureMsg.style.visibility = 'hidden';
  }
  
  // Force disable start button
  const startBtn = document.getElementById('start-game');
  if (startBtn) {
    startBtn.disabled = true;
    startBtn.setAttribute('disabled', 'true');
  }
  
  // Force reset progress dots
  document.querySelectorAll('.progress-step').forEach(step => {
    step.className = 'progress-step';
    step.removeAttribute('data-completed');
    step.removeAttribute('data-active');
  });
  
  window.scrollTo(0, 0);
  updateScrollIndicator();
}

// Progress tracking
function updateProgress() {
  const steps = document.querySelectorAll('.progress-step');
  
  steps.forEach(step => {
    step.classList.remove('completed', 'active');
  });
  
  let currentStep = 0;
  
  if (selectedCategories.length > 0) {
    steps[0].classList.add('completed');
    currentStep = 1;
  }
  
  if (selectedLevel) {
    steps[1].classList.add('completed');
    currentStep = 2;
  }
  
  if (selectedMode) {
    steps[2].classList.add('completed');
    currentStep = 3;
  }
  
  if (selectedCategories.length > 0 && selectedLevel && selectedMode && isSelectionValid()) {
    steps[3].classList.add('completed');
  } else if (currentStep < steps.length) {
    steps[currentStep].classList.add('active');
  }
}

// Scroll indicator management
function updateScrollIndicator() {
  const scrollIndicator = document.getElementById('scroll-indicator');
  if (!scrollIndicator) return;
  
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  const nearBottom = scrollTop + windowHeight >= documentHeight - 100;
  const allSelected = selectedCategories.length > 0 && selectedLevel && selectedMode;
  
  if (nearBottom || allSelected) {
    scrollIndicator.classList.add('hidden');
  } else {
    scrollIndicator.classList.remove('hidden');
  }
}

// Show/hide literature message
function toggleLiteratureMessage(show) {
  const messageElement = document.getElementById('literature-message');
  if (!messageElement) return; // Exit if element doesn't exist
  
  if (show) {
    messageElement.style.display = 'block';
  } else {
    messageElement.style.display = 'none';
  }
}

// ✨ ENHANCED VALIDATION FOR MULTI-SELECTION
function isSelectionValid() {
  // Must have at least 1 category selected
  if (selectedCategories.length === 0) {
    return false;
  }
  
  // Different validation rules for different modes
  if (selectedMode === 'certamen' || selectedMode === 'certamen-solo' || selectedMode === 'certamen-multiplayer') {
    // Certamen modes: Allow 6 categories (novice/intermediate) or 7 categories (advanced with literature)
    if (selectedLevel === 'novice' && selectedCategories.length === 6) {
      // Should be 6 categories without literature
      return !selectedCategories.includes('literature');
    } else if (selectedLevel === 'advanced' && selectedCategories.length === 7) {
      // Should be 7 categories including literature
      return selectedCategories.includes('literature');
    } else if (selectedLevel === 'intermediate' && selectedCategories.length === 6) {
      // Intermediate also uses 6 categories without literature
      return !selectedCategories.includes('literature');
    }
    return false; // Invalid category count for Certamen modes
  } else {
    // Practice/Timed modes: limit to 3 categories max
    if (selectedCategories.length > 3) {
      return false;
    }
    
    // Literature validation: if literature is selected, level must be advanced
    if (selectedCategories.includes('literature') && selectedLevel && selectedLevel !== 'advanced') {
      return false;
    }
  }
  
  return true;
}

// Enhanced smooth scrolling to next section
function scrollToNextSection(currentSection) {
  const sections = document.querySelectorAll('.section');
  const currentIndex = Array.from(sections).indexOf(currentSection);
  
  if (currentIndex < sections.length - 1) {
    const nextSection = sections[currentIndex + 1];
    
    requestAnimationFrame(() => {
      const offsetTop = nextSection.offsetTop - 20;
      
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    });
  }
}

// ✨ ENHANCED SELECTION HANDLERS WITH MULTI-CATEGORY SUPPORT
function updateSelection(type, value, element) {
  const selectionValue = document.getElementById(`selected-${type}`);
  const currentText = selectionValue.textContent;
  
  if (type === 'category') {
    // ✨ MULTI-CATEGORY TOGGLE LOGIC
    const categoryIndex = selectedCategories.indexOf(value);
    
    if (categoryIndex > -1) {
      // Category is already selected - remove it (unless in any Certamen mode)
      if (selectedMode === 'certamen' || selectedMode === 'certamen-solo' || selectedMode === 'certamen-multiplayer') {
        // In Certamen modes, don't allow deselection - always all categories
        return;
      }
      
      selectedCategories.splice(categoryIndex, 1);
      element.classList.remove('selected');
      console.log(`➖ Removed ${value}. Selected: [${selectedCategories.join(', ')}]`);
    } else {
      // ✨ SPECIAL LOGIC: Auto-select Advanced when Literature is CLICKED (not hovered)
      if (value === 'literature' && selectedLevel !== 'advanced') {
        console.log('🎯 Literature CLICKED - auto-selecting Advanced difficulty');
        selectedLevel = 'advanced';
        document.querySelectorAll('.level-option').forEach(btn => btn.classList.remove('selected'));
        const advancedButton = document.querySelector('[data-level="advanced"]');
        if (advancedButton) {
          advancedButton.classList.add('selected');
        }
        document.getElementById('selected-level').textContent = 'Advanced';
        
        // Add visual feedback for the auto-selection
        const levelSection = document.querySelector('.levels').closest('.section');
        if (levelSection) {
          levelSection.style.background = 'rgba(255, 215, 0, 0.05)';
          setTimeout(() => {
            levelSection.style.background = '';
          }, 1000);
        }
      }
      
      // Category is not selected - add it (max 3 categories)
      if (selectedCategories.length >= 3) {
        console.log(`⚠️ Maximum 3 categories allowed. Current: [${selectedCategories.join(', ')}]`);
        // Show helpful message about category limit ONLY on 4th attempt
        showCategoryLimitMessage();
        return;
      }
      
      selectedCategories.push(value);
      element.classList.add('selected');
      console.log(`➕ Added ${value}. Selected: [${selectedCategories.join(', ')}]`);
    }
    
    // Update display with multiple categories
    updateCategoryDisplay();
    
    // Auto-scroll to next section if this is the first category selected
    if (selectedCategories.length === 1) {
      setTimeout(() => {
        scrollToNextSection(element.closest('.section'));
      }, 800);
    }
    
  } else if (type === 'level') {
    selectedLevel = value;
    document.querySelectorAll('.level-option').forEach(btn => btn.classList.remove('selected'));
    
    // Clear literature message when advanced is selected
    if (selectedCategories.includes('literature') && value === 'advanced') {
      toggleLiteratureMessage(false);
      updateStartButton();
    }
// Literature auto-deselection when leaving Advanced (but not in Certamen)
if (selectedCategories.includes('literature') && value !== 'advanced' && selectedMode !== 'certamen') {
  console.log('📚 Auto-deselecting Literature when leaving Advanced level');
  const literatureIndex = selectedCategories.indexOf('literature');
  selectedCategories.splice(literatureIndex, 1);
  const literatureCard = document.querySelector('[data-category="literature"]');
  if (literatureCard) {
    literatureCard.classList.remove('selected');
  }
  updateCategoryDisplay();
}
    
    element.classList.add('selected');
    
    // Update categories for all certamen modes using the same function
    if (selectedMode === 'certamen' || selectedMode === 'certamen-solo' || selectedMode === 'certamen-multiplayer') {
      updateCertamenCategories(value);
    }
    
    setTimeout(() => {
      scrollToNextSection(element.closest('.section'));
    }, 800);
    
  } else if (type === 'mode') {
    // ✨ TRANSITION LOGIC: Handle switching from Certamen modes to Practice/Timed
    const wasInCertamen = (selectedMode === 'certamen' || selectedMode === 'certamen-solo');
    const wasInMultiplayerCertamen = (selectedMode === 'certamen-multiplayer');
    const goingToPracticeTimed = (value === 'practice' || value === 'timed');
    
    selectedMode = value;
    document.querySelectorAll('.mode-option').forEach(btn => btn.classList.remove('selected'));
    
    element.classList.add('selected');
    
    // Clear categories when switching FROM any Certamen mode TO Practice/Timed
    if ((wasInCertamen || wasInMultiplayerCertamen) && goingToPracticeTimed) {
      console.log('🔄 Switching from Certamen to Practice/Timed - clearing category selections');
      selectedCategories = [];
      document.querySelectorAll('.category-option').forEach(btn => btn.classList.remove('selected'));
      updateCategoryDisplay();
      hideCategoryLimitMessage();
      toggleLiteratureMessage(false);
    }
    
    // Auto-select categories when switching TO any Certamen mode
    if (value === 'certamen' || value === 'certamen-solo' || value === 'certamen-multiplayer') {
      hideCategoryLimitMessage();
      if (selectedLevel) {
        updateCertamenCategories(selectedLevel);
      }
    }
    
    setTimeout(() => {
      scrollToNextSection(element.closest('.section'));
    }, 800);
  }
  
  // Update display with proper formatting for level and mode
  if (type === 'level' || type === 'mode') {
    let displayValue = value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ');
    if (value === 'certamen') {
      displayValue = 'Certamen';
    }
    
    selectionValue.textContent = displayValue;
    
    if (currentText !== selectionValue.textContent) {
      selectionValue.classList.add('updated');
      setTimeout(() => selectionValue.classList.remove('updated'), 500);
    }
  }
  
  updateProgress();
  updateStartButton();
  updateScrollIndicator();
}

// ✨ NEW FUNCTION: Update category display for multiple selections
function updateCategoryDisplay() {
  console.log('🚀 updateCategoryDisplay() CALLED');
  const categoryEl = document.getElementById('selected-category');
  
  if (selectedCategories.length === 0) {
    categoryEl.textContent = 'None';
    hideCategoryLimitMessage();
  } else if (selectedCategories.length === 1) {
    // Format single category name
    let displayName = formatCategoryName(selectedCategories[0]);
    categoryEl.textContent = displayName;
    hideCategoryLimitMessage();
  } else if (selectedCategories.length === 2) {
    // Format two categories
    const formattedNames = selectedCategories.map(cat => formatCategoryName(cat));
    categoryEl.textContent = `${formattedNames.join(' + ')} (${selectedCategories.length} themes)`;
    hideCategoryLimitMessage();
  } else if (selectedCategories.length === 3) {
    // Format three categories but DON'T show limit message automatically
    const formattedNames = selectedCategories.map(cat => formatCategoryName(cat));
    categoryEl.textContent = `${formattedNames.join(' + ')} (${selectedCategories.length} themes)`;
    hideCategoryLimitMessage(); // Only show when attempting 4th selection
  } else if (selectedCategories.length > 3) {
    // For Certamen modes with many categories
    if (selectedMode === 'certamen' || selectedMode === 'certamen-solo' || selectedMode === 'certamen-multiplayer') {
      if (selectedCategories.includes('literature')) {
        categoryEl.textContent = 'All 7 themes';
      } else {
        categoryEl.textContent = 'All themes except Literature';
      }
    } else {
      categoryEl.textContent = `${selectedCategories.length} themes selected`;
    }
    hideCategoryLimitMessage();
  }
  
categoryEl.classList.add('updated');
setTimeout(() => categoryEl.classList.remove('updated'), 500);
const categoriesGrid = document.querySelector('.categories');
if (selectedCategories.length >= 3) {
  categoriesGrid.classList.add('max-selected');
} else {
  categoriesGrid.classList.remove('max-selected');
}
// Update helper text
const helperText = document.getElementById('category-helper');
if (helperText && selectedMode !== 'certamen' && selectedMode !== 'certamen-solo' && selectedMode !== 'certamen-multiplayer') {
  helperText.textContent = '(3 themes maximum for Timed and Practice modes)';
  helperText.classList.remove('limit-active');
} else if (helperText && (selectedMode === 'certamen' || selectedMode === 'certamen-solo' || selectedMode === 'certamen-multiplayer')) {
  helperText.textContent = 'All themes will be included';
}
}

// ✨ IMPROVED: Gentle toast notification with smooth animations
function showCategoryLimitMessage() {
  const messageElement = document.getElementById('category-limit-message');
  if (messageElement) {
    messageElement.innerHTML = `
  3 themes maximum for Timed and Practice mode.<br>
  <small>Deselect a category to choose a different one.</small>
    `;
    
    // Show and animate in
    messageElement.style.display = 'block';
    setTimeout(() => {
      messageElement.classList.add('show');
    }, 10); // Small delay for smooth animation
    
    // Auto-hide after 3 seconds with animation
    setTimeout(() => {
      messageElement.classList.add('hiding');
      messageElement.classList.remove('show');
      
      // Completely hide after animation finishes
      setTimeout(() => {
        hideCategoryLimitMessage();
      }, 300);
    }, 3000);
  }
}
// ✨ NEW FUNCTION: Hide category limit message
function hideCategoryLimitMessage() {
  const messageElement = document.getElementById('category-limit-message');
  if (messageElement) {
    messageElement.style.display = 'none';
    messageElement.classList.remove('show', 'hiding');
  }
}

// ✨ NEW FUNCTION: Format category names for display
function formatCategoryName(category) {
  const nameMap = {
    'mythology': 'Mythology',
    'roman-history-daily-life': 'Roman History',
    'ancient-geography': 'Geography', 
    'mottos': 'Mottos',
    'latin-grammar': 'Grammar',
    'derivatives': 'Derivatives',
    'literature': 'Literature'
  };
  return nameMap[category] || category;
}

// Handle Certamen category auto-selection

function updateCertamenCategories(level) {
  console.log(`🛡️ updateCertamenCategories called with level: ${level}`);
  
  // Clear current selection
  selectedCategories = [];
  document.querySelectorAll('.category-option').forEach(btn => btn.classList.remove('selected'));
  console.log('🧹 Cleared previous selections');
  
  const allCategories = ['mythology', 'roman-history-daily-life', 'ancient-geography', 'mottos', 'latin-grammar', 'derivatives'];
  
  if (level === 'advanced') {
    allCategories.push('literature');
  }
  
  console.log(`📋 Categories to select: ${allCategories.join(', ')}`);
  
  // Select all appropriate categories
  selectedCategories = [...allCategories];
  
  allCategories.forEach(categoryValue => {
    const categoryElement = document.querySelector(`[data-category="${categoryValue}"]`);
    if (categoryElement) {
      categoryElement.classList.add('selected');
      console.log(`🎨 Added .selected class to: ${categoryValue}, has class: ${categoryElement.classList.contains('selected')}`);
    } else {
      console.log(`❌ Could not find element with data-category="${categoryValue}"`);
    }
  });
  
  console.log(`✅ Selected categories: ${selectedCategories.join(', ')}`);
  
  // Update display using the helper function
  updateCategoryDisplay();
  
  toggleLiteratureMessage(false);
  
  updateStartButton();
  
}

function updateStartButton() {
  const startButton = document.getElementById('start-game');
  if (selectedCategories.length > 0 && selectedLevel && selectedMode && isSelectionValid()) {
    startButton.disabled = false;
  } else {
    startButton.disabled = true;
  }
}

// ===================================
// QUESTION LOADER CLASS
// ===================================
class QuestionLoader {
  constructor() {
    this.cache = new Map();
  }


  shuffleQuestionOptions(question) {
    if (!question.options || question.options.length === 0) {
      return question;
    }
    
    const correctAnswerText = question.options[question.correct];
    question.options = this.shuffleArray([...question.options]);
    question.correct = question.options.indexOf(correctAnswerText);
    
    return question;
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  filterByDependency(questions, gameMode) {
    if (gameMode === 'practice') {
      return questions.filter(q => 
        q.dependency === 'standalone' || 
        q.dependency === 'tossup' || 
        q.dependency === 'bonus_independent'
      );
    } else if (gameMode === 'timed') {
      return questions.filter(q => 
        (q.dependency === 'standalone' || 
         q.dependency === 'tossup' || 
         q.dependency === 'bonus_independent') &&
        q.options && q.options.length > 0
      );
    } else if (gameMode === 'certamen') {
      // Certamen only uses triad questions (toss-up + 2 bonus)
      return questions.filter(q => 
        q.dependency === 'tossup' || 
        q.dependency === 'bonus_dependent' || 
        q.dependency === 'bonus_independent'
      );
    }
    return questions;
  }

  async loadQuestions(category, level, gameMode = 'practice') {
    const cacheKey = `${category}-${level}-${gameMode}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    try {
      // Try to load from JSON file first
      const response = await fetch(`questions/${category}/${level}/${category}-${level}-001.json?t=${Date.now()}`);
      if (response.ok) {
        const rawQuestions = await response.json();
        console.log(`🔍 DEBUG: Loaded ${rawQuestions.length} raw questions from ${category}/${level}/${category}-${level}-001.json`);

        
        // Check for potential issues
        if (rawQuestions.length < 50) {
          console.log(`⚠️ WARNING: Only ${rawQuestions.length} questions loaded from ${category}`);
        }
        
        // Convert your format to expected format - handle both MC and FIB
        const questions = rawQuestions.map((q, index) => {
          // Check if it's a multiple choice question (has actual options)
          const hasValidOptions = q.options && 
                                 q.options !== "none" && 
                                 Array.isArray(q.options) && 
                                 q.options.length > 0;

          const correctIndex = hasValidOptions ? q.options.indexOf(Array.isArray(q.answer) ? q.answer[0] : q.answer) : 0;
          
          // ✨ VALIDATION: Warn if answer doesn't match any option
          if (hasValidOptions && correctIndex === -1) {
            console.warn(`⚠️ ANSWER MISMATCH in ${category}-${level} question ${index + 1}:`);
            console.warn(`   Question: ${q.question}`);
            console.warn(`   Answer: "${q.answer}"`);
            console.warn(`   Options: [${q.options.join(', ')}]`);
            console.warn(`   This question will be skipped or may cause errors.`);
          }

          return {
            id: index + 1,
            type: hasValidOptions ? 'multiple-choice' : 'fill-in-blank',
            category: category,
            question: q.question,
            options: hasValidOptions ? q.options : [],
            correct: correctIndex,
            answer: q.answer,
            points: 10,
            explanation: q.explanation,
            dependency: q.dependency,
            group: q.group
          };
        }).filter(q => {
          // Filter out questions with invalid correct index
          if (q.type === 'multiple-choice' && q.correct === -1) {
            return false;
          }
          return true;
        }).map(q => this.shuffleQuestionOptions(q));
        
        // Apply dependency filtering
        console.log(`🔄 DEBUG: Converted ${questions.length} questions for ${category}`);
        const filteredQuestions = this.filterByDependency(questions, gameMode);
        console.log(`🎯 DEBUG: After ${gameMode} filtering: ${filteredQuestions.length} questions for ${category}`);
        
        this.cache.set(cacheKey, filteredQuestions);
        console.log(`Loaded ${filteredQuestions.length} filtered questions from ${category}-${level}-001.json (${questions.length} total)`);
        return filteredQuestions;
      } else {
        // Handle HTTP errors (404, 403, etc.)
        console.error(`🚨 HTTP Error for ${category}: ${response.status} ${response.statusText}`);
        console.error(`🚨 Attempted URL: questions/${category}-${level}-001.json`);
      }
    } catch (error) {
      console.error(`🚨 File load failed for ${category}: ${error.message}`);
      console.error(`🚨 Attempted URL: questions/${category}-${level}-001.json`);
      console.warn(`Could not load JSON file for ${category}-${level}, using sample questions:`, error);
    }
    
    // Fallback to sample questions if file loading failed
    const questions = this.generateSampleQuestions(category, level, gameMode);
    this.cache.set(cacheKey, questions);
    return questions;
  }

  generateSampleQuestions(category, level, gameMode = 'practice') {
    const sampleQuestions = [
      {
        id: "sample_001",
        question: "Who is the Roman god of war?",
        options: ['Mars', 'Jupiter', 'Apollo', 'Mercury'],
        answer: "Mars",
        explanation: "Mars is the Roman god of war, equivalent to the Greek Ares.",
        dependency: "standalone"
      },
      {
        id: "sample_002", 
        question: "Who rules the underworld?",
        options: ['Jupiter', 'Mars', 'Pluto', 'Apollo'],
        answer: "Pluto",
        explanation: "Pluto rules the underworld, equivalent to Greek Hades.",
        dependency: "standalone"
      },
      {
        id: "sample_003",
        question: "Which goddess is associated with love?",
        options: ['Diana', 'Minerva', 'Venus', 'Juno'],
        answer: "Venus", 
        explanation: "Venus is the goddess of love, equivalent to Greek Aphrodite.",
        dependency: "standalone"
      },
      {
        id: "sample_004",
        question: "Who is the messenger god?",
        options: ['Apollo', 'Mercury', 'Mars', 'Jupiter'],
        answer: "Mercury",
        explanation: "Mercury is the messenger god, equivalent to Greek Hermes.",
        dependency: "standalone"
      },
      {
        id: "sample_005",
        question: "Which goddess is associated with wisdom?",
        options: ['Venus', 'Diana', 'Minerva', 'Juno'],
        answer: "Minerva",
        explanation: "Minerva is the goddess of wisdom, equivalent to Greek Athena.",
        dependency: "standalone"
      },
      {
        id: "sample_006",
        question: "Who is the king of the gods?",
        options: ['Mars', 'Jupiter', 'Apollo', 'Mercury'],
        answer: "Jupiter",
        explanation: "Jupiter is the king of the gods, equivalent to Greek Zeus.",
        dependency: "standalone"
      }
    ];

    // Apply the same conversion and filtering as JSON loading
    const convertedQuestions = sampleQuestions.map((q, index) => ({
      id: index + 1,
      type: 'multiple-choice',
      category: category,
      question: q.question,
      options: q.options,
      correct: q.options.indexOf(q.answer),
      points: 10,
      explanation: q.explanation,
      dependency: q.dependency,
      group: q.group
    })).map(q => this.shuffleQuestionOptions(q));

    // Apply dependency filtering
    return this.filterByDependency(convertedQuestions, gameMode);
  }
}
// ===================================
// MAIN GAME ENGINE CLASS
// ===================================
class CertamenGame {
  constructor() {
    this.questions = [];
    this.currentQuestion = 0;
    this.currentPassage = 0; // ✨ Track which passage/round (1-20) we're on in Certamen
    this.teams = [];
    this.playerScore = 0;
    this.gameMode = '';
    this.teamBuzzedIn = null;
    this.answerTimer = null;
    this.answerTimeLeft = 0;
    this.timerInterval = null;
    this.timeLeft = 0;
    this.gameState = 'setup';
    this.questionLoader = new QuestionLoader();
    this.sessionSize = 25; // ✨ NEW: Session size for Practice/Timed modes
    this.usedTriads = []; // Track triads used in current Certamen session for repeat-prevention
    this.displayedQuestions = []; // Track questions actually displayed to player (for Timed/Practice)

    // Word-by-word reading state for Certamen
    this.isReading = false;
    this.readingTimeout = null;
    this.currentWordIndex = 0;
    this.questionWords = [];
    this.partialQuestion = '';
    this.readingSpeed = 400;
    this.eliminatedTeams = new Set();
    this.lastBuzzTime = 0; // ✨ For debouncing buzz button clicks
    this.buzzingAllowed = false; // ✨ NEW: Prevent race condition - only allow buzzing during active question
    console.log('🔴 DEBUG: buzzingAllowed set to FALSE (initialization)');
    this.soloCountdownInterval = null; // ✨ Solo Certamen countdown timer
    this.soloTimeLeft = 0; // ✨ Solo Certamen countdown time remaining
    this.isRestarting = false; // ✨ Prevent multiple rapid Play Again clicks

    // ADD THESE 6 LINES:
    this.bonusState = 'none';
    this.bonusWinningTeam = null;
    this.currentBonusQuestion = 0;
    this.bonusQuestions = [];
    this.bonusTimeLeft = 0;
    this.bonusTimer = null;
    this.bonusRoundEnding = false; // 🛡️ Guard flag to prevent double endBonusRound calls

    // Lightning Round state (Timed Mode)
    this.lightningStarted = undefined;
    this.timeRemaining = 0;
    this.currentStreak = 0;
    this.longestStreak = 0;
    this.questionsAnswered = 0;
    this.correctAnswersCount = 0;
    this.targetStreak = 5;
    this.lightningTimer = null;
    this.highScores = null;

    // Practice Review System
    this.reviewQuestions = new Map();
    this.retryMode = false;
    this.retryQuestionList = [];
    this.retryQuestionIndex = 0;
    this.retryThreshold = 3;
    this.retrySessionStartCount = 0;

    // Multiplayer Certamen state
    this.isMultiplayer = false;
    this.isHost = false;
    this.roomRef = null;
    this.myPlayerId = null;
    this.myTeamIndex = null;
    this.multiplayerUnsubscribe = null;
    this.lastProcessedBuzzTimestamp = null; // Track last processed buzz to prevent duplicates
    this.retrySessionMastered = 0;
    this.retrySessionType = 'all';
}

    // ===================================
// SESSION MEMORY SYSTEM - Add these methods to your CertamenGame class
// ===================================

// ADD this method to track recently used questions
saveRecentQuestions(categories) {
  console.log('🗾 DEBUG: saveRecentQuestions called with categories:', categories);
  if (this.gameMode !== 'practice' && this.gameMode !== 'timed') return;
  
  try {
    // Use different tracking limits based on game mode
    // Timed: Track only 12 recent (matches typical questions per game, allows fresh questions in back-to-back play)
    // Practice: Track 50 recent (longer sessions need more history)
    const questionsToTrack = this.gameMode === 'timed' ? 12 : 50;
    
    // Get current recent questions for each category
    const recentQuestions = this.getRecentQuestions();
    
    // Use displayedQuestions instead of all loaded questions
    // This only saves questions the player actually saw
    const questionsToSave = this.displayedQuestions.map(id => 
      this.questions.find(q => q.id === id)
    ).filter(q => q); // Remove any undefined values
    
    console.log(`📊 Saving ${questionsToSave.length} displayed questions (out of ${this.questions.length} loaded) - tracking last ${questionsToTrack}`);
    
    // Add displayed questions to recent list
    questionsToSave.forEach(question => {
      const category = question.category;
      const questionId = question.id;
      
      if (!recentQuestions[category]) {
        recentQuestions[category] = [];
      }
      
      // Add to front of array (most recent first)
      recentQuestions[category].unshift(questionId);
      
      // Keep only last N questions per category (based on game mode)
      recentQuestions[category] = recentQuestions[category].slice(0, questionsToTrack);
    });
    
    // Save back to localStorage
    localStorage.setItem(PRACTICE_TRACKING.STORAGE_KEY, JSON.stringify(recentQuestions));
    console.log(`🗾 Saved recent questions for categories: ${categories.join(', ')}`);
    
  } catch (error) {
    console.warn('Failed to save recent questions:', error);
  }
}

// ADD this method to load recently used questions
getRecentQuestions() {
  try {
    const saved = localStorage.getItem(PRACTICE_TRACKING.STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.warn('Failed to load recent questions:', error);
    return {};
  }
}

// ADD this method to filter out recently used questions
filterRecentQuestions(questions, category) {
  if (this.gameMode !== 'practice' && this.gameMode !== 'timed') {
    return questions; // No filtering for Certamen mode
  }
  
  const recentQuestions = this.getRecentQuestions();
  const recentIds = recentQuestions[category] || [];
  
  if (recentIds.length === 0) {
    console.log(`🔍 No recent questions for ${category}, using all questions`);
    return questions;
  }
  
  // Filter out recently used questions
  const filteredQuestions = questions.filter(question => {
    return !recentIds.includes(question.id);
  });
  
  // Safety valve: If we filtered out too many questions, use some recent ones
  if (filteredQuestions.length < PRACTICE_TRACKING.MIN_FRESH_QUESTIONS) {
    console.log(`⚠️ Only ${filteredQuestions.length} non-recent questions for ${category}, adding some recent ones back`);
    
    // Take the oldest recent questions (from end of array)
    const oldestRecent = recentIds.slice(-15); // Last 15 recent questions
    const recentQuestionsToAdd = questions.filter(question => 
      oldestRecent.includes(question.id)
    );
    
    return [...filteredQuestions, ...recentQuestionsToAdd];
  }
  
  console.log(`🔄 Filtered ${category}: ${questions.length} → ${filteredQuestions.length} questions (avoiding ${recentIds.length} recent)`);
  return filteredQuestions;
}



  // ===================================
  // PRACTICE REVIEW SYSTEM METHODS
  // ===================================
  loadReviewQuestions() {
    try {
      const saved = localStorage.getItem('certamen-review-questions');
      if (saved) {
        const data = JSON.parse(saved);
        this.reviewQuestions = new Map(data);
        console.log(`Loaded ${this.reviewQuestions.size} review questions from localStorage`);
      }
    } catch (error) {
      console.warn('Failed to load review questions:', error);
      this.reviewQuestions = new Map();
    }
  }

  saveReviewQuestions() {
    try {
      const data = Array.from(this.reviewQuestions.entries());
      localStorage.setItem('certamen-review-questions', JSON.stringify(data));
      console.log(`Saved ${this.reviewQuestions.size} review questions to localStorage`);
    } catch (error) {
      console.warn('Failed to save review questions:', error);
    }
  }

  addToReview(question, reason = 'missed') {
    const key = `${question.category}-${question.id}`;
    
    if (this.reviewQuestions.has(key)) {
      const existing = this.reviewQuestions.get(key);
      if (reason === 'starred') {
        existing.starred = true;
      }
      if (reason === 'missed') {
        existing.missed = true;
        existing.correctInRetry = 0;
      }
      existing.lastSeen = Date.now();
    } else {
      this.reviewQuestions.set(key, {
        question: question,
        starred: reason === 'starred',
        missed: reason === 'missed',
        correctInRetry: 0,
        dateAdded: Date.now(),
        lastSeen: Date.now()
      });
    }
    
    this.saveReviewQuestions();
    this.updateReviewCounter();
    console.log(`Added question to review: ${question.question.substring(0, 50)}... (${reason})`);
  }

  removeFromReview(question) {
    const key = `${question.category}-${question.id}`;
    if (this.reviewQuestions.has(key)) {
      this.reviewQuestions.delete(key);
      this.saveReviewQuestions();
      this.updateReviewCounter();
      console.log(`Removed mastered question from review: ${question.question.substring(0, 50)}...`);
      return true;
    }
    return false;
  }


toggleStar(question) {
  const key = `${question.category}-${question.id}`;
  if (DEBUG_MODE) {
    console.log(`📌 Toggle bookmark called for question: ${key}`);
  }
  
  if (this.reviewQuestions.has(key)) {
    const existing = this.reviewQuestions.get(key);
    if (DEBUG_MODE) {
      console.log(`📌 Question exists in review: starred=${existing.starred}, missed=${existing.missed}`);
    }
    
    if (existing.starred && !existing.missed) {
      // If only bookmarked (not missed), remove from review entirely
      this.reviewQuestions.delete(key);
      if (DEBUG_MODE) {
        console.log('📌 Removed bookmark-only question from review');
      }
    } else {
      // Toggle the starred status
      existing.starred = !existing.starred;
      if (DEBUG_MODE) {
        console.log(`📌 ${existing.starred ? 'Bookmarked' : 'Unbookmarked'} question (still in review: missed=${existing.missed})`);
      }
    }
  } else {
    if (DEBUG_MODE) {
      console.log('📌 Adding new bookmarked question to review');
    }
    this.addToReview(question, 'starred');
  }
  
  this.saveReviewQuestions();
  this.updateReviewCounter();
  this.updateStarDisplay(question);
  
  if (DEBUG_MODE) {
    console.log('📌 Bookmark toggle complete. Review queue size:', this.reviewQuestions.size);
  }
}

updateStarDisplay(question) {
  const starButton = document.querySelector('.star-button');
  if (!starButton) {
    if (DEBUG_MODE) {
      console.log('📌 No bookmark button found');
    }
    return;
  }
  
  const key = `${question.category}-${question.id}`;
  const inReview = this.reviewQuestions.has(key);
  const isStarred = inReview && this.reviewQuestions.get(key).starred;
  
  if (DEBUG_MODE) {
    console.log(`📌 Updating bookmark for question ${key}: starred=${isStarred}, inReview=${inReview}`);
  }
  
  starButton.className = `star-button ${isStarred ? 'starred' : 'unstarred'}`;
  starButton.innerHTML = isStarred ? '📌 Bookmarked' : '📌 Bookmark';
  starButton.title = isStarred ? 
    'Remove from review list - click to unbookmark this question' : 
    'Add to review list - bookmark tricky questions to practice later';
}

updateReviewCounter() {
  const counter = document.querySelector('.review-counter');
  
  if (!counter || this.gameMode !== 'practice') return;
  
  const reviewCount = this.reviewQuestions.size;
  const missedCount = Array.from(this.reviewQuestions.values()).filter(item => item.missed).length;
  const starredCount = Array.from(this.reviewQuestions.values()).filter(item => item.starred).length;
  
  if (reviewCount === 0) {
    counter.innerHTML = `
      <div class="review-title">📋 Review List</div>
      <div class="review-stats">No questions saved yet.<br>
      📌 Bookmark tricky questions • ❌ Incorrect answers auto-saved</div>
    `;
    counter.className = 'review-counter';
  } else {
    counter.innerHTML = `
      <div class="review-title">📋 Review List</div>
      <div class="review-categories">
        <div class="review-category">
          <div class="review-info">• ${missedCount} missed question${missedCount === 1 ? '' : 's'}</div>
          <div class="review-actions">
            <button class="category-practice-btn" onclick="game.startCategoryReview('missed')" 
                    ${missedCount === 0 ? 'disabled' : ''}>
              Practice Missed Questions
            </button>
            <button class="clear-review-btn" onclick="game.clearReviewCategory('missed')" 
                    ${missedCount === 0 ? 'disabled' : ''} title="Clear all missed questions">
              Clear
            </button>
          </div>
        </div>
        
        <div class="review-category">
          <div class="review-info">• ${starredCount} bookmarked question${starredCount === 1 ? '' : 's'}</div>
          <div class="review-actions">
            <button class="category-practice-btn" onclick="game.startCategoryReview('bookmarked')" 
                    ${starredCount === 0 ? 'disabled' : ''}>
              Practice Bookmarked Questions
            </button>
            <button class="clear-review-btn" onclick="game.clearReviewCategory('bookmarked')" 
                    ${starredCount === 0 ? 'disabled' : ''} title="Clear all bookmarked questions">
              Clear
            </button>
          </div>
        </div>
        
        <div class="review-category all-category">
          <button class="category-practice-btn all-btn" onclick="game.startCategoryReview('all')">
            Practice All Review Questions (${reviewCount})
          </button>
          <button class="clear-review-btn danger" onclick="game.clearReviewCategory('all')" 
                  title="Clear entire review history">

            Clear All
          </button>
        </div>
      </div>
    `;
    counter.className = 'review-counter has-reviews';
  }
}

  clearReviewCategory(category) {
    let count = 0;
    let message = '';
    
    if (category === 'missed') {
      count = Array.from(this.reviewQuestions.values()).filter(item => item.missed).length;
      message = `Delete ${count} missed question${count === 1 ? '' : 's'}? This cannot be undone.`;
    } else if (category === 'bookmarked') {
      count = Array.from(this.reviewQuestions.values()).filter(item => item.starred).length;
      message = `Delete ${count} bookmarked question${count === 1 ? '' : 's'}? This cannot be undone.`;
    } else if (category === 'all') {
      count = this.reviewQuestions.size;
      message = `Delete all ${count} review questions? This cannot be undone.`;
    }
    
    if (count === 0) return;
    
    this.showModal(message).then((confirmed) => {
      if (confirmed) {
        if (category === 'missed') {
          const keysToRemove = [];
          this.reviewQuestions.forEach((value, key) => {
            if (value.missed && !value.starred) {
              keysToRemove.push(key);
            } else if (value.missed && value.starred) {
              value.missed = false;
              value.correctInRetry = 0;
            }
          });
          keysToRemove.forEach(key => this.reviewQuestions.delete(key));
          console.log(`✅ Cleared ${keysToRemove.length} missed questions`);
        } else if (category === 'bookmarked') {
          const keysToRemove = [];
          this.reviewQuestions.forEach((value, key) => {
            if (value.starred && !value.missed) {
              keysToRemove.push(key);
            } else if (value.starred && value.missed) {
              value.starred = false;
            }
          });
          keysToRemove.forEach(key => this.reviewQuestions.delete(key));
          console.log(`✅ Cleared ${keysToRemove.length} bookmarked questions`);
        } else if (category === 'all') {
          this.reviewQuestions.clear();
          console.log(`✅ Cleared all review questions`);
        }
        
        this.saveReviewQuestions();
        this.updateReviewCounter();
      }
    });
  }

  showModal(message) {
    return new Promise((resolve) => {
      this.modalResolve = resolve;
      const modal = document.getElementById('confirm-modal');
      const messageEl = document.getElementById('modal-message');
      messageEl.textContent = message;
      modal.classList.add('show');
    });
  }

  closeModal(confirmed) {
    const modal = document.getElementById('confirm-modal');
    modal.classList.remove('show');
    if (this.modalResolve) {
      this.modalResolve(confirmed);
      this.modalResolve = null;
    }
  }
  
  // 💔 Show modal when host disconnects
  showHostDisconnectedModal() {
    console.log('💔 Showing host disconnected modal');
    
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'host-disconnected-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease-out;
    `;
    
    overlay.innerHTML = `
      <div style="
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        padding: 2.5rem;
        text-align: center;
        max-width: 400px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      ">
        <div style="font-size: 3rem; margin-bottom: 1rem;">💔</div>
        <h2 style="color: white; font-size: 1.5rem; margin-bottom: 0.75rem;">Host Disconnected</h2>
        <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 1.5rem; line-height: 1.5;">
          The game host has left or lost connection.<br>
          The game cannot continue without a host.
        </p>
        <button id="host-disconnect-return-btn" style="
          background: linear-gradient(135deg, #ff8c00, #ffd700);
          color: white;
          border: none;
          padding: 0.875rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
        ">Return to Menu</button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add click handler
    document.getElementById('host-disconnect-return-btn').addEventListener('click', () => {
      overlay.remove();
      this.returnToSetup();
    });
  }

  startCategoryReview(category) {
    console.log(`🔄 Starting ${category} review session`);
    
    if (this.reviewQuestions.size === 0) {
      alert('No questions in review queue yet!');
      return;
    }
    
    let filteredQuestions = [];
    let sessionTitle = '';
    
    if (category === 'missed') {
      filteredQuestions = Array.from(this.reviewQuestions.values())
        .filter(item => item.missed)
        .map(item => item.question);
      sessionTitle = 'Missed Questions Review';
    } else if (category === 'bookmarked') {
      filteredQuestions = Array.from(this.reviewQuestions.values())
        .filter(item => item.starred)
        .map(item => item.question);
      sessionTitle = 'Bookmarked Questions Review';
    } else if (category === 'all') {
      filteredQuestions = Array.from(this.reviewQuestions.values())
        .map(item => item.question);
      sessionTitle = 'All Review Questions';
    }
    
    if (filteredQuestions.length === 0) {
      alert(`No ${category} questions available!`);
      return;
    }
    
    this.retryMode = true;
    this.retryQuestionList = this.shuffleArray(filteredQuestions);
    this.retryQuestionIndex = 0;
    this.retrySessionStartCount = this.retryQuestionList.length;
    this.retrySessionMastered = 0;
    this.retrySessionType = category;
    
    // Hide question counter when entering review mode
    const questionProgress = document.getElementById('question-progress');
    if (questionProgress) questionProgress.style.display = 'none';
    
    console.log(`Starting ${sessionTitle} with ${this.retryQuestionList.length} questions`);
    
    this.updateCategoryRetryModeInterface(sessionTitle);
    this.displayRetryQuestion();
  }

  updateCategoryRetryModeInterface(sessionTitle) {
    const playerStats = document.querySelector('.player-stats');
    if (!playerStats) return;
    
    const retryIndicator = document.createElement('div');
    retryIndicator.className = 'retry-mode-indicator';
    retryIndicator.innerHTML = `
      <small>${this.retryQuestionList.length} questions left • 0 mastered • Get 2 correct to remove from queue</small>
    `;
    
    playerStats.parentNode.insertBefore(retryIndicator, playerStats);
    
    const reviewCounter = document.querySelector('.review-counter');
    if (reviewCounter) reviewCounter.style.display = 'none';
  }

  displayRetryQuestion() {
    // Check if we've reached the end of the list
    if (this.retryQuestionIndex >= this.retryQuestionList.length) {
      // If there are still questions to master, loop back to the beginning
      if (this.retryQuestionList.length > 0) {
        console.log(`🔄 Reached end of list. Looping back to continue practicing ${this.retryQuestionList.length} unmastered questions.`);
        this.retryQuestionIndex = 0;
      } else {
        // All questions mastered - show completion
        this.showRetryComplete();
        return;
      }
    }
    
    const question = this.retryQuestionList[this.retryQuestionIndex];
    this.displayQuestion(question);
  }

  handleRetryAnswer(question, selectedAnswer, element, isCorrect) {
    const key = `${question.category}-${question.id}`;
    console.log(`🎯 Review answer: ${isCorrect ? 'CORRECT' : 'WRONG'} for question ${key}`);
    
    if (isCorrect && this.reviewQuestions.has(key)) {
      const reviewItem = this.reviewQuestions.get(key);
      reviewItem.correctInRetry++;
      
      console.log(`✅ Correct in review! Count: ${reviewItem.correctInRetry}/2`);
      
      if (reviewItem.correctInRetry >= 2) {
        console.log(`🎉 Question mastered! Removing from review queue.`);
        this.removeFromReview(question);
        this.retrySessionMastered++;
        
        const questionDisplay = document.getElementById('question-display');
        const masteredDiv = document.createElement('div');
        masteredDiv.className = 'mastered-message';
        masteredDiv.innerHTML = '🎉 Mastered! This question has been removed from your review queue.';
        questionDisplay.appendChild(masteredDiv);
        
        this.retryQuestionList.splice(this.retryQuestionIndex, 1);
        console.log(`📝 Removed from retry list. ${this.retryQuestionList.length} questions remaining.`);
        
        this.updateRetryModeDisplay();
      } else {
        console.log(`📝 Correct, but need 1 more correct answer to master.`);
        this.retryQuestionIndex++;
      }
      
      this.saveReviewQuestions();
    } else if (!isCorrect && this.reviewQuestions.has(key)) {
      console.log(`❌ Wrong answer - resetting progress for this question.`);
      this.reviewQuestions.get(key).correctInRetry = 0;
      this.saveReviewQuestions();
      this.retryQuestionIndex++;
    } else {
      this.retryQuestionIndex++;
    }
  }

  updateRetryModeDisplay() {
    const retryIndicator = document.querySelector('.retry-mode-indicator');
    if (retryIndicator) {
      const remaining = this.retryQuestionList.length;
      retryIndicator.innerHTML = `
        <small>${remaining} questions left • ${this.retrySessionMastered} mastered • Get 2 correct to remove from queue</small>
      `;
    }
  }

  showRetryComplete() {
    const questionDisplay = document.getElementById('question-display');
    const stillInReview = this.reviewQuestions.size;
    const mastered = this.retrySessionMastered;
    const notMastered = this.retrySessionStartCount - mastered;
    
    // Hide question counter on completion screen
    const questionProgress = document.getElementById('question-progress');
    if (questionProgress) questionProgress.style.display = 'none';
    
    // Hide bookmark button on completion screen
    const bookmarkButton = document.querySelector('.star-button');
    if (bookmarkButton) bookmarkButton.style.display = 'none';
    
    // Choose emoji based on review type
    let emoji = '🎉';
    if (this.retrySessionType === 'missed') {
      emoji = '🎉'; // Party popper for missed questions
    } else if (this.retrySessionType === 'bookmarked') {
      emoji = '🎯'; // Bullseye for bookmarked questions
    } else {
      emoji = '🍰'; // Cake for all review questions
    }
    
    questionDisplay.innerHTML = `
      <div class="game-over">
        <h2>${emoji} Review Complete!</h2>
        <div class="final-scores">
          <div class="final-score">
            <strong>Questions Mastered:</strong> ${mastered}
          </div>
          <div class="final-score">
            <strong>Still Need Review:</strong> ${notMastered}
          </div>
          <div class="final-score">
            <strong>Total Review Queue:</strong> ${stillInReview} questions
          </div>
          ${stillInReview === 0 ? 
            `<div class="final-score">
              <strong>🏁 All Review Questions Mastered!</strong>
            </div>` : ''
          }
        </div>
        <button onclick="game.exitRetryMode()" class="play-again-button">Return to Practice</button>
      </div>
    `;
  }

  exitRetryMode() {
    this.retryMode = false;
    this.retryQuestionList = [];
    this.retryQuestionIndex = 0;
    this.retrySessionStartCount = 0;
    this.retrySessionMastered = 0;
    this.retrySessionType = 'all';
    
    const retryIndicator = document.querySelector('.retry-mode-indicator');
    const returnButton = document.querySelector('.return-practice-button');
    if (retryIndicator) retryIndicator.remove();
    if (returnButton) returnButton.remove();
    
    // Restore question counter
    const questionProgress = document.getElementById('question-progress');
    if (questionProgress) questionProgress.style.display = 'block';
    
    const reviewCounter = document.querySelector('.review-counter');
    if (reviewCounter) {
      reviewCounter.style.display = 'block';
      this.updateReviewCounter();
    }
    
    console.log('Exited review session, returning to normal practice');
    this.startSinglePlayerRound(this.gameMode);
  }

// ===================================
  // ✨ ENHANCED GAME INITIALIZATION WITH MULTI-CATEGORY SUPPORT
  // ===================================
  async startGame(categories, level, mode) {
    console.log('GAME STARTED!');
    
    if (this.gameState === 'playing') {
      console.log('Game already in progress, ignoring duplicate start request');
      return;
    }
    
    // ✨ CRITICAL FIX: Clear ALL existing timers before starting new game
    if (this.lightningTimer) {
      clearInterval(this.lightningTimer);
      this.lightningTimer = null;
    }
    if (this.questionTimer) {
      clearInterval(this.questionTimer);
      this.questionTimer = null;
    }
    if (this.bonusTimer) {
      clearInterval(this.bonusTimer);
      this.bonusTimer = null;
    }
    if (this.readingTimeout) {
      clearTimeout(this.readingTimeout);
      this.readingTimeout = null;
    }
    if (this.lateBufferTimeout) {
      clearTimeout(this.lateBufferTimeout);
      this.lateBufferTimeout = null;
    }
    if (this.allEliminatedTimer) {
      clearTimeout(this.allEliminatedTimer);
      this.allEliminatedTimer = null;
    }
    if (this.bonusCompleteTimer) {
      clearTimeout(this.bonusCompleteTimer);
      this.bonusCompleteTimer = null;
    }
    // ✨ Clear Solo Certamen countdown timer
    this.clearSoloCountdownTimer();
    
    // Clear timer flag and reset bonus state
    this.timerHasExpired = false;
    this.bonusState = 'none';
    this.isReading = false;
    
    this.gameMode = mode;
    this.playerScore = 0;
    this.currentQuestion = 0;
    this.displayedQuestions = []; // Reset displayed questions tracker
    this.gameState = 'playing';
    
    // Setup teams BEFORE creating interface for Certamen modes
    if (mode === 'certamen') {
      this.setupTeams();
      console.log('Teams set up before interface creation');
    } else if (mode === 'certamen-solo') {
      this.setupSoloPlayer();
      console.log('Solo player set up before interface creation');
    }
    
// Reset lightning variables immediately
    this.lightningStarted = undefined;
    this.correctAnswersCount = 0;
    this.questionsAnswered = 0;
    
    if (mode === 'practice') {
      this.loadReviewQuestions();
    }
    
    try {
      if (mode === 'certamen' || mode === 'certamen-solo') {
        await this.loadCertamenQuestions(level);
      } else {
        // ✨ NEW: Load from multiple categories for Practice/Timed modes
        await this.loadMultiCategoryQuestions(categories, level);
      }
      
      // Only shuffle for Practice/Timed modes - Certamen questions are pre-arranged in triads
      if (mode !== 'certamen' && mode !== 'certamen-solo') {
        this.questions = this.shuffleArray(this.questions);
      }
      
      console.log(`✅ Loaded and shuffled ${this.questions.length} questions from ${categories.length} categories`);
      
      this.showGameInterface(mode);

      if (mode === 'practice') {
        setTimeout(() => {
          this.updateReviewCounter();
        }, 100);
      }
      
    } catch (error) {
      console.error('Failed to start game:', error);
      this.gameState = 'setup';
      alert('Failed to load questions. Please try again.');
    }
  }

  // ===================================
  // MULTIPLAYER GAME START
  // ===================================
  
  async startMultiplayerGame(multiplayerState) {
    console.log('🎮 Starting MULTIPLAYER Certamen');
    console.log('Multiplayer state:', multiplayerState);
    
    // Set multiplayer properties
    this.isMultiplayer = true;
    this.isHost = multiplayerState.isHost;
    this.roomRef = multiplayerState.roomRef;
    this.roomCode = multiplayerState.roomCode; // 🎮 FIX: Store roomCode for Firebase sync in endGame
    this.myPlayerId = multiplayerState.playerId;
    this.myTeamIndex = null; // Will be set when we find our player
    this.gameMode = 'certamen-multiplayer';
    this.gameState = 'playing';
    
    // 💔 Reset disconnect detection flag for new game
    this._hostDisconnectShown = false;
    this._gameEnded = false;
    
    // Store game settings from multiplayer state
    this.selectedLevel = multiplayerState.level || 'novice';
    this.selectedCategories = multiplayerState.categories || ['mythology', 'roman-history-daily-life', 'latin-grammar', 'derivatives', 'mottos', 'ancient-geography'];
    
    console.log('🔍 Stored game settings from multiplayerState:', {
      level: this.selectedLevel,
      categories: this.selectedCategories
    });
    
    // Get players from Firebase and map to teams
    const players = multiplayerState.players || {};
    const playerEntries = Object.entries(players);
    
    // Create teams array with player names
    this.teams = playerEntries.map(([id, player]) => {
      // Check if this is me
      if (id === this.myPlayerId) {
        this.myTeamIndex = player.teamIndex;
      }
      
      return {
        name: player.name,  // Use player name as team name in multiplayer
        captain: player.name,  // Also keep as captain for backwards compatibility
        score: 0,
        buzzed: false,
        playerId: id,
        teamIndex: player.teamIndex
      };
    });
    
    // Sort teams by teamIndex to ensure consistent ordering
    this.teams.sort((a, b) => a.teamIndex - b.teamIndex);
    
    console.log('Teams created:', this.teams);
    console.log('My team index:', this.myTeamIndex);
    
    // Show game interface
    this.showGameInterface('certamen-multiplayer');
    
    // Branch: Host loads and runs game, Players just display
    if (this.isHost) {
      console.log('🎮 I am HOST - loading questions and running game');
      await this.runHostGame();
    } else {
      console.log('📺 I am PLAYER - listening for game updates');
      this.runPlayerDisplay();
    }
  }
  
  // Host: Load questions and start game
  async runHostGame() {
    try {
      // Load questions for the selected difficulty level
      await this.loadCertamenQuestions(this.selectedLevel);
      console.log(`✅ Host loaded ${this.questions.length} questions for ${this.selectedLevel} level`);
      
      // Initialize game state in Firebase
      await this.initializeFirebaseGameState();
      console.log('✅ Firebase game state initialized');
      
      // 🎮 HOST: Set up Firebase listener to detect buzz attempts from players
      this.setupHostBuzzListener();
      console.log('✅ Host buzz listener set up');
      
      // 💓 HOST: Start heartbeat so players know host is still connected
      this.startHostHeartbeat();
      console.log('✅ Host heartbeat started');
      
      // Start first question
      this.startCertamenRound();
      console.log('✅ First question started!');
      
      console.log('🎮 Host game ready!');
    } catch (error) {
      console.error('Error loading questions for host:', error);
      alert('Failed to load questions. Please try again.');
    }
  }
  
  // 💓 HOST: Send heartbeat to Firebase so players know host is connected
  startHostHeartbeat() {
    if (!this.isHost || !this.roomRef || !window.updateFirebaseDoc) {
      return;
    }
    
    // Send initial heartbeat
    this.sendHostHeartbeat();
    
    // Send heartbeat every 15 seconds
    this.hostHeartbeatInterval = setInterval(() => {
      this.sendHostHeartbeat();
    }, 15000);
    
    console.log('💓 Host heartbeat interval started (every 15s)');
  }
  
  // 💓 Write heartbeat timestamp to Firebase
  sendHostHeartbeat() {
    if (!this.isHost || !this.roomRef || !window.updateFirebaseDoc) {
      return;
    }
    
    window.updateFirebaseDoc(this.roomRef, {
      'hostHeartbeat': Date.now()
    }).catch(err => {
      console.warn('💓 Heartbeat write failed:', err.message);
    });
  }
  
  // 💓 Stop heartbeat (call on game end or return to setup)
  stopHostHeartbeat() {
    if (this.hostHeartbeatInterval) {
      clearInterval(this.hostHeartbeatInterval);
      this.hostHeartbeatInterval = null;
      console.log('💓 Host heartbeat stopped');
    }
  }
  
  // 🎮 HOST: Listen for buzz attempts from players via Firebase
  setupHostBuzzListener() {
    if (!this.roomRef || !window.onSnapshot) {
      console.error('❌ Cannot set up host buzz listener - Firebase not available');
      return;
    }
    
    console.log('🎮 HOST: Setting up buzz listener for room:', this.roomRef.path);
    
    this.hostBuzzUnsubscribe = window.onSnapshot(this.roomRef, (doc) => {
      if (!doc.exists()) return;
      
      const data = doc.data();
      const state = data.gameState;
      if (!state) return;
      
      // Detect buzz attempts from players
      if (state.buzzAttempt) {
        const { teamIndex, timestamp, questionTimestamp } = state.buzzAttempt;
        
        // Only process if we haven't seen this buzz yet (prevent duplicates)
        if (!this.lastProcessedBuzzTimestamp || timestamp > this.lastProcessedBuzzTimestamp) {
          this.lastProcessedBuzzTimestamp = timestamp;
          
          // Get team name for clearer logging
          const teamName = this.teams[teamIndex]?.name || `Team ${teamIndex}`;
          const buzzTime = new Date(timestamp).toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            fractionalSecondDigits: 3 
          });
          
          // 🎮 SYNC FIX: Reject buzzes from old questions
          if (questionTimestamp && this._currentQuestionTimestamp && 
              questionTimestamp !== this._currentQuestionTimestamp) {
            console.log(`⚠️ STALE BUZZ: ${teamName} buzzed for wrong question - rejected`);
            // Clear the buzz attempt from Firebase
            window.updateFirebaseDoc(this.roomRef, {
              'gameState.buzzAttempt': null
            });
            return;
          }
          
          // 🎮 SIMULTANEOUS BUZZ FIX: Reject if someone already buzzed in
          if (this.teamBuzzedIn !== null) {
            const winnerName = this.teams[this.teamBuzzedIn]?.name || `Team ${this.teamBuzzedIn}`;
            const timeDiff = timestamp - (this._winningBuzzTimestamp || timestamp);
            console.log(`🏆 BUZZ RACE: ${winnerName} won!`);
            console.log(`⚠️ ${teamName} buzz rejected - arrived ${timeDiff}ms later (at ${buzzTime})`);
            // Clear the buzz attempt from Firebase
            window.updateFirebaseDoc(this.roomRef, {
              'gameState.buzzAttempt': null
            });
            return;
          }
          
          // ✨ RACE CONDITION FIX: Check if buzzing is still allowed (timer not expired)
          if (!this.buzzingAllowed) {
            const timeSinceExpiry = this._timerExpiredAt ? (timestamp - this._timerExpiredAt) : 0;
            console.log(`⚠️ LATE BUZZ: ${teamName} buzzed ${timeSinceExpiry}ms after timer expired - rejected (at ${buzzTime})`);
            // Clear the buzz attempt from Firebase
            window.updateFirebaseDoc(this.roomRef, {
              'gameState.buzzAttempt': null
            });
            return;
          }
          
          // 🏆 WINNING BUZZ - record timestamp for race comparison
          this._winningBuzzTimestamp = timestamp;
          console.log(`🏆 BUZZ WINNER: ${teamName} buzzed in first! (at ${buzzTime})`);
          this.processBuzz(teamIndex);
          
          // Clear the buzz attempt from Firebase
          window.updateFirebaseDoc(this.roomRef, {
            'gameState.buzzAttempt': null
          });
        }
      }
      
      // 🎮 HOST: Detect answer submissions from players
      if (state.submittedAnswer) {
        const { teamIndex, answer, timestamp } = state.submittedAnswer;
        
        // Only process if we haven't seen this answer yet
        if (!this.lastProcessedAnswerTimestamp || timestamp > this.lastProcessedAnswerTimestamp) {
          this.lastProcessedAnswerTimestamp = timestamp;
          
          // 🎮 SYNC FIX: Reject answers from old questions
          const answerQuestionTimestamp = state.submittedAnswer.questionTimestamp;
          if (answerQuestionTimestamp && this._currentQuestionTimestamp && 
              answerQuestionTimestamp !== this._currentQuestionTimestamp) {
            console.log(`⚠️ HOST: Rejecting stale answer from team ${teamIndex} - wrong question (answer=${answerQuestionTimestamp}, current=${this._currentQuestionTimestamp})`);
            // Clear the submitted answer from Firebase
            window.updateFirebaseDoc(this.roomRef, {
              'gameState.submittedAnswer': null
            });
            return;
          }
          
          console.log(`📥 HOST: Processing answer from team ${teamIndex}: "${answer}"`);
          
          // Process the answer
          this.processPlayerAnswer(teamIndex, answer);
          
          // Clear the submitted answer from Firebase
          window.updateFirebaseDoc(this.roomRef, {
            'gameState.submittedAnswer': null
          });
        }
      }
    });
    
    // 📡 Register listener with global registry for cleanup
    if (window.listenerRegistry) {
      window.listenerRegistry.add(this.hostBuzzUnsubscribe, 'host-buzz-listener');
    }
    
    console.log('✅ Host buzz listener attached');
  }
  
  // Initialize Firebase game state
  async initializeFirebaseGameState() {
    if (!this.roomRef) {
      console.error('No roomRef available');
      return;
    }
    
    if (!window.updateFirebaseDoc) {
      console.error('Firebase updateDoc not available');
      return;
    }
    
    try {
      await window.updateFirebaseDoc(this.roomRef, {
        // 🎮 Set root phase to 'active' so players know game is in progress
        'phase': 'active',
        'gameState': {
          currentQuestionIndex: 0,
          currentQuestionData: null,
          questionTimestamp: 0, // 🎮 SYNC FIX: Track current question ID
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
          submittedAnswer: null,
          gamePhase: 'playing'  // 🎮 Reset game phase for new game
        }
      });
      console.log('✅ Game state initialized in Firebase');
    } catch (error) {
      console.error('Error initializing game state:', error);
    }
  }
  
  // Player: Listen to Firebase and update display
  runPlayerDisplay() {
    console.log('📺 Player display mode - listening for updates');
    
    if (!this.roomRef) {
      console.error('❌ No roomRef available');
      return;
    }
    
    if (!window.onSnapshot) {
      console.error('❌ window.onSnapshot not available');
      return;
    }
    
    console.log('✅ Setting up Firebase listener for room:', this.roomRef.path);
    
    // Listen for game state changes
    this.unsubscribe = window.onSnapshot(this.roomRef, (doc) => {
      // Removed verbose snapshot logging - was cluttering console
      
      if (!doc.exists()) {
        console.error('Room no longer exists');
        return;
      }
      
      const data = doc.data();
      const state = data.gameState;
      
      // 💓 PLAYER: Check if host is still connected (heartbeat detection)
      if (!this.isHost && data.hostHeartbeat) {
        const heartbeatAge = Date.now() - data.hostHeartbeat;
        const HEARTBEAT_TIMEOUT = 45000; // 45 seconds
        
        if (heartbeatAge > HEARTBEAT_TIMEOUT && !this._hostDisconnectShown) {
          console.log(`💔 Host heartbeat stale (${Math.round(heartbeatAge/1000)}s old) - host may have disconnected`);
          this._hostDisconnectShown = true;
          this.showHostDisconnectedModal();
          return;
        }
      }
      
      // 💔 PLAYER: Check for intentional host leave
      if (!this.isHost && data.hostLeft && !this._hostDisconnectShown) {
        console.log('💔 Host intentionally left the game');
        this._hostDisconnectShown = true;
        this.showHostDisconnectedModal();
        return;
      }
      
      // 🔄 PLAYER: Check if host initiated Play Again (phase = waiting)
      if (!this.isHost && data.phase === 'waiting' && data.restart) {
        // Only process if we haven't already shown the waiting room for this restart
        if (!this._lastRestartTimestamp || this._lastRestartTimestamp !== data.restart) {
          console.log('🔄 PLAYER: Host initiated Play Again - showing waiting room');
          this._lastRestartTimestamp = data.restart;
          this._gameEnded = false; // Reset for new game
          this.showWaitingRoom();
          return;
        }
      }
      
      // 🎮 PLAYER: Check if host started new game from waiting room (phase = countdown)
      if (!this.isHost && data.phase === 'countdown' && data.countdownStart) {
        // Only process if we haven't already started countdown for this game
        if (!this._lastCountdownStart || this._lastCountdownStart !== data.countdownStart) {
          console.log('🎮 PLAYER: Host started new game - showing countdown');
          this._lastCountdownStart = data.countdownStart;
          
          // Remove waiting room if visible
          const waitingRoom = document.querySelector('.multiplayer-waiting-room');
          if (waitingRoom) {
            waitingRoom.closest('.game-container')?.remove();
          }
          
          // Show countdown
          this.showCountdown(() => {
            console.log('🎮 PLAYER: Countdown complete - resetting for new game');
            
            // Reset game state for new game
            this.currentPassage = 0;
            this.currentQuestion = 0;
            this._gameEnded = false;
            this.eliminatedTeams.clear();
            this._lastBuzzerState = null;
            this.teamBuzzedIn = null;
            this.bonusWinningTeam = null;
            this.bonusState = 'none';
            this._lastQuestionTimestamp = null;
            
            // Reset team scores
            if (this.teams) {
              this.teams.forEach(team => {
                team.score = 0;
              });
            }
            
            // Recreate the game interface
            this.showGameInterface('certamen-multiplayer');
            
            console.log('🎮 PLAYER: Interface ready - waiting for host to sync questions');
            // Player's Firebase listener will pick up when host sends first question
          });
          return;
        }
      }
      
      if (!state) {
        console.warn('⚠️ No gameState found');
        return;
      }
      
      // 🎮 MULTIPLAYER: Check for game-over FIRST (before any other processing)
      if (!this.isHost && state.gamePhase === 'ended' && !this._gameEnded) {
        console.log('📥 PLAYER: Game ended - showing victory screen');
        this._gameEnded = true;
        
        // Use the final scores from Firebase
        const finalScores = state.finalScores || [];
        const winners = state.winners || [];
        
        // Hide progress counter
        const certamenProgress = document.getElementById('certamen-progress');
        if (certamenProgress) certamenProgress.style.display = 'none';
        
        // Create winner text
        let winnerText = '';
        if (winners.length === 1) {
          winnerText = `<h2 class="victory-winner">✨ ${winners[0]} Wins! ✨</h2>`;
        } else if (winners.length > 1) {
          winnerText = `<h2 class="victory-tie">✨ Tie Game! ${winners.join(' & ')} ✨</h2>`;
        }
        
        // Create confetti
        const confettiColors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7931e', '#ff85a2'];
        const confettiHTML = Array.from({ length: 30 }, (_, i) => {
          const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
          const left = Math.random() * 100;
          const delay = Math.random() * 2;
          const duration = (1.4 + Math.random() * 1.4).toFixed(2);
          const shape = Math.random() > 0.5 ? 'circle' : 'square';
          return `<div class="confetti ${shape}" style="left: ${left}%; background: ${color}; animation: confetti-fall ${duration}s ${delay}s ease-in infinite;"></div>`;
        }).join('');
        
        // Display victory screen
        const questionDisplay = document.getElementById('question-display');
        if (questionDisplay) {
          questionDisplay.innerHTML = `
            <div class="game-over">
              <div class="victory-header" style="position: relative; overflow: hidden;">
                ${confettiHTML}
                ${winnerText}
              </div>
              <div class="final-scores">
                ${finalScores.map((team, index) => `
                  <div class="final-score ${index === 0 ? 'first-place' : ''}">
                    <span class="team-rank">${index + 1}. ${team.name}</span>
                    <span class="team-points">${team.score} points</span>
                  </div>
                `).join('')}
              </div>
              <div class="victory-actions">
                <button onclick="game.playAgain()" class="play-again-button explosive">Play Again</button>
              </div>
            </div>
          `;
        }
        
        // Hide team cards (they still show BUZZ IN otherwise)
        const teamInterface = document.getElementById('team-interface');
        if (teamInterface) {
          teamInterface.style.display = 'none';
        }
        
        // 🎮 MULTIPLAYER FIX: Also hide .teams-container which is used in multiplayer mode
        const teamsContainer = document.querySelector('.teams-container');
        if (teamsContainer) {
          teamsContainer.style.display = 'none';
        }
        
        // Stop timers and pulsing
        this.clearQuestionTimer();
        this.stopBuzzButtonPulsing();
        
        return; // Exit early - game is over, no need to process anything else
      }
      
      // Display current question
      if (state.currentQuestionData) {
        // 🎮 SYNC FIX: Use questionTimestamp as the authoritative question ID
        const questionTimestamp = state.questionTimestamp || 0;
        const questionChanged = this._lastQuestionTimestamp !== questionTimestamp;
        
        // 🎮 SYNC FIX: Also validate against currentQuestionIndex for extra safety
        const questionIndex = state.currentQuestionIndex;
        const indexChanged = this._lastQuestionIndex !== questionIndex;
        
        if (questionChanged || (indexChanged && questionTimestamp)) {
          this._lastQuestionTimestamp = questionTimestamp;
          this._lastQuestionIndex = questionIndex;
          this._lastQuestionId = state.currentQuestionData.question; // Keep for backwards compat
          this._lastBuzzerState = null; // Force buzzer re-initialization
          this.eliminatedTeams.clear(); // 🎮 Reset eliminations for new question
          this.resetAllTeamVisualStates(); // 🎮 Reset visual states for new question
          console.log(`🔄 New question detected (timestamp=${questionTimestamp}, index=${questionIndex}) - resetting buzzer state and eliminations`);
          
          // 🎮 Store question for players so they can reference it
          this.currentQuestionObj = state.currentQuestionData;
          
          // 🎮 Only call displayQuestion when question actually changes
          console.log('📥 Received question from Firebase:', state.currentQuestionData);
          this.displayQuestion(state.currentQuestionData);
          
          // 🎮 MULTIPLAYER FIX: Players enable buzz button on NEW question only
          if (!this.isHost) {
            this.buzzingAllowed = true;
            this.enableBuzzers();
            this.startBuzzButtonPulsing(); // ✨ FIX: Start pulsing for players too!
          }
        }
        
        // 🎮 MULTIPLAYER FIX: Update word-by-word display based on host's reading
        // BUT NOT during bonus rounds - bonus questions are displayed in full immediately
        if (state.partialQuestion !== undefined && state.partialQuestion !== null && 
            state.currentWordIndex !== undefined && state.currentWordIndex !== null &&
            state.bonusState !== 'active') {
          this.updateQuestionDisplay(state.partialQuestion, false);
        }
      } else {
        console.log('⏳ No currentQuestionData yet');
      }
      
      // Update progress counter
      if (state.currentQuestionIndex !== undefined) {
        this.currentQuestion = state.currentQuestionIndex;
      }
      
      // ✨ MULTIPLAYER FIX: Update round counter from Firebase
      if (state.currentPassage !== undefined) {
        this.currentPassage = state.currentPassage;
      }
      
      // 🎮 MULTIPLAYER: Host detects buzz attempts from players
      if (this.isHost && state.buzzAttempt) {
        const { teamIndex, timestamp, questionTimestamp } = state.buzzAttempt;
        
        // Only process if we haven't seen this buzz yet (prevent duplicates)
        if (!this.lastProcessedBuzzTimestamp || timestamp > this.lastProcessedBuzzTimestamp) {
          this.lastProcessedBuzzTimestamp = timestamp;
          
          // Get team name for clearer logging
          const teamName = this.teams[teamIndex]?.name || `Team ${teamIndex}`;
          const buzzTime = new Date(timestamp).toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            fractionalSecondDigits: 3 
          });
          
          // 🎮 SYNC FIX: Reject buzzes from old questions
          if (questionTimestamp && this._currentQuestionTimestamp && 
              questionTimestamp !== this._currentQuestionTimestamp) {
            console.log(`⚠️ STALE BUZZ: ${teamName} buzzed for wrong question - rejected`);
            // Clear the buzz attempt from Firebase
            window.updateFirebaseDoc(this.roomRef, {
              'gameState.buzzAttempt': null
            });
            return;
          }
          
          // 🎮 SIMULTANEOUS BUZZ FIX: Reject if someone already buzzed in
          if (this.teamBuzzedIn !== null) {
            const winnerName = this.teams[this.teamBuzzedIn]?.name || `Team ${this.teamBuzzedIn}`;
            const timeDiff = timestamp - (this._winningBuzzTimestamp || timestamp);
            console.log(`🏆 BUZZ RACE: ${winnerName} won!`);
            console.log(`⚠️ ${teamName} buzz rejected - arrived ${timeDiff}ms later (at ${buzzTime})`);
            // Clear the buzz attempt from Firebase
            window.updateFirebaseDoc(this.roomRef, {
              'gameState.buzzAttempt': null
            });
            return;
          }
          
          // ✨ RACE CONDITION FIX: Check if buzzing is still allowed (timer not expired)
          if (!this.buzzingAllowed) {
            const timeSinceExpiry = this._timerExpiredAt ? (timestamp - this._timerExpiredAt) : 0;
            console.log(`⚠️ LATE BUZZ: ${teamName} buzzed ${timeSinceExpiry}ms after timer expired - rejected (at ${buzzTime})`);
            // Clear the buzz attempt from Firebase
            window.updateFirebaseDoc(this.roomRef, {
              'gameState.buzzAttempt': null
            });
            return;
          }
          
          // 🏆 WINNING BUZZ - record timestamp for race comparison
          this._winningBuzzTimestamp = timestamp;
          console.log(`🏆 BUZZ WINNER: ${teamName} buzzed in first! (at ${buzzTime})`);
          this.processBuzz(teamIndex);
          
          // Clear the buzz attempt from Firebase
          window.updateFirebaseDoc(this.roomRef, {
            'gameState.buzzAttempt': null
          });
        }
      }
      
      // 🎮 MULTIPLAYER: Players receive score updates from host
      if (!this.isHost && state.teamScores && Array.isArray(state.teamScores)) {
        state.teamScores.forEach((teamData, index) => {
          if (this.teams[index]) {
            const oldScore = this.teams[index].score;
            this.teams[index].score = teamData.score;
            
            // Update the display if score changed
            if (oldScore !== teamData.score) {
              const teamCard = document.getElementById(`team-${index}`);
              if (teamCard) {
                const scoreElement = teamCard.querySelector('.score');
                if (scoreElement) {
                  scoreElement.textContent = `${teamData.score} points`;
                  scoreElement.classList.add('score-update');
                  setTimeout(() => {
                    scoreElement.classList.remove('score-update');
                  }, 1000);
                }
              }
              console.log(`📊 PLAYER: Team ${index} score updated to ${teamData.score}`);
            }
          }
        });
      }
      
      // 🎮 MULTIPLAYER: Players receive teamBuzzedIn updates from host
      if (!this.isHost && state.teamBuzzedIn !== undefined) {
        const buzzedTeam = state.teamBuzzedIn;
        
        // Only process if different from current state
        if (buzzedTeam !== this.teamBuzzedIn) {
          this.teamBuzzedIn = buzzedTeam;
          
          if (buzzedTeam !== null) {
            console.log(`📥 PLAYER: Team ${buzzedTeam} has buzzed in`);
            
            // Update visual state for buzzed team
            this.updateTeamVisualState(buzzedTeam, 'buzzed-in');
            
            // Update the badge to show who buzzed
            const questionTypeEl = document.querySelector('.question-type');
            if (questionTypeEl && this.teams[buzzedTeam]) {
              questionTypeEl.textContent = `TEAM ${this.teams[buzzedTeam].name.toUpperCase()} - TOSSUP`;
            }
            
            // Disable all buzz buttons
            this.disableAllBuzzers();
            this.stopBuzzButtonPulsing();
            
            // Only enable answer options if it's MY team that buzzed
            if (buzzedTeam === this.myTeamIndex) {
              console.log(`🎮 PLAYER: It's MY turn to answer!`);
              this.enableAnswerOptions();
            } else {
              console.log(`📺 PLAYER: Team ${buzzedTeam} is answering - watching`);
              this.disableAnswerOptions();
            }
          } else {
            // teamBuzzedIn was cleared - reset for next buzz opportunity
            console.log(`🔄 PLAYER: teamBuzzedIn cleared - ready for next buzz`);
            
            // ✨ FIX: Reset all team visual states to clear ANSWERING badges
            this.resetAllTeamVisualStates();
            
            // ✨ FIX: Enable buzzing for rollover - players need this flag set!
            this.buzzingAllowed = true;
            console.log('🟢 PLAYER: Buzzing enabled for rollover');
            
            // Re-enable buzz button for this player
            this.enableBuzzers();
            this.startBuzzButtonPulsing();
            
            // Disable answer options until someone buzzes
            this.disableAnswerOptions();
          }
        }
      }
      
      // 🎮 MULTIPLAYER: Players receive answer results from host
      if (!this.isHost && state.answerResult) {
        const { teamIndex, isCorrect, selectedIndex, timestamp } = state.answerResult;
        
        // Only process if we haven't seen this result yet
        if (!this.lastProcessedAnswerResultTimestamp || timestamp > this.lastProcessedAnswerResultTimestamp) {
          this.lastProcessedAnswerResultTimestamp = timestamp;
          console.log(`📥 PLAYER: Team ${teamIndex} answered ${isCorrect ? 'CORRECTLY' : 'INCORRECTLY'}`);
          
          // Show visual feedback on answer buttons (multiple choice)
          if (selectedIndex !== null) {
            const answerButtons = document.querySelectorAll('.answer-option');
            if (answerButtons[selectedIndex]) {
              answerButtons[selectedIndex].classList.add(isCorrect ? 'correct' : 'incorrect');
            }
          } else {
            // Fill-in-the-blank: show visual feedback on input field for ALL screens
            const answerInput = document.getElementById('answer-input');
            if (answerInput) {
              answerInput.style.background = isCorrect ? '#4CAF50' : '#f44336';
              answerInput.style.color = 'white';
              
              // Auto-clear after 1.5 seconds (if not cleared by next buzz first)
              setTimeout(() => {
                if (answerInput) {
                  answerInput.style.background = '';
                  answerInput.style.color = '';
                }
              }, 1500);
            }
          }
          
          // Update team visual state if incorrect (eliminated)
          // 🎮 FIX: Only show eliminated state during TOSS-UPS, not during bonus rounds
          // In bonus rounds, the same team answers both questions regardless of correctness
          if (!isCorrect && state.bonusState !== 'active') {
            this.eliminatedTeams.add(teamIndex);
            this.updateTeamVisualState(teamIndex, 'eliminated');
            
            // 🎮 FIX: Re-enable buzzers with updated elimination state
            // This ensures non-eliminated teams can still buzz during rollover
            console.log(`🔄 PLAYER: Team ${teamIndex} eliminated, refreshing buzzer state`);
            this._lastBuzzerState = null; // Force refresh
            this.enableBuzzers();
            this.startBuzzButtonPulsing();
          }
        }
      }
      
      // 🎮 MULTIPLAYER: Players receive bonus questions from host
      if (!this.isHost && state.bonusState === 'active' && state.bonusQuestionData) {
        const bonusData = state.bonusQuestionData;
        const bonusTimestamp = bonusData.timestamp;
        
        // CRITICAL: Reset timestamp if this is a NEW bonus round (different winning team)
        if (this.bonusWinningTeam !== bonusData.winningTeam) {
          console.log(`🔄 PLAYER: New bonus round detected (team ${this.bonusWinningTeam} → ${bonusData.winningTeam}), resetting timestamp`);
          this._lastBonusTimestamp = null;
        }
        
        // Only process if we haven't seen this bonus question yet
        if (!this._lastBonusTimestamp || bonusTimestamp > this._lastBonusTimestamp) {
          this._lastBonusTimestamp = bonusTimestamp;
          
          console.log(`📥 PLAYER: Received bonus question ${bonusData.bonusNumber}/2 from Firebase`);
          console.log(`🎯 PLAYER: Bonus is for team ${bonusData.winningTeam}`);
          
          // Store bonus state locally
          this.bonusState = 'active';
          this.bonusWinningTeam = bonusData.winningTeam;
          
          // Display the bonus question
          this.displayPlayerBonusQuestion(bonusData);
        }
      }
      
      // 🎮 MULTIPLAYER: Handle bonus round ending
      if (!this.isHost && state.bonusState === 'inactive' && this.bonusState === 'active') {
        console.log('📥 PLAYER: Bonus round ended');
        this.bonusState = 'inactive';
        this._lastBonusTimestamp = null;
        // Visual states will be reset when next toss-up comes in
      }
      
      // 🎮 MULTIPLAYER: Players receive timer updates from host
      if (!this.isHost) {
        if (state.timer) {
          const { timeRemaining, timerType, timestamp } = state.timer;
          
          // Only update if this is a newer timer update
          if (!this._lastTimerTimestamp || timestamp > this._lastTimerTimestamp) {
            this._lastTimerTimestamp = timestamp;
            
            // Update local timer state
            this.questionTimeLeft = timeRemaining;
            this.currentTimerType = timerType;
            
            // Get or create timer box
            let timerBox = document.getElementById('question-timer-box');
            
            if (timerBox) {
              // Guard against undefined timeRemaining
              if (timeRemaining === undefined || timeRemaining === null) {
                console.log('⏰ Timer received but timeRemaining is undefined/null - skipping');
                return;
              }
              
              if (timeRemaining <= 0) {
                // Timer expired
                timerBox.innerHTML = '<span class="timer-icon">⏰</span> Time Expired!';
                timerBox.classList.add('expired');
                timerBox.classList.remove('timer-warning', 'timer-critical');
                
                // Disable buzzing when timer expires
                this.buzzingAllowed = false;
                this.disableAllBuzzers();
                this.stopBuzzButtonPulsing();
              } else {
                // Update timer display
                timerBox.innerHTML = `
                  <span class="timer-icon">⏰</span>
                  <span id="question-timer">${timeRemaining}</span>
                `;
                timerBox.style.visibility = 'visible';
                
                // Add warning/critical classes
                timerBox.classList.remove('expired', 'timer-warning', 'timer-critical');
                if (timeRemaining <= 4) {
                  timerBox.classList.add('timer-critical');
                } else if (timeRemaining <= 7) {
                  timerBox.classList.add('timer-warning');
                }
              }
            }
          }
        } else if (state.timer === null && this._lastTimerTimestamp) {
          // Timer was cleared by host - hide timer box
          this._lastTimerTimestamp = null;
          let timerBox = document.getElementById('question-timer-box');
          if (timerBox) {
            timerBox.style.visibility = 'hidden';
          }
        }
      }
      
      this.updateProgressDisplay();;
    }, (error) => {
      console.error('❌ Firebase listener error:', error);
    });
    
    // 📡 Register listener with global registry for cleanup
    if (window.listenerRegistry) {
      window.listenerRegistry.add(this.unsubscribe, 'player-game-listener');
    }
    
    console.log('✅ Firebase listener attached');
  }
  
  // Host: Sync current question to Firebase
  async syncQuestionToFirebase(question) {
    console.log('📤 Syncing question to Firebase...');
    
    // 💓 Refresh heartbeat on game action
    this.sendHostHeartbeat();
    
    if (!this.roomRef) {
      console.error('❌ No roomRef available');
      return;
    }
    
    if (!window.updateFirebaseDoc) {
      console.error('❌ window.updateFirebaseDoc not available');
      return;
    }
    
    try {
      // 🎮 SYNC FIX: Generate unique timestamp for this question
      const questionTimestamp = Date.now();
      this._currentQuestionTimestamp = questionTimestamp;
      
      // 🏆 RACE TRACKING: Reset for new question
      this._winningBuzzTimestamp = null;
      this._timerExpiredAt = null;
      
      const questionData = {
        question: question.question,
        options: question.options || null,
        answer: question.answer,
        category: question.category,
        dependency: question.dependency,
        group: question.group
      };
      
      console.log('📝 Question data to sync:', questionData);
      
      // 🎮 CLEAN SLATE: Clear all stale data from previous question
      // This prevents race conditions where old data appears on new questions
      await window.updateFirebaseDoc(this.roomRef, {
        'gameState.currentQuestionData': questionData,
        'gameState.currentQuestionIndex': this.currentQuestion,
        'gameState.currentPassage': this.currentPassage,
        'gameState.questionTimestamp': questionTimestamp,
        'gameState.phase': 'reading',
        // Clear stale data from previous question
        'gameState.partialQuestion': null,
        'gameState.currentWordIndex': null,
        'gameState.answerResult': null,
        'gameState.teamBuzzedIn': null,
        'gameState.submittedAnswer': null
      });
      
      console.log('✅ Question synced to Firebase successfully');
    } catch (error) {
      console.error('❌ Error syncing question:', error);
    }
  }

  // 🎮 MULTIPLAYER FIX: Sync word index for synchronized word-by-word display
  async syncWordIndexToFirebase(wordIndex, partialText) {
    if (!this.roomRef || !window.updateFirebaseDoc) {
      return;
    }
    
    try {
      await window.updateFirebaseDoc(this.roomRef, {
        'gameState.currentWordIndex': wordIndex,
        'gameState.partialQuestion': partialText,
        'gameState.isReading': this.isReading
      });
    } catch (error) {
      // Silently fail to avoid console spam - word updates happen frequently
    }
  }

  // 🎮 MULTIPLAYER: Sync bonus round state to Firebase so players know bonus started
  async syncBonusStateToFirebase(bonusState, winningTeam) {
    if (!this.roomRef || !window.updateFirebaseDoc) {
      console.error('❌ Cannot sync bonus state - no Firebase connection');
      return;
    }
    
    try {
      console.log(`📤 HOST: Syncing bonus state to Firebase: state=${bonusState}, winningTeam=${winningTeam}`);
      
      const updateData = {
        'gameState.bonusState': bonusState,
        'gameState.bonusWinningTeam': winningTeam,
        'gameState.teamBuzzedIn': null // Clear buzz state for bonus round
      };
      
      // CRITICAL: Clear old bonus question data when starting NEW bonus round
      // This prevents players from seeing stale data from previous bonus
      if (bonusState === 'active') {
        updateData['gameState.bonusQuestionData'] = null;
        console.log('🧹 Clearing old bonus question data for new bonus round');
      }
      
      // 🎮 FIX: Clear partialQuestion when bonus ends to prevent old toss-up from flashing
      if (bonusState === 'inactive') {
        updateData['gameState.partialQuestion'] = null;
        updateData['gameState.currentWordIndex'] = null;
        console.log('🧹 Clearing old partialQuestion data after bonus round');
      }
      
      await window.updateFirebaseDoc(this.roomRef, updateData);
      console.log('✅ Bonus state synced to Firebase');
    } catch (error) {
      console.error('❌ Error syncing bonus state:', error);
    }
  }

  // 🎮 MULTIPLAYER: Sync current bonus question to Firebase for players to display
  async syncBonusQuestionToFirebase(bonusQuestion, bonusNumber) {
    if (!this.roomRef || !window.updateFirebaseDoc) {
      console.error('❌ Cannot sync bonus question - no Firebase connection');
      return;
    }
    
    try {
      const bonusData = {
        question: bonusQuestion.question,
        options: bonusQuestion.options || null,
        answer: bonusQuestion.answer,
        category: bonusQuestion.category,
        bonusNumber: bonusNumber,
        winningTeam: this.bonusWinningTeam,
        timestamp: Date.now() // Add timestamp to detect changes
      };
      
      console.log(`📤 HOST: Syncing bonus question ${bonusNumber}/2 to Firebase`);
      await window.updateFirebaseDoc(this.roomRef, {
        'gameState.bonusQuestionData': bonusData,
        'gameState.bonusState': 'active'
      });
      console.log('✅ Bonus question synced to Firebase');
    } catch (error) {
      console.error('❌ Error syncing bonus question:', error);
    }
  }

// ✨ NEW: Multi-category question loading with proportional distribution
async loadMultiCategoryQuestions(categories, level) {
  console.log(`📝 Loading questions from ${categories.length} categories for ${level} level`);
  
  this.questions = [];
  const categoryQuestions = [];
  
  // Load questions from each category with better error handling
  for (const category of categories) {
    try {
      const questions = await this.questionLoader.loadQuestions(category, level, this.gameMode);
      if (questions && questions.length > 0) {
        categoryQuestions.push({ category, questions });
        // Filter out recently used questions
        const filteredQuestions = this.filterRecentQuestions(questions, category);
        categoryQuestions[categoryQuestions.length - 1].questions = filteredQuestions;
        console.log(`✅ Loaded ${filteredQuestions.length} filtered questions from ${category} (${questions.length} total)`);
      } else {
        console.warn(`⚠️ No questions found for ${category}-${level}, using samples`);
        const sampleQuestions = this.questionLoader.generateSampleQuestions(category, level, this.gameMode);
        categoryQuestions.push({ category, questions: sampleQuestions });
        // Filter sample questions too
        const filteredSamples = this.filterRecentQuestions(sampleQuestions, category);
        categoryQuestions[categoryQuestions.length - 1].questions = filteredSamples;
      }
    } catch (error) {
      console.warn(`⚠️ Failed to load ${category}-${level}:`, error);
      // Use sample questions as fallback
      const sampleQuestions = this.questionLoader.generateSampleQuestions(category, level, this.gameMode);
      categoryQuestions.push({ category, questions: sampleQuestions });
      // Filter sample questions too
      const filteredSamples = this.filterRecentQuestions(sampleQuestions, category);
      categoryQuestions[categoryQuestions.length - 1].questions = filteredSamples;
      console.log(`✅ Using ${filteredSamples.length} sample questions for ${category}`);
    }
  }
  
  // ✨ PROPORTIONAL DISTRIBUTION: Create 25-question session
  const questionsPerCategory = Math.floor(this.sessionSize / categories.length);
  const remainder = this.sessionSize % categories.length;
  
  console.log(`🎯 Distributing ${this.sessionSize} questions: ${questionsPerCategory} per category + ${remainder} extra`);
  
  categoryQuestions.forEach((catData, index) => {
    const { category, questions } = catData;
    
    // Calculate how many questions this category should contribute
    let targetCount = questionsPerCategory;
    if (index < remainder) {
      targetCount++; // Give extra questions to first few categories
    }
    
    // Randomly select questions from this category
    const shuffledCategoryQuestions = this.shuffleArray(questions);
    const selectedQuestions = shuffledCategoryQuestions.slice(0, Math.min(targetCount, questions.length));
    
    this.questions = this.questions.concat(selectedQuestions);
    
    console.log(`📊 ${category}: selected ${selectedQuestions.length}/${questions.length} questions`);
  });
  
  console.log(`🎯 Final question distribution: ${this.questions.length} total questions from ${categories.length} categories`);
  
  // Add deduplication before final shuffle
  this.questions = this.deduplicateQuestions(this.questions);
  console.log(`✅ After deduplication: ${this.questions.length} unique questions`);
  
  // Interleave categories instead of simple shuffle to prevent clustering
  this.questions = this.interleaveCategories(this.questions);
  console.log(`🔀 Questions interleaved to mix categories evenly`);
}

// ===================================
// BALANCED RANDOM CERTAMEN DISTRIBUTION
// ===================================

async loadCertamenQuestions(level) {
  console.log(`🏛️ Loading group-based Certamen questions for ${level} level`);
  
  let categories = ['mythology', 'roman-history-daily-life', 'latin-grammar', 'derivatives', 'mottos', 'ancient-geography'];
  
  // Determine which difficulty levels to load
  let levelsToLoad = [];
  if (level === 'all') {
    levelsToLoad = ['novice', 'intermediate', 'advanced'];
    categories.push('literature'); // Include literature when loading all levels
  } else {
    levelsToLoad = [level];
    if (level === 'advanced') {
      categories.push('literature');
    }
  }
  
  console.log(`📚 Loading from difficulty levels: ${levelsToLoad.join(', ')}`);
  
  this.questions = [];
  const questionGroups = {};
  
  // Load questions from each difficulty level
  for (const difficultyLevel of levelsToLoad) {
    // Load all questions from each category at this difficulty
    for (const category of categories) {
      // Skip literature for novice/intermediate
      if (category === 'literature' && (difficultyLevel === 'novice' || difficultyLevel === 'intermediate')) {
        continue;
      }
      
      try {
        const questions = await this.questionLoader.loadQuestions(category, difficultyLevel, 'certamen');
        if (questions && questions.length > 0) {
          
          // Group questions by their group field
          questions.forEach(question => {
            // ✨ FIX: Only add category prefix if it's not already there
            const categoryGroup = question.group.startsWith(`${category}_`) 
              ? question.group 
              : `${category}_${question.group}`;
            
            if (!questionGroups[categoryGroup]) {
              questionGroups[categoryGroup] = [];
            }
            questionGroups[categoryGroup].push(question);
          });
          
          console.log(`✅ Loaded ${questions.length} questions from ${category}-${difficultyLevel}`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to load ${category}-${difficultyLevel}:`, error);
      }
    }
  }
  
  // Filter for complete triads only (1 toss-up + 2 bonus questions)
  const completeTriads = [];
  
  Object.keys(questionGroups).forEach(groupKey => {
    const groupQuestions = questionGroups[groupKey];
    
    // Count question types in this group
    const tossups = groupQuestions.filter(q => q.dependency === 'tossup');
    const bonuses = groupQuestions.filter(q => q.dependency && q.dependency.startsWith('bonus'));
    
    // Only use groups with exactly 1 toss-up and 2+ bonus questions
    if (tossups.length === 1 && bonuses.length >= 2) {
      // Sort: toss-up first, then bonus questions
      const orderedGroup = [
        tossups[0],
        bonuses[0],
        bonuses[1]
      ];
      
      // ✨ FIX: Update each question's group to include category prefix for uniqueness
      orderedGroup.forEach(q => {
        q.group = groupKey;  // e.g., "mythology_passage_021" instead of just "passage_021"
      });
      
      completeTriads.push(orderedGroup);
      console.log(`✅ Complete triad from group ${groupKey}: ${orderedGroup.map(q => q.dependency).join(' → ')}`);
    } else {
      console.log(`❌ Skipping incomplete group ${groupKey}: ${tossups.length} toss-ups, ${bonuses.length} bonuses`);
    }
  });
  
  // ===== REPEAT-PREVENTION: Filter out recently used triads =====
  console.log(`📊 Total triads available: ${completeTriads.length}`);
  
  // Get recently used passage groups from localStorage
  const recentPassages = JSON.parse(
    localStorage.getItem(CERTAMEN_TRACKING.STORAGE_KEY) || '[]'
  );
  console.log(`🔍 Tracking ${recentPassages.length} recently used passages`);
  
  // Filter out triads with recently-used passage groups
  let freshTriads = completeTriads.filter(triad => {
    // Extract passage group from the first question (toss-up)
    const passageGroup = triad[0].group;
    const isRecent = recentPassages.includes(passageGroup);
    return !isRecent;
  });
  
  console.log(`✨ Fresh triads available: ${freshTriads.length} (${completeTriads.length - freshTriads.length} filtered out)`);
  
  // SAFETY VALVE: If not enough fresh triads, clear old cache
  if (freshTriads.length < CERTAMEN_TRACKING.MIN_FRESH_TRIADS) {
    console.log(`⚠️ Only ${freshTriads.length} fresh triads - activating safety valve`);
    
    // Keep only most recent half of cache (~7-8 games instead of 15)
    const reducedCache = recentPassages.slice(0, Math.floor(CERTAMEN_TRACKING.MAX_BLOCKED / 2));
    localStorage.setItem(CERTAMEN_TRACKING.STORAGE_KEY, JSON.stringify(reducedCache));
    
    // Re-filter with smaller cache
    freshTriads = completeTriads.filter(triad => {
      return !reducedCache.includes(triad[0].group);
    });
    
    console.log(`✅ Cache reduced from ${recentPassages.length} to ${reducedCache.length} passages`);
    console.log(`✅ Fresh triads now: ${freshTriads.length}`);
  }
  
  // Use fresh triads for the game
  const triadsToUse = freshTriads.length > 0 ? freshTriads : completeTriads;
  
  // ✨ WEIGHTED DISTRIBUTION: Select triads based on level-specific distribution
  const distribution = this.getCertamenDistribution(level);
  console.log(`🎯 Using distribution for ${level}:`, distribution);
  
  // Group triads by category
  const triadsByCategory = {};
  triadsToUse.forEach(triad => {
    const category = triad[0].category;
    if (!triadsByCategory[category]) {
      triadsByCategory[category] = [];
    }
    triadsByCategory[category].push(triad);
  });
  
  // ✨ SMART SELECTION: Prioritize never-seen triads over recycled ones
  // Track all-time triad usage (not just recent blocking)
  const allTimeUsed = JSON.parse(
    localStorage.getItem('certamen-all-time-triads') || '[]'
  );
  
  Object.keys(triadsByCategory).forEach(cat => {
    const triads = triadsByCategory[cat];
    
    // Separate into never-seen and previously-seen
    const neverSeen = triads.filter(triad => 
      !allTimeUsed.includes(triad[0].group)
    );
    const previouslySeen = triads.filter(triad => 
      allTimeUsed.includes(triad[0].group)
    );
    
    // Shuffle each group separately
    const shuffledNeverSeen = this.shuffleArray(neverSeen);
    const shuffledPreviouslySeen = this.shuffleArray(previouslySeen);
    
    // Prioritize never-seen first, then previously-seen
    triadsByCategory[cat] = [...shuffledNeverSeen, ...shuffledPreviouslySeen];
    
    console.log(`   🎲 ${cat}: ${neverSeen.length} never-seen, ${previouslySeen.length} recycled`);
  });
  
  // Select triads according to distribution
  const selectedByCategory = {};
  Object.entries(distribution).forEach(([category, count]) => {
    const available = triadsByCategory[category] || [];
    const selected = available.slice(0, count);
    selectedByCategory[category] = this.shuffleArray(selected); // Shuffle within category
    console.log(`   📋 ${category}: selected ${selected.length}/${count} triads (${available.length} available)`);
  });
  
  // ✨ SMART INTERLEAVING: Prevent category clumping using weighted round-robin
  const interleavedTriads = this.interleaveTriadsByCategory(selectedByCategory);
  console.log(`🎮 Game limited to ${interleavedTriads.length} triads (${interleavedTriads.length * 3} questions total)`);
  
  // ✨ Store actual triad count for UI display
  this.actualTriadCount = interleavedTriads.length;
  
  interleavedTriads.forEach(triad => {
    this.questions = this.questions.concat(triad);
  });

  // DEBUG: Check category distribution of triads
const categoryCount = {};
interleavedTriads.forEach(triad => {
  const category = triad[0].category; // Get category from toss-up question
  categoryCount[category] = (categoryCount[category] || 0) + 1;
});

console.log('📊 CATEGORY DISTRIBUTION OF TRIADS:');
Object.entries(categoryCount).forEach(([category, count]) => {
  console.log(`   ${category}: ${count} triads`);
});
  
  console.log(`🏛️ Certamen session ready: ${this.questions.length} questions in ${interleavedTriads.length} complete triads`);
  console.log('Question sequence preview:', this.questions.slice(0, 9).map(q => `${q.dependency}(${q.group})`));
  
  // ✨ FIX: Initialize empty - will be populated as triads are ACTUALLY displayed
  this.usedTriads = [];
  console.log('📝 Tracking will begin as triads are displayed to user');
  
  return this.questions;
}

// Get weighted distribution for certamen based on difficulty level
getCertamenDistribution(level) {
  // Based on agreed distribution from previous discussion
  
  if (level === 'advanced') {
    return {
      'latin-grammar': 4,
      'derivatives': 3,
      'mythology': 4,
      'roman-history-daily-life': 4,
      'literature': 4,
      'ancient-geography': 1
    };
  } else {
    // Novice and Intermediate use the same distribution
    return {
      'latin-grammar': 5,
      'derivatives': 4,
      'roman-history-daily-life': 5,
      'mythology': 4,
      'mottos': 1,
      'ancient-geography': 1
    };
  }
}

// ✨ SMART INTERLEAVING: Prevent category clumping
interleaveTriadsByCategory(selectedByCategory) {
  // Convert to array of [category, triads[]] and sort by count (descending)
  const sortedCategories = Object.entries(selectedByCategory)
    .filter(([_, triads]) => triads.length > 0)
    .sort((a, b) => b[1].length - a[1].length);
  
  if (sortedCategories.length === 0) return [];
  
  const result = [];
  const categoryQueues = {};
  
  // Initialize queues for each category
  sortedCategories.forEach(([category, triads]) => {
    categoryQueues[category] = [...triads];
  });
  
  // Calculate ideal spacing for each category to maximize distribution
  const totalTriads = sortedCategories.reduce((sum, [_, triads]) => sum + triads.length, 0);
  
  // Round-robin interleaving with anti-clumping logic
  while (result.length < totalTriads) {
    let addedThisRound = false;
    
    // Try to add one triad from each category that still has triads
    for (const [category, _] of sortedCategories) {
      if (categoryQueues[category].length > 0) {
        // Anti-clumping check: don't add from same category as last triad
        const lastCategory = result.length > 0 ? result[result.length - 1][0].category : null;
        
        if (lastCategory !== category) {
          // Safe to add from this category
          result.push(categoryQueues[category].shift());
          addedThisRound = true;
        } else if (categoryQueues[category].length > 0) {
          // Last was same category, try to find different category first
          let foundAlternative = false;
          for (const [altCategory, _] of sortedCategories) {
            if (altCategory !== category && categoryQueues[altCategory].length > 0) {
              result.push(categoryQueues[altCategory].shift());
              foundAlternative = true;
              addedThisRound = true;
              break;
            }
          }
          
          // If no alternative found, must use same category (only one category left with triads)
          if (!foundAlternative) {
            result.push(categoryQueues[category].shift());
            addedThisRound = true;
          }
        }
      }
    }
    
    // Safety valve: if no triads were added this round, force add remaining triads
    if (!addedThisRound) {
      for (const [category, _] of sortedCategories) {
        while (categoryQueues[category].length > 0) {
          result.push(categoryQueues[category].shift());
        }
      }
      break;
    }
  }
  
  console.log(`🔀 Interleaved ${result.length} triads to prevent category clumping`);
  
  // Log the sequence for verification
  const sequence = result.map(triad => triad[0].category.substring(0, 4)).join(' → ');
  console.log(`📊 Category sequence: ${sequence}`);
  
  return result;
}

// Save used passages to localStorage for repeat-prevention
saveCertamenPassages() {
  // Track passages for both regular and solo certamen
  if ((this.gameMode !== 'certamen' && this.gameMode !== 'certamen-solo' && this.gameMode !== 'certamen-multiplayer') || !this.usedTriads || this.usedTriads.length === 0) {
    return; // Only track for certamen modes
  }
  
  // Extract passage groups from triads used in this session
  const thisGamePassages = this.usedTriads.map(triad => triad[0].group);
  
  // Get existing recent passages
  const recentPassages = JSON.parse(
    localStorage.getItem(CERTAMEN_TRACKING.STORAGE_KEY) || '[]'
  );
  
  // Add new passages to the front of the array
  const updated = [...thisGamePassages, ...recentPassages];
  
  // Keep only the most recent passages (up to MAX_BLOCKED)
  const trimmed = updated.slice(0, CERTAMEN_TRACKING.MAX_BLOCKED);
  
  // Save to localStorage
  localStorage.setItem(CERTAMEN_TRACKING.STORAGE_KEY, JSON.stringify(trimmed));
  
  // ✨ SMART SELECTION: Also track all-time usage for prioritization
  const allTimeUsed = JSON.parse(
    localStorage.getItem('certamen-all-time-triads') || '[]'
  );
  
  // Add new passages to all-time tracker (don't remove old ones)
  const updatedAllTime = [...new Set([...thisGamePassages, ...allTimeUsed])];
  localStorage.setItem('certamen-all-time-triads', JSON.stringify(updatedAllTime));
  
  console.log(`💾 Saved ${thisGamePassages.length} passages to tracking (${trimmed.length} recent, ${updatedAllTime.length} all-time)`);
  console.log(`📊 Passage IDs saved:`, thisGamePassages.join(', '));
}

// ✨ NEW: Mark a triad as used when it's ACTUALLY displayed to the user
markTriadAsUsed(groupName) {
  // Find the triad with this group name in the questions array
  const triadQuestions = this.questions.filter(q => q.group === groupName);
  
  if (triadQuestions.length >= 3) {
    // Check if we've already tracked this triad
    const alreadyTracked = this.usedTriads.some(triad => triad[0].group === groupName);
    
    if (!alreadyTracked) {
      // Add the first 3 questions (tossup + 2 bonuses) as a triad
      this.usedTriads.push(triadQuestions.slice(0, 3));
    }
  }
}

  // ✨ DEPRECATED: Keep for backward compatibility, but not used for multi-category
  async loadSingleCategoryQuestions(category, level) {
    this.questions = await this.questionLoader.loadQuestions(category, level);
    console.log(`Loaded ${this.questions.length} questions for ${category}-${level}`);
  }

  setupTeams() {
    // For multiplayer, teams will be populated from Firebase with actual player names
    // For regular certamen, just use simple captain labels
    this.teams = [
      { name: '', captain: 'Player 1', score: 0, buzzed: false },
      { name: '', captain: 'Player 2', score: 0, buzzed: false },
      { name: '', captain: 'Player 3', score: 0, buzzed: false }
    ];
    
    console.log('Teams setup without randomization');
  }

  setupSoloPlayer() {
    // Use default player name - no prompt needed
    const playerName = "Solo Player";
    
    this.soloPlayer = {
      name: playerName,
      score: 0,
      buzzed: false,
      triadsCompleted: 0
    };
    
    console.log(`Solo player initialized: ${this.soloPlayer.name}`);
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Interleave questions from different categories to prevent clustering
  interleaveCategories(questions) {
    // Group questions by category
    const categorized = {};
    questions.forEach(q => {
      const category = q.category || 'unknown';
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(q);
    });
    
    console.log('📋 Category distribution before interleaving:', 
      Object.keys(categorized).map(cat => `${cat}: ${categorized[cat].length}`).join(', '));
    
    // Shuffle questions within each category first
    Object.keys(categorized).forEach(cat => {
      categorized[cat] = this.shuffleArray(categorized[cat]);
    });
    
    const result = [];
    let lastCategory = null;
    let consecutiveCheck = [];
    
    // Keep interleaving until we've used all questions
    while (result.length < questions.length) {
      // Get available categories (those that still have questions)
      const availableCategories = Object.keys(categorized).filter(cat => categorized[cat].length > 0);
      
      if (availableCategories.length === 0) break;
      
      // Remove last used category from options to prevent consecutive duplicates
      const options = lastCategory 
        ? availableCategories.filter(cat => cat !== lastCategory)
        : availableCategories;
      
      // If we filtered out all options (only one category left), use what's available
      const categoryPool = options.length > 0 ? options : availableCategories;
      
      // Pick a random category from the pool
      const selectedCategory = categoryPool[Math.floor(Math.random() * categoryPool.length)];
      
      // Add a question from the selected category
      if (categorized[selectedCategory] && categorized[selectedCategory].length > 0) {
        result.push(categorized[selectedCategory].shift());
        consecutiveCheck.push(selectedCategory.substring(0, 1).toUpperCase());
        lastCategory = selectedCategory;
      }
    }
    
    console.log('🔀 Interleaved order:', consecutiveCheck.join('-'));
    
    return result;
  }

  showGameInterface(mode) {
    document.querySelector('.container').style.display = 'none';
    document.body.appendChild(this.createGameInterface(mode));
    
    // Update progress display with actual triad count for certamen modes
    if ((mode === 'certamen' || mode === 'certamen-solo' || mode === 'certamen-multiplayer') && this.actualTriadCount) {
      const progressDisplay = document.getElementById('certamen-progress');
      if (progressDisplay) {
        progressDisplay.textContent = `Round 1 of ${this.actualTriadCount}`;
      }
    }
    
    if (mode === 'certamen' || mode === 'certamen-solo' || mode === 'certamen-multiplayer') {
      // For multiplayer, skip hyperbuzz splash - game is already started in runHostGame
      if (mode === 'certamen-multiplayer') {
        // Multiplayer game start is handled by runHostGame/runPlayerDisplay
        return;
      }
      
      // Check if hyperbuzz message has been seen this session
      const hasSeenThisSession = sessionStorage.getItem('hyperbuzz-seen');
      
      if (!hasSeenThisSession) {
        // First time this session - show splash with button
        this.showHyperbuzzSplash(() => {
          // Mark as seen for this browser session
          sessionStorage.setItem('hyperbuzz-seen', 'true');
          
          // Start the game
          if (mode === 'certamen') {
            this.startCertamenRound();
          } else {
            this.startSoloCertamenRound();
          }
        });
      } else {
        // Already seen this session - start immediately
        if (mode === 'certamen') {
          this.startCertamenRound();
        } else {
          this.startSoloCertamenRound();
        }
      }
    } else {
      this.startSinglePlayerRound(mode);
    }
  }

  showHyperbuzzSplash(callback) {
    // Create splash element
    const splash = document.createElement('div');
    splash.className = 'hyperbuzz-splash';
    splash.innerHTML = `
      <div class="hyperbuzz-splash-content">
        <div class="hyperbuzz-splash-icon">🔔</div>
        <div class="hyperbuzz-splash-text">
          Hyperbuzz anytime during toss-ups. No need to wait for the full question.
        </div>
      </div>
      <button class="hyperbuzz-splash-button" id="hyperbuzz-got-it">Got it! →</button>
    `;
    
    document.body.appendChild(splash);
    
    // Handle button click
    const button = document.getElementById('hyperbuzz-got-it');
    button.addEventListener('click', () => {
      splash.classList.add('fade-out');
      
      // Remove from DOM after fade animation
      setTimeout(() => {
        splash.remove();
        callback();
      }, 500);
    });
  }

createGameInterface(mode) {
    const gameContainer = document.createElement('div');
    gameContainer.className = 'game-container';
    
    // Determine display name for mode
    let modeDisplay = '';
    if (mode === 'certamen-solo') {
      modeDisplay = 'Solo Certamen';
    } else if (mode === 'certamen-multiplayer') {
      modeDisplay = 'Multiplayer Certamen';
    } else {
      modeDisplay = mode.charAt(0).toUpperCase() + mode.slice(1);
    }
    
    gameContainer.innerHTML = `
      <div class="game-header">
        <h2>${modeDisplay} Mode</h2>
        ${(mode === 'certamen' || mode === 'certamen-solo' || mode === 'certamen-multiplayer') ? '<div id="certamen-progress" class="certamen-progress">Round 1 of ...</div>' : ''}
        ${mode === 'practice' ? '<div id="question-progress" class="certamen-progress">Question 1 of ' + this.sessionSize + '</div>' : ''}
        <button id="back-to-setup" class="back-button">← Back to Setup</button>
      </div>
      
      ${mode !== 'timed' ? `
        <div class="question-container">
          <div id="question-display" class="question-display">
            <p>Loading questions...</p>
          </div>
        </div>
      ` : ''}
      
      ${(mode === 'certamen' || mode === 'certamen-multiplayer') ? this.createCertamenInterface() : mode === 'certamen-solo' ? this.createSoloCertamenInterface() : this.createSinglePlayerInterface(mode)}
    `;
    
    gameContainer.querySelector('#back-to-setup').addEventListener('click', () => {
      this.returnToSetup();
    });
    
    return gameContainer;
  }

  createCertamenInterface() {
    // For multiplayer, create hierarchical layout with MY team on top
    if (this.gameMode === 'certamen-multiplayer' && this.myTeamIndex !== null) {
      const myTeam = this.teams[this.myTeamIndex];
      const otherTeams = this.teams.filter((team, index) => index !== this.myTeamIndex);
      const otherIndices = this.teams.map((team, index) => index).filter(index => index !== this.myTeamIndex);
      
      console.log(`🎨 Creating MULTIPLAYER interface: myTeamIndex=${this.myTeamIndex}, myTeam=${myTeam.captain}, otherIndices=${otherIndices.join(',')}`);
      
      return `
        <div class="teams-container">
          <div class="team-scores">
            <!-- My Team - Full width on top -->
            <div class="team-card my-team" id="team-${this.myTeamIndex}">
              <h3>${myTeam.captain}</h3>
              <div class="score">${myTeam.score} points</div>
              <button class="buzz-button" id="buzz-${this.myTeamIndex}">🔔 BUZZ IN</button>
            </div>
            
            <!-- Other Teams Row -->
            <div class="other-teams-row">
              ${otherTeams.map((team, i) => `
                <div class="team-card other-team" id="team-${otherIndices[i]}">
                  <h3>${team.captain}</h3>
                  <div class="score">${team.score} points</div>
                  <button class="buzz-button" id="buzz-${otherIndices[i]}">🔔 BUZZ IN</button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }
    
    console.log(`🎨 Creating DEFAULT (non-multiplayer) interface: gameMode=${this.gameMode}, myTeamIndex=${this.myTeamIndex}`);
    
    // Default layout for local certamen (no hierarchy)
    return `
      <div class="teams-container">
        <div class="team-scores">
          ${this.teams.map((team, index) => `
            <div class="team-card" id="team-${index}">
              <h3>${team.captain}</h3>
              <div class="score">${team.score} points</div>
              <button class="buzz-button" id="buzz-${index}">🔔 BUZZ IN</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  createSoloCertamenInterface() {
    return `
      <div class="teams-container">
        <div class="team-scores solo-player-container">
          <div class="team-card solo-player-card" id="solo-player">
            <h3>${this.soloPlayer.name}</h3>
            <p>Your Score</p>
            <div class="score" id="solo-score">${this.soloPlayer.score} points</div>
            <button class="buzz-button" id="solo-buzz">🔔 BUZZ IN</button>
          </div>
        </div>
      </div>
    `;
  }

  // ✨ ENHANCED: Show session-based progress instead of total questions
  createSinglePlayerInterface(mode) {
    if (mode === 'timed') {
      return `
        <div class="lightning-game-container">
          <div class="lightning-header">
            <div class="timer-display">
              <div class="timer-label">Time Remaining</div>
              <div class="timer-value" id="timer-value">60</div>
            </div>
            <div class="streak-display">
              <div class="streak-label">Streak</div>
              <div class="streak-value" id="streak-value">0</div>
            </div>
            <div class="score-display">
              <div class="score-label">Score</div>
              <div class="score-value" id="player-score">0</div>
            </div>
          </div>
          
          <div class="target-challenge" id="target-challenge">
            🎯 Challenge: Get 5 correct in a row!
          </div>
          
          <div class="combo-message" id="combo-message"></div>
          
          <div class="lightning-question-area" id="lightning-question-area">
            <div class="question-counter">Question <span id="question-counter">1</span></div>
            <div class="question-content" id="question-content">
              Loading first question...
            </div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="single-player-container">
          <div class="review-counter">
            Loading review status...
          </div>
          <div class="player-stats">
          </div>
        </div>
      `;
    }
  }

  // ===================================
  // TIMED MODE - LIGHTNING ROUND
  // ===================================
  startSinglePlayerRound(mode) {
    // ✨ ENHANCED: Session-based completion check
    if (this.currentQuestion >= this.questions.length) {
      this.showSessionComplete();
      return;
    }

    const question = this.questions[this.currentQuestion];
    
    if (mode === 'timed') {
      this.startLightningRound(question);
    } else {
      this.displayQuestion(question);
    }
  }

  // ✨ NEW: Show session completion with option to continue
showSessionComplete() {
  const questionDisplay = document.getElementById('question-display');
  
  // Null check: if user navigated away mid-game, element won't exist
  if (!questionDisplay) {
    console.warn('⚠️ Cannot show session complete - question display element not found (user may have navigated away)');
    return;
  }
  
  // Hide question counter on completion screen
  const questionProgress = document.getElementById('question-progress');
  if (questionProgress) questionProgress.style.display = 'none';
  
  // Hide bookmark button on completion screen
  const bookmarkButton = document.querySelector('.star-button');
  if (bookmarkButton) bookmarkButton.style.display = 'none';
  
  const totalAnswered = this.currentQuestion;
  const reviewCount = this.reviewQuestions ? this.reviewQuestions.size : 0;
  
  questionDisplay.innerHTML = `
    <div class="game-over">
      <h2>🎉 Session Complete!</h2>
      <div class="final-scores">
        <div class="final-score">
          <strong>Questions Completed:</strong> ${totalAnswered}
        </div>
        <div class="final-score">
          <strong>Categories Practiced:</strong> ${selectedCategories.map(formatCategoryName).join(', ')}
        </div>
        <div class="final-score" style="display: none;">
          ${this.saveRecentQuestions(selectedCategories) || ''}
        </div>
        ${this.gameMode === 'practice' && reviewCount > 0 ? 
          `<div class="final-score">
            <strong>Review Queue:</strong> ${reviewCount} questions
          </div>` : ''
        }
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
        <button onclick="game.continueSession()" class="play-again-button explosive">Continue with 25 More</button>
      </div>
    </div>
  `;
}
  // ✨ NEW: Continue session with fresh questions
  async continueSession() {
    console.log('🔄 Continuing session with fresh questions...');
    
    try {
      // Reset question counter for new session
      this.currentQuestion = 0;
      
      // Load fresh questions from the same categories
      if (this.gameMode === 'certamen') {
        await this.loadCertamenQuestions(selectedLevel);
      } else {
        await this.loadMultiCategoryQuestions(selectedCategories, selectedLevel);
      }
      
      this.questions = this.shuffleArray(this.questions);
      console.log(`🔄 New session: ${this.questions.length} fresh questions loaded`);
      
      // Update the display - use header badge and restore visibility
      const questionProgressEl = document.getElementById('question-progress');
      if (questionProgressEl) {
        questionProgressEl.style.display = 'block';
        questionProgressEl.textContent = `Question 1 of ${this.sessionSize}`;
      }
      
      // Start the new session
      this.startSinglePlayerRound(this.gameMode);
      
    } catch (error) {
      console.error('Failed to continue session:', error);
      alert('Failed to load new questions. Please try again.');
    }
  }

  startLightningRound(question) {
    // Initialize lightning game variables on first run
    if (this.lightningStarted === undefined) {
      this.lightningStarted = true;
      
      // Set timer duration based on difficulty level
      if (selectedLevel === 'novice') {
        this.timeRemaining = 60;
      } else if (selectedLevel === 'intermediate') {
        this.timeRemaining = 75;
      } else if (selectedLevel === 'advanced') {
        this.timeRemaining = 90;
      } else {
        this.timeRemaining = 60; // Default fallback
      }
      
      this.currentStreak = 0;
      this.longestStreak = 0;
      this.questionsAnswered = 0;
      this.correctAnswersCount = 0;
      this.targetStreak = 5;
      
      this.updateTimerDisplay();
      this.startLightningTimer();
      
      console.log(`Lightning Round timer started - ${this.timeRemaining} seconds (${selectedLevel} mode)`);
    }

    const questionCounter = document.getElementById('question-counter');
    if (questionCounter) {
      questionCounter.textContent = this.questionsAnswered + 1;
    }

    this.displayLightningQuestion(question);
  }

  startLightningTimer() {
    if (this.lightningTimer) {
      clearInterval(this.lightningTimer);
    }
    
    console.log('Starting Lightning Timer...');
    
    this.lightningTimer = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
        console.log(`Time remaining: ${this.timeRemaining} seconds`);
        
        this.updateTimerDisplay();
        
        if (this.timeRemaining <= 0) {
          console.log('Time up! Ending Lightning Round...');
          this.endLightningRound();
        }
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const timerValue = document.getElementById('timer-value');
    if (timerValue) {
      timerValue.textContent = this.timeRemaining;
      
      const timerDisplay = timerValue.parentElement;
      timerDisplay.classList.remove('timer-warning', 'timer-critical');
      
      // Calculate proportional warning thresholds based on difficulty
      let warningThreshold, criticalThreshold;
      if (selectedLevel === 'novice') {
        warningThreshold = 30;
        criticalThreshold = 10;
      } else if (selectedLevel === 'intermediate') {
        warningThreshold = 37; // ~50% of 75
        criticalThreshold = 13; // ~17% of 75
      } else if (selectedLevel === 'advanced') {
        warningThreshold = 45; // 50% of 90
        criticalThreshold = 15; // ~17% of 90
      } else {
        warningThreshold = 30;
        criticalThreshold = 10;
      }
      
      if (this.timeRemaining <= criticalThreshold) {
        timerDisplay.classList.add('timer-critical');
      } else if (this.timeRemaining <= warningThreshold) {
        timerDisplay.classList.add('timer-warning');
      }
    } else {
      console.warn('Timer display element not found!');
    }
  }

  displayLightningQuestion(question) {
  const questionContent = document.getElementById('question-content');
  if (!questionContent) return;

  // 🔄 RESHUFFLE MC options every time to prevent position memorization across games
  if (question.options && question.options.length > 0) {
    const correctAnswerText = question.options[question.correct];
    question.options = this.shuffleArray([...question.options]);
    question.correct = question.options.indexOf(correctAnswerText);
  }
  
  // 📊 Track questions actually displayed (for repeat prevention in next session)
  if (!this.displayedQuestions.includes(question.id)) {
    this.displayedQuestions.push(question.id);
  }

  questionContent.innerHTML = `
    <h3 class="question-text">${this.cleanQuestionText(question.question)}</h3>
    <div class="lightning-answers">
      ${question.options.map((option, index) => `
        <button class="lightning-answer" data-index="${index}">${option}</button>
      `).join('')}
    </div>
  `;

  this.setupLightningAnswerHandlers(question);
}
  setupLightningAnswerHandlers(question) {
    const answerButtons = document.querySelectorAll('.lightning-answer');
    answerButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        this.handleLightningAnswer(question, index, button);
      });
    });
  }
setupLightningTextHandlers(question) {
  const input = document.getElementById('lightning-input');
  const submitBtn = document.getElementById('lightning-submit');
  
  if (input) {
    input.focus(); // Auto-focus for fast typing
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleLightningTextAnswer(question, input);
      }
    });
  }
  
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      this.handleLightningTextAnswer(question, input);
    });
  }
}
handleLightningTextAnswer(question, input) {
  const userAnswer = input.value.trim();
  if (!userAnswer) return;
  
  const isCorrect = this.compareAnswers(userAnswer, question.answer);
  
  // Disable input
  input.disabled = true;
  const submitBtn = document.getElementById('lightning-submit');
  if (submitBtn) submitBtn.disabled = true;
  
  // Show result briefly
  input.style.background = isCorrect ? '#4CAF50' : '#f44336';
  
  this.questionsAnswered++;
  
  if (isCorrect) {
    this.handleCorrectAnswer(question);
  } else {
    this.handleIncorrectAnswer();
  }

  // Quick transition to next question
  setTimeout(() => {
    this.nextLightningQuestion();
  }, 800);
}

  handleLightningAnswer(question, selectedAnswer, button) {
    const isCorrect = selectedAnswer === question.correct;
    
    // Increment questions answered counter
    this.questionsAnswered++;
    console.log(`Question ${this.questionsAnswered} answered`);
    
    // Update question counter display
    const questionCounter = document.getElementById('question-counter');
    if (questionCounter) {
      questionCounter.textContent = this.questionsAnswered;
    }
    
    // Disable all buttons
    const allButtons = document.querySelectorAll('.lightning-answer');
    allButtons.forEach((btn, index) => {
      btn.disabled = true;
      if (index === question.correct) {
        btn.classList.add('correct');
      } else if (index === selectedAnswer && !isCorrect) {
        btn.classList.add('incorrect');
      }
    });

    if (isCorrect) {
      this.handleCorrectAnswer(question);
    } else {
      this.handleIncorrectAnswer();
    }

    // Quick transition to next question
    setTimeout(() => {
      this.nextLightningQuestion();
    }, 800);
  }

  handleCorrectAnswer(question) {
    this.currentStreak++;
    this.correctAnswersCount++;
    console.log(`Correct answer! Count now: ${this.correctAnswersCount}`);
    
    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }

    // Calculate score with streak multiplier
    const multiplier = Math.min(this.currentStreak, 5); // Max 5x multiplier
    const points = question.points * multiplier;
    this.updatePlayerScore(true, points);

    // Update streak display
    this.updateStreakDisplay();
    
    // Show combo message - SINGLE call only to prevent duplicates
    this.showComboMessage();
    
    // Check target challenge
    this.checkTargetChallenge();
  }

  handleIncorrectAnswer() {
  const hadStreak = this.currentStreak >= 2; // Only show message if there was a meaningful streak
  this.currentStreak = 0;
  this.updateStreakDisplay();
  
  if (hadStreak) {
    this.showComboMessage('streak broken');
  }
  // No message for wrong answers when streak was 0 or 1
}
  updateStreakDisplay() {
    const streakValue = document.getElementById('streak-value');
    
    
    if (streakValue) {
      streakValue.textContent = this.currentStreak;
      if (this.currentStreak >= 3) {
        streakValue.parentElement.classList.add('streak-hot');
      } else {
        streakValue.parentElement.classList.remove('streak-hot');
      }
    }
    
  }

  showComboMessage(type = 'streak') {
    const comboMessage = document.getElementById('combo-message');
    if (!comboMessage) return;

    // Prevent duplicate messages if one is already showing
    if (comboMessage.classList.contains('show')) {
      console.log('Combo message already showing, preventing duplicate');
      return;
    }

    // Clear any existing message first
    comboMessage.className = 'combo-message';
    comboMessage.textContent = '';

    let message = '';
    let className = '';
    let duration = 2500;

    if (type === 'streak broken') {
      message = 'Streak Broken!';
      className = 'combo-broken';
    } else if (this.currentStreak === 10) {
      // LEGENDARY: Only ring, no text message to avoid duplication
      this.createLegendaryRing();
      return;
    } else if (this.currentStreak === 8) {
      // UNSTOPPABLE: No effect to avoid conflicts
      console.log('UNSTOPPABLE streak reached (no effect)');
      return;
    } else if (this.currentStreak === 5) {
      // HOT STREAK: Text message only, particles called separately
      message = 'HOT STREAK!';
      className = 'combo-fire';
      duration = 2000;
      this.createFlameParticles();
    } else if (this.currentStreak === 3) {
      className = 'combo-good';
      this.createRippleEffect();
    }

    // Only show message if we have one
    if (message) {
      comboMessage.textContent = message;
      comboMessage.className = `combo-message ${className} show`;
      
      setTimeout(() => {
        comboMessage.classList.remove('show');
      }, duration);
    }
  }

  // ===================================
  // TIMED MODE - CELEBRATION EFFECTS
  // ===================================
  createLegendaryRing() {
    // Prevent duplicate rings
    const existingRing = document.querySelector('.legendary-ring');
    if (existingRing) {
      console.log('Legendary ring already exists, skipping duplicate');
      return;
    }

    const ring = document.createElement('div');
    ring.innerHTML = 'LEGENDARY<span></span>';
    ring.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 200px;
      height: 200px;
      background: transparent;
      border: 3px solid rgba(135, 206, 235, 0.3);
      border-radius: 50%;
      text-align: center;
      line-height: 200px;
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: #ffd700;
      letter-spacing: 2px;
      text-transform: uppercase;
      text-shadow: 0 0 15px #ffd700;
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
      pointer-events: none;
      z-index: 300;
      will-change: transform;
    `;

    // Check if style already exists
    let existingStyle = document.querySelector('#legendary-ring-style');
    if (!existingStyle) {
      const style = document.createElement('style');
      style.id = 'legendary-ring-style';
      style.textContent = `
        .legendary-ring::before {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          width: calc(100% + 6px);
          height: calc(100% + 6px);
          border: 3px solid transparent;
          border-top: 3px solid #87ceeb;
          border-right: 3px solid #ffd700;
          border-radius: 50%;
          animation: legendaryRotate 2s linear infinite;
        }
        .legendary-ring span {
          display: block;
          position: absolute;
          top: calc(50% - 2px);
          left: 50%;
          width: 50%;
          height: 4px;
          background: transparent;
          transform-origin: left center;
          animation: legendarySpoke 2s linear infinite;
        }
        .legendary-ring span::before {
          content: '';
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ffd700;
          top: -4px;
          right: -6px;
          box-shadow: 0 0 15px #ffd700;
        }
        @keyframes legendaryRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes legendarySpoke {
          0% { transform: rotate(45deg); }
          100% { transform: rotate(405deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    ring.className = 'legendary-ring';
    document.body.appendChild(ring);

    console.log('Legendary ring created and positioned');

    // Remove after 1.5 seconds
    setTimeout(() => {
      if (ring.parentNode) {
        ring.parentNode.removeChild(ring);
        console.log('Legendary ring removed');
      }
    }, 1500);
  }

  createFlameParticles() {
  const container = document.querySelector('.lightning-game-container');
  if (!container) return;

  const flameColors = ['#ff4500', '#ff6b6b', '#ff8c00', '#ffa500', '#dc2626', '#ff1744'];
  
  // Create 40 enhanced particles
  for (let i = 0; i < 40; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.bottom = Math.random() * 20 + 5 + '%'; // Varied starting positions (5-25% from bottom)
    particle.style.left = Math.random() * 100 + '%';
    particle.style.width = Math.random() * 6 + 4 + 'px'; // 4-10px wide
    particle.style.height = Math.random() * 10 + 12 + 'px'; // 12-22px tall
    particle.style.backgroundColor = flameColors[Math.floor(Math.random() * flameColors.length)];
    particle.style.borderRadius = '50% 50% 50% 50% / 60% 60% 40% 40%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '200';
    particle.style.boxShadow = `0 0 10px ${flameColors[Math.floor(Math.random() * flameColors.length)]}, 0 0 20px rgba(255,69,0,0.3)`; // Enhanced glow
    particle.style.animation = `fireRise ${2.5 + Math.random() * 2.5}s ease-out forwards`; // 2.5-5 second duration
    particle.style.animationDelay = Math.random() * 0.6 + 's';
    
    document.body.appendChild(particle);
    
    // Remove after animation completes
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 5500);
  }
}

  createRippleEffect() {
    const scoreElement = document.getElementById('player-score');
    if (!scoreElement) return;

    // Prevent duplicate ripples
    const existingRipples = document.querySelectorAll('.ripple-ring');
    if (existingRipples.length > 0) {
      console.log('Ripple effect already active, skipping duplicate');
      return;
    }

    const rect = scoreElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    console.log('Creating ripple effect at score position');

    // Create 3 ripple rings with delays
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-ring';
        ripple.style.left = centerX + 'px';
        ripple.style.top = centerY + 'px';
        ripple.style.animation = 'rippleExpand 1.5s ease-out forwards';
        document.body.appendChild(ripple);

        setTimeout(() => {
          if (ripple.parentNode) {
            ripple.remove();
          }
        }, 1500);
      }, i * 200);
    }
  }

  checkTargetChallenge() {
    if (this.currentStreak >= this.targetStreak) {
      // Challenge completed! Set new challenge
      this.targetStreak += 3; // Next challenge is +3 more
      const challengeElement = document.getElementById('target-challenge');
      if (challengeElement) {
        challengeElement.textContent = `🎯 Challenge Complete! New target: ${this.targetStreak} in a row!`;
        challengeElement.classList.add('challenge-complete');
        
        setTimeout(() => {
          challengeElement.classList.remove('challenge-complete');
        }, 2000);
      }
    }
  }

  nextLightningQuestion() {
    // Check if game is finished before loading next question
    if (this.gameState === 'finished') {
      return;
    }
    
    this.currentQuestion++;
    
    // Check if we have more questions
    if (this.currentQuestion >= this.questions.length) {
      // Shuffle questions and start over for continuous play
      this.questions = this.shuffleArray(this.questions);
      this.currentQuestion = 0;
    }
    
    const question = this.questions[this.currentQuestion];
    this.startLightningRound(question);
  }

  endLightningRound() {
    if (this.lightningTimer) {
      clearInterval(this.lightningTimer);
    }

    // Debug final game state before saving
    console.log('=== GAME END DEBUG ===');
    console.log('Final playerScore:', this.playerScore);
    console.log('Final questionsAnswered:', this.questionsAnswered);  
    console.log('Final correctAnswersCount:', this.correctAnswersCount);
    console.log('======================');

    // Get previous high score BEFORE saving new score
    let previousHighScore = 0;
    try {
      const savedScores = JSON.parse(localStorage.getItem('certamen-high-scores') || '[]');
      if (savedScores.length > 0) {
        previousHighScore = savedScores[0].score || 0;
      }
    } catch (e) {
      console.warn('Could not load previous high scores:', e);
    }
    console.log('Previous high score was:', previousHighScore);

    // Save high score (only if game actually happened)
    if (this.questionsAnswered > 0) {
      this.saveHighScore();
    } else {
      console.log('No questions answered - skipping score save');
    }

    // Stop any further question loading
    this.gameState = 'finished';

    // Show victory screen with previous high score for comparison
    this.showVictoryScreen(previousHighScore);
  }

  saveHighScore() {
    const currentScore = this.playerScore || 0;
    const correctCount = this.correctAnswersCount || 0;
    const questionsCount = this.questionsAnswered || 0;
    
    console.log('SAVING HIGH SCORE:');
    console.log('- Final Score:', currentScore);
    console.log('- Questions Answered:', questionsCount);
    console.log('- Correct Answers:', correctCount);
    
    let highScores = [];
    
    try {
      highScores = JSON.parse(localStorage.getItem('certamen-high-scores') || '[]');
      
      // Clean up any corrupted scores
      highScores = highScores.filter(score => {
        return typeof score.score === 'number' && 
               typeof score.questionsAnswered === 'number' && 
               typeof score.correctAnswers === 'number' &&
               score.correctAnswers <= score.questionsAnswered;
      });
      
    } catch (e) {
      console.warn('Error loading high scores, starting fresh:', e);
      highScores = [];
    }
    
    // Create the score object
    const now = new Date();
    const scoreObject = {
      score: currentScore,
      questionsAnswered: questionsCount,
      correctAnswers: correctCount,
      date: now.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    };
    
    console.log('Score object to save:', JSON.stringify(scoreObject));
    
    // Add current score
    highScores.push(scoreObject);

    // Sort by score (highest first) and keep top 10
    highScores.sort((a, b) => b.score - a.score);
    const topScores = highScores.slice(0, 10);
    
    console.log('Top scores after sorting:', topScores.map(s => `${s.score}pts (${s.date})`));
    
    try {
      localStorage.setItem('certamen-high-scores', JSON.stringify(topScores));
      console.log('High scores saved successfully');
    } catch (e) {
      console.warn('Could not save high scores to localStorage:', e);
    }
    
    this.highScores = topScores;
  }

  showVictoryScreen(previousHighScore = 0) {
    // Find the correct container for lightning round
    const lightningContainer = document.querySelector('.lightning-question-area');
    const questionContent = document.getElementById('question-content');
    const targetContainer = lightningContainer || questionContent;
    
    if (!targetContainer) return;
    
    // Hide game UI elements
    const questionProgress = document.getElementById('question-progress');
    if (questionProgress) questionProgress.style.display = 'none';
    
    // Debug the actual final values
    console.log('=== VICTORY SCREEN DEBUG ===');
    console.log('this.playerScore:', this.playerScore);
    console.log('this.questionsAnswered:', this.questionsAnswered);
    console.log('this.correctAnswersCount:', this.correctAnswersCount);

    // Use the actual final score from the game
    const finalScore = this.playerScore || 0;
    const totalQuestions = this.questionsAnswered || 0;
    const correctAnswers = this.correctAnswersCount || 0;
    
    // Check if this is a NEW high score (beats previous, not just matches)
    const isNewRecord = finalScore > previousHighScore;
    
    // Check if current score made it into the leaderboard
    const madeLeaderboard = this.highScores && this.highScores.some(score => 
      score.score === finalScore && 
      score.questionsAnswered === totalQuestions && 
      score.correctAnswers === correctAnswers
    );

    console.log('Victory screen displaying:', `${finalScore}pts, ${correctAnswers}/${totalQuestions} correct`);
    console.log('Previous high:', previousHighScore, 'New record?', isNewRecord, 'Made leaderboard?', madeLeaderboard);
    
    // Handle the challenge banner - either show NEW HIGH SCORE or hide it
    const targetChallenge = document.querySelector('.target-challenge');
    if (targetChallenge) {
      if (isNewRecord) {
        // Create confetti particles
        const confettiColors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7931e', '#ff85a2'];
        const confettiHTML = Array.from({ length: 30 }, (_, i) => {
          const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
          const left = Math.random() * 100;
          const delay = Math.random() * 2;
          const duration = (1.4 + Math.random() * 1.4).toFixed(2); // 30% faster: 1.4-2.8s instead of 2-4s
          const shape = Math.random() > 0.5 ? 'circle' : 'square';
          return `<div class="confetti ${shape}" style="left: ${left}%; background: ${color}; animation: confetti-fall ${duration}s ${delay}s ease-in infinite;"></div>`;
        }).join('');
        
        // Show NEW HIGH SCORE with shimmer and confetti
        targetChallenge.innerHTML = `
          <div class="high-score-marquee">
            ${confettiHTML}
            <div class="high-score-text">NEW HIGH SCORE!</div>
          </div>
        `;
        targetChallenge.style.display = 'block';
        targetChallenge.style.background = 'transparent';
        targetChallenge.style.border = 'none';
      } else {
        // Hide the challenge banner
        targetChallenge.style.display = 'none';
      }
    }
    
    targetContainer.innerHTML = `
      <div class="victory-screen">
        <div class="victory-header">
          <h2>⚡ Lightning Round Complete!</h2>
        </div>
        
        ${!madeLeaderboard ? `
          <div class="this-round-summary">
            This Round: ${finalScore} points • ${correctAnswers}/${totalQuestions} correct
          </div>
        ` : ''}

        <div class="leaderboard">
          <h3>🏆 High Scores</h3>
          <div class="leaderboard-list">
            ${this.getLeaderboardHTML(finalScore, totalQuestions, correctAnswers)}
          </div>
        </div>
        
        <button onclick="game.playAgainSameMode()" class="play-again-button explosive">Play Again</button>
        <a onclick="game.clearHighScoresAndRefresh()" class="clear-scores-link">Clear High Scores</a>
      </div>
    `;
  }

  getLeaderboardHTML(currentScore, currentQuestions, currentCorrect) {
    if (!this.highScores || this.highScores.length === 0) {
      return '<div class="no-scores">No high scores yet!</div>';
    }

    return this.highScores.map((score, index) => {
      const questionsAnswered = score.questionsAnswered || 0;
      const correctAnswers = score.correctAnswers || 0;
      const finalScore = score.score || 0;
      const displayDate = score.date || 'Unknown';
      
      // Check if this entry matches the game that just ended
      const isRecentGame = (finalScore === currentScore && 
                           questionsAnswered === currentQuestions && 
                           correctAnswers === currentCorrect);
      
      console.log(`Leaderboard entry ${index + 1}: ${finalScore}pts, ${correctAnswers}/${questionsAnswered} correct, ${displayDate}${isRecentGame ? ' [RECENT GAME]' : ''}`);
      
      return `
        <div class="leaderboard-entry ${index === 0 ? 'first-place' : ''} ${isRecentGame ? 'recent-game' : ''}">
          <span class="rank">#${index + 1}</span>
          <span class="score">${finalScore} pts</span>
          <span class="details">${questionsAnswered} questions, ${correctAnswers}/${questionsAnswered} correct</span>
          <span class="date">${displayDate}</span>
        </div>
      `;
    }).join('');
  }

  updatePlayerScore(isCorrect, points) {
    if (isCorrect) {
      const oldScore = this.playerScore || 0;
      this.playerScore = oldScore + points;
      console.log(`Score update: +${points} points, total now: ${this.playerScore}`);
      
      const scoreElement = document.getElementById('player-score');
      if (scoreElement) {
        scoreElement.textContent = this.playerScore;
        scoreElement.classList.add('scoring');
        scoreElement.parentElement.classList.add('score-update');
        setTimeout(() => {
          scoreElement.parentElement.classList.remove('score-update');
        }, 500);
      }
    }
  }

 // ===================================
// CERTAMEN MODE - START ROUND
// ===================================
startCertamenRound() {
  // ✨ FIX: Don't start a new round if bonus is active or pending
  if (this.bonusState && this.bonusState !== 'none') {
    console.log('⏸️ Skipping round start - bonus round is active or pending');
    return;
  }
  
  // ✨ CHECK IF GAME SHOULD END (completed all passages)
  if (this.currentPassage >= (this.actualTriadCount || CERTAMEN_TRACKING.TRIADS_PER_GAME)) {
    console.log(`🏁 Game complete! Finished ${this.currentPassage} passages.`);
    this.endGame();
    return;
  }
  
  // Check if we're out of questions (safety check)
  if (this.currentQuestion >= this.questions.length) {
    console.log(`🏁 Ran out of questions at index ${this.currentQuestion}`);
    this.endGame();
    return;
  }

  const question = this.questions[this.currentQuestion];
  
  // ✨ INCREMENT PASSAGE COUNTER when starting a new toss-up
  if (question.dependency === 'tossup') {
    this.currentPassage++;
    console.log(`🎯 Starting passage ${this.currentPassage} of ${this.actualTriadCount || CERTAMEN_TRACKING.TRIADS_PER_GAME}`);
    this.updateProgressDisplay();
    
    // ✨ FIX: Mark triad as used ONLY when actually displayed to user
    if (question.group) {
      this.markTriadAsUsed(question.group);
      console.log(`✅ Marked triad "${question.group}" as used`);
    }
  }
  
  // ✨ ENABLE BUZZING - race condition fix
  this.buzzingAllowed = true;
  console.log('🟢 Buzzing enabled for this question');
  
  // 🎮 MULTIPLAYER: Store the current question object for answer processing
  this.currentQuestionObj = question;
  
  this.displayQuestion(question);
  this.enableBuzzers();
  this.disableAnswerOptions();
  
  // 🔥 MULTIPLAYER: Sync question to Firebase
  if (this.isMultiplayer && this.isHost) {
    this.syncQuestionToFirebase(question);
  }
  
  // START PULSING BUZZ BUTTONS
  this.startBuzzButtonPulsing();
}

// ✨ UPDATE PROGRESS DISPLAY for Certamen mode
updateProgressDisplay() {
  const progressDisplay = document.getElementById('certamen-progress');
  if (progressDisplay && (this.gameMode === 'certamen' || this.gameMode === 'certamen-solo' || this.gameMode === 'certamen-multiplayer')) {
    const triadCount = this.actualTriadCount || CERTAMEN_TRACKING.TRIADS_PER_GAME;
    progressDisplay.textContent = `Round ${this.currentPassage} of ${triadCount}`;
  }
}

// ===================================
// SOLO CERTAMEN MODE - START ROUND
// ===================================
startSoloCertamenRound() {
  // ✨ FIX: Don't start a new round if bonus is active or pending
  if (this.bonusState && this.bonusState !== 'none') {
    console.log('⏸️ Skipping round start - bonus round is active or pending');
    return;
  }
  
  // Reset card to normal color (removes full green from previous question)
  // Score badge will remain if player has points
  this.updateSoloPlayerVisualState('normal');
  
  // Check if game should end (completed all passages)
  if (this.currentPassage >= (this.actualTriadCount || CERTAMEN_TRACKING.TRIADS_PER_GAME)) {
    console.log(`🏁 Solo Certamen complete! Finished ${this.currentPassage} passages.`);
    this.endGameSolo();
    return;
  }
  
  // Check if we're out of questions (safety check)
  if (this.currentQuestion >= this.questions.length) {
    console.log(`🏁 Ran out of questions at index ${this.currentQuestion}`);
    this.endGameSolo();
    return;
  }

  const question = this.questions[this.currentQuestion];
  
  // Increment passage counter when starting a new toss-up
  if (question.dependency === 'tossup') {
    this.currentPassage++;
    console.log(`🎯 Starting passage ${this.currentPassage} of ${this.actualTriadCount || CERTAMEN_TRACKING.TRIADS_PER_GAME}`);
    this.updateProgressDisplay();
    
    // Mark triad as used when actually displayed to user
    if (question.group) {
      this.markTriadAsUsed(question.group);
      console.log(`✅ Marked triad "${question.group}" as used`);
    }
  }
  
  // ✨ FIX: Reset timer expiration flag for new round
  this.timerHasExpired = false;
  
  // Enable buzzing
  this.buzzingAllowed = true;
  console.log('🟢 Buzzing enabled for solo player');
  
  this.displayQuestion(question);
  this.enableSoloBuzzer();
  this.disableAnswerOptions();
  
  // Start pulsing buzz button
  this.startBuzzButtonPulsing();
  
  // NOTE: 5-second buzz-in timer will start automatically when reading finishes
  // (handled in finishReading() function - same as regular certamen)
}

// ===================================
// CERTAMEN MODE - END GAME
// ===================================
endGame() {
  console.log('🏁 Ending Certamen game...');
  
  // 💓 Stop host heartbeat on game end
  if (this.isHost) {
    this.stopHostHeartbeat();
  }
  
  // Save used passages for repeat-prevention
  this.saveCertamenPassages();
  
  // Hide progress counter on completion screen
  const certamenProgress = document.getElementById('certamen-progress');
  if (certamenProgress) certamenProgress.style.display = 'none';
  
  // Find the winning team(s)
  const maxScore = Math.max(...this.teams.map(t => t.score));
  const winners = this.teams.filter(t => t.score === maxScore);
  
  // Sort teams by score (descending)
  const sortedTeams = [...this.teams].sort((a, b) => b.score - a.score);
  
  // 🎮 MULTIPLAYER: Sync game-over state to Firebase so all players see victory screen
  if (this.isMultiplayer && this.isHost && this.roomRef && window.updateFirebaseDoc) {
    console.log('📤 HOST: Syncing game-over state to Firebase');
    window.updateFirebaseDoc(this.roomRef, {
      'gameState.gamePhase': 'ended',
      'gameState.finalScores': sortedTeams.map(t => ({ name: t.name, score: t.score })),
      'gameState.winners': winners.map(w => w.name),
      'gameState.endedAt': Date.now()
    });
  }
  
  // Create final scores display
  const questionDisplay = document.getElementById('question-display');
  if (!questionDisplay) {
    console.error('Could not find question-display element');
    return;
  }
  
  let winnerText = '';
  if (winners.length === 1) {
    winnerText = `<h2 class="victory-winner">✨ ${winners[0].name} Wins! ✨</h2>`;
  } else {
    const winnerNames = winners.map(w => w.name).join(' & ');
    winnerText = `<h2 class="victory-tie">✨ Tie Game! ${winnerNames} ✨</h2>`;
  }
  
  // Create confetti particles for winner celebration
  const confettiColors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7931e', '#ff85a2'];
  const confettiHTML = Array.from({ length: 30 }, (_, i) => {
    const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 2;
    const duration = (1.4 + Math.random() * 1.4).toFixed(2);
    const shape = Math.random() > 0.5 ? 'circle' : 'square';
    return `<div class="confetti ${shape}" style="left: ${left}%; background: ${color}; animation: confetti-fall ${duration}s ${delay}s ease-in infinite;"></div>`;
  }).join('');
  
  questionDisplay.innerHTML = `
    <div class="game-over">
      <div class="victory-header" style="position: relative; overflow: hidden;">
        ${confettiHTML}
        ${winnerText}
      </div>
      <div class="final-scores">
        ${sortedTeams.map((team, index) => `
          <div class="final-score ${index === 0 ? 'first-place' : ''}">
            <span class="team-rank">${index + 1}. ${team.name}</span>
            <span class="team-points">${team.score} points</span>
          </div>
        `).join('')}
      </div>
      <div class="victory-actions">
        <button onclick="game.playAgain()" class="play-again-button explosive">Play Again</button>
      </div>
    </div>
  `;
  
  // Hide team cards (they still show BUZZ IN otherwise)
  // Try both selectors - #team-interface for local certamen, .teams-container for multiplayer
  const teamInterface = document.getElementById('team-interface');
  if (teamInterface) {
    teamInterface.style.display = 'none';
  }
  
  // 🎮 MULTIPLAYER FIX: Also hide .teams-container which is used in multiplayer mode
  const teamsContainer = document.querySelector('.teams-container');
  if (teamsContainer) {
    teamsContainer.style.display = 'none';
  }
  
  // Stop any timers
  this.clearQuestionTimer();
  this.stopBuzzButtonPulsing();
}

// ===================================
// SOLO CERTAMEN MODE - END GAME
// ===================================
endGameSolo() {
  console.log('🏁 Ending Solo Certamen game...');
  
  // Save used passages for repeat-prevention
  this.saveCertamenPassages();
  
  // Hide progress counter on completion screen
  const certamenProgress = document.getElementById('certamen-progress');
  if (certamenProgress) certamenProgress.style.display = 'none';
  
  // ✨ BUG FIX: Hide solo player score panel on completion screen
  const soloPlayerPanel = document.querySelector('.solo-player-container');
  if (soloPlayerPanel) soloPlayerPanel.style.display = 'none';
  
  const finalScore = this.soloPlayer.score;
  
  // Create final score display
  const questionDisplay = document.getElementById('question-display');
  if (!questionDisplay) {
    console.error('Could not find question-display element');
    return;
  }
  
  questionDisplay.innerHTML = `
    <div class="game-over">
      <div class="victory-header">
        <h2 class="victory-winner">🎯 Solo Certamen Complete! 🎯</h2>
      </div>
      <div class="final-scores">
        <div class="final-score first-place">
          <span class="team-rank">Final Score</span>
          <span class="team-points">${finalScore} points</span>
        </div>
        <div class="final-score">
          <span class="team-rank">Triads Completed</span>
          <span class="team-points">${this.currentPassage} of ${this.actualTriadCount || CERTAMEN_TRACKING.TRIADS_PER_GAME}</span>
        </div>
      </div>
      <div class="victory-actions">
        <button onclick="game.playAgainSolo()" class="play-again-button explosive">Play Again</button>
      </div>
    </div>
  `;
  
  // Stop any timers
  this.clearQuestionTimer();
  this.stopBuzzButtonPulsing();
}

// Play again Solo Certamen with same settings
async playAgainSolo() {
  console.log('🔄 Play Again Solo button clicked!');
  
  // 🛡️ DEBOUNCE: Prevent rapid double-clicks on Play Again
  if (!buttonClickTracker.canClick('play-again-solo', 1000)) {
    return; // Ignore rapid repeated clicks
  }
  
  try {
    console.log('🔄 Starting new solo game with same settings...');
    console.log('📋 Categories:', selectedCategories);
    console.log('📋 Level:', selectedLevel);
    console.log('📋 Mode:', selectedMode);
    
    // ✨ CRITICAL FIX: Reset game state to allow restart
    this.gameState = 'setup';
    
    this.currentPassage = 0;
    this.currentQuestion = 0;
    this.soloPlayer.score = 0;
    this.soloPlayer.triadsCompleted = 0;
    this.bonusWinningTeam = null;
    
    // Use the global selected settings
    await this.startGame(selectedCategories, selectedLevel, selectedMode);
    console.log('✅ New game started successfully');
  } catch (error) {
    console.error('❌ Error in playAgainSolo:', error);
    alert('Error starting new game: ' + error.message);
  }
}

// Play Again for Timed/Practice modes - restart with same settings
async playAgainSameMode() {
  console.log('🔄 Play Again button clicked for Timed/Practice mode!');
  
  // Prevent multiple rapid clicks
  if (this.isRestarting) {
    console.log('⚠️ Already restarting, ignoring duplicate click');
    return;
  }
  this.isRestarting = true;
  
  try {
    console.log('🔄 Restarting game with same settings...');
    console.log('📋 Categories:', selectedCategories);
    console.log('📋 Level:', selectedLevel);
    console.log('📋 Mode:', selectedMode);
    
    // CRITICAL: Clear ALL timers first to prevent overlapping games
    if (this.lightningTimer) {
      clearInterval(this.lightningTimer);
      this.lightningTimer = null;
      console.log('✅ Cleared lightning timer');
    }
    if (this.answerTimer) {
      clearInterval(this.answerTimer);
      this.answerTimer = null;
    }
    if (this.bonusTimer) {
      clearInterval(this.bonusTimer);
      this.bonusTimer = null;
    }
    if (this.nextRoundTimer) {
      clearTimeout(this.nextRoundTimer);
      this.nextRoundTimer = null;
    }
    
    // Reset game state FIRST
    this.gameState = 'setup';
    
    // Remove old game container completely
    const oldGameContainer = document.querySelector('.game-container');
    if (oldGameContainer) {
      oldGameContainer.remove();
      console.log('✅ Removed old game container');
    }
    
    // Reset scores and progress
    this.currentQuestion = 0;
    this.playerScore = 0;
    this.correctAnswers = 0;
    this.incorrectAnswers = 0;
    this.skippedQuestions = 0;
    this.correctAnswersCount = 0;
    this.questionsAnswered = 0;
    this.currentStreak = 0;
    this.longestStreak = 0;
    this.timeRemaining = 0;
    this.questions = [];
    
    // CRITICAL: Wait for DOM to fully update before starting new game
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Use the global selected settings to restart the game
    await this.startGame(selectedCategories, selectedLevel, selectedMode);
    console.log('✅ Game restarted successfully');
    
    // Reset restart flag
    this.isRestarting = false;
  } catch (error) {
    console.error('❌ Error in playAgainSameMode:', error);
    this.isRestarting = false;
    alert('Error restarting game: ' + error.message);
  }
}

// ===================================
// SOLO CERTAMEN COUNTDOWN TIMER
// ===================================

startSoloCountdownTimer(duration) {
  console.log('⏰ Starting Solo Certamen countdown timer:', duration, 'seconds');
  
  // Clear any existing timer interval
  this.clearSoloCountdownTimer();
  
  this.soloTimeLeft = duration;
  
  // Check if timer already exists in DOM
  let timer = document.getElementById('solo-buzz-timer');
  
  if (!timer) {
    // Create timer if it doesn't exist
    const timerHTML = `
      <div class="solo-buzz-timer" id="solo-buzz-timer">
        <span class="timer-icon">⏰</span>
        <span class="timer-number" id="solo-timer-number">${duration}</span>
      </div>
    `;
    
    // Insert timer into placeholder
    console.log('📍 Inserting timer into placeholder...');
    const placeholder = document.getElementById('timer-placeholder');
    if (placeholder) {
      placeholder.innerHTML = timerHTML;
      console.log('✅ Timer inserted into placeholder');
      timer = document.getElementById('solo-buzz-timer');
    } else {
      console.error('❌ Timer placeholder NOT found!');
      return;
    }
  } else {
    // Timer exists, just update the number
    console.log('♻️ Reusing existing timer element');
    const numberElement = document.getElementById('solo-timer-number');
    if (numberElement) {
      numberElement.textContent = duration;
    }
  }
  
  // Show timer with fade-in
  if (timer) {
    console.log('✅ Timer element ready');
    setTimeout(() => {
      timer.classList.add('visible');
      console.log('✅ Added .visible class to timer');
    }, 50);
  } else {
    console.error('❌ Timer element NOT found!');
    return;
  }
  
  // Start countdown
  this.soloCountdownInterval = setInterval(() => {
    this.soloTimeLeft--;
    this.updateSoloCountdownDisplay();
    
    if (this.soloTimeLeft <= 0) {
      console.log('⏰ Solo countdown expired - moving to next question');
      this.handleSoloCountdownExpired();
    }
  }, 1000);
}

updateSoloCountdownDisplay() {
  const numberElement = document.getElementById('solo-timer-number');
  const timer = document.getElementById('solo-buzz-timer');
  
  if (!numberElement || !timer) return;
  
  // Update number
  numberElement.textContent = this.soloTimeLeft;
  
  // Add warning class when time is running low
  if (this.soloTimeLeft <= 2) {
    timer.classList.add('urgent');
  } else if (this.soloTimeLeft <= 3) {
    timer.classList.add('warning');
  }
}

handleSoloCountdownExpired() {
  this.clearSoloCountdownTimer();
  
  // Only move to next question if player hasn't buzzed
  if (!this.soloPlayer.buzzed) {
    console.log('⏰ No buzz - moving to next question');
    setTimeout(() => {
      this.nextQuestion();
    }, 500);
  }
}

clearSoloCountdownTimer() {
  if (this.soloCountdownInterval) {
    clearInterval(this.soloCountdownInterval);
    this.soloCountdownInterval = null;
  }
  
  const timer = document.getElementById('solo-buzz-timer');
  if (timer) {
    timer.classList.remove('visible');
    // Don't remove from DOM - just hide it to prevent layout shift
  }
}

// Play again with same settings
async playAgain() {
  console.log('🔄 Play Again Certamen button clicked!');
  console.log('🔍 DEBUG: gameMode =', this.gameMode, ', isMultiplayer =', this.isMultiplayer);
  
  // 🛡️ DEBOUNCE: Prevent rapid double-clicks on Play Again
  if (!buttonClickTracker.canClick('play-again-certamen', 1000)) {
    return; // Ignore rapid repeated clicks
  }
  
  try {
    // 🎮 MULTIPLAYER: Return to waiting room instead of starting locally
    // Check BOTH gameMode AND isMultiplayer flag for robustness
    if (this.gameMode === 'certamen-multiplayer' || this.isMultiplayer) {
      console.log('🎮 MULTIPLAYER: Returning to waiting room for new game');
      
      if (this.isHost && this.roomRef && window.updateFirebaseDoc) {
        // HOST: Signal restart and reset game state in Firebase
        await window.updateFirebaseDoc(this.roomRef, {
          'phase': 'waiting',  // Back to waiting room
          'gameState': null,   // Clear old game state
          'restart': Date.now() // Signal to players
        });
        console.log('📤 HOST: Signaled restart to Firebase');
      }
      
      // Both host and players: Go back to waiting room UI
      this.showWaitingRoom();
      return;
    }
    
    // Regular (local) certamen flow below
    console.log('🔄 Starting new certamen game with same settings...');
    console.log('📋 Categories:', selectedCategories);
    console.log('📋 Level:', selectedLevel);
    console.log('📋 Mode:', selectedMode);
    
    // ✨ CRITICAL FIX: Reset game state to allow restart
    this.gameState = 'setup';
    
    // Reset all game state
    this.currentPassage = 0;
    this.currentQuestion = 0;
    this.teams.forEach(team => {
      team.score = 0;
      team.triadsCompleted = 0;
    });
    this.eliminatedTeams.clear();
    this._lastBuzzerState = null; // Reset buzzer state cache
    this.teamBuzzedIn = null;
    this.bonusWinningTeam = null;
    
    // Use the global selected settings
    await this.startGame(selectedCategories, selectedLevel, selectedMode);
    console.log('✅ New certamen game started successfully');
  } catch (error) {
    console.error('❌ Error in playAgain:', error);
    alert('Error starting new game: ' + error.message);
  }
}

// 🎮 MULTIPLAYER: Show the waiting room screen for Play Again
showWaitingRoom() {
  console.log('📺 Showing waiting room for new game');
  
  // Clear the game container
  const gameContainer = document.querySelector('.game-container');
  if (gameContainer) {
    gameContainer.remove();
  }
  
  // Reset game state
  this._gameEnded = false;
  this._hostDisconnectShown = false;
  this.currentPassage = 0;
  this.currentQuestion = 0;
  this.eliminatedTeams.clear();
  this._lastBuzzerState = null;
  this.teamBuzzedIn = null;
  this.bonusWinningTeam = null;
  
  // Reset team scores
  if (this.teams) {
    this.teams.forEach(team => {
      team.score = 0;
    });
  }
  
  // Create waiting room UI
  const waitingRoom = document.createElement('div');
  waitingRoom.className = 'game-container';
  waitingRoom.innerHTML = `
    <div class="multiplayer-waiting-room" style="
      text-align: center; 
      padding: 3rem 2rem;
      max-width: 400px;
      margin: 0 auto;
    ">
      <h2 style="
        color: white; 
        margin-bottom: 2rem;
        font-weight: 300;
        font-size: 1.5rem;
        letter-spacing: 0.05em;
      ">Ready for Next Round</h2>
      
      <div style="
        background: rgba(255,255,255,0.05); 
        padding: 1.5rem; 
        border-radius: 12px; 
        margin-bottom: 2rem;
        border: 1px solid rgba(255,255,255,0.1);
      ">
        <p style="
          color: rgba(255,255,255,0.5); 
          margin-bottom: 0.5rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        ">Room Code</p>
        <p style="
          font-size: 2rem; 
          font-weight: 600; 
          color: #ffd700; 
          letter-spacing: 0.3em;
          font-family: monospace;
        ">${this.roomCode}</p>
      </div>
      
      <div style="margin-bottom: 2rem;">
        <p style="
          color: rgba(255,255,255,0.5); 
          margin-bottom: 1rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        ">Players</p>
        ${this.teams.map((team, i) => `
          <div style="
            color: rgba(255,255,255,0.9); 
            padding: 0.5rem;
            font-size: 1rem;
          ">
            ${team.name}${i === 0 ? ' · Host' : ''}${i === this.myTeamIndex ? ' (you)' : ''}
          </div>
        `).join('')}
      </div>
      
      ${this.isHost ? `
        <button id="start-new-game-btn" style="
          background: linear-gradient(135deg, #4ade80, #22c55e);
          color: white;
          border: none;
          padding: 1rem 2.5rem;
          font-size: 1rem;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(74, 222, 128, 0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          letter-spacing: 0.05em;
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 25px rgba(74, 222, 128, 0.4)';"
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px rgba(74, 222, 128, 0.3)';">
          Start New Game
        </button>
      ` : `
        <p style="
          color: rgba(255,255,255,0.5);
          font-size: 0.9rem;
          font-style: italic;
        ">Waiting for host to start...</p>
      `}
      
      <button onclick="game.returnToSetup()" style="
        background: transparent;
        color: rgba(255,255,255,0.4);
        border: 1px solid rgba(255,255,255,0.2);
        padding: 0.6rem 1.2rem;
        margin-top: 1.5rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.85rem;
        transition: all 0.2s ease;
      " onmouseover="this.style.borderColor='rgba(255,255,255,0.4)'; this.style.color='rgba(255,255,255,0.7)';"
         onmouseout="this.style.borderColor='rgba(255,255,255,0.2)'; this.style.color='rgba(255,255,255,0.4)';">
        ← Leave Room
      </button>
    </div>
  `;
  
  document.body.appendChild(waitingRoom);
  
  // HOST: Add click handler for start button
  if (this.isHost) {
    const startBtn = document.getElementById('start-new-game-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startNewMultiplayerGame());
    }
  }
}

// 🎮 HOST: Start a new multiplayer game from waiting room
async startNewMultiplayerGame() {
  console.log('🎮 HOST: Starting new multiplayer game');
  
  if (!this.isHost || !this.roomRef) {
    console.error('Not host or no room ref');
    return;
  }
  
  try {
    // Signal countdown to all players
    await window.updateFirebaseDoc(this.roomRef, {
      'phase': 'countdown',
      'countdownStart': Date.now()
    });
    
    // Remove waiting room UI
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
      gameContainer.remove();
    }
    
    // Show countdown and start game (reuse existing countdown logic)
    this.showCountdown(async () => {
      // Reset game state for new game
      this.currentPassage = 0;
      this.currentQuestion = 0;
      this._gameEnded = false;
      this.eliminatedTeams.clear();
      this._lastBuzzerState = null;
      this.teamBuzzedIn = null;
      this.bonusWinningTeam = null;
      this.bonusState = 'none';
      
      // Reset team scores
      if (this.teams) {
        this.teams.forEach(team => {
          team.score = 0;
        });
      }
      
      // Recreate the game interface
      this.showGameInterface('certamen-multiplayer');
      
      // After countdown, start the actual game
      await this.runHostGame();
    });
    
  } catch (error) {
    console.error('Error starting new game:', error);
  }
}

// 🎮 Show countdown animation
showCountdown(onComplete) {
  const countdownOverlay = document.createElement('div');
  countdownOverlay.id = 'countdown-overlay';
  countdownOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(22, 33, 62, 0.95));
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(10px);
  `;
  
  countdownOverlay.innerHTML = `
    <div style="text-align: center;">
      <div id="countdown-number" style="
        font-size: 5rem;
        font-weight: 300;
        color: #ffd700;
        text-shadow: 0 0 40px rgba(255, 215, 0, 0.3);
        letter-spacing: 0.1em;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        transition: transform 0.2s ease, opacity 0.2s ease;
      ">3</div>
      <p style="
        color: rgba(255, 255, 255, 0.6);
        font-size: 1rem;
        margin-top: 1.5rem;
        font-weight: 300;
        letter-spacing: 0.2em;
        text-transform: uppercase;
      ">Get Ready</p>
    </div>
  `;
  
  document.body.appendChild(countdownOverlay);
  
  const countdownNumber = document.getElementById('countdown-number');
  let count = 3;
  
  const countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      // Subtle pulse animation
      countdownNumber.style.transform = 'scale(1.1)';
      countdownNumber.style.opacity = '0.8';
      setTimeout(() => {
        countdownNumber.style.transform = 'scale(1)';
        countdownNumber.style.opacity = '1';
      }, 100);
      countdownNumber.textContent = count;
    } else {
      clearInterval(countdownInterval);
      countdownNumber.textContent = 'GO';
      countdownNumber.style.color = '#4ade80';
      countdownNumber.style.fontSize = '4rem';
      countdownNumber.style.fontWeight = '600';
      
      setTimeout(() => {
        countdownOverlay.style.opacity = '0';
        countdownOverlay.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
          countdownOverlay.remove();
          if (onComplete) onComplete();
        }, 300);
      }, 400);
    }
  }, 1000);
}

// ===================================
// QUESTION DISPLAY & ANSWER HANDLING
// ===================================
displayQuestion(question) {
  // ✨ BUG FIX: Track when question starts to prevent instant skipping
  this.questionStartTime = Date.now();
  
  // 🛡️ DEBOUNCE RESET: Clear answer click tracking for new question
  buttonClickTracker.reset('answer-submit');
  buttonClickTracker.reset('text-submit');
  
  const questionDisplay = document.getElementById('question-display');
  
  // ✅ CRITICAL: Make sure question container is visible
  if (questionDisplay) {
    questionDisplay.style.display = 'block';
    questionDisplay.style.visibility = 'visible';
  }
  
  // Also ensure parent container is visible
  const questionContainer = document.querySelector('.question-container');
  if (questionContainer) {
    questionContainer.style.display = 'block';
    questionContainer.style.visibility = 'visible';
  }
  
  // 🔄 RESHUFFLE MC options in review mode to prevent position memorization
  if (this.retryMode && question.options && question.options.length > 0) {
    const correctAnswerText = question.options[question.correct];
    question.options = this.shuffleArray([...question.options]);
    question.correct = question.options.indexOf(correctAnswerText);
  }
  
  // 📊 Track questions actually displayed (for Timed/Practice repeat prevention)
  if ((this.gameMode === 'timed' || this.gameMode === 'practice') && !this.retryMode) {
    if (!this.displayedQuestions.includes(question.id)) {
      this.displayedQuestions.push(question.id);
    }
  }
  
  // Show question type label based on game mode
  let questionTypeLabel = '';
  if (this.gameMode === 'certamen-solo') {
    questionTypeLabel = '<div class="question-type">TOSSUP</div>';
  } else if (this.gameMode === 'certamen' || this.gameMode === 'certamen-multiplayer') {
    questionTypeLabel = '<div class="question-type">TOSSUP</div>';
  } else {
    questionTypeLabel = `<div class="question-type">${this.getCategoryDisplayText(question.category)}</div>`;
  }
  
  questionDisplay.innerHTML = `
    <div class="question-content">
     ${questionTypeLabel}
     <div class="timer-placeholder" id="timer-placeholder">
       <div class="question-timer-box" id="question-timer-box" style="visibility: hidden; min-width: 70px; min-height: 30px;">
         <span class="timer-icon">⏰</span>
         <span id="question-timer">0</span>
       </div>
     </div>
      <h3 id="question-text-display">${(this.gameMode === 'certamen' || this.gameMode === 'certamen-solo' || this.gameMode === 'certamen-multiplayer') ? '' : this.cleanQuestionText(question.question)}</h3>
      ${this.createAnswerOptions(question)}
    </div>
  `;
  
  console.log('✅ Question display updated and visible');
  
  this.setupAnswerHandlers(question);
  
  // Add buzz-in reminder for text input - FOR ALL CERTAMEN MODES
  if (this.gameMode === 'certamen' || this.gameMode === 'certamen-solo' || this.gameMode === 'certamen-multiplayer') {
    setTimeout(() => {
      const answerInput = document.getElementById('answer-input');
      
      if (answerInput) {
        // 🎮 MULTIPLAYER FIX: Check if this player is currently answering
        const isMyTurnToAnswer = this.gameMode === 'certamen-multiplayer' && 
                                  this.teamBuzzedIn === this.myTeamIndex;
        
        // ENABLE the input so it can receive events, but prevent typing UNLESS it's our turn
        answerInput.disabled = false;
        answerInput.readOnly = !isMyTurnToAnswer; // Allow typing if it's our turn
        
        if (isMyTurnToAnswer) {
          console.log('🎮 PLAYER: Text input enabled for answering (readOnly=false)');
          answerInput.focus();
        }
        
        // Disable autocomplete
        answerInput.setAttribute('autocomplete', 'off');
        answerInput.setAttribute('autocorrect', 'off');
        answerInput.setAttribute('autocapitalize', 'off');
        answerInput.setAttribute('spellcheck', 'false');
        
        // Remove any existing handlers
        answerInput.removeEventListener('focus', answerInput.buzzReminderHandler);
        answerInput.removeEventListener('click', answerInput.buzzClickHandler);
        answerInput.removeEventListener('keydown', answerInput.buzzKeyHandler);
        
        // Create handlers
        answerInput.buzzReminderHandler = () => {
          const notBuzzedIn = (this.gameMode === 'certamen' || this.gameMode === 'certamen-solo' || this.gameMode === 'certamen-multiplayer') 
            ? (this.gameMode === 'certamen' || this.gameMode === 'certamen-multiplayer' ? this.teamBuzzedIn === null : !this.soloPlayer?.buzzed)
            : false;
          if (notBuzzedIn) {
            answerInput.placeholder = 'Please buzz in first!';
            answerInput.classList.add('buzz-reminder-red');
            answerInput.blur();
            setTimeout(() => {
              answerInput.placeholder = 'Type your answer...';
              answerInput.classList.remove('buzz-reminder-red');
            }, 2000);
          }
        };
        
        // Prevent typing before buzz-in
        answerInput.buzzKeyHandler = (e) => {
          const notBuzzedIn = (this.gameMode === 'certamen' || this.gameMode === 'certamen-solo' || this.gameMode === 'certamen-multiplayer')
            ? (this.gameMode === 'certamen' || this.gameMode === 'certamen-multiplayer' ? this.teamBuzzedIn === null : !this.soloPlayer?.buzzed)
            : false;
          if (notBuzzedIn) {
            e.preventDefault();
            answerInput.buzzReminderHandler();
          }
        };
        
        // Attach handlers
        answerInput.addEventListener('focus', answerInput.buzzReminderHandler);
        answerInput.addEventListener('click', answerInput.buzzReminderHandler);
        answerInput.addEventListener('keydown', answerInput.buzzKeyHandler);
      }
    }, 100);
  }
  
  // Start word-by-word reading for Certamen modes
  if (this.gameMode === 'certamen' || this.gameMode === 'certamen-solo' || this.gameMode === 'certamen-multiplayer') {
    this.startWordByWordReading(question);
  }
  
  // Add star button for Practice mode
  if (this.gameMode === 'practice') {
    const questionContainer = document.querySelector('.question-container');
    if (questionContainer) {
      const existingStar = questionContainer.querySelector('.star-button');
      if (existingStar) {
        existingStar.remove();
      }
      
      const starButton = document.createElement('button');
      starButton.className = 'star-button unstarred';
      starButton.innerHTML = '📌 Bookmark';
      starButton.title = 'Mark for review';
      starButton.type = 'button';
      
      starButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleStar(question);
      });
      
      questionContainer.appendChild(starButton);
      
      // Add "← Practice" button when in review mode
      if (this.retryMode) {
        const existingPractice = questionContainer.querySelector('.return-practice-button');
        if (existingPractice) {
          existingPractice.remove();
        }
        
        const practiceButton = document.createElement('button');
        practiceButton.className = 'return-practice-button';
        practiceButton.innerHTML = '← Practice';
        practiceButton.title = 'Return to practice mode';
        practiceButton.type = 'button';
        
        practiceButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.exitRetryMode();
        });
        
        questionContainer.appendChild(practiceButton);
      }
            
      setTimeout(() => {
        this.updateStarDisplay(question);
      }, 100);
    }
  }
}

// ===================================
// CERTAMEN MODE - WORD-BY-WORD READING
// ===================================
  startWordByWordReading(question) {
    // 🎮 MULTIPLAYER FIX: Only host runs word-by-word simulation
    // Players display words based on Firebase updates
    if (this.gameMode === 'certamen-multiplayer' && !this.isHost) {
      console.log('📺 PLAYER: Waiting for host to control word-by-word reading');
      // Initialize state for players to track words
      this.questionWords = question.question.split(' ');
      this.currentWordIndex = 0;
      this.partialQuestion = '';
      return; // Exit - players don't run the simulation
    }
    
    this.isReading = true;
    this.currentWordIndex = 0;
    this.questionWords = question.question.split(' ');
    this.partialQuestion = '';
    this.eliminatedTeams.clear();
    this._lastBuzzerState = null; // Reset buzzer state cache
    
    if (this.readingTimeout) {
      clearTimeout(this.readingTimeout);
    }
    
    this.readNextWord(question);
  }

  readNextWord(question) {
    if (!this.isReading || this.currentWordIndex >= this.questionWords.length) {
      this.finishReading(question);
      return;
    }
    
    const nextWord = this.questionWords[this.currentWordIndex];
    if (this.currentWordIndex === 0) {
      this.partialQuestion = nextWord;
    } else {
      this.partialQuestion += ' ' + nextWord;
    }
    this.currentWordIndex++;
    
    this.updateQuestionDisplay(this.partialQuestion, false);
    
    // 🎮 MULTIPLAYER FIX: Host syncs word index to Firebase for synchronized display
    if (this.gameMode === 'certamen-multiplayer' && this.isHost) {
      this.syncWordIndexToFirebase(this.currentWordIndex, this.partialQuestion);
    }
    
    this.readingTimeout = setTimeout(() => {
      this.readNextWord(question);
    }, this.readingSpeed);
  }

  updateQuestionDisplay(displayText, isPartialAfterBuzz = false) {
    const questionTextEl = document.getElementById('question-text-display');
    if (questionTextEl) {
      questionTextEl.textContent = displayText;
      
      if (isPartialAfterBuzz) {
        questionTextEl.style.color = '#ffa500';
        questionTextEl.title = 'Partial question - reading stopped when team buzzed';
      } else {
        questionTextEl.style.color = '#ffffff';
        questionTextEl.title = '';
      }
    }
  }

  // Clear the question display immediately (for clean transitions)
  clearQuestionDisplay() {
    // Clear question text
    const questionTextEl = document.getElementById('question-text-display');
    if (questionTextEl) {
      questionTextEl.textContent = '';
    }
    
    // ✅ DON'T hide the container - just clear the content
    // This prevents the "invisible question" bug
    
    // Hide bonus question container if visible
    const bonusContainer = document.querySelector('.bonus-question-container');
    if (bonusContainer) {
      bonusContainer.style.display = 'none';
    }
  }

  stopReading() {
  // Only log and process if reading was actually active
  if (!this.isReading) {
    return; // Prevent duplicate messages when already stopped
  }
  
  console.log('⏸️ READING STOPPED - Someone buzzed!');
  console.log(`⏹️ Stopped at word ${this.currentWordIndex}/${this.questionWords.length}`);
  console.log(`📖 Partial: "${this.partialQuestion}"`);
  
  this.isReading = false;
  
  if (this.readingTimeout) {
    clearTimeout(this.readingTimeout);
    this.readingTimeout = null;
  }
  
  // 🎮 MULTIPLAYER FIX: Sync reading stopped state to Firebase
  if (this.gameMode === 'certamen-multiplayer' && this.isHost) {
    this.syncWordIndexToFirebase(this.currentWordIndex, this.partialQuestion);
  }
}

finishReading(question) {
  console.log('✅ Reading finished naturally - checking if anyone buzzed');
  this.isReading = false;
  
  if (this.readingTimeout) {
    clearTimeout(this.readingTimeout);
    this.readingTimeout = null;
  }
  
  // 🎮 MULTIPLAYER FIX: Sync reading completion to Firebase
  if (this.gameMode === 'certamen-multiplayer' && this.isHost) {
    this.syncWordIndexToFirebase(this.questionWords.length, question.question);
  }
  
  // 🎮 MULTIPLAYER FIX: Only host starts timers
  if (this.gameMode === 'certamen-multiplayer' && !this.isHost) {
    console.log('⏰ PLAYER: Waiting for host to start timer');
    return;
  }
  
  // ✨ FIX: Don't start countdown if player already buzzed or timer expired
  if (this.gameMode === 'certamen-solo' && this.soloPlayer.buzzed) {
    console.log('⏭️ Player already buzzed - skipping countdown');
    return;
  }
  
  if (this.timerHasExpired) {
    console.log('⏭️ Timer expired - skipping countdown');
    return;
  }
  
  // CRITICAL: Ensure answer options are disabled during buffer period
  this.disableAnswerOptions();
  
  // ✨ USE SEPARATE TIMER SYSTEMS for Solo vs Regular Certamen
  if (this.gameMode === 'certamen-solo') {
    // Solo Certamen: Use dedicated circular countdown timer
    this.startSoloCountdownTimer(5);
  } else {
    // Regular Certamen: 8-second initial buzz-in timer
    this.startQuestionTimer(8, 'buzz-in');
  }
}


  // ===================================
  // GAME FLOW & NAVIGATION  
  // ===================================
nextQuestion() {
  const currentQ = this.questions[this.currentQuestion];
  const beforeIndex = this.currentQuestion;
  
  // Handle unanswered toss-ups (no one buzzed OR all teams eliminated)
  const allTeamsEliminated = this.eliminatedTeams && this.eliminatedTeams.size >= this.teams.length;
  if ((this.gameMode === 'certamen' || this.gameMode === 'certamen-multiplayer') && currentQ && currentQ.dependency === 'tossup' && 
    (this.teamBuzzedIn === null || allTeamsEliminated)) {
    console.log(`⏭️ nextQuestion: ${beforeIndex} → ${beforeIndex + 3} (unanswered tossup, skip +3)`);
    this.currentQuestion += 3; // Skip current toss-up + 2 bonus questions
  } else if (this.gameMode === 'certamen-solo' && currentQ && currentQ.dependency === 'tossup' && 
    !this.soloPlayer.buzzed) {
    console.log(`⏭️ nextQuestion: ${beforeIndex} → ${beforeIndex + 3} (unanswered solo tossup, skip +3)`);
    this.currentQuestion += 3; // Skip current toss-up + 2 bonus questions
  } else {
    console.log(`⏭️ nextQuestion: ${beforeIndex} → ${beforeIndex + 1} (normal increment)`);
    this.currentQuestion++; // Normal increment for answered questions
  }

  
  // CRITICAL: Clear ALL timeouts first to prevent interference
  if (this.lateBufferTimeout) {
    clearTimeout(this.lateBufferTimeout);
    this.lateBufferTimeout = null;
  }
  
  // ✨ FIX: Reset timer expiration flag for new question
  this.timerHasExpired = false;
  
  // CRITICAL: Reset state for new toss-up question
  if (this.gameMode === 'certamen' || this.gameMode === 'certamen-multiplayer') {
    this.eliminatedTeams.clear();  // Clear eliminations from previous question
    this._lastBuzzerState = null;  // 🔧 FIX: Reset buzzer state cache so enableBuzzers() will re-add listeners
    this.teamBuzzedIn = null;      // Reset buzz state
    this.resetAllTeamVisualStates(); // Reset all visual states for new question
    
    // 🎮 MULTIPLAYER: Sync teamBuzzedIn reset to Firebase
    if (this.gameMode === 'certamen-multiplayer' && this.isHost && this.roomRef) {
      window.updateFirebaseDoc(this.roomRef, {
        'gameState.teamBuzzedIn': null,
        'gameState.buzzPhase': 'waiting'
      });
      console.log('📤 HOST: Synced teamBuzzedIn=null for new question');
    }
  } else if (this.gameMode === 'certamen-solo') {
    this.soloPlayer.buzzed = false;  // Reset buzz state for solo player
    this.resetSoloPlayerVisualState(); // Reset visual state
  }
  
  
  // Clear all timers
  if (this.answerTimer) {
    clearInterval(this.answerTimer);
    this.answerTimer = null;
  }
  if (this.bonusTimer) {
    clearInterval(this.bonusTimer);
    this.bonusTimer = null;
  }
  
  // ✨ PREVENTATIVE FIX: Clear mode-specific countdown timers
  if (this.gameMode === 'certamen-solo') {
    this.clearSoloCountdownTimer();  // Solo Certamen 5-second countdown
  } else if (this.gameMode === 'certamen' || this.gameMode === 'certamen-multiplayer') {
    this.clearQuestionTimer();        // Regular Certamen 5-second buzz-in timer
  }
  
  // ✨ ADDITIONAL SAFETY: Clear game flow timers that could trigger nextQuestion()
  if (this.allEliminatedTimer) {
    clearTimeout(this.allEliminatedTimer);
    this.allEliminatedTimer = null;
  }
  if (this.bonusCompleteTimer) {
    clearTimeout(this.bonusCompleteTimer);
    this.bonusCompleteTimer = null;
  }
  
  this.hideVisualTimer();
  
  // Clear word-by-word reading state
  if (this.gameMode === 'certamen' || this.gameMode === 'certamen-multiplayer') {
    this.stopReading();
    this.isReading = false;
    this.currentWordIndex = 0;
    this.questionWords = [];
    this.partialQuestion = '';
  }
  
  // Clear bonus state
  this.bonusState = 'none';
  this.bonusWinningTeam = null;
  this.currentBonusQuestion = 0;
  this.bonusQuestions = [];
  this.bonusTimeLeft = 0;
  
  // Enhanced: Session-based progress for Practice/Timed mode - update header badge
  const questionProgressEl = document.getElementById('question-progress');
  if (questionProgressEl && this.currentQuestion < this.sessionSize) {
    questionProgressEl.textContent = `Question ${this.currentQuestion + 1} of ${this.sessionSize}`;
  }
  
  // Remove active states
  document.querySelectorAll('.team-card').forEach(card => {
    card.classList.remove('active');
  });
  
  // Reset buzz buttons to normal state
  this.teams.forEach((team, index) => {
    const buzzButton = document.getElementById(`buzz-${index}`);
    const floatingButton = document.getElementById(`floating-buzz-${index}`);
    
    if (buzzButton) {
      buzzButton.disabled = false;
      buzzButton.classList.remove('buzzed-active', 'buzzed-inactive', 'eliminated', 'bonus-disabled');
      buzzButton.textContent = '🔔 BUZZ IN';
      buzzButton.style.background = '';
      buzzButton.style.color = '';
      // 🎮 FIX: Reset display property that may have been set to 'none' during bonus
      buzzButton.style.display = '';
    }
    
    if (floatingButton) {
      floatingButton.disabled = false;
      floatingButton.classList.remove('buzzed-active', 'buzzed-inactive', 'eliminated', 'bonus-disabled');
      floatingButton.textContent = team.name;
      floatingButton.style.background = '';
      floatingButton.style.color = '';
    }
  });
  
  this.nextRoundTimer = setTimeout(() => {
    if (this.gameMode === 'certamen' || this.gameMode === 'certamen-multiplayer') {
      this.startCertamenRound();
    } else if (this.gameMode === 'certamen-solo') {
      this.startSoloCertamenRound();
    } else {
      this.startSinglePlayerRound(this.gameMode);
    }
  }, 1000);
}

returnToSetup() {
  // 💓 HOST: Stop heartbeat and notify players
  if (this.isHost && this.gameMode === 'certamen-multiplayer') {
    this.stopHostHeartbeat();
    
    // Notify players that host left intentionally
    if (this.roomRef && window.updateFirebaseDoc) {
      window.updateFirebaseDoc(this.roomRef, {
        'hostLeft': true
      }).catch(err => console.warn('Could not notify players of host leaving:', err));
    }
  }
  
  // Save tracking data BEFORE clearing state
  this.saveCertamenPassages();      // For Certamen mode
  if (selectedCategories && selectedCategories.length > 0) {
    this.saveRecentQuestions(selectedCategories);  // For Practice/Timed modes
  }
  
  // CRITICAL: Clear Certamen/reading state BEFORE resetting gameMode
  // (Otherwise the if check below will never work!)
  if (this.gameMode === 'certamen' || this.gameMode === 'certamen-solo' || this.gameMode === 'certamen-multiplayer') {
    this.stopReading();
    this.isReading = false;
    this.currentWordIndex = 0;
    this.questionWords = [];
    this.partialQuestion = '';
    if (this.eliminatedTeams) {
      this.eliminatedTeams.clear();
    }
    this._lastBuzzerState = null; // Reset buzzer state cache
  }
  
  // Clear ALL timers and intervals
  if (this.answerTimer) {
    clearInterval(this.answerTimer);
    this.answerTimer = null;
  }
  if (this.bonusTimer) {
    clearInterval(this.bonusTimer);
    this.bonusTimer = null;
  }
  if (this.lightningTimer) {
    clearInterval(this.lightningTimer);
    this.lightningTimer = null;
  }
  if (this.lateBufferTimeout) {
    clearTimeout(this.lateBufferTimeout);
    this.lateBufferTimeout = null;
  }
  
  // Clear game flow timers (prevent phantom timers after navigation)
  if (this.nextRoundTimer) {
    clearTimeout(this.nextRoundTimer);
    this.nextRoundTimer = null;
  }
  if (this.allEliminatedTimer) {
    clearTimeout(this.allEliminatedTimer);
    this.allEliminatedTimer = null;
  }
  if (this.bonusCompleteTimer) {
    clearTimeout(this.bonusCompleteTimer);
    this.bonusCompleteTimer = null;
  }
  if (this.bonusStartTimer) {
    clearTimeout(this.bonusStartTimer);
    this.bonusStartTimer = null;
  }
  
  if (this.readingInterval) {
    clearInterval(this.readingInterval);
    this.readingInterval = null;
  }
  
  this.gameState = 'setup';

  // ENHANCED CLEANUP: Remove ALL game-related elements
  const gameContainer = document.querySelector('.game-container');
  if (gameContainer) {
    gameContainer.remove();
  }
  
  // Also remove any floating buzz buttons that might remain
  const floatingBuzzButtons = document.querySelectorAll('[id^="floating-buzz"], #floating-solo-buzz');
  floatingBuzzButtons.forEach(btn => btn.remove());
  
  // Remove any team cards or solo player cards that might remain
  const teamCards = document.querySelectorAll('.team-card, #solo-player');
  teamCards.forEach(card => card.remove());
  
  // Remove any leftover question displays or game-over screens
  const gameOverScreens = document.querySelectorAll('.game-over, .question-container, .session-summary');
  gameOverScreens.forEach(screen => screen.remove());
  
  document.querySelector('.container').style.display = 'block';
  
  // 🎮 MULTIPLAYER: Clean up multiplayer state when returning to setup
  if (this.gameMode === 'certamen-multiplayer' || this.isHost !== undefined) {
    // Hide the multiplayer setup screen - go back to main setup
    const multiplayerSetup = document.getElementById('multiplayer-setup');
    if (multiplayerSetup) {
      multiplayerSetup.style.display = 'none';
      multiplayerSetup.classList.remove('active');
    }
    
    // ✅ FIX: Restore the setup elements that showMultiplayerSetup() hid
    const setupContainer = document.querySelector('.game-setup');
    const header = document.querySelector('.header');
    const progressIndicator = document.querySelector('.progress-indicator');
    
    if (setupContainer) {
      setupContainer.style.display = 'block';
      setupContainer.style.opacity = '1';
    }
    if (header) {
      header.style.display = 'block';
      header.style.opacity = '1';
    }
    if (progressIndicator) {
      progressIndicator.style.display = 'flex';
      progressIndicator.style.opacity = '1';
    }
    
    console.log('📱 Returning to main setup screen');
    
    // Clean up multiplayer state
    this.isHost = undefined;
    this.myTeamIndex = null;
    this.roomRef = null;
    
    // 🧹 Clean up ALL Firebase listeners using registry
    if (window.listenerRegistry) {
      window.listenerRegistry.cleanupAll();
    }
    // Also clean up local references (in case registry wasn't used)
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this.hostBuzzUnsubscribe) {
      this.hostBuzzUnsubscribe();
      this.hostBuzzUnsubscribe = null;
    }
  }
  
  // Reset ALL game state completely
  this.currentQuestion = 0;
  this.currentPassage = 0; // Reset passage counter
  this.playerScore = 0;
  this.gameMode = '';
  this.gameState = 'setup';
  this.questions = [];
  this.teams = [];
  this.usedTriads = []; // Clear tracked triads
  this.buzzingAllowed = false; // Reset buzzing state
  console.log('🔴 DEBUG: buzzingAllowed set to FALSE (game reset)');
  this.timerHasExpired = false; // Reset timer flag
  
  // Reset solo player state
  if (this.soloPlayer) {
    this.soloPlayer.buzzed = false;
  }

  // Clear bonus state
  this.bonusState = 'none';
  this.bonusWinningTeam = null;
  this.currentBonusQuestion = 0;
  this.bonusQuestions = [];
  this.bonusTimeLeft = 0;
  
  this.teamBuzzedIn = null;
  this.answerTimeLeft = 0;
  
  // Reset lightning round state
  this.lightningStarted = undefined;
  this.timeRemaining = 0;
  this.currentStreak = 0;
  this.longestStreak = 0;
  this.questionsAnswered = 0;
  this.correctAnswersCount = 0;
  this.targetStreak = 5;
  this.highScores = null;
  
  // Reset review system state
  this.retryMode = false;
  this.retryQuestionList = [];
  this.retryQuestionIndex = 0;
  
  if (this.questions && this.questions.length > 0) {
    this.questions = this.shuffleArray(this.questions);
  }
  
  const startButton = document.getElementById('start-game');
  if (startButton) {
    startButton.disabled = false;
    startButton.textContent = 'Start Game';
  }
  
  updateStartButton();
}
  // Debug function to clear localStorage
  clearHighScores() {
    try {
      localStorage.removeItem('certamen-high-scores');
      localStorage.removeItem('certamen-recent-questions'); // Also clear recent questions for fresh start
      console.log('High scores and recent questions cleared');
    } catch (e) {
      console.warn('Could not clear high scores');
    }
  }

  // Clear high scores and refresh the leaderboard display immediately
  clearHighScoresAndRefresh() {
    // Clear the scores from localStorage
    this.clearHighScores();
    
    // Update in-memory high scores
    this.highScores = [];
    
    // Update the leaderboard display immediately
    const leaderboardList = document.querySelector('.leaderboard-list');
    if (leaderboardList) {
      leaderboardList.innerHTML = '<div class="no-scores">No high scores yet!</div>';
      console.log('✅ Leaderboard display updated - showing empty state');
    }
  }

  // ADD THIS NEW METHOD HERE:
  deduplicateQuestions(questions) {
    const seenIds = new Set();
    const uniqueQuestions = [];
    
    questions.forEach(question => {
      const questionId = question.id;
      if (!seenIds.has(questionId)) {
        seenIds.add(questionId);
        uniqueQuestions.push(question);
      } else {
        console.log(`🚫 Removed duplicate question ID: ${questionId}`);
      }
    });
    
    if (questions.length !== uniqueQuestions.length) {
      console.log(`🔄 Deduplication: ${questions.length} → ${uniqueQuestions.length} questions`);
    }
    
    return uniqueQuestions;
  }
  
  startBuzzButtonPulsing() {
    if (this.gameMode === 'certamen' || this.gameMode === 'certamen-multiplayer') {
      // Regular/multiplayer certamen - pulse team buzz buttons
      this.teams.forEach((team, index) => {
        // Only pulse non-eliminated teams
        if (!this.eliminatedTeams.has(index)) {
          const buzzButton = document.getElementById(`buzz-${index}`);
          const floatingButton = document.getElementById(`floating-buzz-${index}`);
          
          if (buzzButton && !buzzButton.disabled) {
            buzzButton.classList.add('pulse');
          }
          if (floatingButton && !floatingButton.disabled) {
            floatingButton.classList.add('pulse');
          }
        }
      });
      
      console.log('Started pulsing buzz buttons for available teams');
    } else if (this.gameMode === 'certamen-solo') {
      // Solo certamen - pulse solo buzz button
      const soloBuzzButton = document.getElementById('solo-buzz');
      const floatingSoloButton = document.getElementById('floating-solo-buzz');
      
      if (soloBuzzButton && !soloBuzzButton.disabled) {
        soloBuzzButton.classList.add('pulse');
      }
      if (floatingSoloButton && !floatingSoloButton.disabled) {
        floatingSoloButton.classList.add('pulse');
      }
      
      console.log('Started pulsing solo buzz button');
    }
  }

  stopBuzzButtonPulsing() {
    if (this.gameMode === 'certamen' || this.gameMode === 'certamen-multiplayer') {
      // Regular/multiplayer certamen - stop pulsing team buzz buttons
      this.teams.forEach((team, index) => {
        const buzzButton = document.getElementById(`buzz-${index}`);
        const floatingButton = document.getElementById(`floating-buzz-${index}`);
        
        if (buzzButton) {
          buzzButton.classList.remove('pulse');
        }
        if (floatingButton) {
          floatingButton.classList.remove('pulse');
        }
      });
      
      console.log('Stopped all buzz button pulsing');
    } else if (this.gameMode === 'certamen-solo') {
      // Solo certamen - stop pulsing solo buzz button
      const soloBuzzButton = document.getElementById('solo-buzz');
      const floatingSoloButton = document.getElementById('floating-solo-buzz');
      
      if (soloBuzzButton) {
        soloBuzzButton.classList.remove('pulse');
      }
      if (floatingSoloButton) {
        floatingSoloButton.classList.remove('pulse');
      }
      
      console.log('Stopped solo buzz button pulsing');
    }
  }

createAnswerOptions(question) {
  const hasOptions = question.options && question.options.length > 0;
  
  if (hasOptions) {
    // Multiple choice question
    return this.createMultipleChoice(question);
  } else {
    // Fill-in-the-blank question
    return this.createTextInput();
  }
}

// ADD these two new helper methods right after createAnswerOptions:
createMultipleChoice(question) {
  return `
    <div class="answer-options">
      ${question.options.map((option, index) => `
        <button class="answer-option" data-index="${index}">${option}</button>
      `).join('')}
    </div>
  `;
}

createTextInput() {
  return `
    <div class="answer-input">
      <input type="text" placeholder="Type your answer..." id="answer-input" autocomplete="off" />
      <button onclick="game.submitAnswer()">Submit</button>
    </div>
  `;
}

// REPLACE your setupAnswerHandlers method with this:
setupAnswerHandlers(question) {
  const hasOptions = question.options && question.options.length > 0;
  
  if (hasOptions) {
    // Multiple choice setup
    const answerButtons = document.querySelectorAll('.answer-option');
    answerButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        this.handleAnswer(question, index, button);
      });
    });
  } else {
    // Fill-in-the-blank setup
    const input = document.getElementById('answer-input');
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleAnswer(question, null, null);
        }
      });
    }
    
    // Also handle the submit button click
    const submitButton = document.querySelector('.answer-input button');
    if (submitButton) {
      submitButton.addEventListener('click', () => {
        this.handleAnswer(question, null, null);
      });
    }
  }
}

handleAnswer(question, selectedAnswer, element) {
  // 🛡️ DEBOUNCE: Prevent rapid double-clicks on answer options
  if (!buttonClickTracker.canClick('answer-submit', 500)) {
    return; // Ignore rapid repeated clicks
  }
  
  // 🎮 MULTIPLAYER: Check if it's this player/host's turn to answer
  if (this.gameMode === 'certamen-multiplayer') {
    // Check if we can answer toss-up (buzzed in) or bonus (our bonus round)
    const canAnswerTossUp = this.teamBuzzedIn === this.myTeamIndex;
    const canAnswerBonus = this.bonusState === 'active' && this.bonusWinningTeam === this.myTeamIndex;
    
    if (!canAnswerTossUp && !canAnswerBonus) {
      console.log(`⚠️ Not my turn to answer (teamBuzzedIn=${this.teamBuzzedIn}, myTeamIndex=${this.myTeamIndex}, bonusState=${this.bonusState})`);
      return;
    }
    
    // If we're a PLAYER (not host), send answer to Firebase
    if (!this.isHost) {
      // Log what type of answer this is
      if (canAnswerBonus) {
        console.log(`📤 PLAYER: Sending BONUS answer to Firebase`);
      } else {
        console.log(`📤 PLAYER: Sending answer to Firebase`);
      }
      this.sendAnswerToFirebase(selectedAnswer);
      
      // Disable answer options to prevent double submission
      this.disableAnswerOptions();
      return; // Don't process locally - host will handle it
    }
    
    // HOST continues to process locally below
    console.log(`🎯 HOST: Processing own answer (teamBuzzedIn=${this.teamBuzzedIn})`);
  }
  
  // CLEAR TIMER when answer is submitted
  this.clearQuestionTimer();
  
  // ✨ DISABLE BUZZING - race condition fix
  this.buzzingAllowed = false;
  console.log('🔴 Buzzing disabled - answer submitted');
  
  // CRITICAL: Check if this is a bonus question
  if (this.bonusState === 'active') {
    // ✨ BUG FIX: Prevent answer submission after timer expires
    if (this.questionTimeLeft !== null && this.questionTimeLeft <= 0) {
      console.log('🚫 Bonus answer submission blocked - timer expired');
      return;
    }
    
    const hasOptions = question.options && question.options.length > 0;
    let isCorrect;
    
    if (hasOptions) {
      isCorrect = selectedAnswer === question.correct;
    } else {
      const userAnswer = document.getElementById('answer-input').value.trim();
      isCorrect = this.compareAnswers(userAnswer, question.answer);
    }
    
    this.handleBonusAnswer(question, selectedAnswer, isCorrect);
    return; // Exit early for bonus questions
  }
  
  const hasOptions = question.options && question.options.length > 0;
  let isCorrect;
  
  if (hasOptions) {
    // Multiple choice - selectedAnswer is index
    isCorrect = selectedAnswer === question.correct;
    // MC answer validation debug logs - uncomment if debugging answer matching
    // console.log('🔍 DEBUG MC: User clicked index:', selectedAnswer, 'Expected index:', question.correct);
    // console.log('🔍 DEBUG MC: User clicked:', question.options[selectedAnswer], 'Expected answer:', question.answer);
    // console.log('🔍 DEBUG MC: Comparison result:', isCorrect);
    
    // Disable all MC buttons
const allButtons = document.querySelectorAll('.answer-option');
allButtons.forEach((btn, index) => {
  btn.disabled = true;
  
  if (this.gameMode === 'certamen-solo') {
    // Solo Certamen: Show GREEN if player chose correctly, RED if wrong
    // Never reveal what the correct answer is when player gets it wrong
    if (index === selectedAnswer) {
      if (isCorrect) {
        btn.classList.add('correct'); // GREEN - player got it right!
      } else {
        btn.classList.add('incorrect'); // RED - player got it wrong (don't show correct answer)
      }
    }
  } else if (this.gameMode === 'certamen' || this.gameMode === 'certamen-multiplayer') {
    // Certamen mode (team or multiplayer): NEVER reveal correct answer
    // Only show feedback on the selected answer
    if (index === selectedAnswer) {
      if (isCorrect) {
        btn.classList.add('correct'); // GREEN - team got it right!
      } else {
        btn.classList.add('incorrect'); // RED - team got it wrong
        // 🎮 FIX: Keep red highlighting visible so all players see which answers were tried
        // Don't remove it - highlighting will be cleared when moving to next question
      }
    }
  } else {
    // Practice/Timed modes: permanent green/red for learning
    if (index === question.correct) {
      btn.classList.add('correct');
    } else if (index === selectedAnswer && !isCorrect) {
      btn.classList.add('incorrect');
    }
  }
});

  } else {
  // Fill-in-the-blank - selectedAnswer is ignored, get from input
  const userAnswer = document.getElementById('answer-input').value.trim();
  // Fill-in answer debug logs - uncomment if debugging answer matching
  // console.log('🔍 DEBUG: User typed:', userAnswer, 'Expected:', question.answer);
  isCorrect = this.compareAnswers(userAnswer, question.answer);
  // console.log('🔍 DEBUG: Comparison result:', isCorrect);
  
  // Disable the input and button WITH visual feedback
  const answerInput = document.getElementById('answer-input');
  const submitButton = answerInput.nextElementSibling;
  
  if (answerInput) {
    answerInput.disabled = true;
    // ADD VISUAL FEEDBACK:
    answerInput.style.background = isCorrect ? '#4CAF50' : '#f44336';
    answerInput.style.color = 'white';
    
    // Auto-clear incorrect answers after 1.5 seconds (but not during bonus rounds)
    if (!isCorrect && this.bonusState !== 'active') {
      setTimeout(() => {
        answerInput.style.background = '';
        answerInput.style.color = '';
        answerInput.value = '';
      }, 1500);
    }
  }
  
  if (submitButton) {
    submitButton.disabled = true;
  }
}

 // ENHANCED: Mode-specific handling
if (this.gameMode === 'certamen' || this.gameMode === 'certamen-multiplayer') {
  // CERTAMEN MODE: Handle team elimination and bonus questions
  
  // ✨ FIX: Ignore answer submission if timer has already expired
  if (this.timerHasExpired) {
    console.log('⚠️ Ignoring answer submission - timer has already expired');
    return;
  }
  
  console.log(`🎯 Certamen answer: ${isCorrect ? 'CORRECT' : 'INCORRECT'} by team ${this.teamBuzzedIn}`);
  
  // 🎮 MULTIPLAYER: Sync host's answer result to Firebase so players see it
  if (this.gameMode === 'certamen-multiplayer' && this.isHost && this.roomRef) {
    const hasOptions = question.options && question.options.length > 0;
    this.syncAnswerResultToFirebase(this.teamBuzzedIn, isCorrect, hasOptions ? selectedAnswer : null);
    console.log('📤 HOST: Synced own answer result to Firebase');
  }
  
  if (isCorrect) {
    // CORRECT ANSWER - Start bonus questions for winning team
    console.log('✅ CORRECT ANSWER - Starting bonus round');
    
    // ✅ DON'T clear display - let it transition naturally
    
    this.bonusWinningTeam = this.teamBuzzedIn;
    
    // ✨ FIX: Set bonus state immediately to prevent race conditions
    this.bonusState = 'pending';
    
    this.bonusStartTimer = setTimeout(() => {
      this.startBonusQuestions();
    }, 1500);
    
  } else {
    // INCORRECT ANSWER - Eliminate team and continue
    console.log(`❌ INCORRECT - Eliminating team ${this.teamBuzzedIn}`);
    this.eliminatedTeams.add(this.teamBuzzedIn);
    this.updateTeamVisualState(this.teamBuzzedIn, 'eliminated');

    setTimeout(() => {
      this.continueAfterIncorrectAnswer();
    }, 1000);
  }

} else if (this.gameMode === 'certamen-solo') {
  // SOLO CERTAMEN MODE: Handle correct/incorrect for solo player
  
  // ✨ FIX: Ignore answer submission if timer has already expired
  if (this.timerHasExpired) {
    console.log('⚠️ Ignoring answer submission - timer has already expired');
    return;
  }
  
  console.log(`🎯 Solo Certamen answer: ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);
  
  if (isCorrect) {
    // CORRECT ANSWER - Start bonus questions for solo player
    console.log('✅ CORRECT ANSWER - Starting bonus round');
    
    // ✅ DON'T clear display - let it transition naturally
    
    this.bonusWinningTeam = 0; // Solo player is always index 0
    
    // ✨ FIX: Set bonus state immediately to prevent race conditions
    this.bonusState = 'pending';
    
    // Remove full card green, keep only score badge green
    this.updateSoloPlayerVisualState('normal');
    
    // Clear late buffer timeout to prevent race condition
    if (this.lateBufferTimeout) {
      clearTimeout(this.lateBufferTimeout);
      this.lateBufferTimeout = null;
    }
    
    setTimeout(() => {
      this.startSoloBonusQuestions();
    }, 1500);
    
  } else {
    // INCORRECT ANSWER - Just skip to next toss-up (no elimination in solo mode)
    console.log(`❌ INCORRECT - Moving to next toss-up`);
    this.updateSoloPlayerVisualState('normal');
    
    // CRITICAL: Clear late buffer timeout to prevent race condition
    if (this.lateBufferTimeout) {
      clearTimeout(this.lateBufferTimeout);
      this.lateBufferTimeout = null;
    }
    
    setTimeout(() => {
      this.continueAfterIncorrectSoloAnswer();
    }, 1000);
  }

} else {
    // PRACTICE/TIMED MODE: Always show explanation
    this.showExplanation(question, isCorrect);
    
    if (this.gameMode === 'practice') {
      if (this.retryMode) {
        this.handleRetryAnswer(question, selectedAnswer, element, isCorrect);
        return;
      }
      if (!isCorrect) {
        this.addToReview(question, 'missed');
      }
      // No auto-advance - Continue button handles navigation
      
    } else if (this.gameMode === 'timed') {
      if (isCorrect) {
        this.handleCorrectAnswer(question);
      } else {
        this.handleIncorrectAnswer();
      }
      
      // Keep auto-advance ONLY for timed mode
      setTimeout(() => {
        this.nextQuestion();
      }, 4500);
    }
  }
}

continueAfterIncorrectAnswer() {
  // CRITICAL: Clear any existing timers first
  this.clearQuestionTimer();
  
  const question = this.questions[this.currentQuestion];
  const availableTeams = this.teams.filter((_, index) => !this.eliminatedTeams.has(index));

  console.log(`${availableTeams.length} teams remaining for this question`);

  if (availableTeams.length === 0) {
    // All teams eliminated - move to next question
    console.log('All teams eliminated - moving to next question');
    
    // Clear the question display immediately for clean transition
    this.clearQuestionDisplay();
    
    this.allEliminatedTimer = setTimeout(() => this.nextQuestion(), 1000);
    return;
  }

  // Reset for remaining teams
  this.teamBuzzedIn = null;
  
  // 🎮 MULTIPLAYER: Sync teamBuzzedIn reset to Firebase so players can buzz again
  if (this.gameMode === 'certamen-multiplayer' && this.isHost && this.roomRef) {
    window.updateFirebaseDoc(this.roomRef, {
      'gameState.teamBuzzedIn': null,
      'gameState.buzzPhase': 'waiting'
    });
    console.log('📤 HOST: Synced teamBuzzedIn=null to Firebase (allowing other teams to buzz)');
  }
  
  // RESET THE QUESTION-TYPE LABEL back to "TOSSUP" for remaining teams
  const questionTypeEl = document.querySelector('.question-type');
  if (questionTypeEl) {
    questionTypeEl.textContent = 'TOSSUP';
  }
  
  // ✨ RE-ENABLE BUZZING for remaining teams - race condition fix
  this.buzzingAllowed = true;
  console.log('🟢 Buzzing re-enabled for remaining teams');
  
  this.enableBuzzers();
  this.disableAnswerOptions();
  
  // 🎮 CERTAMEN: Re-enable answer options but KEEP incorrect highlighting visible
  // This shows other teams which answers have already been tried
  // NOTE: Don't call clearAnswerHighlighting() here - keep red highlighting on wrong answers
  const answerButtons = document.querySelectorAll('.answer-option');
  answerButtons.forEach(button => {
    button.disabled = false; // Re-enable for next team to try
    // Keep 'incorrect' class - don't remove it!
  });
  
  // Also re-enable text input if present
  const answerInput = document.getElementById('answer-input');
  if (answerInput) {
    answerInput.disabled = false;
    // Keep background color styling to show previous wrong answer
  }

  // RESTART PULSING FOR REMAINING TEAMS
  this.startBuzzButtonPulsing();

  // Show full question for remaining teams
  this.updateQuestionDisplay(question.question, false);
  
  // START 5-SECOND ROLLOVER BUZZ-IN TIMER 
  // (Shorter than initial 8-second timer because teams have already seen the question)
  this.startQuestionTimer(5, 'buzz-in');
}

continueAfterIncorrectSoloAnswer() {
  // Clear any existing timers first
  this.clearQuestionTimer();
  
  console.log('Moving to next toss-up after incorrect answer');
  
  // Reset solo player state
  this.soloPlayer.buzzed = false;
  
  // Move to next toss-up (skip bonuses)
  const currentQ = this.questions[this.currentQuestion];
  if (currentQ.dependency === 'tossup') {
    // We're on a toss-up, skip to next toss-up (which means +3 to skip this triad)
    this.currentQuestion += 3;
  } else {
    // Safety: shouldn't happen, but move to next question
    this.currentQuestion++;
  }
  
  // Start next round
  this.startSoloCertamenRound();
}

startBonusQuestions() {
  // Use bonusWinningTeam if already set (from processPlayerAnswer), otherwise fall back to teamBuzzedIn
  const winningTeam = this.bonusWinningTeam !== null ? this.bonusWinningTeam : this.teamBuzzedIn;
  console.log('🏛️ Starting bonus questions for winning team:', winningTeam);
  
  if (winningTeam === null) {
    console.error('❌ Cannot start bonus - no winning team identified');
    this.nextQuestion();
    return;
  }
  
  // Helper function for flexible group matching
  function normalizeGroupName(groupName) {
    if (!groupName) return '';
    return groupName.toLowerCase().replace(/[_-]/g, '');
  }
  
  const tossupIndex = this.currentQuestion;
  const bonus1Index = tossupIndex + 1;
  const bonus2Index = tossupIndex + 2;
  
  // Quick alignment sanity check - only log if there's a problem
  if (tossupIndex % 3 !== 0) {
    console.error(`🚨 ALIGNMENT ERROR: index ${tossupIndex} is not at tossup position (expected multiple of 3)`);
  }
  
  // Verify we have the next 2 questions available
  if (bonus1Index < this.questions.length && bonus2Index < this.questions.length) {
    const bonus1 = this.questions[bonus1Index];
    const bonus2 = this.questions[bonus2Index];
    const tossupGroup = this.questions[tossupIndex].group;
    
    // Use flexible group matching
    const normalizedTossupGroup = normalizeGroupName(tossupGroup);
    const normalizedBonus1Group = normalizeGroupName(bonus1.group);
    const normalizedBonus2Group = normalizeGroupName(bonus2.group);
    
    if (normalizedBonus1Group === normalizedTossupGroup && normalizedBonus2Group === normalizedTossupGroup) {
      
      // Set up bonus state - use the winningTeam we calculated at the start
      this.bonusState = 'active';
      this.bonusWinningTeam = winningTeam;
      this.bonusQuestions = [bonus1, bonus2];
      this.currentBonusQuestion = 0;
      this.bonusRoundEnding = false; // 🛡️ Reset guard flag for new bonus round

      // Keep winning team highlighted during bonus round
      this.updateTeamVisualState(this.bonusWinningTeam, 'bonus-active');
      
      // Mark other teams as inactive (faded) during bonus round
      this.teams.forEach((team, index) => {
        if (index !== this.bonusWinningTeam) {
          this.updateTeamVisualState(index, 'inactive');
        }
      });
      
      console.log(`📋 Bonus round loaded for team ${this.bonusWinningTeam} (group: ${tossupGroup})`);
      
      // Add winning team score for correct toss-up
      const tossupPoints = this.questions[this.currentQuestion].points || 10;
      if (this.bonusWinningTeam !== null && this.teams[this.bonusWinningTeam]) {
        this.teams[this.bonusWinningTeam].score += tossupPoints;
        this.updateTeamScoreDisplay(this.bonusWinningTeam);
      } else {
        console.error(`❌ Cannot update score - invalid bonusWinningTeam: ${this.bonusWinningTeam}`);
      }
      
      // 🎮 MULTIPLAYER: Sync bonus state to Firebase so players know bonus round started
      if (this.gameMode === 'certamen-multiplayer' && this.isHost) {
        this.syncBonusStateToFirebase('active', this.bonusWinningTeam);
      }
      
      // Start first bonus question after brief pause
      setTimeout(() => {
        // 🛡️ GUARD: Only proceed if bonus round is still active
        if (this.bonusState === 'active') {
          this.displayBonusQuestion();
        }
      }, 2000);
      
    } else {
      console.warn(`Group mismatch - bonus questions not from same group as toss-up`);
      console.warn(`Tossup group: ${tossupGroup}, Bonus1: ${bonus1.group}, Bonus2: ${bonus2.group}`);
      this.fallbackToNextQuestion();
    }
    
  } else {
    console.warn(`Not enough questions remaining for bonus round`);
    console.warn(`Current: ${tossupIndex}, Need: ${bonus1Index}, ${bonus2Index}, Available: ${this.questions.length}`);
    this.fallbackToNextQuestion();
  }
}

fallbackToNextQuestion() {
  console.log('🔄 Using fallback - awarding toss-up points and moving to next question');
  
  // ✨ SAFETY CHECK: Verify question exists before accessing
  const currentQ = this.questions[this.currentQuestion];
  if (!currentQ) {
    console.warn('⚠️ No question at current index - ending game');
    setTimeout(() => this.endGame(), 500);
    return;
  }
  
  // Safety check: only award points if we have a valid winning team
  if (this.bonusWinningTeam !== null && this.bonusWinningTeam !== undefined && this.teams[this.bonusWinningTeam]) {
    const tossupPoints = currentQ.points || 10;
    this.teams[this.bonusWinningTeam].score += tossupPoints;
    this.updateTeamScoreDisplay(this.bonusWinningTeam);
  } else {
    console.warn('⚠️ Cannot award toss-up points - no valid winning team');
  }
  
  // ✨ FIX: Skip the 2 mismatched bonus questions to maintain triad alignment
  // We're currently at the tossup, need to skip +2 for the bonuses, then nextQuestion() adds +1
  console.log(`⏭️ Skipping mismatched bonus questions (${this.currentQuestion} → ${this.currentQuestion + 2})`);
  this.currentQuestion += 2;
  
  this.bonusCompleteTimer = setTimeout(() => this.nextQuestion(), 2000);
}

startSoloBonusQuestions() {
  console.log('🏛️ Starting bonus questions for solo player');
  
  // Helper function for flexible group matching
  function normalizeGroupName(groupName) {
    if (!groupName) return '';
    return groupName.toLowerCase().replace(/[_-]/g, '');
  }
  
  const tossupIndex = this.currentQuestion;
  const bonus1Index = tossupIndex + 1;
  const bonus2Index = tossupIndex + 2;
  
  // Verify we have the next 2 questions available
  if (bonus1Index < this.questions.length && bonus2Index < this.questions.length) {
    const bonus1 = this.questions[bonus1Index];
    const bonus2 = this.questions[bonus2Index];
    
    // Verify they are from the same group (safety check)
    const tossupGroup = this.questions[tossupIndex].group;
    
    const normalizedTossupGroup = normalizeGroupName(tossupGroup);
    const normalizedBonus1Group = normalizeGroupName(bonus1.group);
    const normalizedBonus2Group = normalizeGroupName(bonus2.group);
    
    if (normalizedBonus1Group === normalizedTossupGroup && normalizedBonus2Group === normalizedTossupGroup) {
      
      // Set up bonus state
      this.bonusState = 'active';
      this.bonusWinningTeam = 0; // Solo player is always 0
      this.bonusQuestions = [bonus1, bonus2];
      this.currentBonusQuestion = 0;
      this.bonusRoundEnding = false; // 🛡️ Reset guard flag for new bonus round

      // Card stays normal purple during bonus - only score badge is green
      // (Removed: this.updateSoloPlayerVisualState('bonus-active'))
      
      // Immediately disable solo buzzer and remove visual effects
      this.disableSoloBuzzer();
      const soloBuzzButton = document.getElementById('solo-buzz');
      const floatingSoloButton = document.getElementById('floating-solo-buzz');
      if (soloBuzzButton) {
        soloBuzzButton.classList.remove('buzzed-active', 'pulse');
        soloBuzzButton.classList.add('bonus-disabled');
        soloBuzzButton.textContent = '🏆 BONUS ROUND';
      }
      if (floatingSoloButton) {
        floatingSoloButton.classList.remove('buzzed-active', 'pulse');
        floatingSoloButton.classList.add('bonus-disabled');
      }
      
      console.log(`📋 Loaded bonus questions from group ${tossupGroup}`);
      
      // Add solo player score for correct toss-up
      const tossupPoints = this.questions[this.currentQuestion].points || 10;
      this.soloPlayer.score += tossupPoints;
      this.updateSoloScoreDisplay();
      
      // Start first bonus question after brief pause
      setTimeout(() => {
        this.displayBonusQuestion();
      }, 2000);
      
    } else {
      console.warn(`Group mismatch - bonus questions not from same group as toss-up`);
      this.fallbackToNextSoloQuestion();
    }
    
  } else {
    console.warn(`Not enough questions remaining for bonus round`);
    this.fallbackToNextSoloQuestion();
  }
}

fallbackToNextSoloQuestion() {
  console.log('🔄 Using fallback for solo - awarding toss-up points and moving to next question');
  
  const currentQ = this.questions[this.currentQuestion];
  if (!currentQ) {
    console.warn('⚠️ No question at current index - ending game');
    setTimeout(() => this.endGameSolo(), 500);
    return;
  }
  
  // Award toss-up points to solo player
  const tossupPoints = currentQ.points || 10;
  this.soloPlayer.score += tossupPoints;
  this.updateSoloScoreDisplay();
  
  setTimeout(() => this.nextQuestion(), 2000);
}

updateSoloScoreDisplay() {
  const scoreElement = document.getElementById('solo-score');
  if (scoreElement) {
    scoreElement.textContent = `${this.soloPlayer.score} points`;
    
    // Add green badge if player has earned points
    if (this.soloPlayer.score > 0) {
      scoreElement.classList.add('score-badge-green');
    } else {
      scoreElement.classList.remove('score-badge-green');
    }
  }
}

// UNIFIED TIMER SYSTEM for both toss-ups and bonus questions
startQuestionTimer(duration, timerType) {
  // Verbose timer debug logs commented out to reduce console noise
  // console.log(`⏰ DEBUG: Starting ${timerType} timer for ${duration} seconds`);
  this.questionTimeLeft = duration;
  this.currentTimerType = timerType; // 'tossup', 'bonus', or 'buzz-in'
  
  // ✨ FIX: Reset flag when starting new timer (for tossup questions)
  // For bonus questions, this flag isn't used, but reset it anyway for consistency
  this.timerHasExpired = false;
  
  // Get the timer box that was created in the question display HTML
  let timerBox = document.getElementById('question-timer-box');
  
  if (timerBox) {
    // Update timer content
    timerBox.innerHTML = `
      <span class="timer-icon">⏰</span>
      <span id="question-timer">${duration}</span>
    `;
    timerBox.classList.remove('expired', 'timer-warning', 'timer-critical');
    
    // Make timer visible
    timerBox.style.visibility = 'visible';
    // console.log(`⏰ DEBUG: Timer box updated and made visible`);
  } else {
    console.warn(`⏰ Could not find timer box element`);
  }
  
  // console.log(`⏰ DEBUG: Starting interval countdown from ${duration} seconds`);
  
  // 🎮 MULTIPLAYER: Host broadcasts initial timer to Firebase
  if (this.gameMode === 'certamen-multiplayer' && this.isHost && this.roomRef && window.updateFirebaseDoc) {
    window.updateFirebaseDoc(this.roomRef, {
      'gameState.timer': {
        timeRemaining: duration,
        timerType: timerType,
        timestamp: Date.now()
      }
    });
  }
  
  this.questionTimer = setInterval(() => {
    this.questionTimeLeft--;
    this.updateQuestionTimerDisplay();
    
    // 🎮 MULTIPLAYER: Host broadcasts timer to Firebase every second
    if (this.gameMode === 'certamen-multiplayer' && this.isHost && this.roomRef && window.updateFirebaseDoc) {
      window.updateFirebaseDoc(this.roomRef, {
        'gameState.timer': {
          timeRemaining: this.questionTimeLeft,
          timerType: this.currentTimerType,
          timestamp: Date.now()
        }
      });
    }
    
    if (this.questionTimeLeft <= 0) {
      console.log(`⏰ ${timerType} time expired`);
      this.handleQuestionTimeout();
    }
  }, 1000);
}

updateQuestionTimerDisplay() {
  const timerElement = document.getElementById('question-timer');
  const timerBox = document.getElementById('question-timer-box');
  
  if (timerElement) {
    timerElement.textContent = this.questionTimeLeft;
    
    if (timerBox) {
      timerBox.classList.remove('timer-warning', 'timer-critical');
      if (this.questionTimeLeft <= 4) {
        timerBox.classList.add('timer-critical');
      } else if (this.questionTimeLeft <= 7) {
        timerBox.classList.add('timer-warning');
      }
    }
  }
}

handleQuestionTimeout() {
  // ✨ DISABLE BUZZING - race condition fix
  this.buzzingAllowed = false;
  this._timerExpiredAt = Date.now(); // Record when timer expired for late buzz logging
  console.log('🔴 Buzzing disabled - timer expired');
  
  if (this.questionTimer) {
    clearInterval(this.questionTimer);
    this.questionTimer = null;
  }
  
  // 🎮 MULTIPLAYER: Host broadcasts timer expiry to Firebase
  if (this.gameMode === 'certamen-multiplayer' && this.isHost && this.roomRef && window.updateFirebaseDoc) {
    window.updateFirebaseDoc(this.roomRef, {
      'gameState.timer': {
        timeRemaining: 0,
        timerType: this.currentTimerType,
        timestamp: Date.now()
      },
      'gameState.buzzingAllowed': false
    });
  }
  
  const timerBox = document.getElementById('question-timer-box');
  if (timerBox) {
    timerBox.innerHTML = '<span class="timer-icon">⏰</span> Time Expired!';
    timerBox.classList.add('expired');
  }
  
  if (this.currentTimerType === 'buzz-in') {
    // 🎮 MULTIPLAYER FIX: Only host advances question
    if (this.gameMode === 'certamen-multiplayer' && !this.isHost) {
      console.log('⏰ PLAYER: Waiting for host to advance question');
      return;
    }
    
    // 5-second buzz-in time expired - move to next question
    console.log('⏰ No team buzzed within 5 seconds - moving to next question');
    setTimeout(() => {
      this.nextQuestion();
    }, 1000);
  } else if (this.currentTimerType === 'tossup') {
    // ✨ FIX: Set flag to prevent double-processing of timeout + answer submission
    this.timerHasExpired = true;
    
    // ✨ FIX: Completely disable answer submission
    this.disableAnswerOptions();
    const answerInput = document.getElementById('answer-input');
    const submitButton = document.querySelector('.answer-input button');
    if (answerInput) {
      answerInput.disabled = true;
      answerInput.readOnly = true;
    }
    if (submitButton) {
      submitButton.disabled = true;
    }
    
    // Toss-up timeout - handle differently for solo vs team mode
    if (this.gameMode === 'certamen-solo') {
      // Solo mode: Just move to next toss-up (no elimination)
      console.log(`⏰ Solo player - Time expired on toss-up`);
      this.updateSoloPlayerVisualState('normal');
      
      setTimeout(() => {
        this.continueAfterIncorrectSoloAnswer();
      }, 1500);
    } else {
      // Regular Certamen: Eliminate team
      console.log(`❌ Time expired - Eliminating team ${this.teamBuzzedIn}`);
      this.eliminatedTeams.add(this.teamBuzzedIn);
      this.updateTeamVisualState(this.teamBuzzedIn, 'eliminated');
      
      setTimeout(() => {
        this.continueAfterIncorrectAnswer();
      }, 1500);
    }
  } else if (this.currentTimerType === 'bonus') {
  // Bonus timeout - no points, move to next bonus
  const questionDisplay = document.getElementById('question-display');
  
  // Null check: prevent error if user navigated away
  if (!questionDisplay) {
    console.log('⚠️ Cannot show bonus timeout - user navigated away');
    return;
  }
  
  const timeoutDiv = document.createElement('div');
  timeoutDiv.className = 'bonus-timeout';
  timeoutDiv.innerHTML = `
    <div class="result-indicator">⏰ Time Expired!</div>
    <p>No points awarded for this bonus question.</p>
  `;
  questionDisplay.appendChild(timeoutDiv);
    
    setTimeout(() => {
      this.nextBonusQuestion();
    }, 2000);
  }
}

clearQuestionTimer() {
  if (this.questionTimer) {
    clearInterval(this.questionTimer);
    this.questionTimer = null;
  }
  
  // 🎮 MULTIPLAYER: Host clears timer from Firebase
  if (this.gameMode === 'certamen-multiplayer' && this.isHost && this.roomRef && window.updateFirebaseDoc) {
    window.updateFirebaseDoc(this.roomRef, {
      'gameState.timer': null
    });
  }
  
  // HIDE the visual timer box instead of removing it (prevents jumping)
  const timerBox = document.getElementById('question-timer-box');
  if (timerBox) {
    timerBox.style.visibility = 'hidden'; // Hide but keep space reserved
    // console.log('⏰ DEBUG: Timer box hidden (space reserved)');
  }
}

// 🎮 MULTIPLAYER: Display bonus question on player screens (received from Firebase)
displayPlayerBonusQuestion(bonusData) {
  console.log(`🎯 PLAYER: Displaying bonus question ${bonusData.bonusNumber}/2`);
  
  const winningTeam = bonusData.winningTeam;
  const isMyBonus = (winningTeam === this.myTeamIndex);
  
  // Update team visual states for bonus round
  this.teams.forEach((team, index) => {
    if (index === winningTeam) {
      this.updateTeamVisualState(index, 'bonus-active');
    } else {
      this.updateTeamVisualState(index, 'inactive');
    }
  });
  
  // Build question type label
  const teamName = this.teams[winningTeam]?.name || `Team ${winningTeam}`;
  const questionTypeLabel = `TEAM ${teamName.toUpperCase()} - BONUS QUESTION ${bonusData.bonusNumber}`;
  
  // Display the bonus question
  const questionDisplay = document.getElementById('question-display');
  questionDisplay.innerHTML = `
    <div class="bonus-question-container">
      <div class="question-content">
        <div class="question-type">${questionTypeLabel}</div>
        <div class="timer-placeholder" id="timer-placeholder">
          <div class="question-timer-box" id="question-timer-box" style="visibility: hidden; min-width: 70px; min-height: 30px;">
            <span class="timer-icon">⏰</span>
            <span id="question-timer">0</span>
          </div>
        </div>
        <h3 id="question-text-display">${this.cleanQuestionText(bonusData.question)}</h3>
        ${this.createAnswerOptionsFromData(bonusData)}
      </div>
    </div>
  `;
  
  // Ensure question display is visible
  questionDisplay.style.display = 'block';
  
  // Disable all buzz buttons during bonus
  this.disableAllBuzzers();
  this.stopBuzzButtonPulsing();
  
  // 🎮 MULTIPLAYER FIX: Only show button on answering team
  // Non-answering teams should have their button hidden during bonus
  this.teams.forEach((team, index) => {
    const buzzButton = document.getElementById(`buzz-${index}`);
    if (buzzButton) {
      if (index === winningTeam) {
        // Answering team - show "ANSWERING" button
        buzzButton.textContent = '🎯 ANSWERING';
        buzzButton.classList.add('bonus-disabled');
        buzzButton.style.display = 'block';
      } else {
        // Non-answering teams - hide the button entirely during bonus
        buzzButton.style.display = 'none';
      }
    }
  });
  
  // If it's MY team's bonus, enable answer options
  if (isMyBonus) {
    console.log('🎮 PLAYER: This is MY team\'s bonus - enabling answer options');
    // Set up answer handlers for the bonus question
    const bonusQuestionObj = {
      question: bonusData.question,
      options: bonusData.options,
      answer: bonusData.answer,
      category: bonusData.category
    };
    this.currentQuestionObj = bonusQuestionObj;
    this.setupAnswerHandlers(bonusQuestionObj);
    this.enableAnswerOptions();
  } else {
    console.log('📺 PLAYER: Watching other team\'s bonus - answer options disabled');
    this.disableAnswerOptions();
  }
}

// Helper method to create answer options from bonus data
createAnswerOptionsFromData(bonusData) {
  if (bonusData.options && bonusData.options.length > 0) {
    // Multiple choice
    return `
      <div class="answer-options">
        ${bonusData.options.map((option, index) => `
          <button class="answer-option" data-index="${index}" disabled>${option}</button>
        `).join('')}
      </div>
    `;
  } else {
    // Fill in the blank - use same structure as host for consistent styling
    return `
      <div class="answer-input">
        <input type="text" placeholder="Type your answer..." id="answer-input" autocomplete="off" disabled />
        <button id="submit-answer-btn" disabled>Submit</button>
      </div>
    `;
  }
}

displayBonusQuestion() {
  // 🛡️ GUARD: Don't display if bonus round is already ending
  if (this.bonusRoundEnding) {
    console.log('⚠️ displayBonusQuestion skipped - bonus round already ending');
    return;
  }
  
  if (this.currentBonusQuestion >= this.bonusQuestions.length) {
    this.endBonusRound();
    return;
  }
  
  // CRITICAL: Clear any existing timer before starting a new one
  this.clearQuestionTimer();
  
  const bonusQuestion = this.bonusQuestions[this.currentBonusQuestion];
  const bonusNumber = this.currentBonusQuestion + 1;
  
  console.log(`📋 Displaying bonus question ${bonusNumber}/2`);
  
  // 🎮 MULTIPLAYER: Sync bonus question to Firebase so players can see it
  if (this.gameMode === 'certamen-multiplayer' && this.isHost) {
    this.syncBonusQuestionToFirebase(bonusQuestion, bonusNumber);
  }
  
  // Update question display
const questionDisplay = document.getElementById('question-display');

// Different display for solo vs team mode
let questionTypeLabel;
if (this.gameMode === 'certamen-solo') {
  questionTypeLabel = `BONUS ${bonusNumber}`;
} else {
  const teamName = this.teams[this.bonusWinningTeam]?.name || `Team ${this.bonusWinningTeam}`;
  questionTypeLabel = `TEAM ${teamName.toUpperCase()} - BONUS QUESTION ${bonusNumber}`;
}

questionDisplay.innerHTML = `
  <div class="bonus-question-container">
    <div class="question-content">
      <div class="question-type">${questionTypeLabel}</div>
      <div class="timer-placeholder" id="timer-placeholder">
        <div class="question-timer-box" id="question-timer-box" style="visibility: hidden; min-width: 70px; min-height: 30px;">
          <span class="timer-icon">⏰</span>
          <span id="question-timer">0</span>
        </div>
      </div>
      <h3 id="question-text-display">${this.cleanQuestionText(bonusQuestion.question)}</h3>
      ${this.createAnswerOptions(bonusQuestion)}
    </div>
  </div>
`;
  
  // Ensure question display is visible (in case it was hidden by clearQuestionDisplay)
  questionDisplay.style.display = 'block';
  
  // 🎮 MULTIPLAYER: Update currentQuestionObj so host can validate player bonus answers
  this.currentQuestionObj = bonusQuestion;
  
  // 🎮 MULTIPLAYER FIX: Only set up answer handlers if it's the host's team's bonus
  // In multiplayer, host should only be able to answer during their own team's bonus
  const isMyTeamsBonus = this.gameMode === 'certamen-multiplayer' 
    ? (this.myTeamIndex === this.bonusWinningTeam)
    : true; // Non-multiplayer modes always allow answering
  
  if (isMyTeamsBonus) {
    // Set up answer handlers for this bonus question
    this.setupAnswerHandlers(bonusQuestion);
  } else {
    // Not my team's bonus - disable answer options
    console.log('📺 HOST: Watching other team\'s bonus - answer options disabled');
    this.disableAnswerOptions();
  }
  
  // Start 15-second timer using unified system
  this.startQuestionTimer(15, 'bonus');
  
  // Disable buzz buttons during bonus (no buzzing for bonus questions)
  if (this.gameMode === 'certamen-solo') {
    // Solo mode - disable solo buzzer and remove visual effects
    this.disableSoloBuzzer();
    
    // Remove buzzed-active class from buttons
    const soloBuzzButton = document.getElementById('solo-buzz');
    const floatingSoloButton = document.getElementById('floating-solo-buzz');
    if (soloBuzzButton) {
      soloBuzzButton.classList.remove('buzzed-active', 'pulse');
      soloBuzzButton.classList.add('bonus-disabled');
      soloBuzzButton.textContent = '🏆 BONUS ROUND';
    }
    if (floatingSoloButton) {
      floatingSoloButton.classList.remove('buzzed-active', 'pulse');
      floatingSoloButton.classList.add('bonus-disabled');
    }
  } else {
    // Team mode - disable all team buzzers
    this.disableAllBuzzers();
    
    // 🎮 MULTIPLAYER FIX: Only show button on answering team
    // Non-answering teams should have their button hidden during bonus
    this.teams.forEach((team, index) => {
      const buzzButton = document.getElementById(`buzz-${index}`);
      if (buzzButton) {
        if (index === this.bonusWinningTeam) {
          // Answering team - show "ANSWERING" button
          buzzButton.textContent = '🎯 ANSWERING';
          buzzButton.classList.add('bonus-disabled');
          buzzButton.style.display = 'block';
        } else {
          // Non-answering teams - hide the button entirely during bonus
          buzzButton.style.display = 'none';
        }
      }
    });
  }
}

handleBonusAnswer(question, selectedAnswer, isCorrect) {
  // 🛡️ GUARD: Don't process if bonus round is already ending
  if (this.bonusRoundEnding) {
    console.log('⚠️ handleBonusAnswer skipped - bonus round already ending');
    return;
  }
  
  // Clear the timer
  this.clearQuestionTimer();
  
  console.log(`🎯 Bonus answer: ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);
  
  // Show visual feedback AND disable inputs
  const hasOptions = question.options && question.options.length > 0;
  if (hasOptions) {
    // Multiple choice - disable buttons
    const allButtons = document.querySelectorAll('.answer-option');
    allButtons.forEach((btn, index) => {
      btn.disabled = true;
      
      // Show feedback on the selected answer only (like toss-ups in Certamen)
      if (index === selectedAnswer) {
        if (isCorrect) {
          btn.classList.add('correct'); // GREEN - got it right!
        } else {
          btn.classList.add('incorrect'); // RED - got it wrong
        }
      }
    });
  } else {
    // Fill-in-the-blank - disable input and button
  const answerInput = document.getElementById('answer-input');
  const submitButton = document.querySelector('.answer-input button');
  
  if (answerInput) {
    answerInput.disabled = true;
    // Visual feedback on input field
    answerInput.style.background = isCorrect ? '#4CAF50' : '#f44336';
    answerInput.style.color = 'white';
  }
  
  if (submitButton) {
    submitButton.disabled = true;
  }
}
  
  // Award points for correct bonus (5 points each)
  if (isCorrect) {
    if (this.gameMode === 'certamen-solo') {
      // Solo mode: update solo player score
      this.soloPlayer.score += 5;
      this.updateSoloScoreDisplay();
    } else {
      // Team mode: update team score
      this.teams[this.bonusWinningTeam].score += 5;
      this.updateTeamScoreDisplay(this.bonusWinningTeam);
    }
  }

  // Move to next bonus after pause
  setTimeout(() => {
    this.nextBonusQuestion();
  }, 1500);
}

nextBonusQuestion() {
  // 🛡️ GUARD: Don't process if bonus round is already ending
  if (this.bonusRoundEnding) {
    console.log('⚠️ nextBonusQuestion skipped - bonus round already ending');
    return;
  }
  
  this.currentBonusQuestion++;
  
  if (this.currentBonusQuestion >= this.bonusQuestions.length) {
    this.endBonusRound();
  } else {
    this.displayBonusQuestion();
  }
}

endBonusRound() {
  // 🛡️ GUARD: Prevent multiple calls due to timer/answer race condition
  if (this.bonusRoundEnding) {
    console.log('⚠️ endBonusRound already in progress - skipping duplicate call');
    return;
  }
  this.bonusRoundEnding = true;
  
  console.log('🎉 Bonus round complete');
  
  // Reset bonus state
  this.bonusState = 'none';
  this.bonusWinningTeam = null;
  this.currentBonusQuestion = 0;
  this.bonusQuestions = [];
  
  // Clear any remaining timer
  if (this.bonusTimer) {
    clearInterval(this.bonusTimer);
    this.bonusTimer = null;
  }
  
  // 🎮 MULTIPLAYER: Sync bonus end state to Firebase
  if (this.gameMode === 'certamen-multiplayer' && this.isHost) {
    this.syncBonusStateToFirebase('inactive', null);
  }
  
  // CRITICAL: Skip the 2 bonus questions we just used
  // Jump directly to the next toss-up (which will be current + 3)
  console.log(`⏭️ Skipping from question ${this.currentQuestion} to ${this.currentQuestion + 3}`);
  this.currentQuestion += 2; // Skip bonus1 and bonus2
  
  // Move to next toss-up question
  setTimeout(() => {
    this.bonusRoundEnding = false; // 🛡️ Reset guard flag for future bonus rounds
    this.nextQuestion(); // This will increment currentQuestion by 1 more, landing on next toss-up
  }, 2000);
}

updateTeamScoreDisplay(teamIndex) {
  const teamCard = document.getElementById(`team-${teamIndex}`);
  if (teamCard) {
    const scoreElement = teamCard.querySelector('.score');
    if (scoreElement) {
      scoreElement.textContent = `${this.teams[teamIndex].score} points`;
      scoreElement.classList.add('score-update');
      setTimeout(() => {
        scoreElement.classList.remove('score-update');
      }, 1000);
    }
  }
  
  // 🎮 MULTIPLAYER: Host syncs scores to Firebase
  if (this.isHost && this.roomRef && window.updateFirebaseDoc) {
    this.syncScoresToFirebase();
  }
}

// 🎮 MULTIPLAYER: Sync all team scores to Firebase
async syncScoresToFirebase() {
  if (!this.isHost || !this.roomRef) return;
  
  try {
    const teamScores = this.teams.map(team => ({
      name: team.name,
      score: team.score
    }));
    
    await window.updateFirebaseDoc(this.roomRef, {
      'gameState.teamScores': teamScores
    });
    console.log('📊 Synced team scores to Firebase:', teamScores);
  } catch (error) {
    console.error('❌ Failed to sync scores:', error);
  }
}

disableAllBuzzers() {
  this.teams.forEach((team, index) => {
    const buzzButton = document.getElementById(`buzz-${index}`);
    const floatingButton = document.getElementById(`floating-buzz-${index}`);
    
    if (buzzButton) {
      buzzButton.disabled = true;
      // Note: bonus-disabled class is added separately only during actual bonus rounds
    }
    
    if (floatingButton) {
      floatingButton.disabled = true;
    }
  });
}

// ===================================
// LEVENSHTEIN DISTANCE (Fuzzy Matching)
// ===================================
// Calculates the minimum number of single-character edits needed to change one word into another
// Used to accept answers with typos (1 character difference)
levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  
  // Create a 2D array for dynamic programming
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
  
  // Initialize first row and column
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  // Fill the matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]; // No change needed
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,    // Deletion
          matrix[i][j - 1] + 1,    // Insertion
          matrix[i - 1][j - 1] + 1 // Substitution
        );
      }
    }
  }
  
  return matrix[len1][len2];
}

compareAnswers(userAnswer, correctAnswer) {
  // Safety checks for undefined/null values
  if (!userAnswer) {
    return false;
  }
  
  // Handle arrays of acceptable answers
  if (Array.isArray(correctAnswer)) {
    return correctAnswer.some(answer => 
      this.normalizeAndCompare(userAnswer, answer)
    );
  }
  
  // Single answer comparison
  return this.normalizeAndCompare(userAnswer, correctAnswer);
}

normalizeAndCompare(userAnswer, correctAnswer) {
  if (!userAnswer || !correctAnswer) {
    return false;
  }
  
  const userStr = String(userAnswer);
  const correctStr = String(correctAnswer);
  
  // Convert both to lowercase and remove extra whitespace
  const cleanUser = userStr.toLowerCase().trim();
  const cleanCorrect = correctStr.toLowerCase().trim();
  
  // Direct match
  if (cleanUser === cleanCorrect) {
    return true;
  }
  
  // Handle common variations
  const normalizeAnswer = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize spaces
      .replace(/\s/g, ''); // Remove all spaces for number matching
  };
  
  const normalizedUser = normalizeAnswer(cleanUser);
  const normalizedCorrect = normalizeAnswer(cleanCorrect);
  
  // Exact match after normalization
  if (normalizedUser === normalizedCorrect) {
    return true;
  }
  
  // Fuzzy matching - accept answers within 1 character difference
  // This catches common typos like "atlanta" → "Atalanta" or "clymenestra" → "Clytemnestra"
  const distance = this.levenshteinDistance(normalizedUser, normalizedCorrect);
  
  if (distance <= 1) {
    console.log(`✅ FUZZY MATCH: "${userAnswer}" accepted for "${correctAnswer}" (distance: ${distance})`);
    return true;
  }
  
  return false;
}

cleanQuestionText(questionText) {
  if (!questionText) return questionText;
  
  // Remove dependency prefixes from question display
  const prefixesToRemove = [
    /^Toss-up:\s*/i,
    /^Bonus\s*\d*\s*\(Independent\):\s*/i,
    /^Bonus\s*\d*\s*\(Dependent\):\s*/i,
    /^Bonus\s*\d*:\s*/i
  ];
  
  let cleanText = questionText;
  prefixesToRemove.forEach(prefix => {
    cleanText = cleanText.replace(prefix, '');
  });
  
  return cleanText;
}

formatCategoryDisplay(category) {
  const nameMap = {
    'mythology': 'Mythology',
    'roman-history-daily-life': 'Roman History and Daily Life',
    'ancient-geography': 'Ancient Geography', 
    'mottos': 'Phrases and Mottos',
    'latin-grammar': 'Latin Grammar',
    'derivatives': 'Derivatives',
    'literature': 'Literature'
  };
  return nameMap[category] || category;
}

getCategoryDisplayText(currentCategory) {
  // Check if multiple categories were selected
  if (selectedCategories.length > 1) {
    // Show multi-category session with all selected categories
    const formattedCategories = selectedCategories.map(cat => this.formatCategoryDisplay(cat)).join(' + ');
    return `Multi-category Session: ${formattedCategories}`;
  } else {
    // Single category - just show the current question's category
    return this.formatCategoryDisplay(currentCategory);
  }
}

showExplanation(question, isCorrect) {
  const questionDisplay = document.getElementById('question-display');
  
  const explanationDiv = document.createElement('div');
  explanationDiv.className = `explanation ${isCorrect ? 'correct' : 'incorrect'}`;
  
  explanationDiv.innerHTML = `
    <div class="result-indicator">
      ${isCorrect ? '✅ Correct!' : '❌ Incorrect'}
    </div>
    <p>${question.explanation || 'No explanation available for this question.'}</p>
  `;
  
  // Add Continue button for Practice mode only
  if (this.gameMode === 'practice') {
    const continueBtn = document.createElement('button');
    continueBtn.className = 'continue-button';
    continueBtn.textContent = 'Continue →';
    
    continueBtn.addEventListener('click', () => {
  // Check if in retry mode and call the appropriate function
  if (this.retryMode) {
    this.displayRetryQuestion();
  } else {
    this.nextQuestion();
  }
});
    
    explanationDiv.appendChild(continueBtn);
  }
  
  questionDisplay.appendChild(explanationDiv);
}

submitAnswer() {
  // 🛡️ DEBOUNCE: Prevent rapid double-clicks on submit button
  if (!buttonClickTracker.canClick('text-submit', 500)) {
    return; // Ignore rapid repeated clicks
  }
  
  const input = document.getElementById('answer-input');
  if (!input) return;
  
  const userAnswer = input.value.trim();
  if (!userAnswer) return;
  
  input.disabled = true;
}

enableBuzzers() {
  if (this.gameMode !== 'certamen' && this.gameMode !== 'certamen-multiplayer') return;
  
  // 🔧 FIX: Prevent constant re-initialization during Firebase updates
  // Only reinitialize if state has actually changed
  const stateKey = `${this.myTeamIndex}-${Array.from(this.eliminatedTeams).join(',')}`;
  if (this._lastBuzzerState === stateKey) {
    // State hasn't changed, no need to re-clone buttons
    return;
  }
  this._lastBuzzerState = stateKey;
  
  console.log(`🔧 enableBuzzers: Initializing (state changed to ${stateKey})`);
  
  this.teams.forEach((team, index) => {
    const buzzButton = document.getElementById(`buzz-${index}`);
    if (buzzButton) {
      // ✨ FIX BUZZ SPAM: Remove any existing event listeners first
      // Clone and replace the button to remove ALL old event listeners
      const newButton = buzzButton.cloneNode(true);
      buzzButton.parentNode.replaceChild(newButton, buzzButton);
      
      // 🎮 MULTIPLAYER FIX: In multiplayer, only enable button for player's own team
      if (this.gameMode === 'certamen-multiplayer' && this.myTeamIndex !== null && index !== this.myTeamIndex) {
        // This is NOT the player's team - let CSS handle hiding (.other-team .buzz-button { display: none })
        // Don't override the CSS - just return without setting up the button
        return;
      }
      
      // Check if team is eliminated from current question
      if (this.eliminatedTeams.has(index)) {
        newButton.disabled = true;
        newButton.classList.add('eliminated');
        newButton.textContent = 'ELIMINATED';
        newButton.style.background = 'rgba(239, 68, 68, 0.3)';
        newButton.style.display = 'block';
      } else {
        newButton.disabled = false;
        newButton.classList.remove('eliminated', 'inactive-team', 'bonus-disabled');
        newButton.textContent = '🔔 BUZZ IN';
        newButton.style.background = '';
        newButton.style.opacity = '';
        newButton.style.cursor = '';
        newButton.style.display = 'block';
        // Add FRESH event listener (no duplicates possible now)
        newButton.addEventListener('click', () => {
          this.handleBuzz(index);
        });
      }
    }
  });
}

enableSoloBuzzer() {
  if (this.gameMode !== 'certamen-solo') return;
  
  const buzzButton = document.getElementById('solo-buzz');
  const floatingBuzzButton = document.getElementById('floating-solo-buzz');
  
  if (buzzButton) {
    // Remove any existing event listeners by cloning
    const newButton = buzzButton.cloneNode(true);
    buzzButton.parentNode.replaceChild(newButton, buzzButton);
    
    // Reset button state completely
    newButton.disabled = false;
    newButton.textContent = '🔔 BUZZ IN';
    newButton.style.background = '';
    newButton.classList.remove('buzzed-active', 'buzzed-inactive', 'pulse', 'bonus-disabled');
    newButton.addEventListener('click', () => this.handleSoloBuzz());
  }
  
  if (floatingBuzzButton) {
    // Remove any existing event listeners by cloning
    const newFloatingButton = floatingBuzzButton.cloneNode(true);
    floatingBuzzButton.parentNode.replaceChild(newFloatingButton, floatingBuzzButton);
    
    // Reset button state completely
    newFloatingButton.disabled = false;
    newFloatingButton.classList.remove('buzzed-active', 'buzzed-inactive', 'pulse', 'bonus-disabled');
    newFloatingButton.addEventListener('click', () => this.handleSoloBuzz());
  }
}

handleBuzz(teamIndex) {
  console.log(`🔔 handleBuzz called: teamIndex=${teamIndex}, buzzingAllowed=${this.buzzingAllowed}, teamBuzzedIn=${this.teamBuzzedIn}`);
  
  // ✨ RACE CONDITION FIX: Prevent buzzing when not allowed (timer expired, between questions, etc.)
  if (!this.buzzingAllowed) {
    console.log('⚠️ Buzz rejected - buzzing not currently allowed');
    return;
  }
  
  // ✨ DEBOUNCE: Prevent multiple buzzes within 100ms
  const now = Date.now();
  if (this.lastBuzzTime && (now - this.lastBuzzTime) < 100) {
    return; // Ignore rapid repeated clicks
  }
  this.lastBuzzTime = now;
  
  // Prevent buzzing when someone has already buzzed
  if (this.teamBuzzedIn !== null) {
    console.log('⚠️ Buzz rejected - team already buzzed in');
    return;
  }
  
  // 🎮 MULTIPLAYER: If player (not host), send buzz to Firebase and return
  if (this.gameMode === 'certamen-multiplayer' && !this.isHost) {
    this.sendBuzzToFirebase(teamIndex);
    return; // Players don't process buzzes locally
  }
  
  // 🎮 HOST or REGULAR CERTAMEN: Process buzz locally
  this.processBuzz(teamIndex);
}

// 🎮 MULTIPLAYER: Send buzz attempt to Firebase
async sendBuzzToFirebase(teamIndex) {
  if (!this.roomRef || !window.updateFirebaseDoc) {
    console.error('❌ Cannot send buzz - Firebase not available');
    return;
  }
  
  try {
    await window.updateFirebaseDoc(this.roomRef, {
      'gameState.buzzAttempt': {
        teamIndex: teamIndex,
        timestamp: Date.now(),
        questionTimestamp: this._lastQuestionTimestamp || 0 // 🎮 SYNC FIX: Include which question this buzz is for
      }
    });
  } catch (error) {
    console.error('❌ Error sending buzz:', error);
  }
}

// 🎮 MULTIPLAYER: Send answer to Firebase for host to process
async sendAnswerToFirebase(selectedAnswer) {
  if (!this.roomRef || !window.updateFirebaseDoc) {
    console.error('❌ Cannot send answer - Firebase not available');
    return;
  }
  
  // For text input, get the value
  let answerData = selectedAnswer;
  if (selectedAnswer === null) {
    const answerInput = document.getElementById('answer-input');
    answerData = answerInput ? answerInput.value.trim() : '';
  }
  
  try {
    await window.updateFirebaseDoc(this.roomRef, {
      'gameState.submittedAnswer': {
        teamIndex: this.myTeamIndex,
        answer: answerData,
        timestamp: Date.now(),
        questionTimestamp: this._lastQuestionTimestamp || 0 // 🎮 SYNC FIX: Include which question this answer is for
      }
    });
    console.log('✅ Answer sent to Firebase:', answerData);
  } catch (error) {
    console.error('❌ Error sending answer:', error);
  }
}

// 🎮 Process buzz (called by host or in non-multiplayer)
processBuzz(teamIndex) {
  // 💓 Refresh heartbeat on game action
  if (this.isHost) this.sendHostHeartbeat();
  
  this.teamBuzzedIn = teamIndex;
  
  // 🎮 MULTIPLAYER: Host syncs teamBuzzedIn to Firebase so all players know who buzzed
  if (this.gameMode === 'certamen-multiplayer' && this.isHost && this.roomRef) {
    window.updateFirebaseDoc(this.roomRef, {
      'gameState.teamBuzzedIn': teamIndex,
      'gameState.buzzPhase': 'answering'  // Signal that a team is now answering
    });
    console.log(`📤 HOST: Synced teamBuzzedIn=${teamIndex} to Firebase`);
  }
  
  // ✨ IMMEDIATELY DISABLE ALL BUZZ BUTTONS to prevent spam
  this.disableAllBuzzers();
  
  // Clear any buzz-in timer when someone buzzes
  this.clearQuestionTimer();
  if (this.gameMode === 'certamen' || this.gameMode === 'certamen-multiplayer') {
    this.stopReading();
  }
  console.log(`Team ${teamIndex} buzzed in`);

  // STOP ALL PULSING WHEN SOMEONE BUZZES
  this.stopBuzzButtonPulsing();

  // ✨ START 15-SECOND TOSS-UP TIMER (increased from 8 for better gameplay)
  this.startQuestionTimer(15, 'tossup');
  
  this.updateTeamVisualState(teamIndex, 'buzzed-in');
  
  // Add visual feedback when team buzzes in
  this.updateTeamVisualState(teamIndex, 'buzzed-in');
  
  // UPDATE THE YELLOW BADGE TO SHOW WHICH TEAM BUZZED IN
  const questionTypeEl = document.querySelector('.question-type');
  if (questionTypeEl && this.teams[teamIndex]) {
    questionTypeEl.textContent = `TEAM ${this.teams[teamIndex].name.toUpperCase()} - TOSSUP`;
  } 
 
  // Clear late buffer timeout if someone buzzes after reading finished
  if (this.lateBufferTimeout) {
    clearTimeout(this.lateBufferTimeout);
    this.lateBufferTimeout = null;
    console.log('Cancelled late buffer timeout - someone buzzed in');
  }
  
  
  // Re-enable answer options after buzz-in
  const answerButtons = document.querySelectorAll('.answer-option');
  // Verbose button enable logs commented out to reduce console noise
  // console.log(`🎮 DEBUG: Found ${answerButtons.length} answer buttons to enable after buzz-in`);
  answerButtons.forEach((button, index) => {
    button.disabled = false;
    // console.log(`✅ DEBUG: Enabled button ${index}: "${button.textContent}" (disabled=${button.disabled})`);
  });
  
// Also enable text input if it exists
const answerInput = document.getElementById('answer-input');
const submitButton = document.querySelector('.answer-input button');
if (answerInput) {
  answerInput.disabled = false;
  answerInput.readOnly = false; // Allow typing after buzz-in
  answerInput.value = ''; // Clear previous team's answer
  answerInput.style.background = ''; // Reset background color
  answerInput.style.color = ''; // Reset text color
  answerInput.focus();
  // console.log('✅ DEBUG: Enabled text input field');
}
if (submitButton) {
  submitButton.disabled = false;
  // console.log('✅ DEBUG: Enabled submit button');
}

// console.log('🎮 DEBUG: Answer options should now be clickable. Timer should be running.');
} 

// 🎮 MULTIPLAYER: Host processes answer submitted by a player
processPlayerAnswer(teamIndex, answer) {
  // 💓 Refresh heartbeat on game action
  this.sendHostHeartbeat();
  
  console.log(`🎮 HOST: processPlayerAnswer called with teamIndex=${teamIndex}, answer="${answer}"`);
  // Verbose debug logs commented out - uncomment if debugging answer processing
  // console.log(`🎮 HOST: currentQuestionObj=`, this.currentQuestionObj);
  // console.log(`🎮 HOST: bonusState=${this.bonusState}`);
  
  // Clear the answer timer
  this.clearQuestionTimer();
  
  // Get current question - use currentQuestionObj for multiplayer
  const question = this.currentQuestionObj;
  if (!question) {
    console.error('❌ No current question to process answer against (currentQuestionObj is null)');
    return;
  }
  
  console.log(`🔍 HOST: Question:`, question);
  console.log(`🔍 HOST: Question has options: ${!!question.options}, correct index: ${question.correct}`);
  
  // Determine if answer is correct
  let isCorrect;
  const hasOptions = question.options && question.options.length > 0;
  
  if (hasOptions) {
    // Multiple choice - answer is the index
    isCorrect = parseInt(answer) === question.correct;
    console.log(`🔍 HOST: MC answer index ${answer}, correct index ${question.correct}, isCorrect=${isCorrect}`);
    
    // Show visual feedback on the host's screen
    const answerButtons = document.querySelectorAll('.answer-option');
    const selectedIndex = parseInt(answer);
    if (answerButtons[selectedIndex]) {
      answerButtons[selectedIndex].classList.add(isCorrect ? 'correct' : 'incorrect');
    }
  } else {
    // Text answer
    isCorrect = this.compareAnswers(answer, question.answer);
    console.log(`🔍 HOST: Text answer "${answer}" vs "${question.answer}", isCorrect=${isCorrect}`);
  }
  
  // Log the result
  console.log(`🎯 HOST: Team ${teamIndex} answered ${isCorrect ? 'CORRECTLY' : 'INCORRECTLY'}`);
  
  // Sync result to Firebase for players to see FIRST
  this.syncAnswerResultToFirebase(teamIndex, isCorrect, hasOptions ? parseInt(answer) : null);
  
  // 🎮 Check if this is a BONUS question answer (different flow)
  if (this.bonusState === 'active') {
    console.log('🎯 HOST: Processing as BONUS answer');
    this.handleBonusAnswerFromPlayer(teamIndex, isCorrect);
    return;
  }
  
  // TOSS-UP answer logic
  if (isCorrect) {
    // CORRECT ANSWER - Start bonus questions for winning team
    console.log('✅ CORRECT ANSWER - Starting bonus round');
    
    this.bonusWinningTeam = teamIndex;
    this.bonusState = 'pending';
    
    this.bonusStartTimer = setTimeout(() => {
      this.startBonusQuestions();
    }, 1500);
    
  } else {
    // INCORRECT ANSWER - Eliminate team and continue
    console.log(`❌ INCORRECT - Eliminating team ${teamIndex}`);
    this.eliminatedTeams.add(teamIndex);
    this.updateTeamVisualState(teamIndex, 'eliminated');

    setTimeout(() => {
      this.continueAfterIncorrectAnswer();
    }, 1000);
  }
}

// 🎮 MULTIPLAYER: Sync answer result to Firebase
async syncAnswerResultToFirebase(teamIndex, isCorrect, selectedIndex) {
  if (!this.roomRef || !window.updateFirebaseDoc) return;
  
  try {
    await window.updateFirebaseDoc(this.roomRef, {
      'gameState.answerResult': {
        teamIndex: teamIndex,
        isCorrect: isCorrect,
        selectedIndex: selectedIndex,
        timestamp: Date.now()
      },
      'gameState.teamBuzzedIn': null,  // Clear buzzed state
      'gameState.buzzPhase': 'complete'
    });
    console.log(`📤 HOST: Synced answer result to Firebase`);
  } catch (error) {
    console.error('❌ Error syncing answer result:', error);
  }
}

// 🎮 MULTIPLAYER: Handle bonus answer submitted by player
handleBonusAnswerFromPlayer(teamIndex, isCorrect) {
  console.log(`🎯 HOST: handleBonusAnswerFromPlayer - team ${teamIndex}, correct: ${isCorrect}`);
  
  // 🛡️ GUARD: Don't process if bonus round is already ending
  if (this.bonusRoundEnding) {
    console.log('⚠️ handleBonusAnswerFromPlayer skipped - bonus round already ending');
    return;
  }
  
  // CRITICAL: Clear timer immediately when answer is received
  this.clearQuestionTimer();
  
  const bonusNumber = this.currentBonusQuestion + 1;
  const bonusPoints = this.bonusQuestions[this.currentBonusQuestion]?.points || 5;
  
  if (isCorrect) {
    // Award bonus points
    this.teams[this.bonusWinningTeam].score += bonusPoints;
    this.updateTeamScoreDisplay(this.bonusWinningTeam);
    console.log(`✅ BONUS ${bonusNumber} CORRECT - Team ${this.bonusWinningTeam} awarded ${bonusPoints} points`);
  } else {
    console.log(`❌ BONUS ${bonusNumber} INCORRECT - No points awarded`);
  }
  
  // Move to next bonus question after delay
  this.currentBonusQuestion++;
  
  setTimeout(() => {
    this.displayBonusQuestion(); // Will call endBonusRound if no more bonuses
  }, 1500);
}

handleSoloBuzz() {
  // Race condition fix: Prevent buzzing when not allowed
  if (!this.buzzingAllowed) {
    console.log('⚠️ Solo buzz rejected - buzzing not currently allowed');
    return;
  }
  
  // Debounce: Prevent multiple buzzes within 100ms
  const now = Date.now();
  if (this.lastBuzzTime && (now - this.lastBuzzTime) < 100) {
    return;
  }
  this.lastBuzzTime = now;
  
  // Prevent buzzing when already buzzed
  if (this.soloPlayer.buzzed) {
    console.log('⚠️ Solo buzz rejected - already buzzed in');
    return;
  }
  
  this.soloPlayer.buzzed = true;
  
  // Immediately disable buzz button
  this.disableSoloBuzzer();
  
  // STOP PULSING WHEN PLAYER BUZZES
  this.stopBuzzButtonPulsing();
  
  // Clear any buzz-in timers when player buzzes
  this.clearQuestionTimer();
  this.clearSoloCountdownTimer(); // ✨ Clear Solo Certamen circular countdown
  if (this.gameMode === 'certamen-solo') {
    this.stopReading();
  }
  
  // Start 20-second answer timer for solo player
  this.startQuestionTimer(20, 'tossup');
  
  this.updateSoloPlayerVisualState('buzzed-in');
  
  // Update the question type badge
  const questionTypeEl = document.querySelector('.question-type');
  if (questionTypeEl) {
    questionTypeEl.style.display = 'inline-block';
    questionTypeEl.textContent = `YOUR TURN - TOSSUP`;
  }
  
  // Clear late buffer timeout if it exists
  if (this.lateBufferTimeout) {
    clearTimeout(this.lateBufferTimeout);
    this.lateBufferTimeout = null;
  }
  
  // Enable answer options after buzz-in
  const answerButtons = document.querySelectorAll('.answer-option');
  answerButtons.forEach(button => {
    button.disabled = false;
  });
  
  // Enable text input if it exists
  const answerInput = document.getElementById('answer-input');
  const submitButton = document.querySelector('.answer-input button');
  if (answerInput) {
    answerInput.disabled = false;
    answerInput.readOnly = false;
    answerInput.value = '';
    answerInput.style.background = '';
    answerInput.style.color = '';
    answerInput.focus();
  }
  if (submitButton) {
    submitButton.disabled = false;
  }
}

disableSoloBuzzer() {
  const buzzButton = document.getElementById('solo-buzz');
  const floatingBuzzButton = document.getElementById('floating-solo-buzz');
  
  if (buzzButton) {
    buzzButton.disabled = true;
  }
  if (floatingBuzzButton) {
    floatingBuzzButton.disabled = true;
  }
}

updateSoloPlayerVisualState(state) {
  const playerCard = document.getElementById('solo-player');
  const soloBuzzButton = document.getElementById('solo-buzz');
  const floatingSoloButton = document.getElementById('floating-solo-buzz');
  
  if (playerCard) {
    // Remove all visual state classes from player card
    playerCard.classList.remove('team-buzzed-in', 'team-bonus-active');
  }
  
  // Remove all visual state classes from buzz buttons
  if (soloBuzzButton) {
    soloBuzzButton.classList.remove('buzzed-active', 'buzzed-inactive', 'pulse');
  }
  if (floatingSoloButton) {
    floatingSoloButton.classList.remove('buzzed-active', 'buzzed-inactive', 'pulse');
  }
  
  // Apply new state
  switch(state) {
    case 'buzzed-in':
      if (playerCard) {
        playerCard.classList.add('team-buzzed-in');
      }
      // Add green glow effect to buzz buttons
      if (soloBuzzButton) {
        soloBuzzButton.classList.add('buzzed-active');
      }
      if (floatingSoloButton) {
        floatingSoloButton.classList.add('buzzed-active');
      }
      console.log('🟢 Solo player visual state: BUZZED IN (green)');
      break;
    case 'bonus-active':
      if (playerCard) {
        playerCard.classList.add('team-bonus-active');
      }
      // Don't add green glow to buttons during bonus - they should be disabled
      // The startSoloBonusQuestions() and displayBonusQuestion() functions handle button state
      console.log('🟢 Solo player visual state: BONUS ACTIVE (green)');
      break;
    default:
      console.log('⚪ Solo player visual state: NORMAL');
      break;
  }
}

resetSoloPlayerVisualState() {
  this.updateSoloPlayerVisualState('normal');
  console.log('🔄 Solo player visual state reset to normal');
}

disableAnswerOptions() {
  const answerButtons = document.querySelectorAll('.answer-option');
  answerButtons.forEach(button => {
    button.disabled = true;
  });
  
  // ALSO disable text input and submit button
  const answerInput = document.getElementById('answer-input');
  const submitButton = document.querySelector('.answer-input button');
  if (answerInput) {
    answerInput.disabled = true;
  }
  if (submitButton) {
    submitButton.disabled = true;
  }
}

// 🎮 MULTIPLAYER: Enable answer options for the buzzed team
enableAnswerOptions() {
  const answerButtons = document.querySelectorAll('.answer-option');
  answerButtons.forEach(button => {
    button.disabled = false;
  });
  
  // Also enable text input and submit button
  const answerInput = document.getElementById('answer-input');
  const submitButton = document.querySelector('.answer-input button');
  if (answerInput) {
    answerInput.disabled = false;
    answerInput.readOnly = false;
    answerInput.value = '';
    answerInput.style.background = '';
    answerInput.style.color = '';
    answerInput.focus();
  }
  if (submitButton) {
    submitButton.disabled = false;
  }
  console.log('✅ Answer options enabled');
}

// 🎮 CERTAMEN: Clear any correct/incorrect highlighting from answer options
clearAnswerHighlighting() {
  const answerButtons = document.querySelectorAll('.answer-option');
  answerButtons.forEach(button => {
    button.classList.remove('correct', 'incorrect');
    button.disabled = false; // Re-enable for next team
  });
  
  // Also clear text input styling
  const answerInput = document.getElementById('answer-input');
  if (answerInput) {
    answerInput.style.background = '';
    answerInput.style.color = '';
    answerInput.value = '';
    answerInput.disabled = false;
  }
  
  const submitButton = document.querySelector('.answer-input button');
  if (submitButton) {
    submitButton.disabled = false;
  }
}

hideVisualTimer() {
  const timer = document.querySelector('.visual-timer');
  if (timer) {
    timer.remove();
  }
}

// Team visual feedback helper methods
updateTeamVisualState(teamIndex, state) {
  const teamCard = document.getElementById(`team-${teamIndex}`);
  if (!teamCard) return;
  
  // Debug: Check if .other-team class is present (for ANSWERING/ELIMINATED badges)
  const hasOtherTeamClass = teamCard.classList.contains('other-team');
  const hasMyTeamClass = teamCard.classList.contains('my-team');
  
  // Debug log the class list for troubleshooting badge visibility
  if (state === 'buzzed-in' || state === 'eliminated') {
    console.log(`🏷️ Team ${teamIndex} classList: ${teamCard.className}`);
  }
  
  // Remove all visual state classes
  teamCard.classList.remove('team-buzzed-in', 'team-bonus-active', 'team-eliminated', 'team-inactive');
  
  // 🎮 FIX: Also reset button text when going to normal state
  const buzzButton = document.getElementById(`buzz-${teamIndex}`);
  if (buzzButton && state === 'normal') {
    const oldText = buzzButton.textContent;
    buzzButton.textContent = '🔔 BUZZ IN';
    buzzButton.classList.remove('bonus-disabled');
    // Reset display - clear any inline style so CSS takes over
    buzzButton.style.display = '';
    console.log(`🔔 Reset buzz-${teamIndex} button: "${oldText}" → "🔔 BUZZ IN", display cleared`);
  } else if (state === 'normal') {
    console.log(`⚠️ Could not find buzz-${teamIndex} button to reset`);
  }
  
  // Apply new state
  switch(state) {
    case 'buzzed-in':
      teamCard.classList.add('team-buzzed-in');
      // 🎮 FIX: Set button text to ANSWERING for other teams during toss-up buzzes
      if (buzzButton && hasOtherTeamClass) {
        buzzButton.textContent = '🎯 ANSWERING';
        console.log(`🟠 Team ${teamIndex} visual state: BUZZED IN (other team - button set to ANSWERING)`);
        console.log(`🏷️ Team ${teamIndex} buzzed classList: ${teamCard.className}`);
      } else if (hasOtherTeamClass) {
        console.log(`🟠 Team ${teamIndex} visual state: BUZZED IN (other team - no button found)`);
        console.log(`🏷️ Team ${teamIndex} buzzed classList: ${teamCard.className}`);
      } else {
        console.log(`🟢 Team ${teamIndex} visual state: BUZZED IN (my team - green glow)`);
      }
      break;
    case 'bonus-active':
      teamCard.classList.add('team-bonus-active');
      // 🎮 FIX: Set button text to ANSWERING for other teams during bonus rounds
      if (buzzButton && hasOtherTeamClass) {
        buzzButton.textContent = '🎯 ANSWERING';
        console.log(`🟠 Team ${teamIndex} visual state: BONUS ACTIVE (other team - button set to ANSWERING)`);
        console.log(`🏷️ Team ${teamIndex} bonus classList: ${teamCard.className}`);
      } else if (hasOtherTeamClass) {
        console.log(`🟠 Team ${teamIndex} visual state: BONUS ACTIVE (other team - no button found)`);
        console.log(`🏷️ Team ${teamIndex} bonus classList: ${teamCard.className}`);
      } else {
        console.log(`🟢 Team ${teamIndex} visual state: BONUS ACTIVE (my team - green glow)`);
      }
      break;
    case 'eliminated':
      teamCard.classList.add('team-eliminated');
      // 🎮 FIX: Set button text to ELIMINATED
      if (buzzButton) {
        buzzButton.textContent = 'ELIMINATED';
      }
      if (hasOtherTeamClass) {
        console.log(`🔴 Team ${teamIndex} visual state: ELIMINATED (other team - button set to ELIMINATED)`);
      } else {
        console.log(`🔴 Team ${teamIndex} visual state: ELIMINATED (my team - button set to ELIMINATED)`);
      }
      break;
    case 'inactive':
      teamCard.classList.add('team-inactive');
      console.log(`⚫ Team ${teamIndex} visual state: INACTIVE (faded)`);
      break;
    default:
      console.log(`⚪ Team ${teamIndex} visual state: NORMAL`);
      break;
  }
}

resetAllTeamVisualStates() {
  this.teams.forEach((team, index) => {
    this.updateTeamVisualState(index, 'normal');
  });
  console.log('🔄 All team visual states reset to normal');
}

}  // <-- This closing brace stays (end of CertamenGame class)


function showCategoryLimitMessage() {
  const messageElement = document.getElementById('category-limit-message');
  if (messageElement) {
    messageElement.innerHTML = `
      3 themes maximum for Timed and Practice mode.<br>
      <small>Deselect a category to choose a different one.</small>
    `;
    
    messageElement.style.display = 'block';
    setTimeout(() => {
      messageElement.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      messageElement.classList.add('hiding');
      messageElement.classList.remove('show');
      
      setTimeout(() => {
        hideCategoryLimitMessage();
      }, 300);
    }, 3000);
  }
}

function hideCategoryLimitMessage() {
  const messageElement = document.getElementById('category-limit-message');
  if (messageElement) {
    messageElement.style.display = 'none';
    messageElement.classList.remove('show', 'hiding');
  }
}

function formatCategoryName(category) {
  const nameMap = {
    'mythology': 'Mythology',
    'roman-history-daily-life': 'Roman History',
    'ancient-geography': 'Geography', 
    'mottos': 'Mottos',
    'latin-grammar': 'Grammar',
    'derivatives': 'Derivatives',
    'literature': 'Literature'
  };
  return nameMap[category] || category;
}

// ===================================
// ENHANCED INITIALIZATION & EVENT LISTENERS
// ===================================

// Initialize game instance
const game = new CertamenGame();
// ✨ ENHANCED: Multi-category selection event listeners
document.querySelectorAll('.category-option').forEach(option => {
  option.addEventListener('click', function() {
    const category = this.dataset.category;
    updateSelection('category', category, this);
  });
});

document.querySelectorAll('.level-option').forEach(option => {
  option.addEventListener('click', function() {
    const level = this.dataset.level;
    updateSelection('level', level, this);
  });
});

document.querySelectorAll('.mode-option').forEach(option => {
  option.addEventListener('click', function() {
    const mode = this.dataset.mode;
    updateSelection('mode', mode, this);
  });
});

// ✨ ENHANCED: Start game with multiple categories
document.getElementById('start-game').addEventListener('click', function(event) {
  // Prevent any default action that might cause page reload
  event.preventDefault();
  
  console.log('Start button clicked!');
  console.log('Selected categories:', selectedCategories);
  console.log('Selected level:', selectedLevel);
  console.log('Selected mode:', selectedMode);
  console.log('Is valid:', isSelectionValid());
  
  if (selectedCategories.length > 0 && selectedLevel && selectedMode && isSelectionValid()) {
    // Disable button to prevent double-clicking
    this.disabled = true;
    
    // Update button text for split-reveal structure
    const topSpan = this.querySelector('.split-top');
    const bottomSpan = this.querySelector('.split-bottom');
    const revealSpan = this.querySelector('.split-reveal');
    
    if (topSpan && bottomSpan && revealSpan) {
      topSpan.textContent = 'STARTING...';
      bottomSpan.textContent = 'STARTING...';
      revealSpan.style.display = 'none';
    }
    
    try {
      // Check if multiplayer certamen mode
      if (selectedMode === 'certamen-multiplayer') {
        console.log('🌐 Multiplayer Certamen selected - showing Host/Join screen');
        
        // CRITICAL: Store selections in BOTH localStorage AND window globals
        // localStorage for firebase.js, window for multiplayer.js
        localStorage.setItem('multiplayer_selectedLevel', selectedLevel);
        localStorage.setItem('multiplayer_selectedCategories', selectedCategories.join(','));
        window.selectedLevel = selectedLevel;
        window.selectedCategories = selectedCategories;
        
        console.log(`📊 Stored for multiplayer: Level=${selectedLevel}, Categories=${selectedCategories}`);
        
        showMultiplayerSetup();
        // Re-enable button in case they go back
        this.disabled = false;
        if (topSpan && bottomSpan && revealSpan) {
          topSpan.textContent = 'START GAME';
          bottomSpan.textContent = 'START GAME';
          revealSpan.style.display = '';
        }
      } else {
        // Regular modes - start game immediately
        game.startGame(selectedCategories, selectedLevel, selectedMode);
      }
    } catch (error) {
      console.error('Error starting game:', error);
      this.disabled = false;
      if (topSpan && bottomSpan && revealSpan) {
        topSpan.textContent = 'START GAME';
        bottomSpan.textContent = 'START GAME';
        revealSpan.style.display = '';
      }
    }
  } else {
    console.warn('Cannot start game - invalid selection');
  }
});

// ============================================
// MULTIPLAYER SCREEN MANAGEMENT
// ============================================

function showMultiplayerSetup() {
  console.log('📱 Showing Host/Join screen');
  
  // Hide the setup screen with fade out
  const setupContainer = document.querySelector('.game-setup');
  const header = document.querySelector('.header');
  const progressIndicator = document.querySelector('.progress-indicator');
  
  if (setupContainer) {
    setupContainer.style.transition = 'opacity 0.5s ease';
    setupContainer.style.opacity = '0';
  }
  if (header) {
    header.style.transition = 'opacity 0.5s ease';
    header.style.opacity = '0';
  }
  if (progressIndicator) {
    progressIndicator.style.transition = 'opacity 0.5s ease';
    progressIndicator.style.opacity = '0';
  }
  
  // Show multiplayer setup screen after fade out
  setTimeout(() => {
    if (setupContainer) setupContainer.style.display = 'none';
    if (header) header.style.display = 'none';
    if (progressIndicator) progressIndicator.style.display = 'none';
    
    const multiplayerSetup = document.getElementById('multiplayer-setup');
    if (multiplayerSetup) {
      multiplayerSetup.style.display = 'flex';
      // Trigger reflow for transition
      multiplayerSetup.offsetHeight;
      multiplayerSetup.classList.add('active');
    }
  }, 500);
}

function hideMultiplayerSetup() {
  console.log('📱 Hiding Host/Join screen');
  
  const multiplayerSetup = document.getElementById('multiplayer-setup');
  
  if (multiplayerSetup) {
    multiplayerSetup.classList.remove('active');
    
    setTimeout(() => {
      multiplayerSetup.style.display = 'none';
      
      // Show setup screen again with fade in
      const setupContainer = document.querySelector('.game-setup');
      const header = document.querySelector('.header');
      const progressIndicator = document.querySelector('.progress-indicator');
      
      if (setupContainer) {
        setupContainer.style.display = 'block';
        setupContainer.style.opacity = '0';
        setTimeout(() => {
          setupContainer.style.opacity = '1';
        }, 50);
      }
      if (header) {
        header.style.display = 'block';
        header.style.opacity = '0';
        setTimeout(() => {
          header.style.opacity = '1';
        }, 50);
      }
      if (progressIndicator) {
        progressIndicator.style.display = 'flex';
        progressIndicator.style.opacity = '0';
        setTimeout(() => {
          progressIndicator.style.opacity = '1';
        }, 50);
      }
    }, 500);
  }
}

// Event listeners for Host/Join buttons
// Multiplayer button handlers now in multiplayer.js

document.getElementById('back-to-setup').addEventListener('click', function() {
  console.log('← Back to setup clicked');
  hideMultiplayerSetup();
});

// Scroll event listeners
window.addEventListener('scroll', updateScrollIndicator);
window.addEventListener('resize', updateScrollIndicator);

// Initialize intro page
createParticles();
updateProgress();
updateScrollIndicator();
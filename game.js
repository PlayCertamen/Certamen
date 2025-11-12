console.log("JavaScript is working!");

// ===== DEBUG MODE TOGGLE =====
const DEBUG_MODE = false; // Set to true to enable debug logging, false to hide it

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
  if (selectedMode === 'certamen' || selectedMode === 'certamen-solo') {
    // Certamen mode: Allow 6 categories (novice) or 7 categories (advanced with literature)
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
    return false; // Invalid category count for Certamen mode
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
      // Category is already selected - remove it (unless it's the last one in Certamen mode)
      if (selectedMode === 'certamen' || selectedMode === 'certamen-solo') {
        // In Certamen mode, don't allow deselection - always all categories
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
    
    if (selectedMode === 'certamen' || selectedMode === 'certamen-solo') {
      updateCertamenCategories(value);
    }
    
    setTimeout(() => {
      scrollToNextSection(element.closest('.section'));
    }, 800);
    
  } else if (type === 'mode') {
    // ✨ TRANSITION LOGIC: Handle switching from Certamen to Practice/Timed
    const wasInCertamen = (selectedMode === 'certamen' || selectedMode === 'certamen-solo');
    const goingToPracticeTimed = (value === 'practice' || value === 'timed');
    
    selectedMode = value;
    document.querySelectorAll('.mode-option').forEach(btn => btn.classList.remove('selected'));
    
    element.classList.add('selected');
    
    // Clear categories when switching FROM Certamen TO Practice/Timed
    if (wasInCertamen && goingToPracticeTimed) {
      console.log('🔄 Switching from Certamen to Practice/Timed - clearing category selections');
      selectedCategories = [];
      document.querySelectorAll('.category-option').forEach(btn => btn.classList.remove('selected'));
      updateCategoryDisplay();
      hideCategoryLimitMessage();
      toggleLiteratureMessage(false);
    }
    
    // Auto-select categories when switching TO Certamen modes
    if (value === 'certamen' || value === 'certamen-solo') {
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
    // For Certamen mode with many categories
    if (selectedMode === 'certamen' || selectedMode === 'certamen-solo') {
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
if (helperText && selectedMode !== 'certamen' && selectedMode !== 'certamen-solo') {
  helperText.textContent = '(3 themes maximum for Timed and Practice modes)';
  helperText.classList.remove('limit-active');
} else if (helperText && (selectedMode === 'certamen' || selectedMode === 'certamen-solo')) {
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
    this.currentPassage = 0; // ✨ NEW: Track which passage/round (1-20) we're on in Certamen
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
  
  if (level === 'advanced') {
    categories.push('literature');
  }
  
  this.questions = [];
  const questionGroups = {};
  
  // Load all questions from each category
  for (const category of categories) {
    try {
      const questions = await this.questionLoader.loadQuestions(category, level, 'certamen');
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
        
        console.log(`✅ Loaded ${questions.length} questions from ${category}`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to load ${category}:`, error);
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
  if ((this.gameMode !== 'certamen' && this.gameMode !== 'certamen-solo') || !this.usedTriads || this.usedTriads.length === 0) {
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
    const teamNames = getRandomTeamNames();
    
    this.teams = [
      { name: teamNames[0], captain: 'Player 1', score: 0, buzzed: false },
      { name: teamNames[1], captain: 'Player 2', score: 0, buzzed: false },
      { name: teamNames[2], captain: 'Player 3', score: 0, buzzed: false }
    ];
    
    console.log('Teams setup with names:', teamNames);
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
    if ((mode === 'certamen' || mode === 'certamen-solo') && this.actualTriadCount) {
      const progressDisplay = document.getElementById('certamen-progress');
      if (progressDisplay) {
        progressDisplay.textContent = `Round 0 of ${this.actualTriadCount}`;
      }
    }
    
    if (mode === 'certamen' || mode === 'certamen-solo') {
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
    gameContainer.innerHTML = `
      <div class="game-header">
        <h2>${mode === 'certamen-solo' ? 'Solo Certamen' : mode.charAt(0).toUpperCase() + mode.slice(1)} Mode</h2>
        ${(mode === 'certamen' || mode === 'certamen-solo') ? '<div id="certamen-progress" class="certamen-progress">Round 0 of ...</div>' : ''}
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
      
      ${mode === 'certamen' ? this.createCertamenInterface() : mode === 'certamen-solo' ? this.createSoloCertamenInterface() : this.createSinglePlayerInterface(mode)}
    `;
    
    gameContainer.querySelector('#back-to-setup').addEventListener('click', () => {
      this.returnToSetup();
    });
    
    return gameContainer;
  }

  createCertamenInterface() {
    return `
      <div class="teams-container">
        <div class="team-scores">
          ${this.teams.map((team, index) => `
            <div class="team-card" id="team-${index}">
              <h3>${team.name}</h3>
              <p>Captain: ${team.captain}</p>
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
  
  this.displayQuestion(question);
  this.enableBuzzers();
  this.disableAnswerOptions();
  
  // START PULSING BUZZ BUTTONS
  this.startBuzzButtonPulsing();
}

// ✨ UPDATE PROGRESS DISPLAY for Certamen mode
updateProgressDisplay() {
  const progressDisplay = document.getElementById('certamen-progress');
  if (progressDisplay && (this.gameMode === 'certamen' || this.gameMode === 'certamen-solo')) {
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
  
  questionDisplay.innerHTML = `
    <div class="game-over">
      <div class="victory-header">
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
  console.log('🔄 Starting new game with same settings...');
  this.currentPassage = 0;
  this.currentQuestion = 0;
  this.teams.forEach(team => team.score = 0);
  this.eliminatedTeams.clear();
  this.teamBuzzedIn = null;
  this.bonusWinningTeam = null;
  
  // Use the global selected settings
  await this.startGame(selectedCategories, selectedLevel, selectedMode);
}

// ===================================
// QUESTION DISPLAY & ANSWER HANDLING
// ===================================
displayQuestion(question) {
  // ✨ BUG FIX: Track when question starts to prevent instant skipping
  this.questionStartTime = Date.now();
  
  const questionDisplay = document.getElementById('question-display');
  
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
  } else if (this.gameMode === 'certamen') {
    questionTypeLabel = '<div class="question-type" style="display: none;">TOSSUP</div>';
  } else {
    questionTypeLabel = `<div class="question-type">${this.getCategoryDisplayText(question.category)}</div>`;
  }
  
  questionDisplay.innerHTML = `
    <div class="question-content">
     ${questionTypeLabel}
     <div class="timer-placeholder" id="timer-placeholder"></div>
      <h3 id="question-text-display">${(this.gameMode === 'certamen' || this.gameMode === 'certamen-solo') ? '' : this.cleanQuestionText(question.question)}</h3>
      ${this.createAnswerOptions(question)}
    </div>
  `;
  
  this.setupAnswerHandlers(question);
  
  // Add buzz-in reminder for text input - FOR BOTH CERTAMEN MODES
  if (this.gameMode === 'certamen' || this.gameMode === 'certamen-solo') {
    setTimeout(() => {
      const answerInput = document.getElementById('answer-input');
      
      if (answerInput) {
        // ENABLE the input so it can receive events, but prevent typing
        answerInput.disabled = false;
        answerInput.readOnly = true; // Prevents typing but allows focus/click
        
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
          const notBuzzedIn = (this.gameMode === 'certamen' || this.gameMode === 'certamen-solo') 
            ? (this.gameMode === 'certamen' ? this.teamBuzzedIn === null : !this.soloPlayer?.buzzed)
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
          const notBuzzedIn = (this.gameMode === 'certamen' || this.gameMode === 'certamen-solo')
            ? (this.gameMode === 'certamen' ? this.teamBuzzedIn === null : !this.soloPlayer?.buzzed)
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
  if (this.gameMode === 'certamen' || this.gameMode === 'certamen-solo') {
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
    
    this.isReading = true;
    this.currentWordIndex = 0;
    this.questionWords = question.question.split(' ');
    this.partialQuestion = '';
    this.eliminatedTeams.clear();
    
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
}

finishReading(question) {
  console.log('✅ Reading finished naturally - checking if anyone buzzed');
  this.isReading = false;
  
  if (this.readingTimeout) {
    clearTimeout(this.readingTimeout);
    this.readingTimeout = null;
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
    // Regular Certamen: Use existing timer system
    this.startQuestionTimer(5, 'buzz-in');
  }
}


  // ===================================
  // GAME FLOW & NAVIGATION  
  // ===================================
nextQuestion() {
  const currentQ = this.questions[this.currentQuestion];
  
  // Handle unanswered toss-ups
  if (this.gameMode === 'certamen' && currentQ && currentQ.dependency === 'tossup' && 
    (this.teamBuzzedIn === null || this.eliminatedTeams.size === 3)) {
    console.log(`🚫 UNANSWERED TOSS-UP: Skipping to next toss-up (jumping +3 positions)`);
    this.currentQuestion += 3; // Skip current toss-up + 2 bonus questions
  } else if (this.gameMode === 'certamen-solo' && currentQ && currentQ.dependency === 'tossup' && 
    !this.soloPlayer.buzzed) {
    console.log(`🚫 UNANSWERED TOSS-UP (SOLO): Skipping to next toss-up (jumping +3 positions)`);
    this.currentQuestion += 3; // Skip current toss-up + 2 bonus questions
  } else {
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
  if (this.gameMode === 'certamen') {
    this.eliminatedTeams.clear();  // Clear eliminations from previous question
    this.teamBuzzedIn = null;      // Reset buzz state
    this.resetAllTeamVisualStates(); // Reset all visual states for new question
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
  } else if (this.gameMode === 'certamen') {
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
  if (this.gameMode === 'certamen') {
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
      buzzButton.classList.remove('buzzed-active', 'buzzed-inactive', 'eliminated');
      buzzButton.textContent = '🔔 BUZZ IN';
      buzzButton.style.background = '';
      buzzButton.style.color = '';
    }
    
    if (floatingButton) {
      floatingButton.disabled = false;
      floatingButton.classList.remove('buzzed-active', 'buzzed-inactive', 'eliminated');
      floatingButton.textContent = team.name;
      floatingButton.style.background = '';
      floatingButton.style.color = '';
    }
  });
  
  this.nextRoundTimer = setTimeout(() => {
    if (this.gameMode === 'certamen') {
      this.startCertamenRound();
    } else if (this.gameMode === 'certamen-solo') {
      this.startSoloCertamenRound();
    } else {
      this.startSinglePlayerRound(this.gameMode);
    }
  }, 1000);
}

returnToSetup() {
  // Save tracking data BEFORE clearing state
  this.saveCertamenPassages();      // For Certamen mode
  if (selectedCategories && selectedCategories.length > 0) {
    this.saveRecentQuestions(selectedCategories);  // For Practice/Timed modes
  }
  
  // CRITICAL: Clear Certamen/reading state BEFORE resetting gameMode
  // (Otherwise the if check below will never work!)
  if (this.gameMode === 'certamen' || this.gameMode === 'certamen-solo') {
    this.stopReading();
    this.isReading = false;
    this.currentWordIndex = 0;
    this.questionWords = [];
    this.partialQuestion = '';
    if (this.eliminatedTeams) {
      this.eliminatedTeams.clear();
    }
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
    if (this.gameMode === 'certamen') {
      // Regular certamen - pulse team buzz buttons
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
    if (this.gameMode === 'certamen') {
      // Regular certamen - stop pulsing team buzz buttons
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
    console.log('🔍 DEBUG MC: User clicked index:', selectedAnswer, 'Expected index:', question.correct);
    console.log('🔍 DEBUG MC: User clicked:', question.options[selectedAnswer], 'Expected answer:', question.answer);
    console.log('🔍 DEBUG MC: Comparison result:', isCorrect);
    
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
  } else if (this.gameMode !== 'certamen') {
    // Practice/Timed modes: permanent green/red for learning
    if (index === question.correct) {
      btn.classList.add('correct');
    } else if (index === selectedAnswer && !isCorrect) {
      btn.classList.add('incorrect');
    }
  } else {
    // Certamen mode (team)
    if (index === question.correct && isCorrect) {
      btn.classList.add('correct'); // Show green when correct
    } else if (index === selectedAnswer && !isCorrect) {
      btn.classList.add('incorrect'); // Show red briefly
      setTimeout(() => {
        btn.classList.remove('incorrect'); // Remove red so next team sees clean options
      }, 800);
    }
  }
});

  } else {
  // Fill-in-the-blank - selectedAnswer is ignored, get from input
  const userAnswer = document.getElementById('answer-input').value.trim();
  console.log('🔍 DEBUG: User typed:', userAnswer, 'Expected:', question.answer);
  isCorrect = this.compareAnswers(userAnswer, question.answer);
  console.log('🔍 DEBUG: Comparison result:', isCorrect);
  
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
if (this.gameMode === 'certamen') {
  // CERTAMEN MODE: Handle team elimination and bonus questions
  
  // ✨ FIX: Ignore answer submission if timer has already expired
  if (this.timerHasExpired) {
    console.log('⚠️ Ignoring answer submission - timer has already expired');
    return;
  }
  
  console.log(`🎯 Certamen answer: ${isCorrect ? 'CORRECT' : 'INCORRECT'} by team ${this.teamBuzzedIn}`);
  
  if (isCorrect) {
    // CORRECT ANSWER - Start bonus questions for winning team
    console.log('✅ CORRECT ANSWER - Starting bonus round');
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
    this.allEliminatedTimer = setTimeout(() => this.nextQuestion(), 1000);
    return;
  }

  // Reset for remaining teams
  this.teamBuzzedIn = null;
  
  // ✨ RE-ENABLE BUZZING for remaining teams - race condition fix
  this.buzzingAllowed = true;
  console.log('🟢 Buzzing re-enabled for remaining teams');
  
  this.enableBuzzers();
  this.disableAnswerOptions();

  // RESTART PULSING FOR REMAINING TEAMS
  this.startBuzzButtonPulsing();

  // Show full question for remaining teams
  this.updateQuestionDisplay(question.question, false);
  
  // START 5-SECOND BUZZ-IN TIMER FOR REMAINING TEAMS
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
  console.log('🏛️ Starting bonus questions for winning team:', this.teamBuzzedIn);
  
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
    console.log(`🔍 DEBUG: Tossup group: "${tossupGroup}"`);
    console.log(`🔍 DEBUG: Bonus1 group: "${bonus1.group}"`);
    console.log(`🔍 DEBUG: Bonus2 group: "${bonus2.group}"`);
    
    // Use flexible group matching
    const normalizedTossupGroup = normalizeGroupName(tossupGroup);
    const normalizedBonus1Group = normalizeGroupName(bonus1.group);
    const normalizedBonus2Group = normalizeGroupName(bonus2.group);
    
    console.log(`🔍 DEBUG: Normalized groups - Tossup: "${normalizedTossupGroup}", Bonus1: "${normalizedBonus1Group}", Bonus2: "${normalizedBonus2Group}"`);
    console.log(`🔍 DEBUG: Groups match? ${normalizedBonus1Group === normalizedTossupGroup && normalizedBonus2Group === normalizedTossupGroup}`);
    
    if (normalizedBonus1Group === normalizedTossupGroup && normalizedBonus2Group === normalizedTossupGroup) {
      
      // Set up bonus state
      this.bonusState = 'active';
      this.bonusWinningTeam = this.teamBuzzedIn;
      this.bonusQuestions = [bonus1, bonus2];
      this.currentBonusQuestion = 0;

      // Keep winning team highlighted during bonus round
      this.updateTeamVisualState(this.bonusWinningTeam, 'bonus-active');
      
      // Mark other teams as inactive (faded) during bonus round
      this.teams.forEach((team, index) => {
        if (index !== this.bonusWinningTeam) {
          this.updateTeamVisualState(index, 'inactive');
        }
      });
      
      console.log(`📋 Loaded bonus questions from group ${tossupGroup}`);
      console.log(`Bonus 1: ${bonus1.question.substring(0, 50)}...`);
      console.log(`Bonus 2: ${bonus2.question.substring(0, 50)}...`);
      
      // Add winning team score for correct toss-up
      const tossupPoints = this.questions[this.currentQuestion].points || 10;
      this.teams[this.bonusWinningTeam].score += tossupPoints;
      this.updateTeamScoreDisplay(this.bonusWinningTeam);
      
      // Start first bonus question after brief pause
      setTimeout(() => {
        this.displayBonusQuestion();
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

      // Card stays normal purple during bonus - only score badge is green
      // (Removed: this.updateSoloPlayerVisualState('bonus-active'))
      
      // Immediately disable solo buzzer and remove visual effects
      this.disableSoloBuzzer();
      const soloBuzzButton = document.getElementById('solo-buzz');
      const floatingSoloButton = document.getElementById('floating-solo-buzz');
      if (soloBuzzButton) {
        soloBuzzButton.classList.remove('buzzed-active', 'pulse');
        soloBuzzButton.textContent = '🔕 BONUS ROUND';
      }
      if (floatingSoloButton) {
        floatingSoloButton.classList.remove('buzzed-active', 'pulse');
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
  this.questionTimeLeft = duration;
  this.currentTimerType = timerType; // 'tossup', 'bonus', or 'buzz-in'
  
  // ✨ FIX: Reset flag when starting new timer (for tossup questions)
  // For bonus questions, this flag isn't used, but reset it anyway for consistency
  this.timerHasExpired = false;
  
  // Create timer display
  const questionContainer = document.querySelector('.question-container');
  if (questionContainer) {
    const timerBox = document.createElement('div');
    timerBox.className = 'question-timer-box';
    timerBox.id = 'question-timer-box';
    timerBox.innerHTML = `
      <span class="timer-icon">⏰</span>
      <span id="question-timer">${duration}</span>
    `;
    
    const questionType = questionContainer.querySelector('.question-type');
    if (questionType) {
      questionType.insertAdjacentElement('afterend', timerBox);
    }
  }
  
  this.questionTimer = setInterval(() => {
    this.questionTimeLeft--;
    this.updateQuestionTimerDisplay();
    
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
  console.log('🔴 Buzzing disabled - timer expired');
  
  if (this.questionTimer) {
    clearInterval(this.questionTimer);
    this.questionTimer = null;
  }
  
  const timerBox = document.getElementById('question-timer-box');
  if (timerBox) {
    timerBox.innerHTML = '<span class="timer-icon">⏰</span> Time Expired!';
    timerBox.classList.add('expired');
  }
  
  if (this.currentTimerType === 'buzz-in') {
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
  
  // REMOVE the visual timer box from DOM
  const timerBox = document.getElementById('question-timer-box');
  if (timerBox) {
    timerBox.remove();
  }
}

displayBonusQuestion() {
  if (this.currentBonusQuestion >= this.bonusQuestions.length) {
    this.endBonusRound();
    return;
  }
  
  // CRITICAL: Clear any existing timer before starting a new one
  this.clearQuestionTimer();
  
  const bonusQuestion = this.bonusQuestions[this.currentBonusQuestion];
  const bonusNumber = this.currentBonusQuestion + 1;
  
  console.log(`📋 Displaying bonus question ${bonusNumber}/2`);
  
  // Update question display
const questionDisplay = document.getElementById('question-display');

// Different display for solo vs team mode
let questionTypeLabel;
if (this.gameMode === 'certamen-solo') {
  questionTypeLabel = `BONUS ${bonusNumber}`;
} else {
  questionTypeLabel = `TEAM ${this.teams[this.bonusWinningTeam].name.toUpperCase()} - BONUS QUESTION ${bonusNumber}`;
}

questionDisplay.innerHTML = `
  <div class="bonus-question-container">
    <div class="question-content">
      <div class="question-type">${questionTypeLabel}</div>
      <h3 id="question-text-display">${this.cleanQuestionText(bonusQuestion.question)}</h3>
      ${this.createAnswerOptions(bonusQuestion)}
    </div>
  </div>
`;
  
  // Set up answer handlers for this bonus question
  this.setupAnswerHandlers(bonusQuestion);
  
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
      soloBuzzButton.textContent = '🔕 BONUS ROUND';
    }
    if (floatingSoloButton) {
      floatingSoloButton.classList.remove('buzzed-active', 'pulse');
    }
  } else {
    // Team mode - disable all team buzzers
    this.disableAllBuzzers();
    
    // Set BONUS ROUND text on all team buttons (only during actual bonus)
    this.teams.forEach((team, index) => {
      const buzzButton = document.getElementById(`buzz-${index}`);
      if (buzzButton) {
        buzzButton.textContent = '🔕 BONUS ROUND';
      }
    });
  }
}

handleBonusAnswer(question, selectedAnswer, isCorrect) {
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
      
      // Only show green when user got it right
      if (index === question.correct && isCorrect) {
        btn.classList.add('correct');
      }
      
      // Show the wrong answer in red (stays visible for bonus)
      if (index === selectedAnswer && !isCorrect) {
        btn.classList.add('incorrect');
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
  this.currentBonusQuestion++;
  
  if (this.currentBonusQuestion >= this.bonusQuestions.length) {
    this.endBonusRound();
  } else {
    this.displayBonusQuestion();
  }
}

endBonusRound() {
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
  
  // CRITICAL: Skip the 2 bonus questions we just used
  // Jump directly to the next toss-up (which will be current + 3)
  console.log(`⏭️ Skipping from question ${this.currentQuestion} to ${this.currentQuestion + 3}`);
  this.currentQuestion += 2; // Skip bonus1 and bonus2
  
  // Move to next toss-up question
  setTimeout(() => {
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
}

disableAllBuzzers() {
  this.teams.forEach((team, index) => {
    const buzzButton = document.getElementById(`buzz-${index}`);
    const floatingButton = document.getElementById(`floating-buzz-${index}`);
    
    if (buzzButton) {
      buzzButton.disabled = true;
      buzzButton.classList.add('bonus-disabled');
    }
    
    if (floatingButton) {
      floatingButton.disabled = true;
      floatingButton.classList.add('bonus-disabled');
    }
  });
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
  
  return normalizeAnswer(cleanUser) === normalizeAnswer(cleanCorrect);
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
  const input = document.getElementById('answer-input');
  if (!input) return;
  
  const userAnswer = input.value.trim();
  if (!userAnswer) return;
  
  input.disabled = true;
}

enableBuzzers() {
  if (this.gameMode !== 'certamen') return;
  
  this.teams.forEach((team, index) => {
    const buzzButton = document.getElementById(`buzz-${index}`);
    if (buzzButton) {
      // ✨ FIX BUZZ SPAM: Remove any existing event listeners first
      // Clone and replace the button to remove ALL old event listeners
      const newButton = buzzButton.cloneNode(true);
      buzzButton.parentNode.replaceChild(newButton, buzzButton);
      
      // Check if team is eliminated from current question
      if (this.eliminatedTeams.has(index)) {
        newButton.disabled = true;
        newButton.classList.add('eliminated');
        newButton.textContent = 'ELIMINATED';
        newButton.style.background = 'rgba(239, 68, 68, 0.3)';
      } else {
        newButton.disabled = false;
        newButton.classList.remove('eliminated');
        newButton.textContent = '🔔 BUZZ IN';
        newButton.style.background = '';
        // Add FRESH event listener (no duplicates possible now)
        newButton.addEventListener('click', () => this.handleBuzz(index));
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
  
  this.teamBuzzedIn = teamIndex;
  
  // ✨ IMMEDIATELY DISABLE ALL BUZZ BUTTONS to prevent spam
  this.disableAllBuzzers();
  
  // Clear any buzz-in timer when someone buzzes
  this.clearQuestionTimer();
  if (this.gameMode === 'certamen') {
    this.stopReading();
  }
  console.log(`Team ${teamIndex} buzzed in`);

  // STOP ALL PULSING WHEN SOMEONE BUZZES
  this.stopBuzzButtonPulsing();

  // ✨ START 8-SECOND TOSS-UP TIMER (reduced from 12 for faster pace)
  this.startQuestionTimer(8, 'tossup');
  
  this.updateTeamVisualState(teamIndex, 'buzzed-in');
  
  // Add visual feedback when team buzzes in
  this.updateTeamVisualState(teamIndex, 'buzzed-in');
  
  // UPDATE THE YELLOW BADGE TO SHOW WHICH TEAM BUZZED IN
  const questionTypeEl = document.querySelector('.question-type');
  if (questionTypeEl) {
    questionTypeEl.style.display = 'inline-block';
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
  answerButtons.forEach(button => {
    button.disabled = false;
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
}
if (submitButton) {
  submitButton.disabled = false;
}
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
  
  // Remove all visual state classes
  teamCard.classList.remove('team-buzzed-in', 'team-bonus-active', 'team-eliminated', 'team-inactive');
  
  // Apply new state
  switch(state) {
    case 'buzzed-in':
      teamCard.classList.add('team-buzzed-in');
      console.log(`🟢 Team ${teamIndex} visual state: BUZZED IN (green)`);
      break;
    case 'bonus-active':
      teamCard.classList.add('team-bonus-active');
      console.log(`🟢 Team ${teamIndex} visual state: BONUS ACTIVE (green)`);
      break;
    case 'eliminated':
      teamCard.classList.add('team-eliminated');
      console.log(`🔴 Team ${teamIndex} visual state: ELIMINATED (red)`);
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
    this.textContent = 'Starting...';
    
    try {
      // Pass array of categories instead of single category
      game.startGame(selectedCategories, selectedLevel, selectedMode);
    } catch (error) {
      console.error('Error starting game:', error);
      this.disabled = false;
      this.textContent = 'Start Game';
    }
  } else {
    console.warn('Cannot start game - invalid selection');
  }
});

// Scroll event listeners
window.addEventListener('scroll', updateScrollIndicator);
window.addEventListener('resize', updateScrollIndicator);

// Initialize intro page
createParticles();
updateProgress();
updateScrollIndicator();
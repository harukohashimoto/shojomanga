class MangaApp {
    constructor() {
        this.currentIndex = 0;
        this.previousEffects = [];
        this.init();
    }

    init() {
        this.backgroundElement = document.getElementById('background-image');
        this.speechBubble = document.getElementById('speech-bubble');
        this.speechText = document.getElementById('speech-text');
        this.bubblePath = document.getElementById('bubble-path');
        this.container = document.getElementById('manga-container');
        
        this.setupEventListeners();
        this.createSpeechBubble();
        this.showNext();
    }

    setupEventListeners() {
        this.container.addEventListener('click', () => this.showNext());
        this.container.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.showNext();
        });
    }

    createSpeechBubble() {
        const bubblePath = "M 50 50 Q 50 20 80 20 L 320 20 Q 350 20 350 50 L 350 120 Q 350 150 320 150 L 150 150 L 120 180 L 140 150 L 80 150 Q 50 150 50 120 Z";
        this.bubblePath.setAttribute('d', bubblePath);
    }

    generateDialog() {
        const template = this.getRandomItem(mangaData.dialogTemplates);
        let dialog = template.template;
        
        for (const [key, values] of Object.entries(template.variables)) {
            const placeholder = `{${key}}`;
            const randomValue = this.getRandomItem(values);
            dialog = dialog.replace(placeholder, randomValue);
        }
        
        return dialog;
    }

    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    applyImageEffect() {
        this.backgroundElement.classList.remove('zoom-effect', 'rotate-effect', 'brightness-effect');
        
        const effects = ['zoom-effect', 'rotate-effect', 'brightness-effect'];
        let availableEffects = effects.filter(effect => !this.previousEffects.includes(effect));
        
        if (availableEffects.length === 0) {
            availableEffects = effects;
            this.previousEffects = [];
        }
        
        const selectedEffect = this.getRandomItem(availableEffects);
        this.previousEffects.push(selectedEffect);
        
        if (this.previousEffects.length > 2) {
            this.previousEffects.shift();
        }
        
        setTimeout(() => {
            this.backgroundElement.classList.add(selectedEffect);
        }, 100);
    }

    updateBackground() {
        const background = this.getRandomItem(mangaData.backgrounds);
        
        this.backgroundElement.style.opacity = '0';
        
        setTimeout(() => {
            this.backgroundElement.style.backgroundImage = `url("${background.image}")`;
            this.backgroundElement.style.opacity = '1';
            this.applyImageEffect();
        }, 250);
    }

    updateDialog(dialog) {
        this.speechText.style.opacity = '0';
        
        setTimeout(() => {
            const words = dialog.split('');
            this.speechText.textContent = '';
            this.speechText.style.opacity = '1';
            
            this.typeWriter(words, 0);
        }, 200);
    }

    typeWriter(words, index) {
        if (index < words.length) {
            this.speechText.textContent += words[index];
            setTimeout(() => this.typeWriter(words, index + 1), 50);
        }
    }

    showNext() {
        const dialog = this.generateDialog();
        
        this.updateBackground();
        this.updateDialog(dialog);
        
        this.speechBubble.classList.add('fade-in');
        setTimeout(() => {
            this.speechBubble.classList.remove('fade-in');
        }, 500);
        
        this.currentIndex++;
    }
}

let mangaApp;
let gameEngine;

document.addEventListener('DOMContentLoaded', () => {
    mangaApp = new MangaApp();
    gameEngine = new ReverseGameEngine();
    
    setupModeToggle();
});

function setupModeToggle() {
    const storyModeBtn = document.getElementById('story-mode');
    const gameModeBtn = document.getElementById('game-mode');
    const gameUI = document.getElementById('game-ui');
    const tapInstruction = document.getElementById('tap-instruction');
    
    storyModeBtn.addEventListener('click', () => {
        switchToStoryMode();
    });
    
    gameModeBtn.addEventListener('click', () => {
        switchToGameMode();
    });
    
    function switchToStoryMode() {
        storyModeBtn.classList.add('active');
        gameModeBtn.classList.remove('active');
        gameUI.style.display = 'none';
        tapInstruction.style.display = 'block';
        gameEngine.setGameActive(false);
        
        // ゲームモード用のCSSクラスを削除
        document.body.classList.remove('game-mode');
        
        // Reset speech bubble for story mode
        const speechText = document.getElementById('speech-text');
        speechText.style.opacity = '1';
        speechText.textContent = 'タップして始める';
    }
    
    function switchToGameMode() {
        gameModeBtn.classList.add('active');
        storyModeBtn.classList.remove('active');
        gameUI.style.display = 'block';
        tapInstruction.style.display = 'none';
        gameEngine.setGameActive(true);
        
        // ゲームモード用のCSSクラスを追加
        document.body.classList.add('game-mode');
        
        // Show level selection instead of starting game directly
        document.getElementById('level-selection').style.display = 'block';
        document.getElementById('game-play').style.display = 'none';
    }
}

document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('selectstart', (e) => e.preventDefault());
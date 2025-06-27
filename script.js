class MangaApp {
    constructor() {
        this.currentIndex = 0;
        this.previousEffects = [];
        this.introductionIndex = 0;
        this.isIntroduction = true;
        this.selectedIntroBackground = null;
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
        this.startIntroduction();
    }

    setupEventListeners() {
        this.container.addEventListener('click', () => {
            if (this.isIntroduction) {
                this.showNextIntroduction();
            } else {
                this.showNext();
            }
        });
        this.container.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this.isIntroduction) {
                this.showNextIntroduction();
            } else {
                this.showNext();
            }
        });
    }

    createSpeechBubble() {
        const bubblePath = "M 50 50 Q 50 20 80 20 L 370 20 Q 400 20 400 50 L 400 140 Q 400 170 370 170 L 150 170 L 120 200 L 140 170 L 80 170 Q 50 170 50 140 Z";
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

    setIntroductionBackground() {
        if (!this.selectedIntroBackground) {
            this.selectedIntroBackground = this.getRandomItem(mangaData.introductionBackgrounds);
        }
        
        this.backgroundElement.style.opacity = '0';
        
        setTimeout(() => {
            this.backgroundElement.style.backgroundImage = `url("${this.selectedIntroBackground.image}")`;
            this.backgroundElement.style.opacity = '1';
        }, 250);
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
            // Clear previous content
            this.speechText.innerHTML = '';
            this.speechText.style.opacity = '1';
            
            // Split dialog into lines and create tspan elements
            const lines = this.wrapText(dialog, 20); // Wrap at 20 characters
            lines.forEach((line, index) => {
                const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                tspan.setAttribute('x', '80');
                tspan.setAttribute('y', 50 + (index * 25));
                this.speechText.appendChild(tspan);
            });
            
            this.typeWriterMultiLine(lines, 0, 0);
        }, 200);
    }
    
    wrapText(text, maxLength) {
        const lines = [];
        let currentLine = '';
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === '\n') {
                lines.push(currentLine);
                currentLine = '';
            } else if (currentLine.length >= maxLength && char === ' ') {
                lines.push(currentLine);
                currentLine = '';
            } else {
                currentLine += char;
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }

    typeWriterMultiLine(lines, lineIndex, charIndex) {
        if (lineIndex >= lines.length) return;
        
        const currentLine = lines[lineIndex];
        const tspan = this.speechText.children[lineIndex];
        
        if (charIndex < currentLine.length) {
            tspan.textContent += currentLine[charIndex];
            setTimeout(() => this.typeWriterMultiLine(lines, lineIndex, charIndex + 1), 50);
        } else {
            // Move to next line
            setTimeout(() => this.typeWriterMultiLine(lines, lineIndex + 1, 0), 100);
        }
    }

    startIntroduction() {
        this.setIntroductionBackground();
        this.updateDialog(mangaData.introductionTexts[0]);
        this.speechBubble.classList.add('fade-in');
        setTimeout(() => {
            this.speechBubble.classList.remove('fade-in');
        }, 500);
    }
    
    showNextIntroduction() {
        this.introductionIndex++;
        if (this.introductionIndex < mangaData.introductionTexts.length) {
            this.updateDialog(mangaData.introductionTexts[this.introductionIndex]);
            this.speechBubble.classList.add('fade-in');
            setTimeout(() => {
                this.speechBubble.classList.remove('fade-in');
            }, 500);
        } else {
            document.getElementById('start-button').style.display = 'block';
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
    
    setupStartButton();
});

function setupStartButton() {
    const startButton = document.getElementById('start-button');
    startButton.style.display = 'none';
    
    startButton.addEventListener('click', () => {
        switchToGameMode();
    });
}

function switchToGameMode() {
    const gameUI = document.getElementById('game-ui');
    const tapInstruction = document.getElementById('tap-instruction');
    const introductionScreen = document.getElementById('introduction-screen');
    const appTitle = document.getElementById('app-title');
    
    gameUI.style.display = 'block';
    tapInstruction.style.display = 'none';
    introductionScreen.style.display = 'none';
    appTitle.style.display = 'none';
    gameEngine.setGameActive(true);
    
    // ゲームモード用のCSSクラスを追加
    document.body.classList.add('game-mode');
    
    // Show level selection instead of starting game directly
    document.getElementById('level-selection').style.display = 'block';
    document.getElementById('game-play').style.display = 'none';
}

document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('selectstart', (e) => e.preventDefault());
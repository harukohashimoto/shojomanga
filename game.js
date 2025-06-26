class ReverseGameEngine {
    constructor() {
        this.recognition = null;
        this.currentSpeech = '';
        this.reversedTarget = '';
        this.isRecording = false;
        this.timer = null;
        this.gameActive = false;
        
        this.init();
    }

    init() {
        this.setupSpeechRecognition();
        this.setupEventListeners();
    }

    setupSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('Speech recognition not supported');
            this.showError('このブラウザは音声認識に対応していません');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.lang = 'ja-JP';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            this.isRecording = true;
            this.showRecordingIndicator();
        };

        this.recognition.onresult = (event) => {
            const result = event.results[0][0].transcript;
            this.processRecognitionResult(result);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isRecording = false;
            this.hideRecordingIndicator();
            this.showError('音声認識エラーが発生しました');
        };

        this.recognition.onend = () => {
            this.isRecording = false;
            this.hideRecordingIndicator();
        };
    }

    setupEventListeners() {
        document.getElementById('start-recording').addEventListener('click', () => {
            this.startRecording();
        });

        document.getElementById('next-game').addEventListener('click', () => {
            this.startNewGame();
        });
    }

    startNewGame() {
        if (!this.gameActive) return;
        
        this.hideGameResult();
        this.currentSpeech = this.generateRandomSpeech();
        this.reversedTarget = this.reverseText(this.currentSpeech);
        
        this.displaySpeech(this.currentSpeech);
        this.startTimer();
    }

    generateRandomSpeech() {
        const template = this.getRandomItem(mangaData.dialogTemplates);
        let speech = template.template;
        
        for (const [key, values] of Object.entries(template.variables)) {
            const placeholder = `{${key}}`;
            const randomValue = this.getRandomItem(values);
            speech = speech.replace(placeholder, randomValue);
        }
        
        return speech;
    }

    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    reverseText(text) {
        const cleaned = text.replace(/[、。？！]/g, '');
        return cleaned.split('').reverse().join('');
    }

    displaySpeech(speech) {
        const speechText = document.getElementById('speech-text');
        speechText.textContent = speech;
        speechText.style.opacity = '1';
        
        document.getElementById('game-status').textContent = 'セリフを覚えてください';
    }

    startTimer() {
        let countdown = 3;
        const timerElement = document.getElementById('game-timer');
        const startRecordingButton = document.getElementById('start-recording');
        
        timerElement.style.display = 'block';
        timerElement.textContent = countdown;
        
        this.timer = setInterval(() => {
            countdown--;
            timerElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(this.timer);
                timerElement.style.display = 'none';
                this.hideSpeech();
                startRecordingButton.style.display = 'block';
                document.getElementById('game-status').textContent = 'セリフを逆さまに言ってください！';
            }
        }, 1000);
    }

    hideSpeech() {
        const speechText = document.getElementById('speech-text');
        speechText.style.opacity = '0';
    }

    startRecording() {
        if (!this.recognition || this.isRecording) return;
        
        document.getElementById('start-recording').style.display = 'none';
        this.recognition.start();
    }

    showRecordingIndicator() {
        document.getElementById('recording-indicator').style.display = 'block';
        document.getElementById('game-status').textContent = '録音中...';
    }

    hideRecordingIndicator() {
        document.getElementById('recording-indicator').style.display = 'none';
    }

    processRecognitionResult(result) {
        console.log('認識結果:', result);
        console.log('正解:', this.reversedTarget);
        
        const isCorrect = this.compareTexts(result, this.reversedTarget);
        this.showResult(isCorrect, result);
    }

    compareTexts(recognized, target) {
        const normalizeText = (text) => {
            return text
                .replace(/[、。？！\s]/g, '')
                .toLowerCase()
                .replace(/[ぁ-ん]/g, (match) => {
                    return String.fromCharCode(match.charCodeAt(0) + 0x60);
                });
        };

        const normalizedRecognized = normalizeText(recognized);
        const normalizedTarget = normalizeText(target);
        
        console.log('正規化された認識結果:', normalizedRecognized);
        console.log('正規化された正解:', normalizedTarget);
        
        const similarity = this.calculateSimilarity(normalizedRecognized, normalizedTarget);
        console.log('類似度:', similarity);
        
        return similarity >= 0.7;
    }

    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    showResult(isCorrect, recognizedText) {
        const resultElement = document.getElementById('game-result');
        const nextButton = document.getElementById('next-game');
        
        resultElement.innerHTML = `
            <div class="result-content ${isCorrect ? 'correct' : 'incorrect'}">
                <div class="result-title">${isCorrect ? '🎉 正解！' : '❌ 不正解'}</div>
                <div class="result-details">
                    <p><strong>元のセリフ:</strong> ${this.currentSpeech}</p>
                    <p><strong>正解:</strong> ${this.reversedTarget}</p>
                    <p><strong>あなたの答え:</strong> ${recognizedText}</p>
                </div>
            </div>
        `;
        
        resultElement.style.display = 'block';
        nextButton.style.display = 'block';
        
        resultElement.classList.add('fade-in');
        this.playResultSound(isCorrect);
    }

    hideGameResult() {
        document.getElementById('game-result').style.display = 'none';
        document.getElementById('next-game').style.display = 'none';
        document.getElementById('start-recording').style.display = 'none';
        document.getElementById('game-timer').style.display = 'none';
    }

    playResultSound(isCorrect) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (isCorrect) {
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
        } else {
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(180, audioContext.currentTime + 0.2);
        }
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }

    showError(message) {
        const resultElement = document.getElementById('game-result');
        resultElement.innerHTML = `<div class="error-message">${message}</div>`;
        resultElement.style.display = 'block';
    }

    setGameActive(active) {
        this.gameActive = active;
    }
}
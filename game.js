class ReverseGameEngine {
    constructor() {
        this.recognition = null;
        this.currentSpeech = '';
        this.reversedTarget = '';
        this.isRecording = false;
        this.timer = null;
        this.gameActive = false;
        this.currentLevel = 'beginner';
        this.responseTimer = null;
        this.waitingForResponse = false;
        
        this.levelConfig = {
            beginner: { timeLimit: null, displayTime: 3, name: '🌟 初級' },
            intermediate: { timeLimit: 10, displayTime: 3, name: '⭐⭐ 中級' },
            advanced: { timeLimit: 5, displayTime: 3, name: '⭐⭐⭐ 上級' }
        };
        
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
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 5;

        this.recognition.onstart = () => {
            this.isRecording = true;
            this.showRecordingIndicator();
        };

        this.recognition.onresult = (event) => {
            // 最終結果のみを処理
            if (event.results[event.results.length - 1].isFinal) {
                // 複数の候補から最適なものを選択
                let bestResult = '';
                let bestConfidence = 0;
                
                for (let i = 0; i < event.results[event.results.length - 1].length; i++) {
                    const alternative = event.results[event.results.length - 1][i];
                    console.log(`候補 ${i + 1}: "${alternative.transcript}" (信頼度: ${alternative.confidence})`);
                    
                    if (alternative.confidence > bestConfidence) {
                        bestConfidence = alternative.confidence;
                        bestResult = alternative.transcript;
                    }
                }
                
                console.log(`選択された結果: "${bestResult}" (信頼度: ${bestConfidence})`);
                this.processRecognitionResult(bestResult);
            }
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
        // Level selection - directly start game when level is clicked
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentLevel = e.target.dataset.level;
                this.showGamePlay();
            });
        });

        document.getElementById('start-recording').addEventListener('click', () => {
            this.startRecording();
        });

        document.getElementById('next-game').addEventListener('click', () => {
            this.startNewGame();
        });

        document.getElementById('review-speech').addEventListener('click', () => {
            this.reviewSpeech();
        });

        document.getElementById('manual-answer').addEventListener('click', () => {
            this.handleManualAnswer();
        });

        document.getElementById('back-to-levels').addEventListener('click', () => {
            this.backToLevelSelection();
        });
    }

    startNewGame() {
        if (!this.gameActive) return;
        
        this.hideGameResult();
        this.hideAllGameElements();
        this.currentSpeech = this.generateRandomSpeech();
        this.reversedTarget = this.reverseText(this.currentSpeech);
        
        this.displaySpeech(this.currentSpeech);
        this.startTimer();
    }

    generateRandomSpeech() {
        const levelData = gameData[this.currentLevel];
        return this.getRandomItem(levelData);
    }

    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    reverseText(text) {
        // すでにひらがなの場合はそのまま逆順にする
        return text.split('').reverse().join('');
    }

    // カタカナをひらがなに変換する関数
    katakanaToHiragana(str) {
        return str.replace(/[\u30A1-\u30F6]/g, function(match) {
            const chr = match.charCodeAt(0) - 0x60;
            return String.fromCharCode(chr);
        });
    }

    // 漢字をひらがなに変換する関数（簡易版）
    convertToHiragana(text) {
        // 一般的な漢字→ひらがな変換マップ
        const kanjiMap = {
            '今日': 'きょう', '素敵': 'すてき', '美しい': 'うつくしい', '可愛い': 'かわいい',
            '嬉しい': 'うれしい', '楽しい': 'たのしい', '幸せ': 'しあわせ', '大好き': 'だいすき',
            '優しい': 'やさしい', '綺麗': 'きれい', '時間': 'じかん', '瞬間': 'しゅんかん',
            '思い出': 'おもいで', '出会い': 'であい', '恋': 'こい', '友情': 'ゆうじょう',
            '学校': 'がっこう', '先輩': 'せんぱい', '皆': 'みんな', '今': 'いま',
            '魔法': 'まほう', '気分': 'きぶん', '予感': 'よかん', '胸': 'むね',
            '涙': 'なみだ', '寝': 'ね', '君': 'きみ', '人': 'ひと', '心': 'こころ',
            '愛': 'あい', '夢': 'ゆめ', '希望': 'きぼう', '笑顔': 'えがお',
            '天使': 'てんし', '星': 'ほし', '花': 'はな', '空': 'そら',
            '海': 'うみ', '太陽': 'たいよう', '月': 'つき', '光': 'ひかり',
            // 名前関連の漢字
            '久米': 'くめ', '佐藤': 'さとう', '田中': 'たなか', '山田': 'やまだ',
            '高橋': 'たかはし', '伊藤': 'いとう', '渡辺': 'わたなべ', '中村': 'なかむら',
            '小林': 'こばやし', '加藤': 'かとう', '吉田': 'よしだ', '山本': 'やまもと',
            '松本': 'まつもと', '井上': 'いのうえ', '木村': 'きむら', '林': 'はやし',
            '清水': 'しみず', '山崎': 'やまざき', '森': 'もり', '池田': 'いけだ',
            '橋本': 'はしもと', '斎藤': 'さいとう', '新井': 'あらい', '藤田': 'ふじた',
            // 単体の漢字も追加
            '久': 'く', '米': 'め', '石': 'いし', '田': 'た', '山': 'やま', '川': 'かわ',
            '雨': 'あめ', '風': 'かぜ', '雪': 'ゆき', '雲': 'くも', '水': 'みず',
            '火': 'ひ', '土': 'つち', '木': 'き', '金': 'きん', '銀': 'ぎん',
            '白': 'しろ', '黒': 'くろ', '赤': 'あか', '青': 'あお', '緑': 'みどり',
            '手': 'て', '足': 'あし', '目': 'め', '耳': 'みみ', '口': 'くち',
            '鼻': 'はな', '頭': 'あたま', '顔': 'かお', '体': 'からだ', '声': 'こえ',
            '上': 'うえ', '下': 'した', '左': 'ひだり', '右': 'みぎ', '前': 'まえ',
            '後': 'うしろ', '中': 'なか', '外': 'そと', '内': 'うち', '間': 'あいだ',
            // よく使われる組み合わせ
            '石の田': 'いしのた', '田の石': 'たのいし', '久米きと': 'くめきと'
        };

        let result = text;
        
        // 漢字をひらがなに変換（長い順にソートして部分一致を防ぐ）
        const sortedEntries = Object.entries(kanjiMap).sort((a, b) => b[0].length - a[0].length);
        for (const [kanji, hiragana] of sortedEntries) {
            result = result.replace(new RegExp(kanji, 'g'), hiragana);
        }
        
        // カタカナをひらがなに変換
        result = this.katakanaToHiragana(result);
        
        return result;
    }

    displaySpeech(speech) {
        // Show speech bubble for game
        const speechBubble = document.getElementById('speech-bubble');
        speechBubble.style.display = 'block';
        
        const speechText = document.getElementById('speech-text');
        speechText.innerHTML = '';
        
        // Create tspan for the speech text
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('x', '80');
        tspan.setAttribute('y', '50');
        tspan.textContent = speech;
        speechText.appendChild(tspan);
        
        speechText.style.opacity = '1';
        
        document.getElementById('game-status').textContent = 'セリフを覚えてください';
    }

    startTimer() {
        let countdown = this.levelConfig[this.currentLevel].displayTime;
        const timerElement = document.getElementById('game-timer');
        
        timerElement.style.display = 'block';
        timerElement.textContent = countdown;
        
        this.timer = setInterval(() => {
            countdown--;
            timerElement.textContent = countdown;
            
            if (countdown <= 0) {
                console.log('Timer countdown reached 0');
                clearInterval(this.timer);
                timerElement.style.display = 'none';
                this.hideSpeech();
                
                // Start recording directly without showing buttons first
                console.log('Timer ended, starting recording directly in 500ms');
                setTimeout(() => {
                    console.log('About to start recording directly');
                    this.startRecordingDirectly();
                }, 500);
            }
        }, 1000);
    }

    hideSpeech() {
        const speechText = document.getElementById('speech-text');
        speechText.style.opacity = '0';
        setTimeout(() => {
            speechText.innerHTML = '';
        }, 300);
    }
    
    showRecordingInterface() {
        console.log('showRecordingInterface called for level:', this.currentLevel);
        
        const startRecordingButton = document.getElementById('start-recording');
        const manualAnswerButton = document.getElementById('manual-answer');
        const reviewSpeechButton = document.getElementById('review-speech');
        const autoTimer = document.getElementById('auto-timer');
        
        console.log('Button elements found:', {
            startRecording: !!startRecordingButton,
            manualAnswer: !!manualAnswerButton,
            reviewSpeech: !!reviewSpeechButton,
            autoTimer: !!autoTimer
        });
        
        // Update game status
        document.getElementById('game-status').textContent = 'セリフを逆さまに言ってください！';
        
        // Show appropriate buttons based on level
        if (this.currentLevel === 'beginner') {
            if (startRecordingButton) {
                startRecordingButton.style.setProperty('display', 'block', 'important');
                startRecordingButton.style.setProperty('visibility', 'visible', 'important');
                startRecordingButton.style.setProperty('opacity', '1', 'important');
            }
            if (manualAnswerButton) {
                manualAnswerButton.style.setProperty('display', 'block', 'important');
                manualAnswerButton.style.setProperty('visibility', 'visible', 'important');
                manualAnswerButton.style.setProperty('opacity', '1', 'important');
            }
            console.log('Showing beginner buttons with !important');
        } else {
            if (startRecordingButton) {
                startRecordingButton.style.setProperty('display', 'block', 'important');
                startRecordingButton.style.setProperty('visibility', 'visible', 'important');
                startRecordingButton.style.setProperty('opacity', '1', 'important');
            }
            console.log('Showing advanced buttons with !important');
        }
        
        // Show review button for all levels
        if (reviewSpeechButton) {
            reviewSpeechButton.style.setProperty('display', 'block', 'important');
            reviewSpeechButton.style.setProperty('visibility', 'visible', 'important');
            reviewSpeechButton.style.setProperty('opacity', '1', 'important');
        }
        
        // Auto-start timer for intermediate and advanced levels
        if (this.currentLevel !== 'beginner') {
            this.startResponseTimer();
            if (autoTimer) autoTimer.style.display = 'block';
        }
        
        // Ensure game UI container is visible
        const gameUI = document.getElementById('game-ui');
        const gamePlay = document.getElementById('game-play');
        if (gameUI) {
            gameUI.style.display = 'block';
            gameUI.style.visibility = 'visible';
            gameUI.style.opacity = '1';
        }
        if (gamePlay) {
            gamePlay.style.display = 'block';
            gamePlay.style.visibility = 'visible';
            gamePlay.style.opacity = '1';
        }
        
        // Auto-start recording after showing interface
        setTimeout(() => {
            console.log('Auto-starting recording...');
            this.startRecording();
        }, 1000);
        
        console.log('showRecordingInterface completed');
    }
    
    startRecordingDirectly() {
        console.log('startRecordingDirectly called for level:', this.currentLevel);
        
        // Ensure game UI container is visible
        const gameUI = document.getElementById('game-ui');
        const gamePlay = document.getElementById('game-play');
        if (gameUI) {
            gameUI.style.display = 'block';
            gameUI.style.visibility = 'visible';
            gameUI.style.opacity = '1';
        }
        if (gamePlay) {
            gamePlay.style.display = 'block';
            gamePlay.style.visibility = 'visible';
            gamePlay.style.opacity = '1';
        }
        
        // Update game status for recording phase
        document.getElementById('game-status').textContent = 'セリフを逆さまに言ってください！';
        
        // Show only review button, hide all others
        const startRecordingButton = document.getElementById('start-recording');
        const manualAnswerButton = document.getElementById('manual-answer');
        const reviewSpeechButton = document.getElementById('review-speech');
        const autoTimer = document.getElementById('auto-timer');
        
        if (startRecordingButton) startRecordingButton.style.display = 'none';
        if (manualAnswerButton) manualAnswerButton.style.display = 'none';
        
        // Show review button
        if (reviewSpeechButton) {
            reviewSpeechButton.style.setProperty('display', 'block', 'important');
            reviewSpeechButton.style.setProperty('visibility', 'visible', 'important');
            reviewSpeechButton.style.setProperty('opacity', '1', 'important');
        }
        
        // Show timer for intermediate and advanced levels
        if (this.currentLevel !== 'beginner') {
            const config = this.levelConfig[this.currentLevel];
            this.startResponseTimer(config.timeLimit);
            if (autoTimer) autoTimer.style.display = 'block';
        }
        
        // Start recording immediately
        if (this.recognition && !this.isRecording) {
            console.log('Starting recording directly...');
            this.showRecordingIndicator();
            this.recognition.start();
        }
        
        console.log('startRecordingDirectly completed');
    }
    

    startRecording() {
        if (!this.recognition || this.isRecording) return;
        
        console.log('Starting recording...');
        
        // Hide all buttons except review
        document.getElementById('start-recording').style.display = 'none';
        document.getElementById('manual-answer').style.display = 'none';
        
        // Show recording indicator
        this.showRecordingIndicator();
        
        // Start the actual recording
        this.recognition.start();
    }

    showRecordingIndicator() {
        document.getElementById('recording-indicator').style.display = 'block';
    }

    hideRecordingIndicator() {
        document.getElementById('recording-indicator').style.display = 'none';
    }


    compareTexts(recognized, target) {
        const normalizeText = (text) => {
            return text
                .replace(/[、。？！\s]/g, '')  // 句読点と空白を除去
                .replace(/[ァ-ヴ]/g, function(match) { // カタカナをひらがなに
                    return String.fromCharCode(match.charCodeAt(0) - 0x60);
                })
                .toLowerCase();
        };

        const normalizedRecognized = normalizeText(recognized);
        const normalizedTarget = normalizeText(target);
        
        console.log('正規化された認識結果:', normalizedRecognized);
        console.log('正規化された正解:', normalizedTarget);
        
        // 完全一致の場合
        if (normalizedRecognized === normalizedTarget) {
            console.log('完全一致！');
            return true;
        }
        
        // 類似度計算
        const similarity = this.calculateSimilarity(normalizedRecognized, normalizedTarget);
        console.log('類似度:', similarity);
        
        // 音響的類似性も考慮（濁音・半濁音・長音の誤認識対応）
        const phoneticSimilarity = this.calculatePhoneticSimilarity(normalizedRecognized, normalizedTarget);
        console.log('音響類似度:', phoneticSimilarity);
        
        const finalSimilarity = Math.max(similarity, phoneticSimilarity);
        console.log('最終類似度:', finalSimilarity);
        
        // レベルに応じて判定の厳しさを調整
        let threshold = 0.7;
        if (this.currentLevel === 'beginner') {
            threshold = 0.5;  // 初心者はより甘めに判定
        } else if (this.currentLevel === 'advanced') {
            threshold = 0.8;  // 上級者は厳しめに判定
        }
        
        return finalSimilarity >= threshold;
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

    calculatePhoneticSimilarity(str1, str2) {
        // 音響的に類似した文字のマッピング
        const phoneticMap = {
            'が': 'か', 'ぎ': 'き', 'ぐ': 'く', 'げ': 'け', 'ご': 'こ',
            'ざ': 'さ', 'じ': 'し', 'ず': 'す', 'ぜ': 'せ', 'ぞ': 'そ',
            'だ': 'た', 'ぢ': 'ち', 'づ': 'つ', 'で': 'て', 'ど': 'と',
            'ば': 'は', 'び': 'ひ', 'ぶ': 'ふ', 'べ': 'へ', 'ぼ': 'ほ',
            'ぱ': 'は', 'ぴ': 'ひ', 'ぷ': 'ふ', 'ぺ': 'へ', 'ぽ': 'ほ',
            'ー': '', 'っ': 'つ'
        };
        
        const normalizePhonetic = (text) => {
            let normalized = text;
            for (const [voiced, voiceless] of Object.entries(phoneticMap)) {
                normalized = normalized.replace(new RegExp(voiced, 'g'), voiceless);
            }
            return normalized;
        };
        
        const phonetic1 = normalizePhonetic(str1);
        const phonetic2 = normalizePhonetic(str2);
        
        return this.calculateSimilarity(phonetic1, phonetic2);
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

    showGamePlay() {
        document.getElementById('level-selection').style.display = 'none';
        document.getElementById('game-play').style.display = 'block';
        
        setTimeout(() => {
            this.startNewGame();
        }, 500);
    }

    backToLevelSelection() {
        document.getElementById('game-play').style.display = 'none';
        document.getElementById('level-selection').style.display = 'block';
        this.resetGameState();
    }

    resetGameState() {
        this.hideAllGameElements();
        clearTimeout(this.timer);
        clearTimeout(this.responseTimer);
        this.waitingForResponse = false;
        this.isRecording = false;
    }

    hideAllGameElements() {
        document.getElementById('game-timer').style.display = 'none';
        document.getElementById('start-recording').style.display = 'none';
        document.getElementById('recording-indicator').style.display = 'none';
        document.getElementById('manual-answer').style.display = 'none';
        document.getElementById('auto-timer').style.display = 'none';
        document.getElementById('review-speech').style.display = 'none';
        document.getElementById('game-result').style.display = 'none';
        document.getElementById('result-buttons').style.display = 'none';
        document.getElementById('game-status').textContent = '';
    }

    showLevelSpecificControls() {
        const config = this.levelConfig[this.currentLevel];
        
        // Always show review button
        document.getElementById('review-speech').style.display = 'block';
        
        if (config.timeLimit === null) {
            // Beginner level: manual response
            document.getElementById('start-recording').style.display = 'block';
            document.getElementById('manual-answer').style.display = 'block';
            document.getElementById('game-status').textContent = 'セリフを逆さまに言って、「言えました！」を押してください';
        } else {
            // Intermediate/Advanced: auto timer
            document.getElementById('start-recording').style.display = 'block';
            document.getElementById('auto-timer').style.display = 'block';
            document.getElementById('game-status').textContent = `セリフを逆さまに言ってください！（${config.timeLimit}秒以内）`;
            this.startResponseTimer(config.timeLimit);
        }
    }

    startResponseTimer(seconds) {
        this.waitingForResponse = true;
        let remaining = seconds;
        const countdownElement = document.getElementById('countdown');
        
        countdownElement.textContent = remaining;
        
        this.responseTimer = setInterval(() => {
            remaining--;
            countdownElement.textContent = remaining;
            
            if (remaining <= 0) {
                clearInterval(this.responseTimer);
                this.waitingForResponse = false;
                if (!this.isRecording) {
                    this.handleTimeout();
                }
            }
        }, 1000);
    }

    handleTimeout() {
        document.getElementById('auto-timer').style.display = 'none';
        document.getElementById('start-recording').style.display = 'none';
        this.showResult(false, '時間切れ');
    }

    reviewSpeech() {
        const speechText = document.getElementById('speech-text');
        speechText.innerHTML = '';
        
        // Create tspan for the speech text
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('x', '80');
        tspan.setAttribute('y', '50');
        tspan.textContent = this.currentSpeech;
        speechText.appendChild(tspan);
        
        speechText.style.opacity = '1';
        
        setTimeout(() => {
            speechText.style.opacity = '0';
        }, 2000);
    }

    handleManualAnswer() {
        if (!this.isRecording) {
            this.startRecording();
        }
    }


    processRecognitionResult(result) {
        console.log('認識結果:', result);
        console.log('正解:', this.reversedTarget);
        
        // 前処理：不要な文字を除去
        let cleanedResult = result
            .replace(/[。、！？\s]/g, '') // 句読点と空白を除去
            .replace(/[０-９]/g, function(s) { // 全角数字を半角に
                return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
            })
            .toLowerCase();
        
        // 音声認識結果をひらがなに変換
        let hiraganaResult = this.convertToHiragana(cleanedResult);
        hiraganaResult = this.katakanaToHiragana(hiraganaResult);
        
        console.log('前処理後:', cleanedResult);
        console.log('ひらがな変換後:', hiraganaResult);
        
        // Stop response timer if active
        if (this.responseTimer) {
            clearInterval(this.responseTimer);
            this.responseTimer = null;
        }
        document.getElementById('auto-timer').style.display = 'none';
        this.waitingForResponse = false;
        
        const isCorrect = this.compareTexts(hiraganaResult, this.reversedTarget);
        this.showResult(isCorrect, hiraganaResult);
    }

    showResult(isCorrect, recognizedText) {
        const resultElement = document.getElementById('game-result');
        const resultButtons = document.getElementById('result-buttons');
        
        // Hide recording indicator and review button in result screen
        document.getElementById('recording-indicator').style.display = 'none';
        document.getElementById('review-speech').style.display = 'none';
        document.getElementById('game-status').textContent = '';
        
        let resultHTML = `
            <div class="result-content ${isCorrect ? 'correct' : 'incorrect'}">
                <div class="result-title">${isCorrect ? '🎉 正解！' : '❌ 不正解'}</div>
                <div class="result-details">
                    <p><strong>元のセリフ:</strong> ${this.currentSpeech}</p>
                    <p><strong>正解:</strong> ${this.reversedTarget}</p>
        `;
        
        if (recognizedText !== '時間切れ') {
            resultHTML += `<p><strong>あなたの答え:</strong> ${recognizedText}</p>`;
        } else {
            resultHTML += `<p><strong>結果:</strong> ${recognizedText}</p>`;
        }
        
        resultHTML += `
                </div>
            </div>
        `;
        
        resultElement.innerHTML = resultHTML;
        resultElement.style.display = 'block';
        resultButtons.style.display = 'flex';
        
        resultElement.classList.add('fade-in');
        this.playResultSound(isCorrect);
    }

    hideGameResult() {
        this.hideAllGameElements();
        const speechText = document.getElementById('speech-text');
        speechText.style.opacity = '1';
    }
}
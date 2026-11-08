// ============================================================================
// 高校情報I 第5章 情報セキュリティ・暗号＆誤り検出対策テスト
// 『暗号怪盗とパリティ探偵 〜情報セキュリティ＆誤り検出テスト〜』
// メイン制御スクリプト (Vanilla JS / Web Audio API / Canvas HUD)
// ============================================================================

(() => {
  'use strict';

  // ==========================================================================
  // 1. 効果音合成エンジン (Web Audio API: デフォルト消音)
  // ==========================================================================
  class SoundManager {
    constructor() {
      this.ctx = null;
      this.seEnabled = false; // デフォルトOFF (教訓24準拠)
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playClick() {
      if (!this.seEnabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1100, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.04);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.045);
      } catch (e) {}
    }

    playToggle(enable) {
      if (!enable) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        [880, 1174.66].forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + i * 0.04);
          gain.gain.setValueAtTime(0.12, now + i * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.06);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.04);
          osc.stop(now + i * 0.04 + 0.07);
        });
      } catch (e) {}
    }

    playCorrect() {
      if (!this.seEnabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + i * 0.07);
          gain.gain.setValueAtTime(0.2, now + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.25);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.07);
          osc.stop(now + i * 0.07 + 0.28);
        });
      } catch (e) {}
    }

    playWrong() {
      if (!this.seEnabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(140, now + 0.22);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } catch (e) {}
    }

    playFanfare() {
      if (!this.seEnabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const notes = [
          { f: 523.25, t: 0.00, d: 0.12 },
          { f: 659.25, t: 0.12, d: 0.12 },
          { f: 783.99, t: 0.24, d: 0.14 },
          { f: 1046.50, t: 0.38, d: 0.45 }
        ];
        notes.forEach(n => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(n.f, now + n.t);
          gain.gain.setValueAtTime(0.25, now + n.t);
          gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + n.t);
          osc.stop(now + n.t + n.d + 0.05);
        });
      } catch (e) {}
    }
  }

  // ==========================================================================
  // 2. BGM管理 (HTML5 Audio: デフォルト消音)
  // ==========================================================================
  class BgmManager {
    constructor() {
      this.bgmEnabled = false; // デフォルトOFF (教訓24準拠)
      this.audioTitle = new Audio('bgm_title.mp3');
      this.audioMain = new Audio('bgm_main.mp3');
      this.audioTitle.loop = true;
      this.audioMain.loop = true;
      this.audioTitle.volume = 0.25;
      this.audioMain.volume = 0.25;
      this.currentTrack = null;
    }

    play(track) {
      if (this.currentTrack && this.currentTrack !== track) {
        this.currentTrack.pause();
        this.currentTrack.currentTime = 0;
      }
      this.currentTrack = track;
      if (this.bgmEnabled && this.currentTrack) {
        this.currentTrack.play().catch(() => {});
      }
    }

    stop() {
      if (this.currentTrack) {
        this.currentTrack.pause();
        this.currentTrack.currentTime = 0;
      }
    }

    toggle() {
      this.bgmEnabled = !this.bgmEnabled;
      if (this.bgmEnabled) {
        if (this.currentTrack) {
          this.currentTrack.play().catch(() => {});
        }
      } else {
        if (this.currentTrack) {
          this.currentTrack.pause();
        }
      }
      return this.bgmEnabled;
    }
  }

  // ==========================================================================
  // 3. メインアプリケーション制御クラス
  // ==========================================================================
  class CryptoDetectiveApp {
    constructor() {
      this.sound = new SoundManager();
      this.bgm = new BgmManager();

      this.questions = (typeof QUESTIONS !== 'undefined') ? QUESTIONS : [];
      this.currentIndex = 0;
      this.score = 0;
      this.correctCount = 0;
      this.userAnswers = [];

      this.animId = null;
      this.animFrame = 0;
      this.currentHudType = null;
      this.currentHudData = null;

      // キャラクター画像 (怪盗猫 & 探偵柴犬)
      this.imgThief = new Image();
      this.imgThief.src = 'delivery_cat.jpg';
      this.imgDetective = new Image();
      this.imgDetective.src = 'detective_shiba.jpg';

      this.initDom();
      this.initEvents();
      this.initCanvas();
    }

    initDom() {
      this.dom = {
        titleScreen: document.getElementById('titleScreen'),
        quizScreen: document.getElementById('quizScreen'),
        resultScreen: document.getElementById('resultScreen'),

        startBtn: document.getElementById('startBtn'),
        restartBtn: document.getElementById('restartBtn'),
        openReviewBtn: document.getElementById('openReviewBtn'),
        closeReviewBtn: document.getElementById('closeReviewBtn'),
        copyWordBtn: document.getElementById('copyWordBtn'),
        secretWord: document.getElementById('secretWord'),

        bgmToggleBtn: document.getElementById('bgmToggleBtn'),
        seToggleBtn: document.getElementById('seToggleBtn'),

        progressText: document.getElementById('progressText'),
        scoreBadge: document.getElementById('scoreBadge'),
        progressFill: document.getElementById('progressFill'),
        qCategoryTag: document.getElementById('qCategoryTag'),
        qTitle: document.getElementById('qTitle'),
        optionsContainer: document.getElementById('optionsContainer'),
        optionBtns: Array.from(document.querySelectorAll('.option-btn')),

        hudTitle: document.getElementById('hudTitle'),
        hudStatusBadge: document.getElementById('hudStatusBadge'),
        hudCanvas: document.getElementById('hudCanvas'),
        hudInfoBox: document.getElementById('hudInfoBox'),

        answerModal: document.getElementById('answerModal'),
        judgeIcon: document.getElementById('judgeIcon'),
        judgeTitle: document.getElementById('judgeTitle'),
        modalCorrectAnswer: document.getElementById('modalCorrectAnswer'),
        modalExplanation: document.getElementById('modalExplanation'),
        nextQuestionBtn: document.getElementById('nextQuestionBtn'),

        reviewModal: document.getElementById('reviewModal'),
        reviewItemList: document.getElementById('reviewItemList'),
        reviewDetailCol: document.getElementById('reviewDetailCol'),

        resultScore: document.getElementById('resultScore'),
        resultCorrect: document.getElementById('resultCorrect'),
        resultRate: document.getElementById('resultRate'),
        rankChar: document.getElementById('rankChar'),
        rankTitle: document.getElementById('rankTitle')
      };
    }

    initEvents() {
      if (this.dom.startBtn) {
        this.dom.startBtn.addEventListener('click', () => {
          this.sound.playClick();
          this.startGame();
        });
      }

      if (this.dom.restartBtn) {
        this.dom.restartBtn.addEventListener('click', () => {
          this.sound.playClick();
          this.startGame();
        });
      }

      if (this.dom.bgmToggleBtn) {
        this.dom.bgmToggleBtn.addEventListener('click', () => {
          const on = this.bgm.toggle();
          this.sound.playToggle(on);
          this.dom.bgmToggleBtn.querySelector('.btn-text').textContent = `BGM: ${on ? 'ON' : 'OFF'}`;
        });
      }

      if (this.dom.seToggleBtn) {
        this.dom.seToggleBtn.addEventListener('click', () => {
          this.sound.seEnabled = !this.sound.seEnabled;
          this.sound.playToggle(this.sound.seEnabled);
          this.dom.seToggleBtn.querySelector('.btn-text').textContent = `SE: ${this.sound.seEnabled ? 'ON' : 'OFF'}`;
          this.dom.seToggleBtn.querySelector('span:first-child').textContent = this.sound.seEnabled ? '🔊' : '🔇';
        });
      }

      this.dom.optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.index, 10);
          this.handleAnswer(idx);
        });
      });

      if (this.dom.nextQuestionBtn) {
        this.dom.nextQuestionBtn.addEventListener('click', () => {
          this.sound.playClick();
          this.advanceQuestion();
        });
      }

      if (this.dom.openReviewBtn) {
        this.dom.openReviewBtn.addEventListener('click', () => {
          this.sound.playClick();
          this.openReviewModal();
        });
      }

      if (this.dom.closeReviewBtn) {
        this.dom.closeReviewBtn.addEventListener('click', () => {
          this.sound.playClick();
          this.dom.reviewModal.classList.remove('active');
        });
      }

      if (this.dom.copyWordBtn && this.dom.secretWord) {
        this.dom.copyWordBtn.addEventListener('click', () => {
          const text = this.dom.secretWord.textContent.trim();
          navigator.clipboard.writeText(text).then(() => {
            const orig = this.dom.copyWordBtn.textContent;
            this.dom.copyWordBtn.textContent = '✅ コピー完了！';
            setTimeout(() => {
              this.dom.copyWordBtn.textContent = orig;
            }, 2000);
          });
        });
      }
    }

    initCanvas() {
      const c = this.dom.hudCanvas;
      if (!c) return;
      const resize = () => {
        const wrap = c.parentElement;
        c.width = wrap.clientWidth || 360;
        c.height = wrap.clientHeight || 280;
      };
      resize();
      window.addEventListener('resize', resize);
      this.startCanvasLoop();
    }

    startCanvasLoop() {
      const loop = () => {
        this.animFrame++;
        this.renderCanvas();
        this.animId = requestAnimationFrame(loop);
      };
      loop();
    }

    startGame() {
      this.sound.init();
      this.bgm.play(this.bgm.audioMain);

      this.currentIndex = 0;
      this.score = 0;
      this.correctCount = 0;
      this.userAnswers = [];

      this.dom.titleScreen.classList.remove('active');
      this.dom.resultScreen.classList.remove('active');
      this.dom.quizScreen.classList.add('active');

      this.renderQuestion();
    }

    renderQuestion() {
      const q = this.questions[this.currentIndex];
      if (!q) return;

      this.dom.progressText.textContent = `第 ${this.currentIndex + 1} 問 / 全 ${this.questions.length} 問`;
      this.dom.scoreBadge.textContent = `スコア: ${this.score} 点`;
      const pct = (this.currentIndex / this.questions.length) * 100;
      this.dom.progressFill.style.width = `${pct}%`;

      this.dom.qCategoryTag.textContent = q.category;
      this.dom.qTitle.textContent = q.question;

      this.dom.optionBtns.forEach((btn, idx) => {
        btn.disabled = false;
        btn.classList.remove('correct-pick', 'wrong-pick');
        const textSpan = btn.querySelector('.opt-text');
        if (textSpan) {
          textSpan.textContent = q.options[idx];
        }
      });

      this.currentHudType = q.hudType;
      this.currentHudData = q.hudData;
      this.updateHud(q);
    }

    updateHud(q) {
      if (q.hudType && q.hudType.startsWith('parity')) {
        this.dom.hudTitle.textContent = '🔍 パリティビット誤り検出スコープ';
        this.dom.hudStatusBadge.textContent = '誤り検出中';
        this.dom.hudStatusBadge.style.background = '#eab308';
        this.dom.hudInfoBox.innerHTML = `
          <strong>【パリティビット鑑識】</strong><br>
          ${q.hudData.title || q.category}：${q.hudData.feature || '7ビットデータ＋1ビットのパリティビットで誤りを検出するワン！'}
        `;
      } else {
        this.dom.hudTitle.textContent = '🔐 暗号怪盗 vs 探偵スコープ';
        this.dom.hudStatusBadge.textContent = '暗号照合中';
        this.dom.hudStatusBadge.style.background = '#06b6d4';
        this.dom.hudInfoBox.innerHTML = `
          <strong>【暗号解析】</strong><br>
          ${q.hudData.title || q.category}：${q.hudData.keyName || q.hudData.feature || q.hudData.role || '盗聴・改ざんを鉄壁ガードするワン！'}
        `;
      }
    }

    handleAnswer(idx) {
      const q = this.questions[this.currentIndex];
      const isCorrect = (idx === q.answerIndex);
      this.userAnswers.push(idx);

      this.dom.optionBtns.forEach((btn, i) => {
        btn.disabled = true;
        if (i === q.answerIndex) {
          btn.classList.add('correct-pick');
        } else if (i === idx) {
          btn.classList.add('wrong-pick');
        }
      });

      if (isCorrect) {
        this.score += 100;
        this.correctCount++;
        this.sound.playCorrect();
        this.showAnswerModal(true, q, idx);
      } else {
        this.sound.playWrong();
        this.showAnswerModal(false, q, idx);
      }
    }

    showAnswerModal(isCorrect, q, idx) {
      const labels = ['ア', 'イ', 'ウ', 'エ'];
      this.dom.judgeIcon.textContent = isCorrect ? '⭕' : '❌';
      this.dom.judgeTitle.textContent = isCorrect ? '捜査成功！ 証拠を押さえた！' : '捜査失敗！ 怪盗に裏をかかれた！';
      this.dom.judgeTitle.style.color = isCorrect ? 'var(--detective-yellow)' : 'var(--danger-red)';

      this.dom.modalCorrectAnswer.textContent = `【${labels[q.answerIndex]}】 ${q.options[q.answerIndex]}`;
      this.dom.modalExplanation.textContent = q.explanation;

      this.dom.answerModal.classList.add('active');
    }

    advanceQuestion() {
      this.dom.answerModal.classList.remove('active');
      this.currentIndex++;

      if (this.currentIndex < this.questions.length) {
        this.renderQuestion();
      } else {
        this.showResult();
      }
    }

    showResult() {
      this.bgm.stop();
      this.sound.playFanfare();

      this.dom.quizScreen.classList.remove('active');
      this.dom.resultScreen.classList.add('active');

      const total = this.questions.length;
      const rate = Math.round((this.correctCount / total) * 100);

      this.dom.resultScore.textContent = `${this.score} 点`;
      this.dom.resultCorrect.textContent = `${this.correctCount} / ${total} 問`;
      this.dom.resultRate.textContent = `${rate} %`;

      let rank = 'C';
      let title = '見習いセキュリティ巡査';
      if (rate >= 90) {
        rank = 'S';
        title = '鉄壁のサイバー特級探偵（怪盗完封）';
      } else if (rate >= 75) {
        rank = 'A';
        title = '敏腕暗号捜査官';
      } else if (rate >= 60) {
        rank = 'B';
        title = '一人前パリティ鑑識官';
      }

      this.dom.rankChar.textContent = rank;
      this.dom.rankTitle.textContent = title;
    }

    openReviewModal() {
      const labels = ['ア', 'イ', 'ウ', 'エ'];
      this.dom.reviewItemList.innerHTML = '';
      this.questions.forEach((q, idx) => {
        const uAns = this.userAnswers[idx];
        const isOk = (uAns === q.answerIndex);
        const item = document.createElement('div');
        item.className = `review-item-row ${isOk ? 'correct' : 'wrong'}`;
        item.innerHTML = `
          <span style="font-size:1.1rem;">${isOk ? '⭕' : '❌'}</span>
          <div style="flex:1;">
            <div style="font-size:0.75rem;color:var(--text-muted);">第${idx + 1}問：${q.category}</div>
            <div style="font-weight:700;font-size:0.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${q.question}</div>
          </div>
        `;
        item.addEventListener('click', () => {
          this.renderReviewDetail(idx);
          Array.from(this.dom.reviewItemList.children).forEach(c => c.classList.remove('selected'));
          item.classList.add('selected');
        });
        this.dom.reviewItemList.appendChild(item);
      });

      this.renderReviewDetail(0);
      if (this.dom.reviewItemList.firstChild) {
        this.dom.reviewItemList.firstChild.classList.add('selected');
      }
      this.dom.reviewModal.classList.add('active');
    }

    renderReviewDetail(idx) {
      const q = this.questions[idx];
      const uAns = this.userAnswers[idx];
      const isOk = (uAns === q.answerIndex);
      const labels = ['ア', 'イ', 'ウ', 'エ'];

      this.dom.reviewDetailCol.innerHTML = `
        <div style="font-size:0.8rem;color:var(--courier-cyan);font-weight:700;">第 ${idx + 1} 問 【${q.category}】</div>
        <h4 style="margin:6px 0 12px;font-size:0.95rem;line-height:1.5;">${q.question}</h4>

        <div style="background:rgba(0,0,0,0.4);border-radius:8px;padding:10px;margin-bottom:12px;">
          <div style="font-size:0.8rem;color:${isOk ? '#22c55e' : '#ef4444'};font-weight:700;margin-bottom:4px;">
            あなたの解答: 【${uAns !== undefined ? labels[uAns] : '-'}】 ${uAns !== undefined ? q.options[uAns] : '未解答'} ${isOk ? '⭕ 正解' : '❌ 不正解'}
          </div>
          <div style="font-size:0.8rem;color:var(--detective-yellow);font-weight:700;">
            正解: 【${labels[q.answerIndex]}】 ${q.options[q.answerIndex]}
          </div>
        </div>

        <div class="explanation-card" style="font-size:0.85rem;line-height:1.6;">
          <div style="font-weight:900;color:var(--detective-yellow);margin-bottom:6px;">💡 探偵柴犬の解説:</div>
          ${q.explanation.replace(/\n/g, '<br>')}
        </div>
      `;
    }

    renderCanvas() {
      const c = this.dom.hudCanvas;
      if (!c) return;
      const ctx = c.getContext('2d');
      const w = c.width;
      const h = c.height;

      ctx.clearRect(0, 0, w, h);

      // 背景グリッド
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.16)';
      ctx.lineWidth = 1;
      const step = 24;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      if (this.currentHudType && this.currentHudType.startsWith('parity')) {
        this.drawParityHUD(ctx, w, h);
      } else {
        this.drawCryptoHUD(ctx, w, h);
      }
    }

    // 🔍 準拠：7ビットデータ＋1ビットパリティビット誤り検出盤面描画
    drawParityHUD(ctx, w, h) {
      const t = this.animFrame;
      const d = this.currentHudData || {};
      const dataStr = d.data || '0010101';
      const pBit = d.bit || '1';
      const pType = d.parityType || '偶数パリティ';
      const bits = (dataStr + pBit).split('');

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🔍 誤り検出符号：7ビットデータ ＋ パリティビット (${pType})`, w / 2, 22, w - 20);

      const cellW = Math.min(36, Math.floor((w - 40) / 8.5));
      const totalW = cellW * 8 + 8;
      const startX = (w - totalW) / 2;
      const startY = 42;

      // ラベル
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('◀─── 元のデータ (7ビット) ───▶', startX + (cellW * 7) / 2, startY - 6);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('付加(8bit目', startX + cellW * 7 + 8 + cellW / 2, startY - 6);

      let oneCount = 0;
      for (let i = 0; i < 8; i++) {
        const isParityBit = (i === 7);
        const bx = startX + i * cellW + (isParityBit ? 8 : 0);
        const by = startY;
        const val = bits[i] || '0';
        if (val === '1') oneCount++;

        ctx.fillStyle = isParityBit
          ? `rgba(234, 179, 8, ${0.35 + Math.sin(t * 0.08) * 0.15})`
          : (val === '1' ? 'rgba(16, 185, 129, 0.28)' : 'rgba(6, 24, 18, 0.88)');
        ctx.strokeStyle = isParityBit ? '#fbbf24' : (val === '1' ? '#10b981' : 'rgba(148, 163, 184, 0.35)');
        ctx.lineWidth = isParityBit ? 2.5 : 1.5;

        ctx.beginPath();
        ctx.roundRect(bx, by, cellW - 4, 42, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isParityBit ? '#fde047' : (val === '1' ? '#ffffff' : '#94a3b8');
        ctx.font = 'bold 16px monospace';
        ctx.fillText(val, bx + (cellW - 4) / 2, by + 27);
      }

      // 判定ステータスボックス（左右余白12pxに広げてmaxWidthで完全収容）
      const boxX = 12;
      const boxW = w - 24;
      const boxY = startY + 54;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.65)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, 54, 8);
      ctx.fill();
      ctx.stroke();

      const isEven = (oneCount % 2 === 0);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `8ビット中の「1」の個数：合計 ${oneCount} 個 （${isEven ? '偶数個' : '奇数個'}）`,
        w / 2,
        boxY + 21,
        boxW - 16
      );

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 10.5px sans-serif';
      ctx.fillText(
        d.feature || '1bit逆転は検出⭕ / 2bit逆転は検出不可❌ / 訂正は再送要求',
        w / 2,
        boxY + 42,
        boxW - 16
      );

      // 探偵柴犬アイコン＋2行吹き出しボックス（右端はみ出し完全防止）
      const avX = 32;
      const avY = h - 30;
      ctx.save();
      ctx.beginPath();
      ctx.arc(avX, avY, 18, 0, Math.PI * 2);
      ctx.clip();
      if (this.imgDetective.complete && this.imgDetective.naturalWidth > 0) {
        ctx.drawImage(this.imgDetective, avX - 18, avY - 18, 36, 36);
      } else {
        ctx.fillStyle = '#eab308';
        ctx.fill();
      }
      ctx.restore();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(avX, avY, 18, 0, Math.PI * 2);
      ctx.stroke();

      // 吹き出し枠
      const bubX = 56;
      const bubW = w - bubX - 12;
      const bubY = h - 50;
      ctx.fillStyle = 'rgba(6, 28, 20, 0.9)';
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bubX, bubY, bubW, 40, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 10.5px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('「8ビット中の『1』の個数が偶数か奇数かで', bubX + 8, bubY + 16, bubW - 16);
      ctx.fillText('　通信途中の誤り（1bit反転）を見抜くワン！」', bubX + 8, bubY + 32, bubW - 16);
    }

    // 🔐 暗号怪盗 vs 探偵柴犬 アニメーション描画
    drawCryptoHUD(ctx, w, h) {
      const t = this.animFrame * 0.03;
      const midY = h * 0.45;

      // 通信電脳ライン
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(70, midY);
      ctx.lineTo(w - 70, midY);
      ctx.stroke();

      // パルス光
      const pulseX = 70 + ((t * 80) % (w - 140));
      const grad = ctx.createRadialGradient(pulseX, midY, 2, pulseX, midY, 18);
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(pulseX, midY, 18, 0, Math.PI * 2);
      ctx.fill();

      // 左: 暗号怪盗猫
      ctx.save();
      ctx.beginPath();
      ctx.arc(45, midY, 24, 0, Math.PI * 2);
      ctx.clip();
      if (this.imgThief.complete && this.imgThief.naturalWidth > 0) {
        ctx.drawImage(this.imgThief, 21, midY - 24, 48, 48);
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.fill();
      }
      ctx.restore();
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('暗号怪盗猫', 45, midY + 38);

      // 右: パリティ探偵柴犬
      ctx.save();
      ctx.beginPath();
      ctx.arc(w - 45, midY, 24, 0, Math.PI * 2);
      ctx.clip();
      if (this.imgDetective.complete && this.imgDetective.naturalWidth > 0) {
        ctx.drawImage(this.imgDetective, w - 69, midY - 24, 48, 48);
      } else {
        ctx.fillStyle = '#eab308';
        ctx.fill();
      }
      ctx.restore();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('パリティ探偵柴犬', w - 45, midY + 38);

      // 中央の暗号鍵＆南京錠
      const centerX = w / 2;
      const centerY = midY - 10;
      const bounce = Math.sin(t * 3) * 6;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(centerX - 45, centerY - 25 + bounce, 90, 50, 8);
      ctx.fill();
      ctx.stroke();

      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔐', centerX, centerY + bounce + 2);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('ENCRYPTED', centerX, centerY + bounce + 18);

      // 下部メッセージ
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('「秘密鍵がなければ怪盗にも解読不能だワン！」', w / 2, h - 22);
    }
  }

  // 起動
  window.addEventListener('DOMContentLoaded', () => {
    window.app = new CryptoDetectiveApp();
  });
})();

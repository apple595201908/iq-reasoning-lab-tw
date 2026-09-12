/**
 * duck-game.js - 鴨鴨高壓急急棒核心遊戲引擎 (固定速度自動捲軸 + 自由拖曳版)
 * 玩家按住自由移動、自動捲軸向上推進、壓殺邊界判定、完整選單控制項檢核
 */

class DuckGameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // 捲軸推進與鏡頭 (110 px/s，33,000px 總長恰為 300 秒 = 5 分鐘)
    this.scrollSpeedBase = 110; // 正常速度 (px/s)
    this.scrollSpeed = 110;
    this.speedMode = 'normal';   // 'normal' (110) 或 'fast' (140)

    this.camera = {
      y: 0
    };

    // 特工鴨鴨物件 (初始位在鏡頭中央偏下方)
    this.duck = {
      x: 200,
      y: 350,
      radius: 13,          // 精密微核心判定半徑 (指尖操作高容錯，杜絕邊緣假判定)
      visualAngle: 0,
      state: 'normal',     // 'normal', 'danger', 'shocked', 'victory'
      shockTimer: 0
    };

    this.spawnShieldTimer = 2.5; // 開局 2.5 秒無敵防護盾 (消除一開局必死問題)

    // 遊戲狀態
    this.gameState = 'IDLE'; // 'IDLE', 'RUNNING', 'PAUSED', 'GAME_OVER', 'VICTORY'
    this.startTime = 0;
    this.elapsedTime = 0;
    this.bestProgress = parseFloat(localStorage.getItem('duck_buzz_wire_best') || '0');

    // 操控手感與模式
    this.touchActive = false;
    this.touchScreenPos = null; // 螢幕絕對觸控座標 { x, y }
    this.touchOffsetMode = 'direct'; // 'direct' (1:1 直觸) 或 'offset' (指尖上方 45px 防遮擋)
    this.touchOffsetY = 0; // 偏移量 (像素)

    // 模組實例
    this.course = new window.DuckCourse();
    this.spriteRenderer = new window.DuckSpriteRenderer();
    this.particleSystem = new window.DuckParticleSystem();
    this.audio = window.duckAudio;

    // 畫面尺寸
    this.viewportWidth = 390;
    this.viewportHeight = 844;
    this.dpr = window.devicePixelRatio || 1;

    // 效能與時間追蹤
    this.lastFrameTime = performance.now();
    this.nearWarnCooldown = 0;

    this.init();
  }

  init() {
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.handleResize(), 100));

    this.bindInputs();
    this.updateHUD();

    // 啟動主渲染循環
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  handleResize() {
    const container = document.getElementById('gameContainer');
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    this.viewportWidth = w;
    this.viewportHeight = h;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    this.canvas.width = this.viewportWidth * this.dpr;
    this.canvas.height = this.viewportHeight * this.dpr;
    this.canvas.style.width = `${this.viewportWidth}px`;
    this.canvas.style.height = `${this.viewportHeight}px`;

    this.ctx.scale(this.dpr, this.dpr);
  }

  // 精確轉換 client 座標為 canvas 內部邏輯座標 (解決不同螢幕縮放與邊界偏移)
  getLogicalScreenPos(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.viewportWidth / rect.width;
    const scaleY = this.viewportHeight / rect.height;
    const screenX = (clientX - rect.left) * scaleX;
    const screenY = (clientY - rect.top) * scaleY;
    return {
      x: Math.max(0, Math.min(this.viewportWidth, screenX)),
      y: Math.max(0, Math.min(this.viewportHeight, screenY))
    };
  }

  bindInputs() {
    const handlePointerDown = (clientX, clientY) => {
      this.touchActive = true;
      this.touchScreenPos = this.getLogicalScreenPos(clientX, clientY);

      if (this.audio) this.audio.init();

      if (this.gameState === 'IDLE') {
        this.startGame();
      }
    };

    const handlePointerMove = (clientX, clientY) => {
      if (!this.touchActive) return;
      const pos = this.getLogicalScreenPos(clientX, clientY);

      // 計算水平移動傾角
      if (this.touchScreenPos) {
        const dx = pos.x - this.touchScreenPos.x;
        this.duck.visualAngle = Math.max(-0.6, Math.min(0.6, dx * 0.12));
      }

      this.touchScreenPos = pos;
    };

    const handlePointerUp = () => {
      this.touchActive = false;
      this.touchScreenPos = null;
      this.duck.visualAngle = 0;
    };

    // 手機觸控事件
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.touches[0];
      handlePointerDown(t.clientX, t.clientY);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!this.touchActive) return;
      e.preventDefault();
      const t = e.touches[0];
      handlePointerMove(t.clientX, t.clientY);
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
      if (e.touches.length === 0) {
        handlePointerUp();
      }
    });
    window.addEventListener('touchcancel', () => handlePointerUp());

    // 電腦滑鼠操作支援
    this.canvas.addEventListener('mousedown', (e) => {
      handlePointerDown(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', (e) => {
      if (this.touchActive) {
        handlePointerMove(e.clientX, e.clientY);
      }
    });
    window.addEventListener('mouseup', () => {
      if (this.touchActive) {
        handlePointerUp();
      }
    });

    // ==========================================
    // 全功能選單按鈕綁定與檢核
    // ==========================================

    // 1. 開始按鈕
    const startPlayBtn = document.getElementById('startPlayBtn');
    if (startPlayBtn) {
      startPlayBtn.addEventListener('click', () => this.startGame());
      startPlayBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.startGame(); });
    }

    // 2. 暫停按鈕 (HUD 頂部)
    const pauseToggleBtn = document.getElementById('pauseToggleBtn');
    if (pauseToggleBtn) {
      pauseToggleBtn.addEventListener('click', () => this.pauseGame());
    }

    // 3. 恢復遊戲按鈕 (暫停視窗內)
    const resumePlayBtn = document.getElementById('resumePlayBtn');
    if (resumePlayBtn) {
      resumePlayBtn.addEventListener('click', () => this.resumeGame());
    }

    // 4. 暫停視窗內的重新開始按鈕
    const pauseRestartBtn = document.getElementById('pauseRestartBtn');
    if (pauseRestartBtn) {
      pauseRestartBtn.addEventListener('click', () => this.restartGame());
    }

    // 5. 失敗結算視窗的重試按鈕
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.restartGame());
      retryBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.restartGame(); });
    }

    // 6. 勝利結算視窗的重試按鈕
    const victoryRetryBtn = document.getElementById('victoryRetryBtn');
    if (victoryRetryBtn) {
      victoryRetryBtn.addEventListener('click', () => this.restartGame());
    }

    // 7. 音效開關切換 (HUD 頂部)
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', () => {
        if (this.audio) {
          const isMuted = this.audio.toggleMute();
          soundToggleBtn.textContent = isMuted ? '🔇 靜音' : '🔊 音效';
        }
      });
    }

    // 8. 操控模式切換 (指尖直觸 1:1 vs 向上抬高 45px 防遮擋)
    const sensToggleBtn = document.getElementById('sensToggleBtn');
    if (sensToggleBtn) {
      sensToggleBtn.addEventListener('click', () => {
        if (this.touchOffsetY === 0) {
          this.touchOffsetY = 45;
          sensToggleBtn.textContent = '🎯 指尖: 防遮擋 +45px';
        } else {
          this.touchOffsetY = 0;
          sensToggleBtn.textContent = '🎯 指尖: 100% 直觸';
        }
      });
      sensToggleBtn.textContent = '🎯 指尖: 100% 直觸';
    }

    // 9. 捲軸推進速度切換 (正常 110px/s vs 狂暴 140px/s)
    const speedToggleBtn = document.getElementById('speedToggleBtn');
    if (speedToggleBtn) {
      speedToggleBtn.addEventListener('click', () => {
        this.speedMode = this.speedMode === 'normal' ? 'fast' : 'normal';
        this.scrollSpeed = this.speedMode === 'normal' ? 110 : 140;
        speedToggleBtn.textContent = this.speedMode === 'normal' ? '⚡ 速度: 正常 (5分)' : '⚡ 速度: 狂暴 (4分)';
      });
      speedToggleBtn.textContent = '⚡ 速度: 正常 (5分)';
    }
  }

  startGame() {
    this.gameState = 'RUNNING';
    this.spawnShieldTimer = 2.5; // 開局 2.5 秒無敵防護盾 (消除一開局猝死)
    if (this.startTime === 0) {
      this.startTime = performance.now();
    }
    document.getElementById('startOverlay').style.display = 'none';
    document.getElementById('pauseOverlay').style.display = 'none';
    document.getElementById('gameOverModal').style.display = 'none';
    document.getElementById('victoryModal').style.display = 'none';

    if (this.audio) {
      this.audio.startBGM();
      this.audio.playQuack(1.0);
    }
  }

  pauseGame() {
    if (this.gameState !== 'RUNNING') return;
    this.gameState = 'PAUSED';
    const pauseOverlay = document.getElementById('pauseOverlay');
    if (pauseOverlay) {
      pauseOverlay.style.display = 'flex';
    }
    if (this.audio) {
      this.audio.stopBGM();
    }
  }

  resumeGame() {
    if (this.gameState !== 'PAUSED') return;
    this.gameState = 'RUNNING';
    const pauseOverlay = document.getElementById('pauseOverlay');
    if (pauseOverlay) {
      pauseOverlay.style.display = 'none';
    }
    if (this.audio) {
      this.audio.startBGM();
    }
  }

  triggerGameOver(cause) {
    this.gameState = 'GAME_OVER';
    this.duck.state = 'shocked';
    this.duck.shockTimer = 1.6;

    // 爆散羽毛與電擊音效
    this.particleSystem.spawnShockExplosion(this.duck.x, this.duck.y);
    if (this.audio) {
      this.audio.playShock();
      this.audio.stopBGM();
    }

    const progress = Math.min(100, Math.max(0, (this.duck.y / 32500) * 100));
    if (progress > this.bestProgress) {
      this.bestProgress = progress;
      localStorage.setItem('duck_buzz_wire_best', this.bestProgress.toFixed(1));
    }

    setTimeout(() => {
      this.showGameOverModal(progress, cause);
    }, 900);
  }

  showGameOverModal(progress, cause) {
    const modal = document.getElementById('gameOverModal');
    const scoreVal = document.getElementById('finalScoreVal');
    const bestVal = document.getElementById('bestScoreVal');
    const causeVal = document.getElementById('deathCauseText');

    if (scoreVal) scoreVal.textContent = `${progress.toFixed(1)}%`;
    if (bestVal) bestVal.textContent = `${this.bestProgress.toFixed(1)}%`;

    let causeDesc = '觸碰兩側高壓電弧壁';
    if (cause === 'scroll_crush') causeDesc = '掉出上方鏡頭外，遭高壓電流擠出！';
    else if (cause === 'tri_spoke_rotor') causeDesc = '遭高速旋轉之巨大三叉鋼樑絞中！';
    else if (cause === 'twin_rotors') causeDesc = '在對向雙三叉旋轉鋼樑咬合間隙中觸電！';
    else if (cause === 'giant_compactor') causeDesc = '慘遭巨大黑黃液壓對衝重型活塞壓頂！';
    else if (cause === 'giant_cantilever') causeDesc = '遭巨大重型金屬起重懸臂鋼樑揮擊！';
    else if (cause === 'giant_pendulum') causeDesc = '遭巨型重金屬破壞球強烈撞擊！';
    else if (cause === 'giant_slicer') causeDesc = '慘遭巨大斜向滑移斷頭鍘切斷！';
    else if (cause === 'slalom_rod') causeDesc = '在連續蛇行大扭動中撞上高壓交錯長鋼樑！';
    else if (cause === 'slalom_wave') causeDesc = '遭 S 型波浪時間差金屬套管阻斷！';
    else if (cause === 'slide_bars') causeDesc = '遭對向滑移雙聯軌道門夾殺！';
    else if (cause === 'waterfall_cascade') causeDesc = '遭階梯瀑布交錯光柵攔截！';
    else if (cause === 'zigzag_chicane') causeDesc = '在鋸齒折線急轉走廊撞毀！';
    else if (cause === 'multi_x') causeDesc = '遭雙 X 齒輪咬合旋轉鐵棒絞碎！';
    else if (cause === 'alt_grid') causeDesc = '遭週期交替變化的橫縱電閘阻斷！';
    else if (cause === 'windmill') causeDesc = '被旋轉風車旋翼高壓電棒擊中！';
    else if (cause === 'piston_crusher') causeDesc = '遭黑黃液壓對衝活塞迎面重擊！';
    else if (cause === 'pendulum') causeDesc = '遭重金屬高壓鐘擺迎面撞擊！';
    else if (cause === 'spiral') causeDesc = '在旋轉同心螺旋軌道中觸電！';
    else if (cause === 'orbital_satellites') causeDesc = '遭雙星電磁公轉放電球電殛！';
    else if (cause === 'breathing_iris') causeDesc = '遭呼吸式快門金屬環夾擊！';
    else if (cause === 'scissor_shears') causeDesc = '遭高壓剪刀諧振閘門剪斷！';
    else if (cause === 'twin_turrets') causeDesc = '遭雙塔對向掃描雷達桿精準攔截！';
    else if (cause === 'bouncing_bumper') causeDesc = '遭彈跳反射金屬浮動橫桿衝撞！';
    else if (cause === 'curved_arc') causeDesc = '遭圓弧金屬拱門導管阻擊！';
    else if (cause === 'guillotine_slicer') causeDesc = '慘遭黑黃警戒斜向斷頭鍘切斷！';
    else if (cause === 'serrated_comb') causeDesc = '遭上下交錯狼牙梳齒排閘刺傷！';
    else if (cause === 'rhombus_gate') causeDesc = '遭菱形伸縮金屬閘門收縮夾擊！';
    else if (cause === 'cantilever_flap') causeDesc = '遭重型懸臂交錯拍擊閘揮擊！';
    else if (cause === 'double_rail_corridor') causeDesc = '在雙軌並行蛇行狹道脫軌觸電！';

    if (causeVal) causeVal.textContent = `⚡ 慘遭：${causeDesc}`;
    if (modal) modal.style.display = 'flex';
  }

  triggerVictory() {
    this.gameState = 'VICTORY';
    this.duck.state = 'victory';

    this.particleSystem.spawnVictoryConfetti(this.duck.x, this.duck.y);
    if (this.audio) {
      this.audio.playVictory();
      this.audio.stopBGM();
    }

    this.bestProgress = 100;
    localStorage.setItem('duck_buzz_wire_best', '100.0');

    setTimeout(() => {
      const modal = document.getElementById('victoryModal');
      const timeVal = document.getElementById('victoryTimeVal');
      if (timeVal) {
        const secs = (this.elapsedTime / 1000).toFixed(2);
        timeVal.textContent = `${secs} 秒`;
      }
      if (modal) modal.style.display = 'flex';
    }, 1200);
  }

  restartGame() {
    this.camera.y = 0;
    this.duck.x = 200;
    this.duck.y = 350;
    this.duck.state = 'normal';
    this.duck.visualAngle = 0;
    this.duck.shockTimer = 0;

    this.startTime = 0;
    this.elapsedTime = 0;
    this.gameState = 'IDLE';
    this.spawnShieldTimer = 2.5; // 重開時重置 2.5 秒無敵防護盾

    document.getElementById('gameOverModal').style.display = 'none';
    document.getElementById('victoryModal').style.display = 'none';
    document.getElementById('pauseOverlay').style.display = 'none';
    document.getElementById('startOverlay').style.display = 'flex';

    this.course = new window.DuckCourse();
    this.updateHUD();
  }

  update(dt) {
    if (this.gameState === 'RUNNING') {
      this.elapsedTime = performance.now() - this.startTime;

      // 護盾倒數
      if (this.spawnShieldTimer > 0) {
        this.spawnShieldTimer -= dt;
      }

      // 1. 固定速度自動捲軸前進 (場景持續向上捲動)
      this.camera.y += this.scrollSpeed * dt;

      // 2. 核心觸控跟隨演算法 (手指真實在哪，小鴨就能移動到哪)
      if (this.touchActive && this.touchScreenPos) {
        const offsetX = (this.viewportWidth - 400) / 2;
        const targetWorldX = this.touchScreenPos.x - offsetX;
        const targetWorldY = this.touchScreenPos.y - this.touchOffsetY + this.camera.y;

        // 保障合理的閃避操作範圍：將鴨鴨鎖定在兩側安全走廊內，杜絕摸螢幕邊緣即猝死
        const bounds = this.course.getCorridorBoundsAt(this.duck.y);
        const safeTargetX = Math.max(bounds.left + this.duck.radius + 2, Math.min(bounds.right - this.duck.radius - 2, targetWorldX));

        // 即時吸附追隨 (0.85 權重保持 60fps 平滑無延遲感)
        const dist = Math.hypot(safeTargetX - this.duck.x, targetWorldY - this.duck.y);
        if (dist < 4) {
          this.duck.x = safeTargetX;
          this.duck.y = targetWorldY;
        } else {
          this.duck.x += (safeTargetX - this.duck.x) * 0.85;
          this.duck.y += (targetWorldY - this.duck.y) * 0.85;
        }
      } else {
        // 手指未按住時，鴨鴨保持在當前畫面相對高度隨捲軸前進
        this.duck.y += this.scrollSpeed * dt;
      }

      // 3. 鏡頭可視安全邊界約束 (自由拖動範圍限制)
      const topSafeLine = this.camera.y + 60;
      const bottomSafeLine = this.camera.y + this.viewportHeight - 60;

      // 街機壓殺判定：若鴨鴨被障礙物卡住或未跟上掉出頂部危險線 -> 觸電！
      if (this.duck.y < this.camera.y + 35) {
        this.triggerGameOver('scroll_crush');
        return;
      }

      // 底部不超出當前鏡頭可視下緣
      if (this.duck.y > bottomSafeLine) {
        this.duck.y = bottomSafeLine;
      }

      // 3. 更新賽道動態機關
      this.course.update(dt, this.duck);

      // 4. 碰撞檢測 (開局 2.5s 護盾保護，徹底解決一開局必死問題)
      if (this.spawnShieldTimer <= 0) {
        const col = this.course.checkCollision(this.duck.x, this.duck.y, this.duck.radius);
        if (col.hit) {
          this.triggerGameOver(col.cause);
          return;
        }
      }

      // 5. 接近危險電弧微弱警示
      this.nearWarnCooldown -= dt;
      if (this.course.checkNearWarning(this.duck.x, this.duck.y, this.duck.radius)) {
        this.duck.state = 'danger';
        this.particleSystem.spawnNearSparks(this.duck.x, this.duck.y, 1);
        if (this.nearWarnCooldown <= 0 && this.audio) {
          this.audio.playNearSpark();
          this.nearWarnCooldown = 0.28;
        }
      } else {
        this.duck.state = 'normal';
      }

      // 6. 抵達終點神殿 (y >= 32500)
      if (this.duck.y >= 32500) {
        this.triggerVictory();
        return;
      }

      // 7. 更新動態危險音調
      const progressRatio = Math.min(1.0, this.duck.y / 32500);
      if (this.audio) {
        this.audio.setDangerLevel(progressRatio);
      }
    }

    // 向量動畫更新
    this.spriteRenderer.update(dt, this.touchActive);
    this.particleSystem.update(dt);
    this.updateHUD();
  }

  updateHUD() {
    const progress = Math.min(100, Math.max(0, (this.duck.y / 32500) * 100));
    const progBar = document.getElementById('progressBarFill');
    const progDuck = document.getElementById('progressDuckCursor');
    const progText = document.getElementById('progressPercentageText');
    const zoneBadge = document.getElementById('zoneNameBadge');
    const timeDisplay = document.getElementById('hudTimeDisplay');
    const voltageMeter = document.getElementById('voltageMeterVal');

    if (progBar) progBar.style.width = `${progress}%`;
    if (progDuck) progDuck.style.left = `${progress}%`;
    if (progText) progText.textContent = `${progress.toFixed(1)}%`;

    const curZone = this.course.getCurrentZone(this.duck.y);
    if (zoneBadge) {
      zoneBadge.textContent = curZone.name;
      zoneBadge.style.borderColor = curZone.color;
      zoneBadge.style.color = curZone.color;
    }

    if (timeDisplay) {
      const secs = (this.elapsedTime / 1000).toFixed(1);
      timeDisplay.textContent = `⏱ ${secs}s`;
    }

    if (voltageMeter) {
      const volt = Math.floor(100000 + (Math.random() - 0.5) * 4500);
      voltageMeter.textContent = `⚡ ${volt.toLocaleString()} V`;
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);

    ctx.save();
    // 固定速度自動捲軸變換：
    // 世界地圖隨 camera.y 向上捲動
    const offsetX = (this.viewportWidth - 400) / 2;
    ctx.translate(offsetX, -this.camera.y);

    // 1. 繪製高科技發電廠地板與兩側高壓導軌
    this.course.drawEnvironment(ctx, this.camera.y, this.viewportHeight);

    // 2. 繪製粒子特效
    this.particleSystem.draw(ctx);

    // 3. 繪製特工鴨鴨本體 (Q 版超萌風格 + 開局無敵護盾特效)
    this.spriteRenderer.drawDuck(
      ctx,
      this.duck.x,
      this.duck.y,
      this.duck.state,
      this.duck.visualAngle,
      this.duck.radius,
      this.spawnShieldTimer
    );

    ctx.restore();

    // 4. 僅在鴨鴨接近上方鏡頭壓殺線時才提示紅光 (平時保持全螢幕清爽、極致好辨認)
    if (this.gameState === 'RUNNING' && (this.duck.y - this.camera.y) < 100) {
      ctx.save();
      const dangerRatio = Math.max(0, 1 - (this.duck.y - this.camera.y) / 100);
      const edgeGrad = ctx.createLinearGradient(0, 0, 0, 50);
      edgeGrad.addColorStop(0, `rgba(239, 68, 68, ${0.4 * dangerRatio})`);
      edgeGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = edgeGrad;
      ctx.fillRect(0, 0, this.viewportWidth, 50);
      ctx.restore();
    }

    // 5. 繪製手指觸控即時回饋環 (讓玩家清楚看見螢幕偵測位置)
    if (this.touchActive && this.touchScreenPos) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.touchScreenPos.x, this.touchScreenPos.y, 20, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.fill();

      // 當開啟防遮擋模式時，繪製連結至上方鴨鴨的導引光線
      if (this.touchOffsetY > 0) {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(this.touchScreenPos.x, this.touchScreenPos.y);
        ctx.lineTo(this.touchScreenPos.x, this.touchScreenPos.y - this.touchOffsetY);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  gameLoop(timestamp) {
    const dt = Math.min(0.05, (timestamp - this.lastFrameTime) / 1000);
    this.lastFrameTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.duckGame = new DuckGameEngine();
});

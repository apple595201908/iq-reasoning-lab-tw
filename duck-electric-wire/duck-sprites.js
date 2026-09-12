/**
 * duck-sprites.js - 純粹特工鴨鴨本體向量繪製、無泡泡框、動態表情、骨骼觸電與粒子系統
 * 去除任何圓形頭貼邊框，回歸最純粹生動的特工小鴨本體！
 */

class DuckSpriteRenderer {
  constructor() {
    this.wingAngle = 0;
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.duckImg = new Image();
    this.duckImg.src = 'assets/pure_duck_agent.png';
  }

  update(dt, isMoving) {
    if (isMoving) {
      this.wingAngle += dt * 16;
    } else {
      this.wingAngle += dt * 5;
    }

    this.blinkTimer += dt;
    if (this.blinkTimer > 3.0) {
      this.isBlinking = true;
      if (this.blinkTimer > 3.16) {
        this.isBlinking = false;
        this.blinkTimer = 0;
      }
    }
  }

  // 繪製純粹特工鴨鴨本體 (Q版可愛風格，無外框泡泡，支援開局護盾)
  drawDuck(ctx, x, y, state = 'normal', facingAngle = 0, hitRadius = 15, shieldTimer = 0) {
    ctx.save();
    ctx.translate(x, y);

    // 1. 開局無敵護盾能量光環 (消除一開局必死不合理問題)
    if (shieldTimer > 0) {
      ctx.save();
      const pulse = 1 + Math.sin(performance.now() * 0.01) * 0.08;
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, 0, 36 * pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.fill();

      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🛡️ 護盾中 ${(shieldTimer).toFixed(1)}s`, 0, -42);
      ctx.restore();
    }

    // 2. 微核心碰撞判定指示 (僅保留極簡微光點，乾淨清晰)
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, hitRadius, 0, Math.PI * 2);
    ctx.strokeStyle = state === 'shocked' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(0, 240, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 4]);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = state === 'shocked' ? '#ef4444' : '#00f0ff';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();

    // 3. 隨行進微幅傾斜
    ctx.rotate(facingAngle * 0.35);

    // 4. 狀態繪製 (純 Q 版小鴨本體)
    if (state === 'shocked') {
      this.drawShockedDuck(ctx);
    } else if (state === 'victory') {
      this.drawVictoryDuck(ctx);
    } else {
      this.drawNormalDuck(ctx, state === 'danger');
    }

    ctx.restore();
  }

  // 正常與警戒狀態純粹小鴨 (繪製超萌 Q 版可愛特工小鴨)
  drawNormalDuck(ctx, isDanger = false) {
    // 繪製超萌 Q 版可愛特工鴨 (去背透明 PNG)
    if (this.duckImg && this.duckImg.complete && this.duckImg.naturalWidth > 0) {
      const size = 68; // Q 版大頭萌系比例
      const bob = Math.sin(this.wingAngle) * 3; // 靈動可愛搖擺
      ctx.save();
      // 接地陰影
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.drawImage(this.duckImg, -size / 2, -size / 2 + bob - 4, size, size);
      ctx.restore();

      // 警戒狀態時之純淨微光指示 (非刺眼隨機跳動電弧)
      if (isDanger) {
        ctx.save();
        ctx.strokeStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2;
        const sparkX = 0;
        const sparkY = -size / 2 + bob - 8;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      return;
    }

    const wingFlap = Math.sin(this.wingAngle) * 7;

    ctx.save();

    // 身軀輕微立體投影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    // 1. 飽滿黃色鴨鴨身體 (立體球形漸層)
    const bodyGrad = ctx.createRadialGradient(-3, 2, 3, 0, 4, 23);
    bodyGrad.addColorStop(0, '#fff48d');
    bodyGrad.addColorStop(0.7, '#ffcc00');
    bodyGrad.addColorStop(1, '#d97706');

    ctx.beginPath();
    ctx.ellipse(0, 5, 21, 18, 0, 0, Math.PI * 2);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // 2. 可愛小翅膀 (左與右拍動)
    ctx.fillStyle = '#f59e0b';
    // 左翅
    ctx.beginPath();
    ctx.ellipse(-19, 3 - wingFlap * 0.35, 7, 12, -0.4, 0, Math.PI * 2);
    ctx.fill();
    // 右翅
    ctx.beginPath();
    ctx.ellipse(19, 3 + wingFlap * 0.35, 7, 12, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // 3. 圓滾滾鴨頭
    const headGrad = ctx.createRadialGradient(-2, -14, 2, 0, -13, 16);
    headGrad.addColorStop(0, '#fff6a3');
    headGrad.addColorStop(0.75, '#ffd214');
    headGrad.addColorStop(1, '#e09800');

    ctx.beginPath();
    ctx.arc(0, -13, 14.5, 0, Math.PI * 2);
    ctx.fillStyle = headGrad;
    ctx.fill();

    // 4. 頭頂避雷針呆毛天線
    ctx.beginPath();
    ctx.moveTo(0, -27);
    ctx.lineTo(3, -33);
    ctx.lineTo(-2, -37);
    ctx.lineTo(2, -43);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 避雷天線小光球
    ctx.beginPath();
    ctx.arc(2, -44, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = isDanger ? '#ef4444' : '#0ea5e9';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    // 5. 特工青藍飛行護目鏡 (Goggles)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-13, -19, 26, 9.5, 4.5);
    ctx.fill();

    // 鏡片漸層
    const lensGrad = ctx.createLinearGradient(-11, -18, 11, -11);
    lensGrad.addColorStop(0, '#38bdf8');
    lensGrad.addColorStop(1, '#0284c7');

    ctx.fillStyle = lensGrad;
    ctx.beginPath();
    ctx.roundRect(-11, -18, 10, 7.5, 3);
    ctx.roundRect(1, -18, 10, 7.5, 3);
    ctx.fill();

    // 鏡片反光高光點
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(-8, -16, 1.6, 0, Math.PI * 2);
    ctx.arc(4, -16, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // 6. 眼睛 (護目鏡下方大眼睛)
    if (isDanger) {
      // 驚恐睜大眼！
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-5, -10, 4.2, 0, Math.PI * 2);
      ctx.arc(5, -10, 4.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-5, -10, 2, 0, Math.PI * 2);
      ctx.arc(5, -10, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.isBlinking) {
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-7, -9.5);
      ctx.lineTo(-3, -9.5);
      ctx.moveTo(3, -9.5);
      ctx.lineTo(7, -9.5);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(-5, -9.5, 2.6, 0, Math.PI * 2);
      ctx.arc(5, -9.5, 2.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-6, -10.5, 1, 0, Math.PI * 2);
      ctx.arc(4, -10.5, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. 招牌扁扁橘色鴨嘴 (Beak)
    const beakGrad = ctx.createLinearGradient(0, -8, 0, -2);
    beakGrad.addColorStop(0, '#f97316');
    beakGrad.addColorStop(1, '#ea580c');

    ctx.fillStyle = beakGrad;
    ctx.beginPath();
    ctx.ellipse(0, -5, 8.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 嘴巴微笑中線
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-6.5, -4.5);
    ctx.lineTo(6.5, -4.5);
    ctx.stroke();

    // 萌系粉嫩腮紅
    ctx.fillStyle = 'rgba(251, 113, 133, 0.4)';
    ctx.beginPath();
    ctx.arc(-10, -7, 3, 0, Math.PI * 2);
    ctx.arc(10, -7, 3, 0, Math.PI * 2);
    ctx.fill();

    // 8. 鴨鴨橘色小噗噗腳
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.ellipse(-7, 21, 5, 3.5, -0.2, 0, Math.PI * 2);
    ctx.ellipse(7, 21, 5, 3.5, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 觸電時的爆笑骨骼透視閃電 X-ray (純小鴨無框)
  drawShockedDuck(ctx) {
    const flashWhite = Math.random() > 0.35;
    const shakeX = (Math.random() - 0.5) * 7;
    const shakeY = (Math.random() - 0.5) * 7;

    ctx.save();
    ctx.translate(shakeX, shakeY);

    // 黑色焦化輪廓
    ctx.beginPath();
    ctx.ellipse(0, 5, 22, 19, 0, 0, Math.PI * 2);
    ctx.arc(0, -13, 15, 0, Math.PI * 2);
    ctx.fillStyle = flashWhite ? '#ffffff' : '#1e293b';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 24;
    ctx.fill();
    ctx.shadowBlur = 0;

    // 透視骨骼
    ctx.strokeStyle = flashWhite ? '#00f0ff' : '#ffffff';
    ctx.lineWidth = 2.5;

    // 頭骨
    ctx.beginPath();
    ctx.arc(0, -13, 9, 0, Math.PI * 2);
    // 脊椎與肋骨
    ctx.moveTo(0, -4);
    ctx.lineTo(0, 15);
    ctx.moveTo(-8, 1);
    ctx.lineTo(8, 1);
    ctx.moveTo(-10, 6);
    ctx.lineTo(10, 6);
    ctx.moveTo(-7, 11);
    ctx.lineTo(7, 11);
    // 雙翅骨
    ctx.moveTo(-3, 1);
    ctx.lineTo(-16, -3);
    ctx.moveTo(3, 1);
    ctx.lineTo(16, -3);
    ctx.stroke();

    // 骨骼空洞黑眼窩
    ctx.fillStyle = flashWhite ? '#0f172a' : '#00f0ff';
    ctx.beginPath();
    ctx.arc(-4, -14, 3, 0, Math.PI * 2);
    ctx.arc(4, -14, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 獲勝鴨神姿態 (純小鴨無框)
  drawVictoryDuck(ctx) {
    this.drawNormalDuck(ctx, false);

    ctx.save();
    // 金色王冠
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-8, -26);
    ctx.lineTo(-11, -37);
    ctx.lineTo(-4, -31);
    ctx.lineTo(0, -39);
    ctx.lineTo(4, -31);
    ctx.lineTo(11, -37);
    ctx.lineTo(8, -26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 王冠紅寶石
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -33, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 帥氣墨鏡
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-12, -18, 24, 8, 3);
    ctx.fill();

    // 耀眼黃金光芒粒子環
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 5]);
    ctx.stroke();

    ctx.restore();
  }
}

/**
 * 粒子系統：火花、羽毛、煙霧與彩帶
 */
class DuckParticleSystem {
  constructor() {
    this.particles = [];
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.type === 'feather') {
        p.vy += 60 * dt;
        p.angle += p.vAngle * dt;
        p.vx *= 0.96;
      } else if (p.type === 'spark') {
        p.vx *= 0.92;
        p.vy *= 0.92;
      } else if (p.type === 'confetti') {
        p.vy += 80 * dt;
        p.angle += p.vAngle * dt;
      }
    }
  }

  spawnShockExplosion(x, y) {
    for (let i = 0; i < 26; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 240;
      this.particles.push({
        type: 'feather',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 10,
        size: 7 + Math.random() * 8,
        color: Math.random() > 0.2 ? '#ffd700' : '#ffffff',
        maxLife: 1.8 + Math.random() * 1.0,
        life: 1.8 + Math.random() * 1.0
      });
    }

    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 320;
      this.particles.push({
        type: 'spark',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 4,
        color: Math.random() > 0.5 ? '#0284c7' : '#f59e0b',
        maxLife: 0.6 + Math.random() * 0.5,
        life: 0.6 + Math.random() * 0.5
      });
    }

    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 60;
      this.particles.push({
        type: 'smoke',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        size: 14 + Math.random() * 16,
        color: 'rgba(100, 116, 139, 0.5)',
        maxLife: 1.2,
        life: 1.2
      });
    }
  }

  spawnNearSparks(x, y, count = 2) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 90;
      this.particles.push({
        type: 'spark',
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 2.5,
        color: '#0284c7',
        maxLife: 0.25,
        life: 0.25
      });
    }
  }

  spawnVictoryConfetti(x, y) {
    const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];
    for (let i = 0; i < 60; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
      const speed = 150 + Math.random() * 350;
      this.particles.push({
        type: 'confetti',
        x: x + (Math.random() - 0.5) * 40,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 12,
        width: 8 + Math.random() * 6,
        height: 5 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        maxLife: 2.8,
        life: 2.8
      });
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      const progress = p.life / p.maxLife;

      if (p.type === 'feather') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = Math.min(1.0, progress * 1.5);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.45, p.size, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.type === 'spark') {
        ctx.save();
        ctx.globalAlpha = progress;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.type === 'smoke') {
        ctx.save();
        ctx.globalAlpha = progress * 0.35;
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (2 - progress), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.type === 'confetti') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = progress;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        ctx.restore();
      }
    }
  }
}

// 輔助函式：即時演算鋸齒狀真實電弧
function drawLightningArc(ctx, x1, y1, x2, y2, displace = 18, color = '#0284c7', lineWidth = 2) {
  const points = [{ x: x1, y: y1 }, { x: x2, y: y2 }];

  function subdivide(p1, p2, disp, iter) {
    if (iter <= 0) return [p1, p2];
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const offset = (Math.random() - 0.5) * disp;
    const mid = { x: midX + nx * offset, y: midY + ny * offset };

    const left = subdivide(p1, mid, disp * 0.6, iter - 1);
    const right = subdivide(mid, p2, disp * 0.6, iter - 1);
    return left.slice(0, -1).concat(right);
  }

  const arcPoints = subdivide(points[0], points[1], displace, 3);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.moveTo(arcPoints[0].x, arcPoints[0].y);
  for (let i = 1; i < arcPoints.length; i++) {
    ctx.lineTo(arcPoints[i].x, arcPoints[i].y);
  }
  ctx.stroke();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1, lineWidth * 0.4);
  ctx.stroke();
  ctx.restore();
}

window.DuckSpriteRenderer = DuckSpriteRenderer;
window.DuckParticleSystem = DuckParticleSystem;
window.drawLightningArc = drawLightningArc;

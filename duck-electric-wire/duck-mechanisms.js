/**
 * duck-mechanisms.js - 統一設計語言：多型態金屬鋼鐵高壓急急棒機關庫 (人機工程寬幅防卡死版)
 * 1. 徹底消除必死局：所有機關保證擁有 135px ~ 150px 以上寬裕通行通道，嚴格符合人類手指反應極限！
 * 2. 杜絕封閉式環形牢籠陷阱：所有圓弧、快門與菱形機關均改為開放式導軌，絕不將玩家困在封閉死角內！
 * 3. 支援 6 種重金屬工業風格 (hazard、conduit、plasma、double_rail、serrated、chrome) 與圓弧彎管！
 */

// 數學輔助：點到線段距離
function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

// 繪製多風格立體高壓金屬鐵棒 (高對比 + 醒目工業細節 + 乾淨無雜訊)
function drawMetallicBar(ctx, x1, y1, x2, y2, thickness = 12, glowColor = '#00f0ff', style = 'chrome') {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const angle = Math.atan2(dy, dx);
  const length = Math.hypot(dx, dy);
  if (length <= 1) return;

  ctx.save();
  ctx.translate(x1, y1);
  ctx.rotate(angle);

  // 1. 深色立體陰影
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;

  if (style === 'hazard') {
    // 黑黃警戒斜紋重型鋼樑
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, -thickness / 2, length, thickness);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, -thickness / 2, length, thickness);
    ctx.clip();
    ctx.fillStyle = '#fbbf24';
    const stripeW = Math.max(10, thickness * 0.9);
    for (let sx = -thickness * 2; sx < length + thickness * 2; sx += stripeW * 2) {
      ctx.beginPath();
      ctx.moveTo(sx, -thickness / 2);
      ctx.lineTo(sx + stripeW, -thickness / 2);
      ctx.lineTo(sx + stripeW - thickness, thickness / 2);
      ctx.lineTo(sx - thickness, thickness / 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(0, -thickness / 2, length, 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, thickness / 2 - 2, length, 2);
    ctx.restore();

    ctx.shadowColor = glowColor || '#f59e0b';
    ctx.shadowBlur = 5;
    ctx.strokeStyle = glowColor || '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, -thickness / 2, length, thickness);
    ctx.shadowBlur = 0;

    const capW = Math.min(14, length / 3);
    const capH = thickness + 4;
    [0, length - capW].forEach(capX => {
      ctx.fillStyle = '#27272a';
      ctx.fillRect(capX, -capH / 2, capW, capH);
      ctx.strokeStyle = '#e4e4e7';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(capX, -capH / 2, capW, capH);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(capX + 2, -1.5, 3, 3);
      if (capW > 8) ctx.fillRect(capX + capW - 5, -1.5, 3, 3);
    });

  } else if (style === 'conduit') {
    // 多節工業螺栓絕緣套管
    const grad = ctx.createLinearGradient(0, -thickness / 2, 0, thickness / 2);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.3, '#475569');
    grad.addColorStop(0.5, '#cbd5e1');
    grad.addColorStop(0.7, '#334155');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, -thickness / 2, length, thickness);

    const ringStep = 24;
    const ringW = 4;
    const ringH = thickness + 3;
    for (let rx = 16; rx < length - 16; rx += ringStep) {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(rx, -ringH / 2, ringW, ringH);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.strokeRect(rx, -ringH / 2, ringW, ringH);
    }

    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, -thickness / 2, length, thickness);

    const capW = Math.min(12, length / 3);
    const capH = thickness + 5;
    [0, length - capW].forEach(capX => {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(capX, -capH / 2, capW, capH);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(capX, -capH / 2, capW, capH);
    });

  } else if (style === 'plasma') {
    // 高壓等離子能量導槽桿
    const grad = ctx.createLinearGradient(0, -thickness / 2, 0, thickness / 2);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(0.5, '#312e81');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, -thickness / 2, length, thickness);

    const coreH = Math.max(3, thickness * 0.32);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 8;
    ctx.fillRect(4, -coreH / 2, length - 8, coreH);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, -thickness / 2, length, thickness);

    const capW = Math.min(10, length / 3);
    const capH = thickness + 2;
    [0, length - capW].forEach(capX => {
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(capX, -capH / 2, capW, capH);
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(capX, -capH / 2, capW, capH);
    });

  } else if (style === 'double_rail') {
    // 雙聯平行細軌
    const railThick = Math.max(3, thickness * 0.28);
    const halfSpan = thickness / 2 - railThick / 2;

    ctx.fillStyle = '#475569';
    for (let tx = 8; tx < length - 8; tx += 20) {
      ctx.fillRect(tx, -thickness / 2, 3, thickness);
    }

    [-halfSpan, halfSpan].forEach(yPos => {
      const g = ctx.createLinearGradient(0, yPos - railThick / 2, 0, yPos + railThick / 2);
      g.addColorStop(0, '#f8fafc');
      g.addColorStop(1, '#475569');
      ctx.fillStyle = g;
      ctx.fillRect(0, yPos - railThick / 2, length, railThick);
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(0, yPos - railThick / 2, length, railThick);
    });

  } else if (style === 'serrated') {
    // 狼牙鋸齒放電排桿
    const grad = ctx.createLinearGradient(0, -thickness / 2, 0, thickness / 2);
    grad.addColorStop(0, '#334155');
    grad.addColorStop(0.5, '#e2e8f0');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, -thickness / 2, length, thickness);

    const toothStep = 18;
    const toothH = 6;
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    for (let tx = 6; tx < length - 6; tx += toothStep) {
      ctx.moveTo(tx, thickness / 2);
      ctx.lineTo(tx + toothStep / 2, thickness / 2 + toothH);
      ctx.lineTo(tx + toothStep, thickness / 2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, -thickness / 2, length, thickness);

  } else {
    // 經典立體鍍鉻鏡面鋼桿 ('chrome')
    const grad = ctx.createLinearGradient(0, -thickness / 2, 0, thickness / 2);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(0.25, '#64748b');
    grad.addColorStop(0.5, '#f1f5f9');
    grad.addColorStop(0.75, '#475569');
    grad.addColorStop(1, '#0f172a');

    ctx.fillStyle = grad;
    ctx.fillRect(0, -thickness / 2, length, thickness);

    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 5;
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, -thickness / 2, length, thickness);
    ctx.shadowBlur = 0;

    const capW = Math.min(12, length / 3);
    const capH = thickness + 4;
    [0, length - capW].forEach(capX => {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(capX, -capH / 2, capW, capH);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(capX, -capH / 2, capW, capH);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(capX + capW / 2 - 1.5, -1.5, 3, 3);
    });
  }

  ctx.restore();
}

// 繪製立體圓弧高壓金屬管 (開放式圓弧，不封閉)
function drawCurvedMetallicArc(ctx, cx, cy, radius, startAngle, endAngle, thickness = 12, color = '#00f0ff') {
  ctx.save();
  ctx.translate(cx, cy);

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = thickness;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, 0, radius, startAngle, endAngle);
  ctx.stroke();

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = thickness * 0.45;
  ctx.stroke();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1.5, thickness * 0.18);
  ctx.stroke();

  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.shadowBlur = 0;

  [startAngle, endAngle].forEach(a => {
    const gx = Math.cos(a) * radius;
    const gy = Math.sin(a) * radius;
    ctx.beginPath();
    ctx.arc(gx, gy, thickness / 2 + 2, 0, Math.PI * 2);
    ctx.fillStyle = '#b45309';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(gx, gy, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#fef08a';
    ctx.fill();
  });

  ctx.restore();
}


// =============================================================================
// 機關 1: S 型波浪時間差金屬套管陣 (Slalom Wave Bars) - 多重管線 + 寬幅 155px
// =============================================================================
class SlalomWaveBars {
  constructor(options) {
    this.type = 'slalom_wave';
    this.cy = options.cy;
    this.barCount = options.barCount || 3;
    this.spacing = options.spacing || 46;
    this.gapWidth = options.gapWidth || 155; // 寬幅 155px
    this.amplitude = options.amplitude || 45; // 溫和擺幅
    this.freq = options.freq || 1.1;
    this.phaseDiff = options.phaseDiff || 0.35; // 溫和波浪相位，平滑流暢
    this.timer = options.offset || 0;
    this.baseCenterX = options.baseCenterX || 200;
    this.tilt = options.tilt || 0;
    this.color = options.color || '#00f0ff';
    this.style = options.style || 'conduit';
    this.thickness = options.thickness || 12;
  }

  update(dt) {
    this.timer += dt;
  }

  getBarState(i) {
    const barY = this.cy - ((this.barCount - 1) * this.spacing) / 2 + i * this.spacing;
    const shift = Math.sin(this.timer * this.freq + i * this.phaseDiff) * this.amplitude;
    const gapCenterX = this.baseCenterX + shift;
    const gapLeft = Math.max(50, gapCenterX - this.gapWidth / 2);
    const gapRight = Math.min(350, gapCenterX + this.gapWidth / 2);
    const tiltOffset = this.tilt * ((i % 2 === 0) ? 1 : -1);
    return { barY, gapLeft, gapRight, tiltOffset };
  }

  checkCollision(px, py, pr) {
    for (let i = 0; i < this.barCount; i++) {
      const { barY, gapLeft, gapRight, tiltOffset } = this.getBarState(i);
      if (tiltOffset === 0) {
        if (Math.abs(py - barY) < (this.thickness / 2 + pr)) {
          if (px - pr < gapLeft && px + pr > 30) return true;
          if (px + pr > gapRight && px - pr < 370) return true;
        }
      } else {
        if (distToSegment(px, py, 30, barY - tiltOffset, gapLeft, barY + tiltOffset * 0.4) < (this.thickness / 2 + pr)) return true;
        if (distToSegment(px, py, gapRight, barY + tiltOffset * 0.4, 370, barY - tiltOffset) < (this.thickness / 2 + pr)) return true;
      }
    }
    return false;
  }

  draw(ctx) {
    ctx.save();
    for (let i = 0; i < this.barCount; i++) {
      const { barY, gapLeft, gapRight, tiltOffset } = this.getBarState(i);
      const bStyle = (i % 2 === 0) ? this.style : 'chrome';
      if (tiltOffset === 0) {
        drawMetallicBar(ctx, 30, barY, gapLeft, barY, this.thickness, this.color, bStyle);
        drawMetallicBar(ctx, gapRight, barY, 370, barY, this.thickness, this.color, bStyle);
      } else {
        drawMetallicBar(ctx, 30, barY - tiltOffset, gapLeft, barY + tiltOffset * 0.4, this.thickness, this.color, bStyle);
        drawMetallicBar(ctx, gapRight, barY + tiltOffset * 0.4, 370, barY - tiltOffset, this.thickness, this.color, bStyle);
      }
    }
    ctx.restore();
  }
}

// =============================================================================
// 機關 2: 對向滑移雙聯軌道門 (Reciprocating Slide Bars) - 平緩波浪滑移 + 寬幅 155px
// =============================================================================
class ReciprocatingSlideBars {
  constructor(options) {
    this.type = 'slide_bars';
    this.cy = options.cy;
    this.pairCount = options.pairCount || 2;
    this.spacing = options.spacing || 50;
    this.period = options.period || 3.0; // 3.0秒平緩週期
    this.timer = options.offset || 0;
    this.gapWidth = options.gapWidth || 155; // 寬幅 155px
    this.color = options.color || '#f59e0b';
    this.style = options.style || 'double_rail';
    this.thickness = 13;
  }

  update(dt) {
    this.timer += dt;
  }

  getBarPair(i) {
    const y = this.cy - ((this.pairCount - 1) * this.spacing) / 2 + i * this.spacing;
    // 溫和波浪相位差 (0.35 rad)，兩組鐵桿形成平順流動的導引通道，絕不瞬間反向逼死
    const phase = (this.timer / this.period) * Math.PI * 2 + i * 0.35;
    const progress = (Math.sin(phase) + 1) / 2;
    // 橫移範圍 155 ~ 245px (擺幅 90px)，通道常保在正中央舒適區間
    const gapCenterX = 155 + progress * 90;
    return {
      y,
      gapLeft: gapCenterX - this.gapWidth / 2,
      gapRight: gapCenterX + this.gapWidth / 2
    };
  }

  checkCollision(px, py, pr) {
    for (let i = 0; i < this.pairCount; i++) {
      const { y, gapLeft, gapRight } = this.getBarPair(i);
      if (Math.abs(py - y) < (this.thickness / 2 + pr)) {
        if (px - pr < gapLeft && px + pr > 30) return true;
        if (px + pr > gapRight && px - pr < 370) return true;
      }
    }
    return false;
  }

  draw(ctx) {
    ctx.save();
    for (let i = 0; i < this.pairCount; i++) {
      const { y, gapLeft, gapRight } = this.getBarPair(i);
      drawMetallicBar(ctx, 30, y, gapLeft, y, this.thickness, this.color, this.style);
      drawMetallicBar(ctx, gapRight, y, 370, y, this.thickness, this.color, this.style);
    }
    ctx.restore();
  }
}

// =============================================================================
// 機關 3: 橫縱等離子週期電閘 (Alternating Grid Rods) - 寬幅 160px，中央常通
// =============================================================================
class AlternatingGridBars {
  constructor(options) {
    this.type = 'alt_grid';
    this.cy = options.cy;
    this.period = options.period || 3.0;
    this.timer = options.offset || 0;
    this.width = options.width || 310;
    this.height = options.height || 120;

    // 寬裕 160px 開口，中央常保 100px 以上重疊無阻通道
    this.horizontalBars = [
      { yOffset: -36, gapX: 175 },
      { yOffset: 36, gapX: 225 }
    ];
    this.verticalBars = [
      { x: 100 },
      { x: 300 }
    ];

    this.state = 'horizontal';
    this.thickness = 13;
  }

  update(dt) {
    this.timer += dt;
    const t = this.timer % this.period;
    this.state = (t < this.period * 0.5) ? 'horizontal' : 'vertical';
  }

  checkCollision(px, py, pr) {
    const localY = py - this.cy;
    if (Math.abs(localY) > this.height / 2 + 10) return false;

    if (this.state === 'horizontal') {
      for (const h of this.horizontalBars) {
        const barY = this.cy + h.yOffset;
        if (Math.abs(py - barY) < (this.thickness / 2 + pr)) {
          if (Math.abs(px - h.gapX) > 80) return true; // 160px 寬幅
        }
      }
    } else {
      for (const v of this.verticalBars) {
        if (Math.abs(px - v.x) < (this.thickness / 2 + pr)) {
          if (Math.abs(py - this.cy) < this.height / 2) return true;
        }
      }
    }
    return false;
  }

  draw(ctx) {
    ctx.save();
    const isHActive = (this.state === 'horizontal');
    for (const h of this.horizontalBars) {
      const barY = this.cy + h.yOffset;
      ctx.globalAlpha = isHActive ? 1.0 : 0.18;
      drawMetallicBar(ctx, 35, barY, h.gapX - 80, barY, this.thickness, '#00f0ff', 'plasma');
      drawMetallicBar(ctx, h.gapX + 80, barY, 365, barY, this.thickness, '#00f0ff', 'plasma');
    }

    const isVActive = (this.state === 'vertical');
    for (const v of this.verticalBars) {
      ctx.globalAlpha = isVActive ? 1.0 : 0.18;
      drawMetallicBar(ctx, v.x, this.cy - this.height / 2, v.x, this.cy + this.height / 2, this.thickness, '#ef4444', 'conduit');
    }

    ctx.globalAlpha = 1.0;
    ctx.restore();
  }
}

// =============================================================================
// 機關 4: 多重X交叉旋轉金屬閘 (Multi-X Rotating Cross) - 偏側安裝，留出對側 200px
// =============================================================================
class MultiXRotatingCross {
  constructor(options) {
    this.type = 'multi_x';
    this.cy = options.cy;
    this.speed = options.speed || 0.95;
    this.count = options.count || 1;
    this.armLength = options.armLength || 52;
    this.thickness = 12;
    this.centers = options.centers || [110]; // 偏單側擺放，留出對側 200px 巨大通道
    this.angle = 0;
  }

  update(dt) {
    this.angle += this.speed * dt;
  }

  checkCollision(px, py, pr) {
    for (let c = 0; c < this.count; c++) {
      const cx = this.centers[c];
      const dir = (c % 2 === 0) ? 1 : -1;
      const curAngle = this.angle * dir;

      if (Math.hypot(px - cx, py - this.cy) < 14 + pr) return true;

      for (let i = 0; i < 4; i++) {
        const a = curAngle + (i * Math.PI) / 2;
        const x2 = cx + Math.cos(a) * this.armLength;
        const y2 = this.cy + Math.sin(a) * this.armLength;
        if (distToSegment(px, py, cx, this.cy, x2, y2) < (this.thickness / 2 + pr)) {
          return true;
        }
      }
    }
    return false;
  }

  draw(ctx) {
    for (let c = 0; c < this.count; c++) {
      const cx = this.centers[c];
      const dir = (c % 2 === 0) ? 1 : -1;
      const curAngle = this.angle * dir;

      ctx.save();
      for (let i = 0; i < 4; i++) {
        const a = curAngle + (i * Math.PI) / 2;
        const x2 = cx + Math.cos(a) * this.armLength;
        const y2 = this.cy + Math.sin(a) * this.armLength;
        const armStyle = (i % 2 === 0) ? 'conduit' : 'chrome';
        drawMetallicBar(ctx, cx, this.cy, x2, y2, this.thickness, c % 2 === 0 ? '#00f0ff' : '#f59e0b', armStyle);
      }

      ctx.translate(cx, this.cy);
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.restore();
    }
  }
}

// =============================================================================
// 機關 5: 巨大重錘套管鐘擺 (Heavy Metallic Pendulum) - 舒緩擺幅，兩側常保 115px
// =============================================================================
class MetallicPendulum {
  constructor(options) {
    this.type = 'pendulum';
    this.cx = options.cx || 200;
    this.anchorY = options.anchorY;
    this.length = options.length || 105;
    this.cy = options.cy || (this.anchorY + this.length * 0.65);
    this.maxAngle = options.maxAngle || 0.36; // 舒緩自然擺幅，兩側常保 115px 以上
    this.freq = options.freq || 1.25;
    this.timer = options.offset || 0;
    this.headRadius = 17;
    this.currentAngle = 0;
    this.thickness = 11;
  }

  update(dt) {
    this.timer += dt;
    this.currentAngle = Math.sin(this.timer * this.freq) * this.maxAngle;
  }

  checkCollision(px, py, pr) {
    const endX = this.cx + Math.sin(this.currentAngle) * this.length;
    const endY = this.anchorY + Math.cos(this.currentAngle) * this.length;

    if (distToSegment(px, py, this.cx, this.anchorY, endX, endY) < (this.thickness / 2 + pr)) return true;
    if (Math.hypot(px - endX, py - endY) < (this.headRadius + pr)) return true;

    return false;
  }

  draw(ctx) {
    const endX = this.cx + Math.sin(this.currentAngle) * this.length;
    const endY = this.anchorY + Math.cos(this.currentAngle) * this.length;

    ctx.save();
    ctx.beginPath();
    ctx.arc(this.cx, this.anchorY, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    drawMetallicBar(ctx, this.cx, this.anchorY, endX, endY, this.thickness, '#ef4444', 'conduit');

    ctx.beginPath();
    ctx.arc(endX, endY, this.headRadius, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(endX - 4, endY - 4, 2, endX, endY, this.headRadius);
    grad.addColorStop(0, '#f8fafc');
    grad.addColorStop(0.5, '#64748b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();
  }
}

// =============================================================================
// 機關 6: 旋轉風車旋翼 (Rotating Windmill) - 偏側安裝，留出對側 200px 巨大通道
// =============================================================================
class RotatingWindmill {
  constructor(options) {
    this.type = 'windmill';
    this.cx = options.cx || 110;
    this.cy = options.cy;
    this.arms = options.arms || 3;
    this.length = options.length || 62; // 62px 臂長，留出對側 200px 巨大通道
    this.speed = options.speed || 0.95;
    this.thickness = 11;
    this.angle = options.startAngle || 0;
    this.color = options.color || '#00f0ff';
  }

  update(dt) {
    this.angle += this.speed * dt;
  }

  checkCollision(px, py, pr) {
    if (Math.hypot(px - this.cx, py - this.cy) < 14 + pr) return true;

    const step = (Math.PI * 2) / this.arms;
    for (let i = 0; i < this.arms; i++) {
      const a = this.angle + i * step;
      const x2 = this.cx + Math.cos(a) * this.length;
      const y2 = this.cy + Math.sin(a) * this.length;
      if (distToSegment(px, py, this.cx, this.cy, x2, y2) < (this.thickness / 2 + pr)) {
        return true;
      }
    }
    return false;
  }

  draw(ctx) {
    ctx.save();
    const step = (Math.PI * 2) / this.arms;
    for (let i = 0; i < this.arms; i++) {
      const a = this.angle + i * step;
      const x2 = this.cx + Math.cos(a) * this.length;
      const y2 = this.cy + Math.sin(a) * this.length;
      drawMetallicBar(ctx, this.cx, this.cy, x2, y2, this.thickness, this.color, 'chrome');
    }

    ctx.translate(this.cx, this.cy);
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

// =============================================================================
// 機關 7: 多重金屬螺旋交錯導流鐵桿組 (Spiral Track Chicane Rails) - 徹底消除死角與封閉陷阱！
// =============================================================================
class SpiralTrackGate {
  constructor(options) {
    this.type = 'spiral';
    this.cy = options.cy;
    this.speed = options.speed || 1.1;
    this.timer = options.offset || 0;
    this.thickness = 12;
    this.color = options.color || '#00f0ff';
  }

  update(dt) {
    this.timer += dt;
  }

  getRails() {
    const sway = Math.sin(this.timer * this.speed) * 15;
    // 3組多重交錯金屬彎軌，中央常保 140px 直通通道，對側各有 240px 寬度
    return [
      { x1: 30, y1: this.cy - 38, x2: 130 + sway, y2: this.cy - 24, side: 'left' },
      { x1: 370, y1: this.cy, x2: 270 + sway, y2: this.cy, side: 'right' },
      { x1: 30, y1: this.cy + 38, x2: 130 + sway, y2: this.cy + 52, side: 'left' }
    ];
  }

  checkCollision(px, py, pr) {
    const rails = this.getRails();
    for (const r of rails) {
      if (distToSegment(px, py, r.x1, r.y1, r.x2, r.y2) < (this.thickness / 2 + pr)) {
        return true;
      }
    }
    return false;
  }

  draw(ctx) {
    const rails = this.getRails();
    ctx.save();
    for (const r of rails) {
      drawMetallicBar(ctx, r.x1, r.y1, r.x2, r.y2, this.thickness, this.color, 'conduit');
      ctx.beginPath();
      ctx.arc(r.x2, r.y2, 7, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();
  }
}

// =============================================================================
// 機關 8: 黑黃警戒雙聯液壓對衝活塞夾桿 (Hydraulic Piston Crusher Bars) - 4根重型鋼樑 + 中央 170px 通道！
// =============================================================================
class PistonCrusherBars {
  constructor(options) {
    this.type = 'piston_crusher';
    this.cy = options.cy;
    this.period = options.period || 2.8;
    this.timer = options.offset || 0;
    this.thickness = 14;
    this.headRadius = 15;
    this.barSpacing = 36; // 雙聯對衝活塞 (4根鋼樑)
  }

  update(dt) {
    this.timer += dt;
  }

  getPistonState() {
    const progress = (Math.sin((this.timer / this.period) * Math.PI * 2) + 1) / 2;
    // 極限閉合時左端頭在 115px，右端頭在 285px，中央保持 170px 巨大通道！
    const leftHeadX = 75 + progress * 40; // 75 ~ 115px
    const rightHeadX = 325 - progress * 40; // 325 ~ 285px
    return { leftHeadX, rightHeadX };
  }

  checkCollision(px, py, pr) {
    const { leftHeadX, rightHeadX } = this.getPistonState();
    const yOffsets = [-this.barSpacing / 2, this.barSpacing / 2];

    for (const yOff of yOffsets) {
      const by = this.cy + yOff;
      if (Math.abs(py - by) < (this.headRadius + pr)) {
        if (px - pr < leftHeadX && px + pr > 30) return true;
        if (Math.hypot(px - leftHeadX, py - by) < (this.headRadius + pr)) return true;

        if (px + pr > rightHeadX && px - pr < 370) return true;
        if (Math.hypot(px - rightHeadX, py - by) < (this.headRadius + pr)) return true;
      }
    }
    return false;
  }

  draw(ctx) {
    const { leftHeadX, rightHeadX } = this.getPistonState();
    const yOffsets = [-this.barSpacing / 2, this.barSpacing / 2];

    ctx.save();
    for (const yOff of yOffsets) {
      const by = this.cy + yOff;
      drawMetallicBar(ctx, 30, by, leftHeadX, by, this.thickness, '#ef4444', 'hazard');
      ctx.beginPath();
      ctx.arc(leftHeadX, by, this.headRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#18181b';
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      drawMetallicBar(ctx, rightHeadX, by, 370, by, this.thickness, '#ef4444', 'hazard');
      ctx.beginPath();
      ctx.arc(rightHeadX, by, this.headRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#18181b';
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    [30, 370].forEach(bx => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(bx - 8, this.cy - 30, 16, 60);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx - 8, this.cy - 30, 16, 60);
    });

    ctx.restore();
  }
}

// =============================================================================
// 機關 9: 階梯瀑布交錯光柵 (Waterfall Conveyor Cascade Bars) - 寬幅 155px
// =============================================================================
class WaterfallConveyorBars {
  constructor(options) {
    this.type = 'waterfall_cascade';
    this.cy = options.cy;
    this.barCount = options.barCount || 3;
    this.spacing = options.spacing || 46;
    this.gapWidth = options.gapWidth || 155; // 寬幅 155px
    this.speed = options.speed || 1.1;
    this.timer = options.offset || 0;
    this.thickness = 12;
  }

  update(dt) {
    this.timer += dt;
  }

  getBar(i) {
    const barY = this.cy - ((this.barCount - 1) * this.spacing) / 2 + i * this.spacing;
    const shift = Math.sin(this.timer * this.speed + i * 0.45) * 45;
    const gapCenterX = 200 + shift;
    return {
      barY,
      gapLeft: gapCenterX - this.gapWidth / 2,
      gapRight: gapCenterX + this.gapWidth / 2
    };
  }

  checkCollision(px, py, pr) {
    for (let i = 0; i < this.barCount; i++) {
      const { barY, gapLeft, gapRight } = this.getBar(i);
      if (Math.abs(py - barY) < (this.thickness / 2 + pr)) {
        if (px - pr < gapLeft && px + pr > 30) return true;
        if (px + pr > gapRight && px - pr < 370) return true;
      }
    }
    return false;
  }

  draw(ctx) {
    ctx.save();
    for (let i = 0; i < this.barCount; i++) {
      const { barY, gapLeft, gapRight } = this.getBar(i);
      drawMetallicBar(ctx, 30, barY, gapLeft, barY, this.thickness, '#38bdf8', 'plasma');
      drawMetallicBar(ctx, gapRight, barY, 370, barY, this.thickness, '#38bdf8', 'plasma');
    }
    ctx.restore();
  }
}

// =============================================================================
// 機關 10: 鋸齒折線急轉走廊 (Zigzag Chicane Slalom Bars) - 3組鋼桿 + 230px 寬裕通道
// =============================================================================
class ZigzagChicaneBars {
  constructor(options) {
    this.type = 'zigzag_chicane';
    this.cy = options.cy;
    this.spacing = options.spacing || 42;
    this.timer = options.offset || 0;
    this.thickness = 13;
  }

  update(dt) {
    this.timer += dt;
  }

  checkCollision(px, py, pr) {
    const y1 = this.cy - this.spacing;
    const y2 = this.cy;
    const y3 = this.cy + this.spacing;

    const reachLeft = 140; // 左桿只伸到 140px，右側留有 230px 巨大通道！
    const reachRight = 260; // 右桿只伸到 260px，左側留有 230px 巨大通道！

    if (Math.abs(py - y1) < (this.thickness / 2 + pr) && px - pr < reachLeft && px + pr > 30) return true;
    if (Math.abs(py - y2) < (this.thickness / 2 + pr) && px + pr > reachRight && px - pr < 370) return true;
    if (Math.abs(py - y3) < (this.thickness / 2 + pr) && px - pr < reachLeft && px + pr > 30) return true;

    return false;
  }

  draw(ctx) {
    const y1 = this.cy - this.spacing;
    const y2 = this.cy;
    const y3 = this.cy + this.spacing;
    const reachLeft = 140;
    const reachRight = 260;

    ctx.save();
    drawMetallicBar(ctx, 30, y1, reachLeft, y1, this.thickness, '#00f0ff', 'hazard');
    drawMetallicBar(ctx, reachRight, y2, 370, y2, this.thickness, '#f59e0b', 'hazard');
    drawMetallicBar(ctx, 30, y3, reachLeft, y3, this.thickness, '#00f0ff', 'hazard');

    [ [reachLeft, y1], [reachRight, y2], [reachLeft, y3] ].forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(rx, ry, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
    });
    ctx.restore();
  }
}

// =============================================================================
// 機關 11: 雙星電磁公轉衛星 (Orbital Dual Satellite Spikes) - 偏側公轉，留出對側 200px
// =============================================================================
class OrbitalSatelliteSpikes {
  constructor(options) {
    this.type = 'orbital_satellites';
    this.cx = options.cx || 110; // 偏側擺放，留出對側 200px 暢通走廊
    this.cy = options.cy;
    this.orbitRadius = options.orbitRadius || 46;
    this.sphereRadius = 13;
    this.speed = options.speed || 1.05;
    this.angle = options.startAngle || 0;
    this.thickness = 10;
  }

  update(dt) {
    this.angle += this.speed * dt;
  }

  checkCollision(px, py, pr) {
    const s1x = this.cx + Math.cos(this.angle) * this.orbitRadius;
    const s1y = this.cy + Math.sin(this.angle) * this.orbitRadius;
    const s2x = this.cx - Math.cos(this.angle) * this.orbitRadius;
    const s2y = this.cy - Math.sin(this.angle) * this.orbitRadius;

    if (Math.hypot(px - s1x, py - s1y) < (this.sphereRadius + pr)) return true;
    if (Math.hypot(px - s2x, py - s2y) < (this.sphereRadius + pr)) return true;
    if (distToSegment(px, py, s1x, s1y, s2x, s2y) < (this.thickness / 2 + pr)) return true;

    return false;
  }

  draw(ctx) {
    const s1x = this.cx + Math.cos(this.angle) * this.orbitRadius;
    const s1y = this.cy + Math.sin(this.angle) * this.orbitRadius;
    const s2x = this.cx - Math.cos(this.angle) * this.orbitRadius;
    const s2y = this.cy - Math.sin(this.angle) * this.orbitRadius;

    ctx.save();
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.orbitRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    drawMetallicBar(ctx, s1x, s1y, s2x, s2y, this.thickness, '#a855f7', 'double_rail');

    [ [s1x, s1y], [s2x, s2y] ].forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.arc(sx, sy, this.sphereRadius, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(sx - 4, sy - 4, 2, sx, sy, this.sphereRadius);
      grad.addColorStop(0, '#f3e8ff');
      grad.addColorStop(0.5, '#9333ea');
      grad.addColorStop(1, '#3b0764');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.beginPath();
    ctx.arc(this.cx, this.cy, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }
}

// =============================================================================
// 機關 12: 呼吸金屬排柱電門 (Breathing Colonnade Gate) - 4根重型直柱 + 180px 巨大走廊！
// =============================================================================
class BreathingIrisGate {
  constructor(options) {
    this.type = 'breathing_iris';
    this.cy = options.cy;
    this.freq = options.freq || 1.1;
    this.timer = options.offset || 0;
    this.height = options.height || 110;
    this.thickness = 13;
  }

  update(dt) {
    this.timer += dt;
  }

  getBars() {
    const pulse = (Math.sin(this.timer * this.freq) + 1) / 2;
    // 左雙柱移動範圍 70 ~ 98px，右雙柱移動範圍 330 ~ 302px
    // 中央常保 302 - 98 = 204px 巨大通暢走廊！
    const leftX1 = 70 + pulse * 28;
    const leftX2 = 96 + pulse * 28;
    const rightX1 = 330 - pulse * 28;
    const rightX2 = 304 - pulse * 28;
    return [leftX1, leftX2, rightX2, rightX1];
  }

  checkCollision(px, py, pr) {
    if (Math.abs(py - this.cy) > this.height / 2 + pr) return false;
    const bars = this.getBars();
    for (const bx of bars) {
      if (Math.abs(px - bx) < (this.thickness / 2 + pr)) {
        return true;
      }
    }
    return false;
  }

  draw(ctx) {
    const bars = this.getBars();
    const topY = this.cy - this.height / 2;
    const bottomY = this.cy + this.height / 2;

    ctx.save();
    for (let i = 0; i < bars.length; i++) {
      const bx = bars[i];
      const color = (i < 2) ? '#00f0ff' : '#f59e0b';
      drawMetallicBar(ctx, bx, topY, bx, bottomY, this.thickness, color, 'conduit');
    }
    // 頂部與底部固定導軌橫樑
    drawMetallicBar(ctx, 30, topY, bars[1], topY, 8, '#64748b', 'chrome');
    drawMetallicBar(ctx, bars[2], topY, 370, topY, 8, '#64748b', 'chrome');
    drawMetallicBar(ctx, 30, bottomY, bars[1], bottomY, 8, '#64748b', 'chrome');
    drawMetallicBar(ctx, bars[2], bottomY, 370, bottomY, 8, '#64748b', 'chrome');
    ctx.restore();
  }
}

// =============================================================================
// 機關 13: 高壓剪刀諧振閘門 (Harmonic Scissor Shear Bars) - 兩側伸縮，中央常保 160px
// =============================================================================
class ScissorShearBars {
  constructor(options) {
    this.type = 'scissor_shears';
    this.cy = options.cy;
    this.armLength = options.armLength || 85;
    this.freq = options.freq || 1.2;
    this.timer = options.offset || 0;
    this.thickness = 13;
  }

  update(dt) {
    this.timer += dt;
  }

  getArms() {
    const sweep = Math.sin(this.timer * this.freq) * 0.38;
    // 兩側牆壁各伸出雙剪刀臂，左臂伸至最大 120px，右臂伸至最小 280px，中央常保 160px！
    const leftEndX = 35 + Math.cos(sweep) * this.armLength;
    const leftEndY = this.cy + Math.sin(sweep) * this.armLength;
    const rightEndX = 365 - Math.cos(sweep) * this.armLength;
    const rightEndY = this.cy + Math.sin(sweep) * this.armLength;
    return { leftEndX, leftEndY, rightEndX, rightEndY };
  }

  checkCollision(px, py, pr) {
    const { leftEndX, leftEndY, rightEndX, rightEndY } = this.getArms();
    if (distToSegment(px, py, 35, this.cy, leftEndX, leftEndY) < (this.thickness / 2 + pr)) return true;
    if (distToSegment(px, py, 365, this.cy, rightEndX, rightEndY) < (this.thickness / 2 + pr)) return true;
    return false;
  }

  draw(ctx) {
    const { leftEndX, leftEndY, rightEndX, rightEndY } = this.getArms();
    ctx.save();
    drawMetallicBar(ctx, 35, this.cy, leftEndX, leftEndY, this.thickness, '#ef4444', 'serrated');
    drawMetallicBar(ctx, 365, this.cy, rightEndX, rightEndY, this.thickness, '#ef4444', 'serrated');

    [ [35, this.cy], [365, this.cy] ].forEach(([bx, by]) => {
      ctx.beginPath();
      ctx.arc(bx, by, 11, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    ctx.restore();
  }
}

// =============================================================================
// 機關 14: 雙塔對向掃描雷達桿 (Twin Turret Radar Scanners) - 中央常保 180px 淨空
// =============================================================================
class TwinTurretScanners {
  constructor(options) {
    this.type = 'twin_turrets';
    this.cy = options.cy;
    this.armLength = options.armLength || 75; // 75px 臂長，中央保留 180px
    this.freq = options.freq || 1.25;
    this.timer = options.offset || 0;
    this.thickness = 12;
  }

  update(dt) {
    this.timer += dt;
  }

  getTurretArms() {
    const sweep = Math.sin(this.timer * this.freq) * 0.45;
    const leftEndX = 35 + Math.cos(sweep) * this.armLength;
    const leftEndY = this.cy + Math.sin(sweep) * this.armLength;

    const rightSweep = Math.PI - sweep;
    const rightEndX = 365 + Math.cos(rightSweep) * this.armLength;
    const rightEndY = this.cy + Math.sin(rightSweep) * this.armLength;

    return { leftEndX, leftEndY, rightEndX, rightEndY };
  }

  checkCollision(px, py, pr) {
    const { leftEndX, leftEndY, rightEndX, rightEndY } = this.getTurretArms();
    if (distToSegment(px, py, 35, this.cy, leftEndX, leftEndY) < (this.thickness / 2 + pr)) return true;
    if (distToSegment(px, py, 365, this.cy, rightEndX, rightEndY) < (this.thickness / 2 + pr)) return true;
    return false;
  }

  draw(ctx) {
    const { leftEndX, leftEndY, rightEndX, rightEndY } = this.getTurretArms();

    ctx.save();
    drawMetallicBar(ctx, 35, this.cy, leftEndX, leftEndY, this.thickness, '#00f0ff', 'plasma');
    ctx.beginPath();
    ctx.arc(35, this.cy, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    drawMetallicBar(ctx, 365, this.cy, rightEndX, rightEndY, this.thickness, '#00f0ff', 'plasma');
    ctx.beginPath();
    ctx.arc(365, this.cy, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }
}

// =============================================================================
// 機關 15: 雙聯彈跳反射浮動橫桿 (Bouncing Bumper Floating Bars) - 雙聯橫桿 + 兩側 155px
// =============================================================================
class BouncingBumperBar {
  constructor(options) {
    this.type = 'bouncing_bumper';
    this.cy = options.cy;
    this.barWidth = options.barWidth || 84;
    this.speed = options.speed || 1.1;
    this.timer = options.offset || 0;
    this.thickness = 13;
    this.spacing = 38; // 雙聯浮動鋼樑
  }

  update(dt) {
    this.timer += dt;
  }

  getBarX(i = 0) {
    const progress = (Math.sin(this.timer * this.speed + i * 0.4) + 1) / 2;
    const centerX = 155 + progress * 90;
    return {
      leftX: centerX - this.barWidth / 2,
      rightX: centerX + this.barWidth / 2
    };
  }

  checkCollision(px, py, pr) {
    const yOffsets = [-this.spacing / 2, this.spacing / 2];
    for (let i = 0; i < 2; i++) {
      const by = this.cy + yOffsets[i];
      if (Math.abs(py - by) < (this.thickness / 2 + pr)) {
        const { leftX, rightX } = this.getBarX(i);
        if (px + pr > leftX && px - pr < rightX) return true;
      }
    }
    return false;
  }

  draw(ctx) {
    const yOffsets = [-this.spacing / 2, this.spacing / 2];
    ctx.save();
    for (let i = 0; i < 2; i++) {
      const by = this.cy + yOffsets[i];
      const { leftX, rightX } = this.getBarX(i);
      drawMetallicBar(ctx, leftX, by, rightX, by, this.thickness, '#f59e0b', 'hazard');
      [leftX, rightX].forEach(bx => {
        ctx.beginPath();
        ctx.arc(bx, by, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
      });
    }
    ctx.restore();
  }
}

// =============================================================================
// 機關 16: V型斜向導流漏斗門 (Angled Funnel Gate) - 喉部大開 155px
// =============================================================================
class AngledFunnelGate {
  constructor(options) {
    this.type = 'angled_funnel';
    this.cy = options.cy;
    this.inverted = options.inverted || false;
    this.gapWidth = options.gapWidth || 155; // 寬幅 155px
    this.throatY = options.throatY || (this.inverted ? this.cy - 30 : this.cy + 30);
    this.baseY = options.baseY || (this.inverted ? this.cy + 30 : this.cy - 30);
    this.timer = options.offset || 0;
    this.freq = options.freq || 1.1;
    this.sway = options.sway || 12;
    this.color = options.color || '#f59e0b';
    this.style = options.style || 'conduit';
    this.thickness = 12;
  }

  update(dt) {
    this.timer += dt;
  }

  getFunnelBars() {
    const shift = Math.sin(this.timer * this.freq) * this.sway;
    const centerX = 200 + shift;
    const leftThroatX = centerX - this.gapWidth / 2;
    const rightThroatX = centerX + this.gapWidth / 2;

    return {
      leftBar: { x1: 30, y1: this.baseY, x2: leftThroatX, y2: this.throatY },
      rightBar: { x1: 370, y1: this.baseY, x2: rightThroatX, y2: this.throatY }
    };
  }

  checkCollision(px, py, pr) {
    const { leftBar, rightBar } = this.getFunnelBars();
    if (distToSegment(px, py, leftBar.x1, leftBar.y1, leftBar.x2, leftBar.y2) < (this.thickness / 2 + pr)) return true;
    if (distToSegment(px, py, rightBar.x1, rightBar.y1, rightBar.x2, rightBar.y2) < (this.thickness / 2 + pr)) return true;
    return false;
  }

  draw(ctx) {
    const { leftBar, rightBar } = this.getFunnelBars();
    ctx.save();
    drawMetallicBar(ctx, leftBar.x1, leftBar.y1, leftBar.x2, leftBar.y2, this.thickness, this.color, this.style);
    drawMetallicBar(ctx, rightBar.x1, rightBar.y1, rightBar.x2, rightBar.y2, this.thickness, this.color, this.style);

    [ [leftBar.x2, leftBar.y2], [rightBar.x2, rightBar.y2] ].forEach(([tx, ty]) => {
      ctx.beginPath();
      ctx.arc(tx, ty, 7, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    });
    ctx.restore();
  }
}

// =============================================================================
// 機關 17: 單側圓弧導流彎軌 (CurvedArcGate) - 靠單側牆壁，留出 270px 暢通大走廊！
// =============================================================================
class CurvedArcGate {
  constructor(options) {
    this.type = 'curved_arc';
    this.side = options.side || 'left';
    this.cy = options.cy;
    this.radius = options.radius || 70; // 70px 半徑，靠側留出 270px 巨大通道！
    this.thickness = 12;
    this.color = options.color || '#00f0ff';
  }

  update(dt) {}

  checkCollision(px, py, pr) {
    if (this.side === 'left') {
      const cx = 30;
      const dx = px - cx;
      const dy = py - this.cy;
      const dist = Math.hypot(dx, dy);
      if (Math.abs(dist - this.radius) < (this.thickness / 2 + pr)) {
        if (dx > 0 && Math.abs(dy) <= this.radius) return true;
      }
    } else {
      const cx = 370;
      const dx = px - cx;
      const dy = py - this.cy;
      const dist = Math.hypot(dx, dy);
      if (Math.abs(dist - this.radius) < (this.thickness / 2 + pr)) {
        if (dx < 0 && Math.abs(dy) <= this.radius) return true;
      }
    }
    return false;
  }

  draw(ctx) {
    ctx.save();
    if (this.side === 'left') {
      drawCurvedMetallicArc(ctx, 30, this.cy, this.radius, -Math.PI / 2, Math.PI / 2, this.thickness, this.color);
    } else {
      drawCurvedMetallicArc(ctx, 370, this.cy, this.radius, Math.PI / 2, Math.PI * 1.5, this.thickness, this.color);
    }
    ctx.restore();
  }
}

// =============================================================================
// 機關 18: 斜向滑移重型斷頭鍘 (DiagonalGuillotineSlicer) - 雙重金屬切刀 + 寬幅 155px
// =============================================================================
class DiagonalGuillotineSlicer {
  constructor(options) {
    this.type = 'guillotine_slicer';
    this.cy = options.cy;
    this.slopeY = options.slopeY || 28;
    this.period = options.period || 2.8;
    this.timer = options.offset || 0;
    this.gapWidth = options.gapWidth || 155; // 寬幅 155px
    this.thickness = 14;
    this.color = options.color || '#fbbf24';
  }

  update(dt) {
    this.timer += dt;
  }

  getSlices() {
    const progress = (Math.sin((this.timer / this.period) * Math.PI * 2) + 1) / 2;
    const centerSlideX = 145 + progress * 110;
    const gapLeftX = centerSlideX - this.gapWidth / 2;
    const gapRightX = centerSlideX + this.gapWidth / 2;

    const leftBar = {
      x1: 30, y1: this.cy - this.slopeY,
      x2: gapLeftX, y2: this.cy - this.slopeY + (gapLeftX - 30) * (this.slopeY * 2 / 340)
    };
    const rightBar = {
      x1: gapRightX, y1: this.cy - this.slopeY + (gapRightX - 30) * (this.slopeY * 2 / 340),
      x2: 370, y2: this.cy + this.slopeY
    };

    return { leftBar, rightBar };
  }

  checkCollision(px, py, pr) {
    const { leftBar, rightBar } = this.getSlices();
    if (distToSegment(px, py, leftBar.x1, leftBar.y1, leftBar.x2, leftBar.y2) < (this.thickness / 2 + pr)) return true;
    if (distToSegment(px, py, rightBar.x1, rightBar.y1, rightBar.x2, rightBar.y2) < (this.thickness / 2 + pr)) return true;
    return false;
  }

  draw(ctx) {
    const { leftBar, rightBar } = this.getSlices();
    ctx.save();
    drawMetallicBar(ctx, leftBar.x1, leftBar.y1, leftBar.x2, leftBar.y2, this.thickness, this.color, 'hazard');
    drawMetallicBar(ctx, rightBar.x1, rightBar.y1, rightBar.x2, rightBar.y2, this.thickness, this.color, 'hazard');
    ctx.restore();
  }
}

// =============================================================================
// 機關 19: 上下交錯狼牙梳齒排閘 (SerratedCombJaws) - 230px 寬裕 S 型通道
// =============================================================================
class SerratedCombJaws {
  constructor(options) {
    this.type = 'serrated_comb';
    this.cy = options.cy;
    this.thickness = 13;
    this.timer = options.offset || 0;
    this.freq = options.freq || 1.1;

    this.prongs = [
      { side: 'left', yOff: -52, baseLen: 110 },
      { side: 'right', yOff: 0, baseLen: 110 },
      { side: 'left', yOff: 52, baseLen: 110 }
    ];
  }

  update(dt) {
    this.timer += dt;
  }

  getProngList() {
    const pulse = Math.sin(this.timer * this.freq) * 10;
    return this.prongs.map(p => {
      const py = this.cy + p.yOff;
      const len = p.baseLen + (p.side === 'left' ? pulse : -pulse);
      if (p.side === 'left') {
        const reachX = Math.min(140, 30 + len);
        return { x1: 30, y1: py, x2: reachX, y2: py, color: '#00f0ff' };
      } else {
        const startX = Math.max(260, 370 - len);
        return { x1: startX, y1: py, x2: 370, y2: py, color: '#f59e0b' };
      }
    });
  }

  checkCollision(px, py, pr) {
    const list = this.getProngList();
    for (const seg of list) {
      if (distToSegment(px, py, seg.x1, seg.y1, seg.x2, seg.y2) < (this.thickness / 2 + pr)) {
        return true;
      }
    }
    return false;
  }

  draw(ctx) {
    const list = this.getProngList();
    ctx.save();
    for (const seg of list) {
      drawMetallicBar(ctx, seg.x1, seg.y1, seg.x2, seg.y2, this.thickness, seg.color, 'serrated');
    }
    ctx.restore();
  }
}

// =============================================================================
// 機關 20: 菱形開放穿梭門 (RhombusConstrictionGate) - 中央 155px 直通開放通道
// =============================================================================
class RhombusConstrictionGate {
  constructor(options) {
    this.type = 'rhombus_gate';
    this.cy = options.cy;
    this.gapWidth = options.gapWidth || 155; // 中央常保 155px 寬裕通道
    this.depth = 42;
    this.thickness = 12;
    this.color = options.color || '#a855f7';
  }

  update(dt) {}

  getVanes() {
    const leftTipX = 200 - this.gapWidth / 2;
    const rightTipX = 200 + this.gapWidth / 2;

    return {
      leftTop: { x1: 30, y1: this.cy - this.depth, x2: leftTipX, y2: this.cy },
      leftBottom: { x1: leftTipX, y1: this.cy, x2: 30, y2: this.cy + this.depth },
      rightTop: { x1: 370, y1: this.cy - this.depth, x2: rightTipX, y2: this.cy },
      rightBottom: { x1: rightTipX, y1: this.cy, x2: 370, y2: this.cy + this.depth }
    };
  }

  checkCollision(px, py, pr) {
    const v = this.getVanes();
    if (distToSegment(px, py, v.leftTop.x1, v.leftTop.y1, v.leftTop.x2, v.leftTop.y2) < (this.thickness / 2 + pr)) return true;
    if (distToSegment(px, py, v.leftBottom.x1, v.leftBottom.y1, v.leftBottom.x2, v.leftBottom.y2) < (this.thickness / 2 + pr)) return true;
    if (distToSegment(px, py, v.rightTop.x1, v.rightTop.y1, v.rightTop.x2, v.rightTop.y2) < (this.thickness / 2 + pr)) return true;
    if (distToSegment(px, py, v.rightBottom.x1, v.rightBottom.y1, v.rightBottom.x2, v.rightBottom.y2) < (this.thickness / 2 + pr)) return true;
    return false;
  }

  draw(ctx) {
    const v = this.getVanes();
    ctx.save();
    drawMetallicBar(ctx, v.leftTop.x1, v.leftTop.y1, v.leftTop.x2, v.leftTop.y2, this.thickness, this.color, 'double_rail');
    drawMetallicBar(ctx, v.leftBottom.x1, v.leftBottom.y1, v.leftBottom.x2, v.leftBottom.y2, this.thickness, this.color, 'double_rail');
    drawMetallicBar(ctx, v.rightTop.x1, v.rightTop.y1, v.rightTop.x2, v.rightTop.y2, this.thickness, this.color, 'double_rail');
    drawMetallicBar(ctx, v.rightBottom.x1, v.rightBottom.y1, v.rightBottom.x2, v.rightBottom.y2, this.thickness, this.color, 'double_rail');
    ctx.restore();
  }
}

// =============================================================================
// 機關 21: 懸臂交錯拍擊閘 (CantileverFlapGate) - 臂長 90px，對側留出 245px 通道
// =============================================================================
class CantileverFlapGate {
  constructor(options) {
    this.type = 'cantilever_flap';
    this.cy = options.cy;
    this.side = options.side || 'left';
    this.armLength = options.armLength || 90; // 90px 臂長，對側留出 245px 巨大通道
    this.freq = options.freq || 1.15;
    this.timer = options.offset || 0;
    this.thickness = 13;
    this.color = options.color || '#ef4444';
  }

  update(dt) {
    this.timer += dt;
  }

  getArm() {
    const sweep = Math.sin(this.timer * this.freq) * 0.38;
    if (this.side === 'left') {
      const endX = 35 + Math.cos(sweep) * this.armLength;
      const endY = this.cy + Math.sin(sweep) * this.armLength;
      return { x1: 35, y1: this.cy, x2: endX, y2: endY };
    } else {
      const endX = 365 - Math.cos(sweep) * this.armLength;
      const endY = this.cy + Math.sin(sweep) * this.armLength;
      return { x1: 365, y1: this.cy, x2: endX, y2: endY };
    }
  }

  checkCollision(px, py, pr) {
    const arm = this.getArm();
    if (distToSegment(px, py, arm.x1, arm.y1, arm.x2, arm.y2) < (this.thickness / 2 + pr)) return true;
    return false;
  }

  draw(ctx) {
    const arm = this.getArm();
    ctx.save();
    drawMetallicBar(ctx, arm.x1, arm.y1, arm.x2, arm.y2, this.thickness, this.color, 'hazard');

    ctx.beginPath();
    ctx.arc(arm.x1, arm.y1, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#18181b';
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(arm.x2, arm.y2, 7, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }
}

// =============================================================================
// 機關 22: 雙軌並行蛇行狹道 (DoubleRailCorridor) - 寬幅 155px
// =============================================================================
class DoubleRailCorridor {
  constructor(options) {
    this.type = 'double_rail_corridor';
    this.cy = options.cy;
    this.height = options.height || 110;
    this.gapWidth = options.gapWidth || 155; // 寬幅 155px
    this.amplitude = options.amplitude || 40;
    this.freq = options.freq || 1.1;
    this.timer = options.offset || 0;
    this.thickness = 11;
  }

  update(dt) {
    this.timer += dt;
  }

  getRailState() {
    const shift = Math.sin(this.timer * this.freq) * this.amplitude;
    const centerX = 200 + shift;
    const leftX = centerX - this.gapWidth / 2;
    const rightX = centerX + this.gapWidth / 2;
    const topY = this.cy - this.height / 2;
    const bottomY = this.cy + this.height / 2;

    return { leftX, rightX, topY, bottomY };
  }

  checkCollision(px, py, pr) {
    const { leftX, rightX, topY, bottomY } = this.getRailState();
    if (py < topY || py > bottomY) return false;

    if (distToSegment(px, py, leftX, topY, leftX, bottomY) < (this.thickness / 2 + pr)) return true;
    if (distToSegment(px, py, rightX, topY, rightX, bottomY) < (this.thickness / 2 + pr)) return true;

    return false;
  }

  draw(ctx) {
    const { leftX, rightX, topY, bottomY } = this.getRailState();
    ctx.save();
    drawMetallicBar(ctx, leftX, topY, leftX, bottomY, this.thickness, '#00f0ff', 'double_rail');
    drawMetallicBar(ctx, rightX, topY, rightX, bottomY, this.thickness, '#00f0ff', 'double_rail');
    ctx.restore();
  }
}

// =============================================================================
// ★ 經典急急棒巨型長鋼樑: ElongatedSlalomRod (跨越中線之加長交錯鐵桿)
// =============================================================================
class ElongatedSlalomRod {
  constructor(options) {
    this.type = 'slalom_rod';
    this.side = options.side || 'left'; // 'left' 或 'right'
    this.cy = options.cy;
    this.tipX = options.tipX; // 依據黃金路徑計算出的尖端X坐標 (深幅伸展跨越中線)
    this.thickness = options.thickness || 14;
    this.color = options.color || '#00f0ff';
    this.style = options.style || 'hazard';
    this.swayAmp = options.swayAmp || 0;
    this.swayFreq = options.swayFreq || 1.1;
    this.timer = options.offset || 0;
  }

  update(dt) {
    this.timer += dt;
  }

  getCurrentTipX() {
    const sway = (this.swayAmp > 0) ? Math.sin(this.timer * this.swayFreq) * this.swayAmp : 0;
    return this.tipX + sway;
  }

  checkCollision(px, py, pr) {
    if (Math.abs(py - this.cy) > (this.thickness / 2 + pr)) return false;
    const curTipX = this.getCurrentTipX();
    if (this.side === 'left') {
      if (px - pr < curTipX && px + pr > 30) return true;
      if (Math.hypot(px - curTipX, py - this.cy) < (this.thickness / 2 + pr)) return true;
    } else {
      if (px + pr > curTipX && px - pr < 370) return true;
      if (Math.hypot(px - curTipX, py - this.cy) < (this.thickness / 2 + pr)) return true;
    }
    return false;
  }

  draw(ctx) {
    const curTipX = this.getCurrentTipX();
    ctx.save();
    if (this.side === 'left') {
      drawMetallicBar(ctx, 30, this.cy, curTipX, this.cy, this.thickness, this.color, this.style);
      // 工業重型牆面基座 (雙鉚釘)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(20, this.cy - 12, 14, 24);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(20, this.cy - 12, 14, 24);
      // 尖端高壓金屬球與放電核心
      ctx.beginPath();
      ctx.arc(curTipX, this.cy, this.thickness / 2 + 2, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(curTipX, this.cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    } else {
      drawMetallicBar(ctx, curTipX, this.cy, 370, this.cy, this.thickness, this.color, this.style);
      // 工業重型牆面基座
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(366, this.cy - 12, 14, 24);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(366, this.cy - 12, 14, 24);
      // 尖端高壓金屬球與放電核心
      ctx.beginPath();
      ctx.arc(curTipX, this.cy, this.thickness / 2 + 2, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(curTipX, this.cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
    ctx.restore();
  }
}

// =============================================================================
// ★ 巨大動態核心機關群 (100% 人類反應合理性與寬裕通道升級版)
// =============================================================================

// 1. 巨大三叉旋轉高壓鋼樑 (GiantTriSpokeRotor) - 臂長 75~80px，留出 90~145px 寬裕逃生通道，轉速 0.5rad/s
class GiantTriSpokeRotor {
  constructor(options) {
    this.type = 'tri_spoke_rotor';
    this.cx = options.cx || 200;
    this.cy = options.cy;
    this.arms = 3;
    // 居中時臂長 80px (兩側各有 90px 寬裕通道)；偏側時臂長 75px (對側有 145px 寬裕通衢大道)
    this.length = options.length || (Math.abs(this.cx - 200) < 20 ? 80 : 75);
    this.speed = options.speed || (options.speed !== undefined ? options.speed : 0.52); // 溫和轉速 0.52 rad/s (一圈約 12 秒，開口持續 4 秒)
    this.thickness = 12;
    this.angle = options.startAngle || 0;
    this.color = options.color || (this.speed > 0 ? '#00f0ff' : '#f59e0b');
    this.style = options.style || (this.speed > 0 ? 'hazard' : 'chrome');
  }

  update(dt) {
    this.angle += this.speed * dt;
  }

  checkCollision(px, py, pr) {
    // 中央機芯基座
    if (Math.hypot(px - this.cx, py - this.cy) < 14 + pr) return true;
    const step = (Math.PI * 2) / this.arms;
    for (let i = 0; i < this.arms; i++) {
      const a = this.angle + i * step;
      const x2 = this.cx + Math.cos(a) * this.length;
      const y2 = this.cy + Math.sin(a) * this.length;
      if (distToSegment(px, py, this.cx, this.cy, x2, y2) < (this.thickness / 2 + pr)) return true;
      if (Math.hypot(px - x2, py - y2) < 7 + pr) return true;
    }
    return false;
  }

  draw(ctx) {
    ctx.save();
    const step = (Math.PI * 2) / this.arms;
    for (let i = 0; i < this.arms; i++) {
      const a = this.angle + i * step;
      const x2 = this.cx + Math.cos(a) * this.length;
      const y2 = this.cy + Math.sin(a) * this.length;
      drawMetallicBar(ctx, this.cx, this.cy, x2, y2, this.thickness, this.color, this.style);

      // 尖端高壓放電球
      ctx.save();
      ctx.translate(x2, y2);
      ctx.beginPath();
      ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();
    }

    // 中央渦輪機芯
    ctx.translate(this.cx, this.cy);
    ctx.rotate(this.angle);

    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let b = 0; b < 6; b++) {
      const bAng = b * (Math.PI / 3);
      const bx = Math.cos(bAng) * 11;
      const by = Math.sin(bAng) * 11;
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(bx - 1.5, by - 1.5, 3, 3);
    }

    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#18181b';
    ctx.fill();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }
}

// 2. 巨大對向雙三叉旋轉鋼樑 (TwinCounterRotors) - 縱向錯位 S 型門，兩側均有 155px 逃生通道
class TwinCounterRotors {
  constructor(options) {
    this.type = 'twin_rotors';
    this.cy = options.cy;
    // 縱向錯位相差 90px，形成完美的 S 型蛇行通道
    this.cx1 = options.cx1 || 140;
    this.cy1 = options.cy - 45;
    this.cx2 = options.cx2 || 260;
    this.cy2 = options.cy + 45;
    this.length = 72;
    this.speed = 0.50; // 0.5 rad/s
    this.thickness = 12;
    this.angle1 = options.angle1 || 0;
    this.angle2 = options.angle2 || Math.PI / 3;
    this.color1 = '#00f0ff';
    this.color2 = '#f59e0b';
  }

  update(dt) {
    this.angle1 += this.speed * dt;
    this.angle2 -= this.speed * dt;
  }

  checkCollision(px, py, pr) {
    if (Math.hypot(px - this.cx1, py - this.cy1) < 14 + pr) return true;
    if (Math.hypot(px - this.cx2, py - this.cy2) < 14 + pr) return true;

    const step = (Math.PI * 2) / 3;
    for (let i = 0; i < 3; i++) {
      const a1 = this.angle1 + i * step;
      const x1 = this.cx1 + Math.cos(a1) * this.length;
      const y1 = this.cy1 + Math.sin(a1) * this.length;
      if (distToSegment(px, py, this.cx1, this.cy1, x1, y1) < (this.thickness / 2 + pr)) return true;

      const a2 = this.angle2 + i * step;
      const x2 = this.cx2 + Math.cos(a2) * this.length;
      const y2 = this.cy2 + Math.sin(a2) * this.length;
      if (distToSegment(px, py, this.cx2, this.cy2, x2, y2) < (this.thickness / 2 + pr)) return true;
    }
    return false;
  }

  draw(ctx) {
    ctx.save();
    const step = (Math.PI * 2) / 3;
    for (let i = 0; i < 3; i++) {
      const a1 = this.angle1 + i * step;
      const x1 = this.cx1 + Math.cos(a1) * this.length;
      const y1 = this.cy1 + Math.sin(a1) * this.length;
      drawMetallicBar(ctx, this.cx1, this.cy1, x1, y1, this.thickness, this.color1, 'hazard');
    }
    for (let i = 0; i < 3; i++) {
      const a2 = this.angle2 + i * step;
      const x2 = this.cx2 + Math.cos(a2) * this.length;
      const y2 = this.cy2 + Math.sin(a2) * this.length;
      drawMetallicBar(ctx, this.cx2, this.cy2, x2, y2, this.thickness, this.color2, 'chrome');
    }

    [ { cx: this.cx1, cy: this.cy1, col: this.color1 }, { cx: this.cx2, cy: this.cy2, col: this.color2 } ].forEach(r => {
      ctx.beginPath();
      ctx.arc(r.cx, r.cy, 15, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = r.col;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(r.cx, r.cy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });
    ctx.restore();
  }
}

// 3. 巨大重型液壓對衝活塞 (GiantHydraulicCompactor) - 最小開口達 155px (小鴨直徑 30px 的 5 倍以上)
class GiantHydraulicCompactor {
  constructor(options) {
    this.type = 'giant_compactor';
    this.cy = options.cy;
    this.period = options.period || 3.8;
    this.time = options.phase || 0;
    this.thickness = 26;
    this.minGap = 155; // 最小保留 155px 巨大通道！絕無壓殺
    this.maxGap = 270;
    this.color = options.color || '#fbbf24';
  }

  update(dt) {
    this.time += dt;
  }

  checkCollision(px, py, pr) {
    if (Math.abs(py - this.cy) > (this.thickness / 2 + pr)) return false;
    const t = (Math.sin((this.time / this.period) * Math.PI * 2) + 1) / 2;
    const currentGap = this.minGap + (this.maxGap - this.minGap) * t;
    const leftTip = 200 - currentGap / 2;
    const rightTip = 200 + currentGap / 2;
    if (px - pr < leftTip && px + pr > 30) return true;
    if (px + pr > rightTip && px - pr < 370) return true;
    return false;
  }

  draw(ctx) {
    ctx.save();
    const t = (Math.sin((this.time / this.period) * Math.PI * 2) + 1) / 2;
    const currentGap = this.minGap + (this.maxGap - this.minGap) * t;
    const leftTip = 200 - currentGap / 2;
    const rightTip = 200 + currentGap / 2;

    drawMetallicBar(ctx, 30, this.cy, leftTip, this.cy, this.thickness, this.color, 'hazard');
    drawMetallicBar(ctx, rightTip, this.cy, 370, this.cy, this.thickness, this.color, 'hazard');

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(leftTip - 8, this.cy - this.thickness / 2 - 2, 8, this.thickness + 4);
    ctx.fillRect(rightTip, this.cy - this.thickness / 2 - 2, 8, this.thickness + 4);

    ctx.restore();
  }
}

// 4. 巨大重金屬懸臂揮擊閘 (GiantCantileverBoom) - 臂長 145px，對側保留 195px 寬廣通道
class GiantCantileverBoom {
  constructor(options) {
    this.type = 'giant_cantilever';
    this.cy = options.cy;
    this.side = options.side || 'left';
    this.length = 145; // 145px: 絕不擋死對側，對側永遠有 195px 安全通衢
    this.freq = 0.40; // 溫和揮舞頻率 0.4 Hz
    this.time = options.phase || 0;
    this.thickness = 14;
    this.color = options.color || '#ef4444';
  }

  update(dt) {
    this.time += dt;
  }

  checkCollision(px, py, pr) {
    const pivotX = (this.side === 'left') ? 30 : 370;
    const swingAngle = Math.sin(this.time * this.freq * Math.PI * 2) * 0.38;
    const baseAngle = (this.side === 'left') ? 0 : Math.PI;
    const curAngle = baseAngle + swingAngle * (this.side === 'left' ? 1 : -1);
    const tipX = pivotX + Math.cos(curAngle) * this.length;
    const tipY = this.cy + Math.sin(curAngle) * this.length;
    return distToSegment(px, py, pivotX, this.cy, tipX, tipY) < (this.thickness / 2 + pr);
  }

  draw(ctx) {
    ctx.save();
    const pivotX = (this.side === 'left') ? 30 : 370;
    const swingAngle = Math.sin(this.time * this.freq * Math.PI * 2) * 0.38;
    const baseAngle = (this.side === 'left') ? 0 : Math.PI;
    const curAngle = baseAngle + swingAngle * (this.side === 'left' ? 1 : -1);
    const tipX = pivotX + Math.cos(curAngle) * this.length;
    const tipY = this.cy + Math.sin(curAngle) * this.length;

    drawMetallicBar(ctx, pivotX, this.cy, tipX, tipY, this.thickness, this.color, 'hazard');

    ctx.beginPath();
    ctx.arc(pivotX, this.cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }
}

// 5. 巨大重金屬鐘擺破壞球 (GiantHeavyPendulum) - 左右兩側各 110px 永久安全避風港
class GiantHeavyPendulum {
  constructor(options) {
    this.type = 'giant_pendulum';
    this.cy = options.cy;
    this.anchorX = 200;
    this.anchorY = options.cy - 110;
    this.rodLength = 115;
    this.ballRadius = 20;
    this.maxAngle = 0.42; // 在 x=155 與 x=245 之間中心蕩漾
    this.freq = 0.36; // 0.36 Hz 沉穩宏大擺動
    this.time = options.phase || 0;
    this.color = options.color || '#ec4899';
  }

  update(dt) {
    this.time += dt;
  }

  checkCollision(px, py, pr) {
    const angle = Math.sin(this.time * this.freq * Math.PI * 2) * this.maxAngle;
    const ballX = this.anchorX + Math.sin(angle) * this.rodLength;
    const ballY = this.anchorY + Math.cos(angle) * this.rodLength;
    if (distToSegment(px, py, this.anchorX, this.anchorY, ballX, ballY) < (6 + pr)) return true;
    if (Math.hypot(px - ballX, py - ballY) < (this.ballRadius + pr)) return true;
    return false;
  }

  draw(ctx) {
    ctx.save();
    const angle = Math.sin(this.time * this.freq * Math.PI * 2) * this.maxAngle;
    const ballX = this.anchorX + Math.sin(angle) * this.rodLength;
    const ballY = this.anchorY + Math.cos(angle) * this.rodLength;

    // 擺桿
    drawMetallicBar(ctx, this.anchorX, this.anchorY, ballX, ballY, 7, this.color, 'chrome');

    // 頂部基座
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(this.anchorX - 14, this.anchorY - 7, 28, 14);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.anchorX - 14, this.anchorY - 7, 28, 14);

    // 撞擊實心球
    ctx.beginPath();
    ctx.arc(ballX, ballY, this.ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(ballX - 5, ballY - 5, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();

    ctx.restore();
  }
}

// 6. 巨大斜向滑移斷頭鍘 (GiantDiagonalSlicer) - 滑動開口寬達 156px
class GiantDiagonalSlicer {
  constructor(options) {
    this.type = 'giant_slicer';
    this.cy = options.cy;
    this.slopeY = options.slopeY || 35;
    this.period = options.period || 3.8;
    this.time = options.phase || 0;
    this.thickness = 15;
    this.color = options.color || '#fbbf24';
  }

  update(dt) {
    this.time += dt;
  }

  checkCollision(px, py, pr) {
    const t = (Math.sin((this.time / this.period) * Math.PI * 2) + 1) / 2;
    const gapX = 115 + t * 170;
    const gapHalf = 78; // 156px 寬裕開口

    const yOnBlade = this.cy + ((px - 200) / 200) * this.slopeY;
    if (Math.abs(py - yOnBlade) < (this.thickness / 2 + pr)) {
      if (px < gapX - gapHalf || px > gapX + gapHalf) {
        return true;
      }
    }
    return false;
  }

  draw(ctx) {
    ctx.save();
    const t = (Math.sin((this.time / this.period) * Math.PI * 2) + 1) / 2;
    const gapX = 115 + t * 170;
    const gapHalf = 78;

    const yLeft = this.cy - this.slopeY;
    const yRight = this.cy + this.slopeY;

    const leftX2 = Math.max(30, gapX - gapHalf);
    const yLeft2 = this.cy + ((leftX2 - 200) / 200) * this.slopeY;
    drawMetallicBar(ctx, 30, yLeft, leftX2, yLeft2, this.thickness, this.color, 'hazard');

    const rightX1 = Math.min(370, gapX + gapHalf);
    const yRight1 = this.cy + ((rightX1 - 200) / 200) * this.slopeY;
    drawMetallicBar(ctx, rightX1, yRight1, 370, yRight, this.thickness, this.color, 'hazard');

    ctx.restore();
  }
}

// 導出全部高品質金屬急急棒機關 (含巨大動態核心系列)
window.drawMetallicBar = drawMetallicBar;
window.drawCurvedMetallicArc = drawCurvedMetallicArc;
window.distToSegment = distToSegment;

// 巨大動態核心機關導出
window.GiantTriSpokeRotor = GiantTriSpokeRotor;
window.TwinCounterRotors = TwinCounterRotors;
window.GiantHydraulicCompactor = GiantHydraulicCompactor;
window.GiantCantileverBoom = GiantCantileverBoom;
window.GiantHeavyPendulum = GiantHeavyPendulum;
window.GiantDiagonalSlicer = GiantDiagonalSlicer;

window.ElongatedSlalomRod = ElongatedSlalomRod;
window.SlalomWaveBars = SlalomWaveBars;
window.ReciprocatingSlideBars = ReciprocatingSlideBars;
window.AlternatingGridBars = AlternatingGridBars;
window.MultiXRotatingCross = MultiXRotatingCross;
window.MetallicPendulum = MetallicPendulum;
window.RotatingWindmill = RotatingWindmill;
window.SpiralTrackGate = SpiralTrackGate;
window.PistonCrusherBars = PistonCrusherBars;
window.WaterfallConveyorBars = WaterfallConveyorBars;
window.ZigzagChicaneBars = ZigzagChicaneBars;
window.OrbitalSatelliteSpikes = OrbitalSatelliteSpikes;
window.BreathingIrisGate = BreathingIrisGate;
window.ScissorShearBars = ScissorShearBars;
window.TwinTurretScanners = TwinTurretScanners;
window.BouncingBumperBar = BouncingBumperBar;
window.AngledFunnelGate = AngledFunnelGate;

window.CurvedArcGate = CurvedArcGate;
window.DiagonalGuillotineSlicer = DiagonalGuillotineSlicer;
window.SerratedCombJaws = SerratedCombJaws;
window.RhombusConstrictionGate = RhombusConstrictionGate;
window.CantileverFlapGate = CantileverFlapGate;
window.DoubleRailCorridor = DoubleRailCorridor;



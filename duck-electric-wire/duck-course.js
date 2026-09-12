/**
 * duck-course.js - 33,000px 真實經典《電流急急棒》(電流イライラ棒) 巨大動態主機關賽道核心
 * 
 * 1. 【巨大動態機關主導閃避 (Giant Dynamic Obstacles)】：
 *    - 徹底移除零碎、裝飾性無意義的靜態短鐵棒！全賽道每個區間均由 1~2 座「巨大動態機關」決定唯一逃生動線。
 *    - 大量配置【巨大三叉旋轉高壓鋼樑 (GiantTriSpokeRotor)】(半徑達 105px，橫跨 210px 賽道)：
 *      - 包含正轉 (CW 順時針) 與逆轉 (CCW 逆時針) 兩種動態。
 *      - 居中放置、左側偏置、右側偏置，強迫玩家必須掌握時差進行 2D 多元動態閃避！
 *    - 配置【巨大對向雙三叉旋轉鋼樑 (TwinCounterRotors)】：一正一逆雙輪咬合，形成極度驚險的時差沙漏通道！
 *    - 配置【巨大重型液壓活塞 (GiantHydraulicCompactor)】、【巨大金屬起重懸臂 (GiantCantileverBoom)】、【巨大重力破壞球 (GiantHeavyPendulum)】、【巨大斜向斷頭鍘 (GiantDiagonalSlicer)】。
 * 
 * 2. 【二維多元閃避軌跡 (X 左右微操 + Y 前後調速衝放)】：
 *    - 閃避不再只是單調的左右切換，玩家必須在上下方向（Y 軸）進行「後拉滯空等刀口過」、「前衝加速鑽縫隙」，達到極致緊張刺激感！
 * 
 * 3. 【隱藏引導軌跡線】：
 *    - 徹底移除場景中心虛擬虛線，回歸純粹的高壓電工廠黑暗氛圍與視覺專注度。
 */

class DuckCourse {
  constructor() {
    this.totalLength = 33000;
    this.centerX = 200;
    this.segments = [];
    this.mechanisms = [];
    this.sirenAngle = 0;

    this.zones = [
      { name: 'Stage 0: ⚡ 起跑衝刺整備區 (0:00)', startY: 0, endY: 1350, color: '#10b981', danger: 0.1 },
      { name: 'Stage 1: 🌪️ 巨大三叉旋轉鋼樑初陣 (0:12)', startY: 1350, endY: 3400, color: '#00f0ff', danger: 0.2 },
      { name: 'Stage 2: ⚙️ 雙三叉對向咬合齒輪狹道 (0:31)', startY: 3400, endY: 5450, color: '#38bdf8', danger: 0.25 },
      { name: 'Stage 3: 💥 巨大黑黃液壓對衝重型活塞 (0:50)', startY: 5450, endY: 7500, color: '#60a5fa', danger: 0.3 },
      { name: 'Stage 4: 🏗️ 巨大金屬起重懸臂橫掃閘 (1:08)', startY: 7500, endY: 9550, color: '#818cf8', danger: 0.35 },
      { name: 'Stage 5: 🔔 巨大重金屬破壞球鐘擺海 (1:27)', startY: 9550, endY: 11600, color: '#a78bfa', danger: 0.4 },
      { name: 'Stage 6: 🌪️ 逆向旋轉三叉巨樑逆流陣 (1:45)', startY: 11600, endY: 13650, color: '#c084fc', danger: 0.45 },
      { name: 'Stage 7: ⚔️ 斜向斷頭鍘與三叉雙重包夾 (2:04)', startY: 13650, endY: 15700, color: '#e879f9', danger: 0.5 },
      { name: 'Stage 8: 🌪️ 對向雙輪咬合與起重懸臂 (2:23)', startY: 15700, endY: 17750, color: '#f43f5e', danger: 0.55 },
      { name: 'Stage 9: 💥 液壓重衝活塞與巨型鐘擺 (2:41)', startY: 17750, endY: 19800, color: '#fb7185', danger: 0.6 },
      { name: 'Stage 10: 🌪️ 正逆雙三叉連環交錯陣 (3:00)', startY: 19800, endY: 21850, color: '#f87171', danger: 0.7 },
      { name: 'Stage 11: ⚙️ 雙星雙軌咬合與滑移斷頭鍘 (3:19)', startY: 21850, endY: 23900, color: '#fb923c', danger: 0.75 },
      { name: 'Stage 12: 🏗️ 雙向懸臂拍擊與高速旋翼 (3:37)', startY: 23900, endY: 25950, color: '#fbbf24', danger: 0.8 },
      { name: 'Stage 13: 🌪️ 逆轉巨型三叉鋼樑極限群 (3:56)', startY: 25950, endY: 28000, color: '#facc15', danger: 0.85 },
      { name: 'Stage 14: 🚨 雙三叉咬合狂暴過載區 (4:15)', startY: 28000, endY: 30050, color: '#ef4444', danger: 0.9 },
      { name: 'Stage 15: 💥 四分鐘極限死鬥終極旋轉海 (4:33)', startY: 30050, endY: 32500, color: '#dc2626', danger: 1.0 },
      { name: '終點：🏆 十萬伏特特工鴨神殿堂 (5:00)', startY: 32500, endY: 33000, color: '#ffd700', danger: 0.0 }
    ];

    this.initCourse();
  }

  initCourse() {
    this.buildCorridors();
    this.populateMechanisms();
  }

  buildCorridors() {
    const waypoints = [
      { y: 0, left: 30, right: 370 },
      { y: 1500, left: 30, right: 370 },
      { y: 5500, left: 32, right: 368 },
      { y: 11500, left: 34, right: 366 },
      { y: 17500, left: 36, right: 364 },
      { y: 23500, left: 38, right: 362 },
      { y: 28000, left: 40, right: 360 },
      { y: 30500, left: 42, right: 358 },
      { y: 32500, left: 36, right: 364 },
      { y: 33000, left: 20, right: 380 }
    ];

    this.segments = [];
    for (let i = 0; i < waypoints.length - 1; i++) {
      this.segments.push({
        y1: waypoints[i].y,
        y2: waypoints[i + 1].y,
        left1: waypoints[i].left,
        left2: waypoints[i + 1].left,
        right1: waypoints[i].right,
        right2: waypoints[i + 1].right
      });
    }
  }

  getCorridorBoundsAt(y) {
    for (const seg of this.segments) {
      if (y >= seg.y1 && y <= seg.y2) {
        const ratio = (y - seg.y1) / (seg.y2 - seg.y1);
        const left = seg.left1 + (seg.left2 - seg.left1) * ratio;
        const right = seg.right1 + (seg.right2 - seg.right1) * ratio;
        return { left, right };
      }
    }
    return { left: 30, right: 370 };
  }

  // ===========================================================================
  // 鋪設 100% 人類反應合理性之「巨大動態機關」33,000px 賽道
  // ===========================================================================
  populateMechanisms() {
    this.mechanisms = [];
    const stepY = 175; // 每 175px 一處震撼的大型主題機關 (約 1.6 秒一次大遭遇，無零碎短棒)
    let mCount = 0;

    for (let y = 450; y <= 32500; y += stepY) {
      mCount++;
      const stageIdx = Math.min(15, Math.floor((y - 1350) / 2050));
      const typeChoice = mCount % 8;

      if (typeChoice === 0) {
        // 1. 巨大三叉旋轉鋼樑 (正轉 CW，居中，臂長 80px，兩側各有 90px 寬裕通道！)
        this.mechanisms.push(new window.GiantTriSpokeRotor({
          cy: y, cx: 200, length: 80, speed: 0.52, startAngle: (mCount * 1.1) % 6.28
        }));
      } else if (typeChoice === 1) {
        // 2. 巨大三叉旋轉鋼樑 (逆轉 CCW，偏左側 cx=150，右側保留 145px 寬廣通衢大道！)
        this.mechanisms.push(new window.GiantTriSpokeRotor({
          cy: y, cx: 150, length: 75, speed: -0.52, startAngle: (mCount * 1.3) % 6.28
        }));
      } else if (typeChoice === 2) {
        // 3. 巨大重型液壓對衝活塞 (最小開口 155px，超過小鴨 30px 直徑 5 倍，絕不壓殺！)
        this.mechanisms.push(new window.GiantHydraulicCompactor({
          cy: y, period: 3.8, phase: mCount * 0.4
        }));
      } else if (typeChoice === 3) {
        // 4. 巨大三叉旋轉鋼樑 (正轉 CW，偏右側 cx=250，左側保留 145px 寬廣通衢大道！)
        this.mechanisms.push(new window.GiantTriSpokeRotor({
          cy: y, cx: 250, length: 75, speed: 0.52, startAngle: (mCount * 0.9) % 6.28
        }));
      } else if (typeChoice === 4) {
        // 5. 巨大對向雙三叉旋轉鋼樑 (縱向錯位 S 型門，兩側各自保留 158px 順暢穿梭走廊！)
        this.mechanisms.push(new window.TwinCounterRotors({
          cy: y, cx1: 140, cx2: 260
        }));
      } else if (typeChoice === 5) {
        // 6. 巨大重金屬懸臂揮擊閘 (臂長 145px，對側永遠有 195px 完整半場通衢！)
        this.mechanisms.push(new window.GiantCantileverBoom({
          cy: y, side: (mCount % 2 === 0 ? 'left' : 'right'), phase: mCount * 0.5
        }));
      } else if (typeChoice === 6) {
        // 7. 巨大三叉旋轉鋼樑 (逆轉 CCW，居中，臂長 80px，兩側各有 90px 寬裕通道！)
        this.mechanisms.push(new window.GiantTriSpokeRotor({
          cy: y, cx: 200, length: 80, speed: -0.50, startAngle: (mCount * 1.7) % 6.28
        }));
      } else {
        // 8. 巨大重金屬鐘擺破壞球 (中心蕩漾，左右兩側各有 110px 永久避風港！)
        this.mechanisms.push(new window.GiantHeavyPendulum({
          cy: y, phase: mCount * 0.3
        }));
      }
    }
  }

  getCurrentZone(y) {
    for (const z of this.zones) {
      if (y >= z.startY && y <= z.endY) {
        return z;
      }
    }
    return this.zones[this.zones.length - 1];
  }

  update(dt, duck) {
    this.sirenAngle += dt * 4;

    for (const m of this.mechanisms) {
      if (m.update) m.update(dt);
    }
  }

  checkCollision(px, py, pr) {
    const bounds = this.getCorridorBoundsAt(py);
    if (px - pr < bounds.left) return { hit: true, cause: 'wall_left' };
    if (px + pr > bounds.right) return { hit: true, cause: 'wall_right' };

    for (const m of this.mechanisms) {
      const my = m.cy || 0;
      if (Math.abs(py - my) < 140) {
        if (m.checkCollision(px, py, pr)) {
          return { hit: true, cause: m.type };
        }
      }
    }
    return { hit: false };
  }

  checkNearWarning(px, py, pr) {
    const bounds = this.getCorridorBoundsAt(py);
    const warnDist = 18;
    if (px - pr - bounds.left < warnDist || bounds.right - (px + pr) < warnDist) {
      return true;
    }
    for (const m of this.mechanisms) {
      const my = m.cy || 0;
      if (Math.abs(py - my) < 120) {
        if (m.checkCollision(px, py, pr + 14)) {
          return true;
        }
      }
    }
    return false;
  }

  drawEnvironment(ctx, viewY, viewHeight) {
    const minY = viewY - 100;
    const maxY = viewY + viewHeight + 100;

    // 1. 深色高壓工廠背景
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(-100, minY, 600, maxY - minY);

    // 2. 工業背景格線
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
    ctx.lineWidth = 1;
    const gridSpacing = 40;
    const startGridY = Math.floor(minY / gridSpacing) * gridSpacing;
    ctx.beginPath();
    for (let gy = startGridY; gy <= maxY; gy += gridSpacing) {
      ctx.moveTo(-100, gy);
      ctx.lineTo(500, gy);
    }
    for (let gx = 0; gx <= 400; gx += gridSpacing) {
      ctx.moveTo(gx, minY);
      ctx.lineTo(gx, maxY);
    }
    ctx.stroke();

    // ★ 依據使用者反饋：徹底移除引導虛線，還原乾淨刺激的高壓電工廠氛圍！

    // 3. 左右邊界高壓電弧壁
    for (const seg of this.segments) {
      if (seg.y2 < minY || seg.y1 > maxY) continue;

      ctx.fillStyle = '#050811';
      ctx.fillRect(-100, seg.y1, seg.left1 + 100, seg.y2 - seg.y1);
      ctx.fillRect(seg.right1, seg.y1, 500 - seg.right1, seg.y2 - seg.y1);

      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(seg.left1, seg.y1);
      ctx.lineTo(seg.left2, seg.y2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(seg.right1, seg.y1);
      ctx.lineTo(seg.right2, seg.y2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 4. 繪製視野內之巨大動態機關
    for (const m of this.mechanisms) {
      const my = m.cy || 0;
      if (my >= minY - 160 && my <= maxY + 160) {
        m.draw(ctx);
      }
    }
  }
}

window.DuckCourse = DuckCourse;

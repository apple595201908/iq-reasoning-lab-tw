/**
 * 職場自信程度心理測驗 - 核心互動邏輯與評分系統
 */

(function () {
  "use strict";

  // 本機儲存 Key
  const STORAGE_KEY = "workplace_confidence_quiz_progress";

  // 狀態管理
  let state = {
    currentIndex: 0,
    answers: new Array(QUIZ_QUESTIONS.length).fill(null),
    isFinished: false
  };

  // DOM 元素快取
  const dom = {
    // 視圖面板
    heroView: document.getElementById("hero-view"),
    quizView: document.getElementById("quiz-view"),
    resultsView: document.getElementById("results-view"),

    // 首頁按鈕
    btnStart: document.getElementById("btn-start-quiz"),
    btnResume: document.getElementById("btn-resume-quiz"),

    // 作答區元素
    questionCounter: document.getElementById("current-q-num"),
    totalCounter: document.getElementById("total-q-num"),
    progressPercent: document.getElementById("progress-percent-text"),
    progressBarFill: document.getElementById("quiz-progress-fill"),
    dimBadge: document.getElementById("dimension-badge-text"),
    questionText: document.getElementById("quiz-question-text"),
    optionsContainer: document.getElementById("quiz-options-container"),

    // 導航控制
    btnPrev: document.getElementById("btn-prev-q"),
    btnNext: document.getElementById("btn-next-q"),
    btnJumpModal: document.getElementById("btn-open-jump-modal"),

    // 跳題彈窗
    jumpModal: document.getElementById("jump-modal-overlay"),
    btnCloseModal: document.getElementById("btn-close-modal"),
    jumpGrid: document.getElementById("modal-jump-grid"),

    // 結果頁元素
    resBadge: document.getElementById("result-badge"),
    resArchetypeName: document.getElementById("result-archetype-name"),
    resTagline: document.getElementById("result-tagline"),
    resScoreValue: document.getElementById("result-score-value"),
    resScorePercent: document.getElementById("result-score-percent"),
    resSummaryText: document.getElementById("result-summary-text"),
    resDimensionsList: document.getElementById("result-dimensions-list"),
    resStrengthsList: document.getElementById("result-strengths-list"),
    resPitfallsList: document.getElementById("result-pitfalls-list"),
    resTipsList: document.getElementById("result-action-tips-list"),
    lowestDimTipBox: document.getElementById("lowest-dim-tip-box"),
    lowestDimTitle: document.getElementById("lowest-dim-title"),
    lowestDimText: document.getElementById("lowest-dim-text"),

    // 回顧與操作
    btnToggleReview: document.getElementById("btn-toggle-review"),
    reviewContainer: document.getElementById("review-answers-box"),
    btnRestart: document.getElementById("btn-restart-quiz"),
    btnShare: document.getElementById("btn-share-result"),
    btnPrint: document.getElementById("btn-print-result")
  };

  // 初始化
  function init() {
    loadSavedProgress();
    bindEvents();
    renderHeroStatus();
  }

  // 讀取本機進度
  function loadSavedProgress() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.answers) && parsed.answers.length === QUIZ_QUESTIONS.length) {
          state.answers = parsed.answers;
          state.currentIndex = typeof parsed.currentIndex === "number" ? parsed.currentIndex : 0;
          state.isFinished = !!parsed.isFinished;
        }
      }
    } catch (e) {
      console.warn("無法讀取存檔：", e);
    }
  }

  // 儲存進度
  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        answers: state.answers,
        currentIndex: state.currentIndex,
        isFinished: state.isFinished
      }));
    } catch (e) {
      console.warn("無法儲存進度：", e);
    }
  }

  // 切換視圖
  function showView(viewName) {
    dom.heroView.classList.remove("active");
    dom.quizView.classList.remove("active");
    dom.resultsView.classList.remove("active");

    if (viewName === "hero") dom.heroView.classList.add("active");
    if (viewName === "quiz") dom.quizView.classList.add("active");
    if (viewName === "results") dom.resultsView.classList.add("active");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // 渲染首頁狀態 (若有進度則顯示「繼續測驗」)
  function renderHeroStatus() {
    const answeredCount = state.answers.filter(a => a !== null).length;
    if (answeredCount > 0 && !state.isFinished) {
      dom.btnResume.style.display = "inline-block";
      dom.btnResume.textContent = `繼續未完成測驗 (已答 ${answeredCount}/50 題)`;
    } else {
      dom.btnResume.style.display = "none";
    }
  }

  // 渲染題目
  function renderQuestion(index) {
    if (index < 0 || index >= QUIZ_QUESTIONS.length) return;

    state.currentIndex = index;
    saveProgress();

    const q = QUIZ_QUESTIONS[index];
    const dim = QUIZ_DIMENSIONS[q.dimension];
    const answeredCount = state.answers.filter(a => a !== null).length;
    const currentAnswer = state.answers[index];

    // 更新進度與計數器
    dom.questionCounter.textContent = index + 1;
    dom.totalCounter.textContent = ` / ${QUIZ_QUESTIONS.length} 題`;

    const percent = Math.round(((index + 1) / QUIZ_QUESTIONS.length) * 100);
    dom.progressPercent.textContent = `${percent}%`;
    dom.progressBarFill.style.width = `${percent}%`;

    // 更新維度標籤與題目文字
    dom.dimBadge.innerHTML = `${dim.icon} <span>第 ${Math.floor(index / 10) + 1} 面向：${dim.name}</span>`;
    dom.questionText.textContent = q.text;

    // 渲染 4 個選項卡片
    dom.optionsContainer.innerHTML = "";
    QUIZ_OPTIONS.forEach(opt => {
      const isSelected = currentAnswer === opt.value;
      const card = document.createElement("div");
      card.className = `option-card ${isSelected ? "selected" : ""}`;
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.dataset.value = opt.value;

      card.innerHTML = `
        <div class="option-left-content">
          <div class="option-key-tag">${opt.key}</div>
          <div class="option-text-group">
            <div class="option-main-label">${opt.label}</div>
            <div class="option-sub-hint">${opt.hint}</div>
          </div>
        </div>
        <div class="option-check-circle">✓</div>
      `;

      card.addEventListener("click", () => handleSelectOption(opt.value));
      dom.optionsContainer.appendChild(card);
    });

    // 更新導航按鈕狀態
    dom.btnPrev.disabled = (index === 0);

    if (index === QUIZ_QUESTIONS.length - 1) {
      dom.btnNext.textContent = "查看測驗分析報告 ➔";
      dom.btnNext.classList.add("btn-finish-style");
    } else {
      dom.btnNext.textContent = "下一題 ➔";
      dom.btnNext.classList.remove("btn-finish-style");
    }
  }

  // 處理選項點擊
  function handleSelectOption(value) {
    const prevAnswer = state.answers[state.currentIndex];
    state.answers[state.currentIndex] = value;
    saveProgress();

    // 更新選項選中視覺
    const cards = dom.optionsContainer.querySelectorAll(".option-card");
    cards.forEach(card => {
      if (parseInt(card.dataset.value, 10) === value) {
        card.classList.add("selected");
      } else {
        card.classList.remove("selected");
      }
    });

    // 延遲 200ms 自動跳下一題，體驗極度流暢
    setTimeout(() => {
      if (state.currentIndex < QUIZ_QUESTIONS.length - 1) {
        renderQuestion(state.currentIndex + 1);
      } else {
        // 最後一題做完，檢查是否全部已答完
        checkFinishQuiz();
      }
    }, 220);
  }

  // 上一題
  function handlePrevQuestion() {
    if (state.currentIndex > 0) {
      renderQuestion(state.currentIndex - 1);
    }
  }

  // 下一題 / 完成
  function handleNextQuestion() {
    if (state.currentIndex < QUIZ_QUESTIONS.length - 1) {
      renderQuestion(state.currentIndex + 1);
    } else {
      checkFinishQuiz();
    }
  }

  // 檢查是否完成所有題目
  function checkFinishQuiz() {
    const unAnsweredIndices = [];
    state.answers.forEach((ans, idx) => {
      if (ans === null) unAnsweredIndices.push(idx + 1);
    });

    if (unAnsweredIndices.length > 0) {
      const firstUnanswered = unAnsweredIndices[0] - 1;
      alert(`您還有 ${unAnsweredIndices.length} 題尚未回答（例如第 ${unAnsweredIndices.slice(0, 5).join(", ")} 題），將為您跳轉至未填題目！`);
      renderQuestion(firstUnanswered);
      return;
    }

    // 全部答完，結算結果
    state.isFinished = true;
    saveProgress();
    renderResults();
    showView("results");
  }

  // 渲染跳題彈窗網格
  function renderJumpGrid() {
    dom.jumpGrid.innerHTML = "";
    QUIZ_QUESTIONS.forEach((q, idx) => {
      const isAnswered = state.answers[idx] !== null;
      const isCurrent = state.currentIndex === idx;

      const btn = document.createElement("button");
      btn.className = `jump-item-btn ${isAnswered ? "answered" : ""} ${isCurrent ? "current" : ""}`;
      btn.textContent = idx + 1;
      btn.title = `第 ${idx + 1} 題：${q.text.substring(0, 18)}...`;

      btn.addEventListener("click", () => {
        closeJumpModal();
        renderQuestion(idx);
      });

      dom.jumpGrid.appendChild(btn);
    });
  }

  function openJumpModal() {
    renderJumpGrid();
    dom.jumpModal.classList.add("active");
  }

  function closeJumpModal() {
    dom.jumpModal.classList.remove("active");
  }

  // =========================================================
  // 計算分數與渲染分析報告
  // =========================================================
  function renderResults() {
    // 1. 計算總分 (50 ~ 200)
    const totalScore = state.answers.reduce((sum, val) => sum + (val || 0), 0);

    // 2. 計算五大維度分數 (每個維度 10 題，滿分 40，最低 10)
    const dimScores = {
      expression: 0,
      challenge: 0,
      resilience: 0,
      boundary: 0,
      self_worth: 0
    };

    QUIZ_QUESTIONS.forEach((q, idx) => {
      const score = state.answers[idx] || 0;
      dimScores[q.dimension] += score;
    });

    // 3. 比對對應型格
    const archetype = QUIZ_ARCHETYPES.find(arch => totalScore >= arch.minScore && totalScore <= arch.maxScore) || QUIZ_ARCHETYPES[QUIZ_ARCHETYPES.length - 1];

    // 4. 填充基本資訊
    dom.resBadge.textContent = archetype.badge;
    dom.resBadge.style.backgroundColor = archetype.accentBg;
    dom.resBadge.style.color = archetype.color;
    dom.resBadge.style.border = `1px solid ${archetype.borderCol}`;

    dom.resArchetypeName.textContent = archetype.name;
    dom.resArchetypeName.style.color = archetype.color;
    dom.resTagline.textContent = archetype.tagline;

    dom.resScoreValue.textContent = totalScore;
    dom.resScoreValue.style.color = archetype.color;
    const scorePct = Math.round(((totalScore - 50) / 150) * 100);
    dom.resScorePercent.textContent = `（職場底氣指標：${scorePct}%）`;
    dom.resSummaryText.textContent = archetype.summary;

    // 5. 渲染五大維度長條分析圖
    dom.resDimensionsList.innerHTML = "";
    let lowestDimId = "expression";
    let lowestDimScore = 999;

    Object.keys(QUIZ_DIMENSIONS).forEach(key => {
      const dim = QUIZ_DIMENSIONS[key];
      const score = dimScores[key];
      const pct = Math.round(((score - 10) / 30) * 100);

      if (score < lowestDimScore) {
        lowestDimScore = score;
        lowestDimId = key;
      }

      const card = document.createElement("div");
      card.className = "dim-meter-card";
      card.innerHTML = `
        <div class="dim-meter-header">
          <div class="dim-meter-title">
            <span>${dim.icon}</span>
            <span>${dim.name}</span>
          </div>
          <div class="dim-meter-score">${score} / 40 分 (${pct}%)</div>
        </div>
        <div class="dim-bar-track">
          <div class="dim-bar-fill" style="width: ${pct}%; background: linear-gradient(90deg, ${archetype.color}, #6366f1)"></div>
        </div>
        <div class="dim-meter-desc">${dim.desc}</div>
      `;
      dom.resDimensionsList.appendChild(card);
    });

    // 6. 弱項維度強化專區
    const lowestDim = QUIZ_DIMENSIONS[lowestDimId];
    dom.lowestDimTitle.textContent = `🎯 優先突破焦點：【${lowestDim.name}】（目前得分 ${lowestDimScore} / 40）`;
    dom.lowestDimText.textContent = getLowestDimensionAdvice(lowestDimId);

    // 7. 渲染職場高光與潛在盲點
    dom.resStrengthsList.innerHTML = archetype.highlights.map(h => `<li>${h}</li>`).join("");
    dom.resPitfallsList.innerHTML = archetype.pitfalls.map(p => `<li>${p}</li>`).join("");

    // 8. 專屬行動指南
    dom.resTipsList.innerHTML = archetype.actionTips.map((tip, i) => `
      <li class="tip-item">
        <div class="tip-number">${i + 1}</div>
        <div class="tip-text">${tip}</div>
      </li>
    `).join("");

    // 9. 渲染 50 題答案詳細清單
    renderAnswersReview();
  }

  // 針對最低維度的深度實務建議
  function getLowestDimensionAdvice(dimId) {
    switch (dimId) {
      case "expression":
        return "你在表達不同意見或面對高壓發言場合時，可能常因擔心衝突而把想法壓抑下來。建議嘗試『三明治表達法』：先肯定他人出發點 ➔ 提出自己的觀察與方案 ➔ 詢問對方的回饋。從小型非正式會議開始練習，逐步脫離沉默螺旋。";
      case "challenge":
        return "面對不熟悉的未知專案時，你可能下意識會放大風險、縮小自己的學習彈性。建議下次遇到新任務時，將未知拆解成『第一週能做完的最小驗證行動』，告訴自己：不需要一開始就全部會，只要會查資料與發問，就已經贏過一半的人。";
      case "resilience":
        return "你在面對嚴厲反饋或工作瑕疵時，容易陷入較長的心智內耗，把專案上的修改誤會成對你個人的全盤否定。請在心中建立防火牆：『主管在修改這份企劃，不是在評價我這個人的價值。』將注意力快速聚焦在善後清單上。";
      case "boundary":
        return "你在拒絕不合理要求或爭取資源時容易有愧疚感，常常默默吞下過載的工作。請練習『客觀排程法』：當主管塞新任務時，攤開行事曆請他決定哪項專案可以往後順延。學會溫和而堅定地守護自己的心理產能。";
      case "self_worth":
        return "你深陷『冒牌者心態』的困擾，總覺得自己的成就是靠運氣。建議今天就建立一個專屬的『戰果檔案夾』，把客戶感謝信、主管稱讚、專案數據存下來。每當自我懷疑時拿出來讀一遍，用客觀事實破除心中的冒牌者幻象。";
      default:
        return "保持對自我的好奇與覺察，每天肯定自己一個微小進步，底氣便會在日常中生根茁壯。";
    }
  }

  // 渲染回顧清單
  function renderAnswersReview() {
    dom.reviewContainer.innerHTML = "";
    QUIZ_QUESTIONS.forEach((q, idx) => {
      const userVal = state.answers[idx];
      const opt = QUIZ_OPTIONS.find(o => o.value === userVal);
      const card = document.createElement("div");
      card.className = "review-item-card";
      card.innerHTML = `
        <div class="review-item-left">
          <span class="review-q-num">Q${idx + 1}.</span>
          <span class="review-q-text">${q.text}</span>
        </div>
        <div class="review-item-answer">${opt ? opt.label : "未作答"}</div>
      `;
      dom.reviewContainer.appendChild(card);
    });
  }

  // 重新測驗
  function restartQuiz() {
    if (confirm("確定要清除目前紀錄並重新開始測驗嗎？")) {
      state.answers = new Array(QUIZ_QUESTIONS.length).fill(null);
      state.currentIndex = 0;
      state.isFinished = false;
      saveProgress();
      renderHeroStatus();
      showView("hero");
    }
  }

  // 複製結果摘要
  function copyResultSummary() {
    const totalScore = state.answers.reduce((sum, val) => sum + (val || 0), 0);
    const archetype = QUIZ_ARCHETYPES.find(arch => totalScore >= arch.minScore && totalScore <= arch.maxScore) || QUIZ_ARCHETYPES[QUIZ_ARCHETYPES.length - 1];

    const shareText = `【職場自信程度心理測驗結果】
🏆 我的自信型格：${archetype.name}（${archetype.badge}）
📊 總得分：${totalScore} / 200 分
💡 核心特質：${archetype.tagline}
✨ 快來測試看看你在職場上是沉著大將、實力派還是發光族吧！`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).then(() => {
        alert("測驗結果摘要已複製到剪貼簿！可直接貼給同事或好友分享。");
      }).catch(() => {
        fallbackCopyText(shareText);
      });
    } else {
      fallbackCopyText(shareText);
    }
  }

  function fallbackCopyText(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      alert("測驗結果摘要已複製到剪貼簿！");
    } catch (err) {
      prompt("請複製以下測驗摘要：", text);
    }
    document.body.removeChild(textArea);
  }

  // 事件綁定
  function bindEvents() {
    // 首頁按鈕
    dom.btnStart.addEventListener("click", () => {
      // 若是全新開始且已完成過，重新清空
      if (state.isFinished) {
        state.answers = new Array(QUIZ_QUESTIONS.length).fill(null);
        state.currentIndex = 0;
        state.isFinished = false;
      }
      showView("quiz");
      renderQuestion(state.currentIndex);
    });

    dom.btnResume.addEventListener("click", () => {
      showView("quiz");
      renderQuestion(state.currentIndex);
    });

    // 導航按鈕
    dom.btnPrev.addEventListener("click", handlePrevQuestion);
    dom.btnNext.addEventListener("click", handleNextQuestion);

    // 跳題彈窗
    dom.btnJumpModal.addEventListener("click", openJumpModal);
    dom.btnCloseModal.addEventListener("click", closeJumpModal);
    dom.jumpModal.addEventListener("click", (e) => {
      if (e.target === dom.jumpModal) closeJumpModal();
    });

    // 回顧摺疊切換
    dom.btnToggleReview.addEventListener("click", () => {
      const isOpen = dom.reviewContainer.classList.contains("open");
      if (isOpen) {
        dom.reviewContainer.classList.remove("open");
        dom.btnToggleReview.innerHTML = "展開 50 題完整作答紀錄 ▼";
      } else {
        dom.reviewContainer.classList.add("open");
        dom.btnToggleReview.innerHTML = "收合 50 題完整作答紀錄 ▲";
      }
    });

    // 重新測驗 / 分享 / 列印
    dom.btnRestart.addEventListener("click", restartQuiz);
    dom.btnShare.addEventListener("click", copyResultSummary);
    dom.btnPrint.addEventListener("click", () => window.print());

    // 鍵盤快速鍵 (1, 2, 3, 4, 方向鍵)
    window.addEventListener("keydown", (e) => {
      // 只有在作答畫面才觸發快捷鍵
      if (!dom.quizView.classList.contains("active")) return;
      if (dom.jumpModal.classList.contains("active")) return;

      if (e.key === "1") handleSelectOption(1);
      else if (e.key === "2") handleSelectOption(2);
      else if (e.key === "3") handleSelectOption(3);
      else if (e.key === "4") handleSelectOption(4);
      else if (e.key === "ArrowLeft") handlePrevQuestion();
      else if (e.key === "ArrowRight") handleNextQuestion();
    });
  }

  // 啟動
  document.addEventListener("DOMContentLoaded", init);
})();

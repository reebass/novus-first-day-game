(function () {
  "use strict";

  var config = window.NOVUS_CONFIG;
  var data = window.NOVUS_GAME_DATA;
  var root = document.getElementById("gameRoot");
  var progressRoot = document.getElementById("progressMap");

  var currentScreenId = config.game.firstScreen;
  var gameState = {
    selectedRole: ""
  };

  var wrongCount = 0;
  var revealCorrect = false;
  var feedback = "";
  var feedbackType = "";
  var selectedMulti = [];
  var isTransitioning = false;
  var pendingNextScreenId = "";
  var preloadedMediaSources = {};
  var preloadedVideoObjectUrls = [];
  var trackingStoragePrefix = "novusGameTracking:";
  var trackingKeys = {
    sessionId: trackingStoragePrefix + "sessionId",
    timestart: trackingStoragePrefix + "timestart",
    timeend: trackingStoragePrefix + "timeend",
    startSent: trackingStoragePrefix + "startSent",
    endSent: trackingStoragePrefix + "endSent",
    completed: trackingStoragePrefix + "completed"
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function currentScreen() {
    return data.screens[currentScreenId];
  }

  function storageGet(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch (err) {
      return "";
    }
  }

  function storageSet(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (err) {
      // Tracking should never block the game if browser storage is unavailable.
    }
  }

  function storageRemove(key) {
    try {
      window.sessionStorage.removeItem(key);
    } catch (err) {
      // Ignore storage cleanup errors.
    }
  }

  function generateSessionId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return [
      Date.now().toString(36),
      Math.random().toString(36).slice(2),
      Math.random().toString(36).slice(2)
    ].join("-");
  }

  function currentIsoTime() {
    return new Date().toISOString();
  }

  function resetTrackingSession() {
    Object.keys(trackingKeys).forEach(function (key) {
      storageRemove(trackingKeys[key]);
    });
  }

  function trackingSessionId() {
    var sessionId = storageGet(trackingKeys.sessionId);

    if (!sessionId) {
      sessionId = generateSessionId();
      storageSet(trackingKeys.sessionId, sessionId);
    }

    return sessionId;
  }

  function sendTrackingEvent(type, payload) {
    var dataPayload = Object.assign({
      event: type,
      sessionId: trackingSessionId()
    }, payload || {});
    var timestart = storageGet(trackingKeys.timestart);
    var timeend = storageGet(trackingKeys.timeend);

    if (timestart && !dataPayload.timestart) {
      dataPayload.timestart = timestart;
    }

    if (timeend && !dataPayload.timeend) {
      dataPayload.timeend = timeend;
    }

    if (!config.GOOGLE_SCRIPT_URL) {
      console.log("NOVUS tracking:", dataPayload);
      return Promise.resolve();
    }

    return fetch(config.GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(dataPayload)
    });
  }

  function markTrackingFlag(key) {
    storageSet(key, "1");
  }

  function trackStart() {
    if (storageGet(trackingKeys.sessionId) || storageGet(trackingKeys.startSent)) {
      resetTrackingSession();
    }

    if (!storageGet(trackingKeys.timestart)) {
      storageSet(trackingKeys.timestart, currentIsoTime());
    }

    if (storageGet(trackingKeys.startSent)) {
      return Promise.resolve();
    }

    markTrackingFlag(trackingKeys.startSent);

    return sendTrackingEvent("start").catch(function (err) {
      console.error(err);
    });
  }

  function trackEnd() {
    if (!storageGet(trackingKeys.timestart)) {
      storageSet(trackingKeys.timestart, currentIsoTime());
    }

    if (!storageGet(trackingKeys.timeend)) {
      storageSet(trackingKeys.timeend, currentIsoTime());
    }

    if (!storageGet(trackingKeys.startSent)) {
      markTrackingFlag(trackingKeys.startSent);
    }

    if (storageGet(trackingKeys.endSent)) {
      return Promise.resolve();
    }

    markTrackingFlag(trackingKeys.endSent);

    return sendTrackingEvent("end").catch(function (err) {
      console.error(err);
    });
  }

  function completeTrackingSession() {
    markTrackingFlag(trackingKeys.completed);
  }

  function progressIndex(key) {
    return config.progress.findIndex(function (item) {
      return item.key === key;
    });
  }

  function renderProgress(activeKey) {
    var activeIndex = progressIndex(activeKey);
    progressRoot.innerHTML = config.progress.map(function (item, index) {
      var state = "";
      var marker = index + 1;

      if (index < activeIndex) {
        state = "is-done";
        marker = "✓";
      }

      if (index === activeIndex) {
        state = "is-active";
      }

      return [
        '<span class="progress-step ' + state + '">',
        '<span class="progress-dot">' + marker + "</span>",
        '<span class="progress-label">' + escapeHtml(item.label) + "</span>",
        "</span>"
      ].join("");
    }).join("");
  }

  function isVideoAsset(path) {
    return /\.(mp4|webm|ogg)$/i.test(path);
  }

  function resolveAssetPath(path) {
    return preloadedMediaSources[path] || path;
  }

  function mediaConfigPaths(items) {
    return Object.keys(items || {}).map(function (key) {
      return items[key];
    }).filter(Boolean);
  }

  function collectMediaPaths() {
    var seen = {};

    return mediaConfigPaths(config.sceneImages)
      .concat(mediaConfigPaths(config.heroImages))
      .filter(function (path) {
        if (seen[path]) {
          return false;
        }

        seen[path] = true;
        return true;
      });
  }

  function renderPreloader(done, total) {
    var percent = total ? Math.round((done / total) * 100) : 100;
    var preloadScreen = root.querySelector(".preload-screen");
    var preloadBar = root.querySelector(".preload-bar");
    var preloadBarFill = root.querySelector(".preload-bar span");
    var preloadPercent = root.querySelector(".preload-percent");

    if (!preloadScreen) {
      progressRoot.innerHTML = "";
      root.innerHTML = [
        '<article class="preload-screen" aria-live="polite">',
        '<div class="preload-copy">',
        "<h2>Завантажуємо гру</h2>",
        "<p>Підготовка до твого першого дня в NOVUS. Лишилось кілька секунд...</p>",
        "</div>",
        '<div class="preload-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + percent + '">',
        '<span style="width: ' + percent + '%"></span>',
        "</div>",
        '<p class="preload-percent">' + percent + "%</p>",
        "</article>"
      ].join("");
      return;
    }

    preloadBar.setAttribute("aria-valuenow", percent);
    preloadBarFill.style.width = percent + "%";
    preloadPercent.textContent = percent + "%";
  }

  function markAssetDone(state) {
    state.done += 1;
    renderPreloader(state.done, state.total);
  }

  function preloadImage(path) {
    return new Promise(function (resolve) {
      var image = new Image();

      image.decoding = "async";
      image.onload = function () {
        if (image.decode) {
          image.decode().catch(function () {}).then(resolve);
          return;
        }

        resolve();
      };
      image.onerror = function () {
        console.warn("NOVUS asset failed to preload:", path);
        resolve();
      };
      image.src = path;
    });
  }

  function preloadVideoElement(src, originalPath) {
    return new Promise(function (resolve) {
      var video = document.createElement("video");
      var finish = function () {
        video.removeEventListener("canplaythrough", finish);
        video.removeEventListener("loadeddata", finish);
        video.removeEventListener("error", fail);
        video.removeAttribute("src");
        video.load();
        resolve();
      };
      var fail = function () {
        console.warn("NOVUS video failed to preload:", originalPath);
        finish();
      };

      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.addEventListener("canplaythrough", finish, { once: true });
      video.addEventListener("loadeddata", finish, { once: true });
      video.addEventListener("error", fail, { once: true });
      video.src = src;
      video.load();
    });
  }

  function preloadVideo(path) {
    if (!window.fetch || !window.URL || !window.URL.createObjectURL) {
      return preloadVideoElement(path, path);
    }

    return fetch(path, { cache: "force-cache" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Video preload failed: " + response.status);
        }

        return response.blob();
      })
      .then(function (blob) {
        var objectUrl = URL.createObjectURL(blob);

        preloadedMediaSources[path] = objectUrl;
        preloadedVideoObjectUrls.push(objectUrl);
        return preloadVideoElement(objectUrl, path);
      })
      .catch(function () {
        return preloadVideoElement(path, path);
      });
  }

  function preloadAsset(path) {
    return isVideoAsset(path) ? preloadVideo(path) : preloadImage(path);
  }

  function preloadGameAssets() {
    var paths = collectMediaPaths();
    var state = {
      done: 0,
      total: paths.length
    };

    renderPreloader(0, state.total);

    if (!paths.length) {
      return Promise.resolve();
    }

    return Promise.all(paths.map(function (path) {
      return preloadAsset(path).then(function () {
        markAssetDone(state);
      });
    })).then(function () {});
  }

  function sceneMarkup(screen) {
    var scene = data.scenes[screen.scene] || data.scenes.start;
    var originalPath = config.sceneImages[screen.scene];
    var imagePath = resolveAssetPath(originalPath);

    if (originalPath) {
      if (isVideoAsset(originalPath)) {
        return [
          '<figure class="scene scene-image scene-video scene-' + escapeHtml(screen.scene) + '">',
          '<video src="' + escapeHtml(imagePath) + '" autoplay loop muted playsinline preload="auto" aria-label="' + escapeHtml(scene.label) + '" onerror="this.parentElement.classList.add(\'is-image-error\', \'scene-placeholder\'); this.remove();"></video>',
          '<span class="scene-icon" aria-hidden="true">' + escapeHtml(scene.icon) + "</span>",
          '<figcaption>' + escapeHtml(scene.label) + "</figcaption>",
          "</figure>"
        ].join("");
      }

      return [
        '<figure class="scene scene-image scene-' + escapeHtml(screen.scene) + '">',
        '<img src="' + escapeHtml(imagePath) + '" alt="' + escapeHtml(scene.label) + '" onerror="this.parentElement.classList.add(\'is-image-error\', \'scene-placeholder\'); this.remove();">',
        '<span class="scene-icon" aria-hidden="true">' + escapeHtml(scene.icon) + "</span>",
        '<figcaption>' + escapeHtml(scene.label) + "</figcaption>",
        "</figure>"
      ].join("");
    }

    return [
      '<figure class="scene scene-placeholder scene-' + escapeHtml(screen.scene) + '">',
      '<span class="scene-icon" aria-hidden="true">' + escapeHtml(scene.icon) + "</span>",
      '<figcaption>' + escapeHtml(scene.label) + "</figcaption>",
      "</figure>"
    ].join("");
  }

  function heroMarkup(heroKey) {
    var imagePath = resolveAssetPath(config.heroImages[heroKey]);
    var heroClass = "hero hero-" + heroKey;
    var fallback = '<div class="' + heroClass + ' hero-placeholder" aria-label="Герой NOVUS"><span>N</span></div>';

    if (!imagePath) {
      return fallback;
    }

    return [
      '<div class="' + heroClass + '">',
      '<img src="' + escapeHtml(imagePath) + '" alt="Герой NOVUS" onerror="this.parentElement.classList.add(\'hero-placeholder\'); var s=document.createElement(\'span\'); s.textContent=\'N\'; this.parentElement.appendChild(s); this.remove();">',
      "</div>"
    ].join("");
  }

  function setHeroImage(heroKey) {
    var hero = root.querySelector(".hero");
    var imagePath = resolveAssetPath(config.heroImages[heroKey]);

    if (!hero || !imagePath) {
      return;
    }

    hero.className = "hero hero-" + heroKey;
    hero.innerHTML = '<img src="' + escapeHtml(imagePath) + '" alt="Hero NOVUS" onerror="this.parentElement.classList.add(\'hero-placeholder\'); var s=document.createElement(\'span\'); s.textContent=\'N\'; this.parentElement.appendChild(s); this.remove();">';
  }

  function formatInlineText(value) {
    var text = String(value || "");
    var pattern = /(\*\*([^*]+)\*\*|\[\[([^\]]+)\]\])/g;
    var result = "";
    var lastIndex = 0;
    var match;

    while ((match = pattern.exec(text)) !== null) {
      result += escapeHtml(text.slice(lastIndex, match.index));

      if (match[2]) {
        result += "<strong>" + escapeHtml(match[2]) + "</strong>";
      } else {
        result += '<span class="text-accent">' + escapeHtml(match[3]) + "</span>";
      }

      lastIndex = pattern.lastIndex;
    }

    return result + escapeHtml(text.slice(lastIndex));
  }

  function textMarkup(lines) {
    return (lines || []).map(function (line) {
      return "<p>" + formatInlineText(line) + "</p>";
    }).join("");
  }

  function feedbackMarkup() {
    if (!feedback) {
      return '<div class="feedback" aria-live="assertive"></div>';
    }

    return '<div class="feedback feedback-' + feedbackType + '" aria-live="assertive">' + escapeHtml(feedback) + "</div>";
  }

  function renderShell(screen, bodyMarkup, extraClass) {
    var isFinalScreen = screen.id === "final";
    var isStartScreen = screen.id === "start";
    var isRoleChoiceScreen = screen.id === "roleChoice";
    var isDeclineThanksScreen = screen.id === "declineThanks";
    var storyTextClass = "story-text" + (isFinalScreen ? " story-text-final" : "") 
    + (isStartScreen ? " story-text-start" : "") 
    + (isRoleChoiceScreen ? " story-text-start" : "") 
    + (isDeclineThanksScreen ? " story-text-start" : "");
    var titleClass = "screen-title" + (isFinalScreen ? " screen-title-final" : "") 
    + (isStartScreen ? " screen-title-start" : "") 
    + (isRoleChoiceScreen ? " screen-title-start" : "")
    + (isDeclineThanksScreen ? " screen-title-start" : "");

    renderProgress(screen.progress);

    root.innerHTML = [
      '<article class="screen ' + (extraClass || "") + '">',
      '<div class="visual-row">',
      sceneMarkup(screen),
      screen.showHeroOverlay === false ? "" : heroMarkup(screen.hero),
      "</div>",
      '<div class="content-block">',
      '<h2 class="' + titleClass + '">' + escapeHtml(screen.title) + "</h2>",
      '<div class="' + storyTextClass + '">' + textMarkup(screen.text) + "</div>",
      bodyMarkup,
      "</div>",
      "</article>"
    ].join("");
  }

  function actionButtons(actions) {
    return [
      '<div class="button-stack">',
      actions.map(function (action) {
        return [
          '<button class="btn ' + (action.primary ? "btn-primary" : "btn-secondary") + " " + (action.pulse ? "btn-pulse" : "") + '" ',
          'type="button" data-next="' + escapeHtml(action.next) + '">',
          escapeHtml(action.label),
          "</button>"
        ].join("");
      }).join(""),
      "</div>"
    ].join("");
  }

  function answerButton(answer, isMulti) {
    var classes = ["answer-btn"];

    if (selectedMulti.indexOf(answer.id) !== -1) {
      classes.push("is-selected");
    }

    if (revealCorrect && answer.correct) {
      classes.push("is-correct");
    }

    return [
      '<button class="' + classes.join(" ") + '" type="button" data-answer="' + escapeHtml(answer.id) + '" aria-pressed="' + (isMulti && selectedMulti.indexOf(answer.id) !== -1 ? "true" : "false") + '">',
      '<span class="answer-check">✓</span>',
      '<span>' + escapeHtml(answer.label) + "</span>",
      "</button>"
    ].join("");
  }

  function questionMarkup(screen) {
    return [
      screen.note ? '<p class="question-note">' + escapeHtml(screen.note) + "</p>" : "",
      '<div class="answers">',
      screen.answers.map(function (answer) {
        return answerButton(answer, screen.type === "multi");
      }).join(""),
      "</div>",
      screen.type === "multi" ? '<button class="btn btn-primary btn-submit-answer" type="button" data-submit-multi>Підтвердити вибір</button>' : "",
      feedbackMarkup(),
      '<button class="btn btn-primary btn-next-question is-hidden" type="button" data-next-question>Далі</button>'
    ].join("");
  }

  function renderContent(screen) {
    renderShell(screen, actionButtons(screen.actions), "screen-content");
  }

  function renderChoice(screen) {
    renderShell(screen, actionButtons(screen.actions), "screen-choice");
  }

  function renderQuestion(screen) {
    renderShell(screen, questionMarkup(screen), "screen-question");
  }

  function renderRole(screen) {
    var buttons = screen.roles.map(function (role) {
      return [
        '<button class="role-btn" type="button" data-role-next="' + escapeHtml(role.next) + '" data-role="' + escapeHtml(role.position) + '">',
        '<span class="role-title">' + escapeHtml(role.label) + "</span>",
        '<span class="role-subtitle">Почати практику</span>',
        "</button>"
      ].join("");
    }).join("");

    renderShell(screen, '<div class="role-grid">' + buttons + "</div>", "screen-role");
  }

  function formOptions(items, selectedValue) {
    return '<option value="">Оберіть варіант</option>' + items.map(function (item) {
      var selected = item === selectedValue ? " selected" : "";
      return '<option value="' + escapeHtml(item) + '"' + selected + ">" + escapeHtml(item) + "</option>";
    }).join("");
  }

  function renderFinalForm(screen) {
    var role = gameState.selectedRole || "";
    var form = [
      '<form class="lead-form" id="leadForm" novalidate>',
      '<label>Ім’я та прізвище<input name="name" type="text" autocomplete="name" placeholder="Наприклад: Іван Петренко" required></label>',
      '<label>Посада<select name="position" required>' + formOptions(config.positions, role) + "</select></label>",
      '<label>Вік<input name="age" type="number" inputmode="numeric" min="1" placeholder="Наприклад: 24" required></label>',
      '<label>Зручний район<select name="district" required>' + formOptions(config.districts, "") + "</select></label>",
      '<label>Номер телефону<input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+38 (0XX) XXX-XX-XX" required></label>',
      '<label class="consent-row"><input name="consent" type="checkbox" required><span>Підтверджую згоду на обробку персональних даних для зв’язку щодо вакансій NOVUS.</span></label>',
      '<div class="form-error" id="formError" aria-live="assertive"></div>',
      '<button class="btn btn-primary" type="submit">Надіслати анкету</button>',
      '<button class="btn btn-secondary btn-decline-lead" type="button" data-decline-lead>Дякую. Мені це не цікаво.</button>',
      "</form>"
    ].join("");

    renderShell(screen, '<div class="confetti" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>' + form, "screen-final");
    trackEnd();
  }

  function renderThanks(screen) {
    var confetti = screen.id === "declineThanks" ? "" : '<div class="confetti" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>';

    renderShell(screen, confetti, "screen-thanks");
  }

  function render() {
    var screen = currentScreen();

    if (!screen) {
      throw new Error("Unknown screen: " + currentScreenId);
    }

    if (screen.type === "content") {
      renderContent(screen);
    } else if (screen.type === "choice") {
      renderChoice(screen);
    } else if (screen.type === "question" || screen.type === "multi") {
      renderQuestion(screen);
    } else if (screen.type === "role") {
      renderRole(screen);
    } else if (screen.type === "finalForm") {
      renderFinalForm(screen);
    } else if (screen.type === "thanks") {
      renderThanks(screen);
    }
  }

  function goTo(nextId) {
    currentScreenId = nextId;
    wrongCount = 0;
    revealCorrect = false;
    feedback = "";
    feedbackType = "";
    selectedMulti = [];
    isTransitioning = false;
    pendingNextScreenId = "";
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function findAnswer(screen, answerId) {
    return screen.answers.find(function (answer) {
      return answer.id === answerId;
    });
  }

  function setFeedback(message, type) {
    var feedbackEl = root.querySelector(".feedback");

    feedback = message || "";
    feedbackType = type || "";

    if (!feedbackEl) {
      return;
    }

    feedbackEl.className = "feedback" + (feedbackType ? " feedback-" + feedbackType : "");
    feedbackEl.textContent = feedback;

    if (feedbackType === "error" || feedbackType === "info") {
      feedbackEl.style.animation = "none";
      feedbackEl.offsetHeight;
      feedbackEl.style.animation = "";
    }
  }

  function answerButtonById(answerId) {
    var buttons = root.querySelectorAll("[data-answer]");
    var found = null;

    buttons.forEach(function (button) {
      if (button.getAttribute("data-answer") === answerId) {
        found = button;
      }
    });

    return found;
  }

  function syncAnswerStates() {
    var screen = currentScreen();

    root.querySelectorAll("[data-answer]").forEach(function (button) {
      var answerId = button.getAttribute("data-answer");
      var answer = findAnswer(screen, answerId);
      var isSelected = selectedMulti.indexOf(answerId) !== -1;

      button.classList.toggle("is-selected", isSelected);
      button.classList.toggle("is-correct", Boolean(revealCorrect && answer && answer.correct));
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });
  }

  function disableAnswers() {
    root.querySelectorAll("[data-answer], [data-submit-multi]").forEach(function (button) {
      button.disabled = true;
    });
  }

  function showNextQuestionButton() {
    var nextButton = root.querySelector("[data-next-question]");

    if (nextButton) {
      nextButton.classList.remove("is-hidden");
      nextButton.focus({ preventScroll: true });
    }
  }

  function clearWrongState() {
    root.querySelectorAll(".answer-btn.is-wrong").forEach(function (button) {
      button.classList.remove("is-wrong");
    });
  }

  function markWrongButton(answerId) {
    var button = answerButtonById(answerId);

    clearWrongState();

    if (button) {
      button.classList.add("is-wrong");
    }
  }

  function markWrongMultiButtons() {
    var screen = currentScreen();

    clearWrongState();
    selectedMulti.forEach(function (answerId) {
      var answer = findAnswer(screen, answerId);
      var button = answerButtonById(answerId);

      if (button && (!answer || !answer.correct)) {
        button.classList.add("is-wrong");
      }
    });
  }

  function markCorrectAndMove(screen, answerId) {
    isTransitioning = true;
    pendingNextScreenId = screen.next;
    clearWrongState();
    setHeroImage("happy");
    setFeedback(screen.success, "success");

    if (answerId) {
      var button = answerButtonById(answerId);

      if (button) {
        button.classList.add("is-correct");
      }
    } else {
      revealCorrect = true;
      syncAnswerStates();
    }

    disableAnswers();
    showNextQuestionButton();
  }

  function markWrong(screen, message, answerId) {
    wrongCount += 1;
    feedback = message || config.game.wrongText;
    feedbackType = "error";
    setHeroImage("support");

    if (answerId) {
      markWrongButton(answerId);
    }

    if (wrongCount >= 3) {
      revealCorrect = true;
      feedback = config.game.supportHint;
      feedbackType = "hint";
    }

    setFeedback(feedback, feedbackType);
    syncAnswerStates();
  }

  function handleSingleAnswer(answerId) {
    if (isTransitioning) {
      return;
    }

    var screen = currentScreen();
    var answer = findAnswer(screen, answerId);

    if (!answer) {
      return;
    }

    if (answer.correct) {
      markCorrectAndMove(screen, answer.id);
      return;
    }

    markWrong(screen, "", answer.id);
  }

  function handleMultiAnswer(answerId) {
    var screen = currentScreen();
    var maxCount = screen.requiredCount || 3;
    var index = selectedMulti.indexOf(answerId);

    if (index !== -1) {
      selectedMulti.splice(index, 1);
    } else if (selectedMulti.length < maxCount) {
      selectedMulti.push(answerId);
    }

    clearWrongState();
    syncAnswerStates();
    setFeedback("", "");
  }

  function submitMulti() {
    if (isTransitioning) {
      return;
    }

    var screen = currentScreen();
    var requiredCount = screen.requiredCount || 3;

    if (selectedMulti.length !== requiredCount) {
      setFeedback("Оберіть рівно " + requiredCount + " варіанти.", "info");
      return;
    }

    var selectedAnswers = selectedMulti.map(function (id) {
      return findAnswer(screen, id);
    });
    var correctSelected = selectedAnswers.filter(function (answer) {
      return answer && answer.correct;
    }).length;
    var allCorrect = selectedAnswers.every(function (answer) {
      return answer && answer.correct;
    });

    if (allCorrect && correctSelected === requiredCount) {
      markCorrectAndMove(screen);
      return;
    }

    markWrongMultiButtons();

    if (correctSelected === requiredCount - 1) {
      markWrong(screen, screen.closeText);
      return;
    }

    markWrong(screen);
  }

  function formatPhone(rawValue) {
    var digits = rawValue.replace(/\D/g, "");

    if (!digits) {
      return "";
    }

    if (digits.indexOf("380") === 0) {
      digits = digits.slice(3);
    } else if (digits.indexOf("38") === 0) {
      digits = digits.slice(2);
    } else if (digits.indexOf("0") === 0) {
      digits = digits.slice(1);
    }

    digits = digits.slice(0, 9);

    if (!digits) {
      return "";
    }

    var code = digits.slice(0, 2);
    var first = digits.slice(2, 5);
    var second = digits.slice(5, 7);
    var third = digits.slice(7, 9);
    var value = "+38 (0";

    value += code;
    if (code.length === 2) {
      value += ")";
    }
    if (first) {
      value += " " + first;
    }
    if (second) {
      value += "-" + second;
    }
    if (third) {
      value += "-" + third;
    }

    return value;
  }

  function isValidPhone(phone) {
    return /^\+38 \(0\d{2}\) \d{3}-\d{2}-\d{2}$/.test(phone);
  }

  function normalizePhoneForSubmit(phone) {
    return phone.replace(/\D/g, "");
  }

  function formControl(form, name) {
    return form.elements.namedItem(name);
  }

  function formPayload(form) {
    return {
      name: formControl(form, "name").value.trim(),
      position: formControl(form, "position").value,
      gameRole: gameState.selectedRole,
      age: formControl(form, "age").value.trim(),
      district: formControl(form, "district").value,
      phone: formControl(form, "phone").value.trim(),
      consent: formControl(form, "consent").checked ? "Так" : "Ні"
    };
  }

  function validateForm(form) {
    var payload = formPayload(form);

    if (!payload.name) {
      return "Заповніть ім’я та прізвище.";
    }
    if (!payload.position) {
      return "Оберіть посаду.";
    }
    if (!payload.age) {
      return "Вкажіть вік.";
    }
    if (!payload.district) {
      return "Оберіть зручний район.";
    }
    if (!isValidPhone(payload.phone)) {
      return "Вкажіть номер телефону у форматі +38 (0XX) XXX-XX-XX.";
    }
    if (!formControl(form, "consent").checked) {
      return "Підтвердьте згоду на обробку персональних даних.";
    }

    return "";
  }

  function sendForm(payload) {
    return sendTrackingEvent("submit", payload);
  }

  function handleFormSubmit(form) {
    var errorBox = document.getElementById("formError");
    var submitButton = form.querySelector('button[type="submit"]');
    var error = validateForm(form);

    if (error) {
      errorBox.textContent = error;
      return;
    }

    errorBox.textContent = "";
    submitButton.disabled = true;
    submitButton.textContent = "Надсилаємо...";

    var payload = formPayload(form);
    payload.phone = normalizePhoneForSubmit(payload.phone);

    sendForm(payload)
      .catch(function (err) {
        console.error(err);
      })
      .then(function () {
        completeTrackingSession();
        goTo("thanks");
      });
  }

  function handleDeclineLead(button) {
    button.disabled = true;
    button.textContent = "Дякуємо...";

    markTrackingFlag(trackingKeys.endSent);

    sendTrackingEvent("decline")
      .catch(function (err) {
        console.error(err);
      })
      .then(function () {
        completeTrackingSession();
        goTo("declineThanks");
      });
  }

  root.addEventListener("click", function (event) {
    var nextButton = event.target.closest("[data-next]");
    var nextQuestionButton = event.target.closest("[data-next-question]");
    var answerButtonEl = event.target.closest("[data-answer]");
    var roleButton = event.target.closest("[data-role-next]");
    var multiSubmit = event.target.closest("[data-submit-multi]");
    var declineButton = event.target.closest("[data-decline-lead]");

    if (nextButton) {
      if (currentScreenId === config.game.firstScreen) {
        trackStart();
      }

      goTo(nextButton.getAttribute("data-next"));
      return;
    }

    if (declineButton) {
      handleDeclineLead(declineButton);
      return;
    }

    if (nextQuestionButton && pendingNextScreenId) {
      goTo(pendingNextScreenId);
      return;
    }

    if (roleButton) {
      gameState.selectedRole = roleButton.getAttribute("data-role");
      goTo(roleButton.getAttribute("data-role-next"));
      return;
    }

    if (answerButtonEl) {
      if (currentScreen().type === "multi") {
        handleMultiAnswer(answerButtonEl.getAttribute("data-answer"));
      } else {
        handleSingleAnswer(answerButtonEl.getAttribute("data-answer"));
      }
      return;
    }

    if (multiSubmit) {
      submitMulti();
    }
  });

  root.addEventListener("input", function (event) {
    if (event.target.name === "phone") {
      event.target.value = formatPhone(event.target.value);
    }
  });

  root.addEventListener("submit", function (event) {
    if (event.target.id === "leadForm") {
      event.preventDefault();
      handleFormSubmit(event.target);
    }
  });

  preloadGameAssets().then(function () {
    render();
  });

  window.addEventListener("beforeunload", function () {
    preloadedVideoObjectUrls.forEach(function (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    });
  });
})();

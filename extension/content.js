(async function () {
  const SERVER = "https://supportassist.begoodvpn.com/suggest";
  const FEEDBACK_SERVER = "https://supportassist.begoodvpn.com/feedback";
  const TIMEOUT_MS = 10000;

  const SELF_SENDER_HINTS = [
    "robert bidgood",
    "begoodvpn.com team",
    "info@begoodvpn.com",
    "support@begoodvpn.com"
  ];

  const AUTO_RUN_ENABLED = true;
  const AUTO_RUN_POLL_MS = 1500;

  const SUPPORT_KEYWORDS = [
    "not working", "doesn't work", "doesnt work", "won't work", "wont work",
    "blank screen", "black screen", "empty", "no channels", "no series",
    "buffer", "buffering", "freezing", "freeze", "lag",
    "login", "log in", "sign in", "invalid", "username", "password",
    "code", "activation", "activate",
    "app missing", "app gone", "can't find", "cant find", "disappeared",
    "install", "installer", "downloader", "developer options",
    "renew", "renewal", "payment", "etransfer", "e-transfer", "transfer"
  ];

  function safeText(el) {
    return (el?.innerText || "").trim();
  }

  function normalize(s) {
    return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function isSelfSender(senderTextRaw) {
    const sender = normalize(senderTextRaw);
    if (!sender) return false;
    return SELF_SENDER_HINTS.some(h => sender.includes(h));
  }

  function isTypingContext(el) {
    if (!el) return false;
    const tag = (el.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea") return true;
    if (el.isContentEditable) return true;
    return false;
  }

  function escapeHtml(s) {
    return (s || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
  }

  function insertIntoCompose(url) {
    const editable =
      document.querySelector("div[aria-label='Message Body']") ||
      document.querySelector("div[role='textbox']");

    if (!editable) {
      alert("Open a reply box first.");
      return;
    }

    editable.focus();
    document.execCommand("insertText", false, "\n" + url + "\n");
  }

  function getSubjectText() {
    const h2 = document.querySelector("h2.hP");
    const subject = safeText(h2);
    if (subject) return subject;

    const alt = document.querySelector("[data-legacy-thread-id] h2");
    return safeText(alt) || "";
  }

  function getLastCustomerMessages(n) {
    const main = document.querySelector("div[role='main']");
    if (!main) return [];

    const items = Array.from(main.querySelectorAll("div[role='listitem']"));
    const found = [];

    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];

      const senderEl =
        item.querySelector("span.gD") ||
        item.querySelector("span.g2") ||
        item.querySelector("[email]");

      const senderText = safeText(senderEl);

      const bodyEl =
        item.querySelector("div.a3s.aiL") ||
        item.querySelector("div.a3s");

      const bodyText = safeText(bodyEl);

      if (!bodyText) continue;
      if (isSelfSender(senderText)) continue;

      found.push(bodyText);
      if (found.length >= n) break;
    }

    return found;
  }

  function getEmailTextForAI() {
    const subject = getSubjectText();
    const msgs = getLastCustomerMessages(2);
    const latest = msgs[0] || "";
    const prev = msgs[1] || "";

    if (latest) {
      let combined = `Subject: ${subject || "(no subject)"}\n\nLatest customer message:\n${latest}`;
      if (prev) {
        combined += `\n\nPrevious customer message:\n${prev}`;
      }
      return combined.slice(0, 8000);
    }

    const convo = document.querySelector("div[role='main']");
    if (!convo) return "";

    return (convo.innerText || "").trim().slice(0, 8000);
  }

  function looksLikeSupportEmail() {
    const subject = normalize(getSubjectText());
    const msgs = getLastCustomerMessages(1);
    const latest = normalize(msgs[0] || "");
    const haystack = `${subject}\n${latest}`.trim();

    if (!haystack) return false;
    return SUPPORT_KEYWORDS.some(k => haystack.includes(k));
  }

  async function fetchSuggestions(text) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(SERVER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, top_k: 3 }),
        signal: controller.signal
      });

      if (!res.ok) {
        throw new Error(`Server error ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      if (err && err.name === "AbortError") {
        throw new Error("AI server timeout");
      }
      throw err;
    } finally {
      clearTimeout(t);
    }
  }

  async function sendFeedback(emailText, articleId) {
    try {
      await fetch(FEEDBACK_SERVER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailText,
          article: articleId
        })
      });
    } catch (err) {
      console.log("Feedback logging failed:", err);
    }
  }

  function removePanel() {
    const existing = document.getElementById("kb-suggest-panel");
    if (existing) existing.remove();
  }

  function ensurePanel() {
    let panel = document.getElementById("kb-suggest-panel");
    if (panel) return panel;

    panel = document.createElement("div");
    panel.id = "kb-suggest-panel";
    panel.style.position = "fixed";
    panel.style.top = "100px";
    panel.style.right = "16px";
    panel.style.width = "360px";
    panel.style.maxHeight = "70vh";
    panel.style.overflow = "auto";
    panel.style.zIndex = "999999";
    panel.style.background = "white";
    panel.style.border = "1px solid #ccc";
    panel.style.borderRadius = "10px";
    panel.style.boxShadow = "0 4px 14px rgba(0,0,0,0.15)";
    panel.style.fontFamily = "Arial, sans-serif";
    panel.style.fontSize = "13px";
    panel.style.padding = "12px";

    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-weight:700;">KB Suggestions</div>
        <button id="kb-close" style="border:none;background:#eee;border-radius:6px;padding:4px 8px;cursor:pointer;">X</button>
      </div>

      <div style="margin-top:8px;">
        <button id="kb-run" style="width:100%;padding:8px;border:none;border-radius:8px;cursor:pointer;background:#1a73e8;color:white;font-weight:700;">
          Suggest Articles
        </button>
      </div>

      <div style="margin-top:8px;color:#666;font-size:12px;">
        Auto-run triggers on support-looking emails. Toggle panel: press <b>Z</b>
      </div>

      <div id="kb-status" style="margin-top:10px;color:#555;"></div>
      <div id="kb-results" style="margin-top:10px;"></div>
    `;

    document.body.appendChild(panel);

    panel.querySelector("#kb-close").onclick = () => removePanel();
    panel.querySelector("#kb-run").onclick = () => runSuggestions("manual");

    return panel;
  }

  function renderResults(data) {
    const panel = ensurePanel();
    const status = panel.querySelector("#kb-status");
    const results = panel.querySelector("#kb-results");

    status.textContent = `Confidence: ${data.confidence}`;
    results.innerHTML = "";

    if (!data.results || !data.results.length) {
      results.innerHTML = "<div style='color:#777;'>No suggestions returned.</div>";
      return;
    }

    data.results.forEach((r, idx) => {
      const div = document.createElement("div");
      div.style.borderTop = "1px solid #eee";
      div.style.paddingTop = "8px";
      div.style.marginTop = "8px";

      div.innerHTML = `
        <div style="font-weight:700;">${idx + 1}. ${escapeHtml(r.title)}</div>
        <div style="font-size:11px;color:#666;">Matched customer text</div>
        <div style="margin-top:4px;word-break:break-all;">
          <a href="${r.url}" target="_blank" rel="noreferrer">${r.url}</a>
        </div>
        <div style="margin-top:6px;display:flex;gap:8px;align-items:center;">
          <button style="flex:1;padding:6px 8px;border:none;border-radius:8px;background:#34a853;color:white;cursor:pointer;font-weight:700;">
            INSERT
          </button>
          <button style="padding:6px 12px;border:1px solid #ccc;border-radius:8px;background:#fff;cursor:pointer;">
            VIEW
          </button>
          <button style="padding:6px 12px;border:1px solid #ccc;border-radius:8px;background:#fff;cursor:pointer;">
            COPY
          </button>
        </div>
      `;

      const buttons = div.querySelectorAll("button");

      buttons[0].onclick = async () => {
        insertIntoCompose(r.url);
        await sendFeedback(getEmailTextForAI(), r.id);
      };

      buttons[1].onclick = () => window.open(r.url, "_blank", "noopener,noreferrer");

      buttons[2].onclick = () => copyToClipboard(r.url);

      results.appendChild(div);
    });
  }

  let lastAutoSignature = "";
  let inFlight = false;

  function computeThreadSignature() {
    const hash = window.location.hash || "";
    const subject = getSubjectText() || "";
    const latest = getLastCustomerMessages(1)[0] || "";
    const latestHead = latest.slice(0, 180);
    return `${hash}||${subject}||${latestHead}`;
  }

  function refreshReadyUI() {
    const panel = ensurePanel();
    const status = panel.querySelector("#kb-status");
    if (!status.textContent) {
      status.textContent = "Ready.";
    }
  }

  async function runSuggestions(source) {
    const panel = ensurePanel();
    const status = panel.querySelector("#kb-status");
    const results = panel.querySelector("#kb-results");

    if (inFlight) return;
    inFlight = true;

    status.textContent = source === "auto" ? "Analyzing support email..." : "Working...";
    results.innerHTML = "";

    try {
      const emailText = getEmailTextForAI();
      if (!emailText) {
        status.textContent = "No email text found. Open an email first.";
        return;
      }

      const data = await fetchSuggestions(emailText);
      renderResults(data);
    } catch (e) {
      status.textContent = "Error: " + e.message;
    } finally {
      inFlight = false;
    }
  }

  function tryAutoRunNow() {
    const panel = document.getElementById("kb-suggest-panel");
    if (!panel) return;

    const sig = computeThreadSignature();
    if (!sig) return;

    if (sig !== lastAutoSignature) {
      lastAutoSignature = sig;
    }

    if (looksLikeSupportEmail()) {
      runSuggestions("auto");
    } else {
      const status = panel.querySelector("#kb-status");
      const results = panel.querySelector("#kb-results");
      if (status) status.textContent = "Auto: skipped (not a support email).";
      if (results) results.innerHTML = "";
    }
  }

  document.addEventListener("keydown", (e) => {
    if (isTypingContext(document.activeElement)) return;

    if (e.key && e.key.toLowerCase() === "z") {
      const existing = document.getElementById("kb-suggest-panel");
      if (existing) {
        removePanel();
      } else {
        ensurePanel();
        refreshReadyUI();
        setTimeout(tryAutoRunNow, 300);
      }
    }
  });

  function startAutoRunLoop() {
    if (!AUTO_RUN_ENABLED) return;

    setInterval(() => {
      const panel = document.getElementById("kb-suggest-panel");
      if (!panel) return;
      if (isTypingContext(document.activeElement)) return;

      const sig = computeThreadSignature();
      if (!sig) return;

      if (sig !== lastAutoSignature) {
        lastAutoSignature = sig;

        if (looksLikeSupportEmail()) {
          runSuggestions("auto");
        } else {
          const status = panel.querySelector("#kb-status");
          const results = panel.querySelector("#kb-results");
          if (status) status.textContent = "Auto: skipped (not a support email).";
          if (results) results.innerHTML = "";
        }
      }
    }, AUTO_RUN_POLL_MS);
  }

  setTimeout(() => {
    ensurePanel();
    refreshReadyUI();
    setTimeout(tryAutoRunNow, 300);
  }, 3000);

  startAutoRunLoop();
})();
// popup.js - ES module for DSA Spaced Repetition extension
import { createInitialProblem, applySM2, isDue } from "./sm2.js";

/** Utility: safe HTML escape */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Helper to format relative times */
function formatRelative(ts) {
  const diff = ts - Date.now();
  const sec = Math.round(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hrs = Math.round(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

/** Load all problems from chrome.storage */
function loadProblems() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["problems"], (result) => {
      resolve(result.problems || []);
    });
  });
}

/** Save updated problems array */
function saveProblems(problems) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ problems }, () => resolve());
  });
}

/** Render a single problem as a card */
function renderCard(p, isDueList) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.id = p.id;

  const titleLink = `<a href="${escapeHTML(p.url)}" target="_blank">${escapeHTML(p.title)}</a>`;
  const tags = [];
  if (p.topic) tags.push(`<span class="tag">${escapeHTML(p.topic)}</span>`);
  if (p.difficulty) tags.push(`<span class="tag">${escapeHTML(p.difficulty)}</span>`);
  if (isDueList) {
    tags.push(`<span class="tag">Interval: ${p.interval}d</span>`);
    tags.push(`<span class="tag">EF: ${p.easeFactor}</span>`);
  } else {
    const days = Math.ceil((p.nextReviewAt - Date.now()) / 86400000);
    tags.push(`<span class="tag">in ${days}d</span>`);
  }

  const ratingBtns = isDueList
    ? `
      <div class="rating-btns">
        <button data-quality="1" title="Hard">🔴</button>
        <button data-quality="3" title="Good">🟡</button>
        <button data-quality="5" title="Easy">🟢</button>
      </div>`
    : "";

  card.innerHTML = `
    <button class="delete-btn" title="Delete">✕</button>
    <div class="problem-info">
      ${titleLink}
      <div class="tags">
        ${tags.join(" ")}
      </div>
    </div>
    ${ratingBtns}
  `;
  return card;
}

/** Render UI sections */
async function render() {
  const problems = await loadProblems();
  const now = Date.now();
  const due = problems.filter((p) => isDue(p, now));
  const upcoming = problems
    .filter((p) => !isDue(p, now))
    .sort((a, b) => a.nextReviewAt - b.nextReviewAt);

  // Header badge
  const dueCountEl = document.getElementById("due-count");
  dueCountEl.textContent = due.length > 0 ? due.length : "";

  // Due list count label
  document.getElementById("due-list-count").textContent = due.length;

  // Replace ULs with card containers (empty them first)
  const dueContainer = document.getElementById("due-list");
  dueContainer.innerHTML = "";
  due.forEach((p) => dueContainer.appendChild(renderCard(p, true)));

  const upcomingContainer = document.getElementById("upcoming-list");
  upcomingContainer.innerHTML = "";
  upcoming.forEach((p) => upcomingContainer.appendChild(renderCard(p, false)));

  // Populate topic filter (if present)
  const topicSelect = document.getElementById("topic-filter");
  if (topicSelect) {
    const topics = Array.from(new Set(problems.map((p) => p.topic).filter(Boolean)));
    topicSelect.innerHTML = `<option>All Topics</option>` + topics
      .map((t) => `<option>${escapeHTML(t)}</option>`)
      .join("");
  }
}

/** Fill current tab – now also receives data from content script */
function fillCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) return;
    const tab = tabs[0];
    // Fallback basic fill (title/url) – content script may later overwrite with richer data
    document.getElementById("title").value = tab.title || "";
    document.getElementById("url").value = tab.url || "";
    // Ask the tab to run content script (already injected via manifest)
    chrome.tabs.sendMessage(tab.id, { type: "requestFill" }, () => {});
  });
}

/** Receive messages from content script */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "fillFromPage" && msg.payload) {
    const { title, url, topic, difficulty } = msg.payload;
    if (title) document.getElementById("title").value = title;
    if (url) document.getElementById("url").value = url;
    if (topic) document.getElementById("topic").value = topic;
    if (difficulty) document.getElementById("difficulty").value = difficulty;
  }
});

/** Add problem form submission */
async function handleAdd(e) {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  if (!title) return;
  const topic = document.getElementById("topic").value.trim();
  const difficulty = document.getElementById("difficulty").value;
  const url = document.getElementById("url").value.trim();
  const newProblem = createInitialProblem({ title, url, topic, difficulty });
  const problems = await loadProblems();
  problems.push(newProblem);
  await saveProblems(problems);
  e.target.reset();
  render();
}

/** Rating button click handler */
async function handleRating(e) {
  const btn = e.target.closest("button[data-quality]");
  if (!btn) return;
  const card = btn.closest(".card");
  const id = card.dataset.id;
  const quality = Number(btn.dataset.quality);
  const problems = await loadProblems();
  const prob = problems.find((p) => p.id === id);
  if (!prob) return;
  applySM2(prob, quality);
  await saveProblems(problems);
  render();
}

/** Delete button handler */
async function handleDelete(e) {
  const btn = e.target.closest("button.delete-btn");
  if (!btn) return;
  const card = btn.closest(".card");
  const id = card.dataset.id;
  const problems = await loadProblems();
  const filtered = problems.filter((p) => p.id !== id);
  await saveProblems(filtered);
  render();
}

/** Export / Import handlers */
async function exportJSON() {
  const problems = await loadProblems();
  const blob = new Blob([JSON.stringify(problems, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dsa-spaced-repetition.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data)) {
        await saveProblems(data);
        render();
      } else {
        alert("Invalid JSON format – expected an array of problems.");
      }
    } catch (err) {
      alert("Failed to parse JSON: " + err.message);
    }
  };
  reader.readAsText(file);
}

/** Attach listeners */
function attachListeners() {
  document.getElementById("fill-tab").addEventListener("click", fillCurrentTab);
  document.getElementById("add-form").addEventListener("submit", handleAdd);
  document.getElementById("due-list").addEventListener("click", (e) => {
    handleRating(e);
    handleDelete(e);
  });
  document.getElementById("upcoming-list").addEventListener("click", handleDelete);
  // Export / Import buttons
  document.getElementById("export").addEventListener("click", exportJSON);
  document.getElementById("import").addEventListener("click", () => document.getElementById("import-file").click());
  document.getElementById("import-file").addEventListener("change", importJSON);
}

// Initialisation
render();
attachListeners();

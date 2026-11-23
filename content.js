// content.js - runs on supported DSA sites and extracts problem data
(function() {
  // Helper to clean title suffixes
  const cleanTitle = (title) => {
    const suffixes = [" - LeetCode", " - Problem - Codeforces", " - HackerRank", " | LeetCode", " | Codeforces", " | HackerRank"];
    let cleaned = title;
    suffixes.forEach(s => {
      if (cleaned.endsWith(s)) cleaned = cleaned.slice(0, -s.length);
    });
    return cleaned.trim();
  };

  // Site‑specific extraction
  let data = { title: "", url: location.href, topic: "", difficulty: "" };
  const host = location.host;

  if (host.includes('leetcode.com')) {
    // LeetCode – title is in document.title, difficulty in .css-10o4wqw (or .detail__title)
    data.title = cleanTitle(document.title);
    const diffEl = document.querySelector('.css-10o4wqw, .detail__title');
    if (diffEl) {
      const txt = diffEl.textContent || '';
      const match = txt.match(/(Easy|Medium|Hard)/i);
      if (match) data.difficulty = match[0];
    }
    // Topic (tag) on LeetCode – .tag-labels .topic-tag
    const topicEl = document.querySelector('.topic-tag');
    if (topicEl) data.topic = topicEl.textContent.trim();
  } else if (host.includes('codeforces.com')) {
    // Codeforces – title in .title, difficulty in .property span, tags in .tag
    const titleEl = document.querySelector('.title');
    if (titleEl) data.title = cleanTitle(titleEl.textContent);
    const diffEl = document.querySelector('.property span');
    if (diffEl) {
      const match = diffEl.textContent.match(/(Easy|Medium|Hard)/i);
      if (match) data.difficulty = match[0];
    }
    const tagEls = document.querySelectorAll('.tag');
    if (tagEls.length) data.topic = Array.from(tagEls).map(t=>t.textContent.trim()).join(', ');
  } else if (host.includes('hackerrank.com')) {
    // HackerRank – title in h1, difficulty in .difficulty, topic in .tags a
    const titleEl = document.querySelector('h1');
    if (titleEl) data.title = cleanTitle(titleEl.textContent);
    const diffEl = document.querySelector('.difficulty');
    if (diffEl) {
      const match = diffEl.textContent.match(/(Easy|Medium|Hard)/i);
      if (match) data.difficulty = match[0];
    }
    const tagEls = document.querySelectorAll('.tags a');
    if (tagEls.length) data.topic = Array.from(tagEls).map(t=>t.textContent.trim()).join(', ');
  }

  // Send to extension (popup) if any useful field was found
  if (data.title) {
    chrome.runtime.sendMessage({ type: 'fillFromPage', payload: data });
  }
})();

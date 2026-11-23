// Background service worker for DSA Spaced Repetition

// Initialize storage on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['problems'], (result) => {
    if (!result.problems) {
      chrome.storage.local.set({ problems: [] });
    }
  });
  // Create alarm to check due problems every 360 minutes (6 hours)
  chrome.alarms.create('dsa-due-check', { periodInMinutes: 360 });
});

// Helper to count due problems
function countDueProblems(problems) {
  const now = Date.now();
  return problems.filter((p) => p.nextReviewAt && now >= p.nextReviewAt).length;
}

// Update badge text based on due count
function updateBadge() {
  chrome.storage.local.get(['problems'], (result) => {
    const due = countDueProblems(result.problems || []);
    const text = due > 0 ? String(due) : '';
    chrome.action.setBadgeText({ text });
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
  });
}

// Listen for storage changes to keep badge in sync
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.problems) {
    updateBadge();
  }
});

// Alarm handler – notify if any problem is due
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== 'dsa-due-check') return;
  chrome.storage.local.get(['problems'], (result) => {
    const dueProblems = (result.problems || []).filter((p) => {
      return p.nextReviewAt && Date.now() >= p.nextReviewAt;
    });
    if (dueProblems.length === 0) return;
    const titles = dueProblems.map((p) => p.title).join(', ');
    chrome.notifications.create('dsa-due', {
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'DSA Spaced Repetition',
      message: `You have ${dueProblems.length} problem(s) due: ${titles}`,
    });
    // Badge already reflects due count via storage listener, but ensure it updates now
    updateBadge();
  });
});

// Ensure badge is correct at startup
updateBadge();

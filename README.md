# DSA Spaced Repetition (Chrome/Brave Extension)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight **Manifest V3** extension for spaced‑repetition of DSA problems.

## 📦 Installation (load unpacked)

1. Open Chrome or Brave and navigate to chrome://extensions (or rave://extensions).  
2. Turn **Developer mode** **ON** (toggle in the top‑right).  
3. Click **Load unpacked** and select the folder that contains manifest.json:

4. The extension icon appears in the toolbar. The red badge shows the number of problems that are due.

## ▶️ Usage

- **Add a problem**  
• Fill the form in the popup (Title, Topic, Difficulty, URL) and click **Add**.  
• Or click **Fill Current Tab** to auto‑populate fields from a LeetCode / Codeforces / HackerRank page.

- **Review due problems**  
• When a problem’s 
extReviewAt passes, the badge updates and a Chrome notification appears.  
• Open the popup; the **Due for Review** cards show the problem with rating buttons:  
 🔴 Hard 🟡 Good 🟢 Easy.  
• Click a rating – the SM‑2 algorithm updates the schedule and the card moves to the **Upcoming Queue**.

- **Upcoming queue** – sorted by the nearest review date, shows “in Xd”.

- **Export / Import** – use the **Export JSON** button to download all problems, or **Import JSON** to restore a previous backup.

## 🤝 Contributing

Feel free to open **Issues** or submit **Pull Requests**.  
If you add a CONTRIBUTING.md, link it here and describe the steps you’d like contributors to follow (code style, testing, etc.).

## 📄 License

This project is licensed under the **MIT License**. See the LICENSE file for details.

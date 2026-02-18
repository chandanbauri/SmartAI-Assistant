# Smart AI Email Assistant - Chrome Extension

This extension integrates Chrome's Built-in AI APIs directly into your browser, allowing you to summarize, reply, and translate emails in Gmail and Outlook.

## 🚀 Features
- **Gmail & Outlook Integration**: Scrapes the current email content automatically.
- **AI Side Panel**: A persistent UI that stays open as you navigate.
- **Summarization**: Powered by Chrome's `Summarizer` API.
- **Smart Replies**: Powered by Chrome's `LanguageModel` API.
- **Translation**: Powered by Chrome's `Translator` API.

## 🛠️ How to Load the Extension
1. Open Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top right).
3. Click **Load unpacked**.
4. Select the `/Users/chandanbauri/work/AI/SmartEmailExtension` folder.

## ⚙️ Requirements
To use the real AI APIs, you must enable these flags in **Chrome Dev/Canary**:
- `chrome://flags/#optimization-guide-on-device-model` -> **Enabled (BypassPerfRequirement)**
- `chrome://flags/#prompt-api-for-gemini-nano` -> **Enabled**
- `chrome://flags/#summarization-api-for-gemini-nano` -> **Enabled**

If these are not enabled, the extension will run in **Demo Mode** with simulated responses.

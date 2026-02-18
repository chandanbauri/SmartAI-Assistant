# Smart AI Assistant 🪄

A powerful Chrome Extension that brings Google's **Gemini Nano** directly into your browsing experience. Originally designed for emails, it has evolved into a versatile assistant that handles everything from professional correspondence to competitive programming.

## 🚀 Key Features

- **📧 Email Intelligence**: 
  - **Summarize**: Instantly distill long Gmail or Outlook threads into concise bullet points.
  - **Smart Reply**: Draft professional, context-aware replies in seconds.
  - **Translate**: Break language barriers with built-in translation (Spanish, French, Japanese, and more).
- **💻 Coding Assistant (LeetCode Support)**:
  - **Write Code**: Extracts problem statements directly from **LeetCode** and generates optimized solutions in Python, JavaScript, Java, C++, or SQL.
  - **Context-Aware**: Uses the problem title and description to provide accurate, commented code.
- **⚡ Real-time Performance**:
  - Uses `Summarizer.summarizeStreaming` for instant word-by-word feedback.
  - Interactive "Mercury" status badge showing model download progress.

## 🛠️ Installation

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked**.
4. Select the `SmartEmailExtension` folder from your local machine.

## ⚙️ Enabling Built-in AI (Required)

To use the non-simulated Gemini Nano features, you must enable these flags in Chrome (v131+):

1. **AI Foundation**: `chrome://flags/#optimization-guide-on-device-model` → Set to **Enabled BypassPrefRequirement**.
2. **Prompt API**: `chrome://flags/#prompt-api-for-gemini-nano` → Set to **Enabled**.
3. **Summarizer API**: `chrome://flags/#summarizer-api-for-gemini-nano` → Set to **Enabled**.
4. **Restart Chrome** completely.
5. **Download Models**: Go to `chrome://components/` and check for updates on 'Optimization Guide On Device Model'.

*Note: If flags are missing, the extension automatically falls back to a high-fidelity **Demo Mode**.*

## 📂 Project Structure

- `manifest.json`: Extension configuration and permissions.
- `sidepanel.html`: The modern, dark-themed assistant interface.
- `sidepanel.js`: Core AI orchestration and state management.
- `content.js`: Intelligent scrapers for Gmail, Outlook, and LeetCode.
- `service-worker.js`: Background script for side panel activation.

---
Built with ❤️ using Chrome's Built-in AI APIs.

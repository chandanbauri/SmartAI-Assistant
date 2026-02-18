// --- State ---
let currentEmail = { subject: '', body: '' };
let isMockMode = false;

// --- DOM ---
const syncBtn = document.getElementById('sync-btn');
const summarizeBtn = document.getElementById('summarize-btn');
const replyBtn = document.getElementById('reply-btn');
const translateBtn = document.getElementById('translate-btn');
const langSelect = document.getElementById('lang-select');
const aiStatus = document.getElementById('ai-status');

const summaryOutput = document.getElementById('summary-output');
const replyOutput = document.getElementById('reply-output');
const translateOutput = document.getElementById('translate-output');
const codeBtn = document.getElementById('code-btn');
const codeLangSelect = document.getElementById('code-lang-select');
const codeOutput = document.getElementById('code-output');

const previewEl = document.getElementById('email-preview');
const previewSubject = document.getElementById('preview-subject');
const previewBody = document.getElementById('preview-body');

// --- Init ---
checkAIAvailability();

syncBtn.addEventListener('click', syncWithPage);
summarizeBtn.addEventListener('click', handleSummarize);
replyBtn.addEventListener('click', handleSmartReply);
translateBtn.addEventListener('click', handleTranslate);
codeBtn.addEventListener('click', handleWriteCode);

async function checkAIAvailability() {
    const isSummarizerAvailable = 'Summarizer' in self;
    const isLMAvailable = 'LanguageModel' in self;

    if (!isSummarizerAvailable || !isLMAvailable) {
        console.log('AI Check:', { isSummarizerAvailable, isLMAvailable });
        aiStatus.textContent = 'Setup Required';
        aiStatus.style.background = 'rgba(245, 158, 11, 0.1)';
        aiStatus.style.color = '#f59e0b';
        aiStatus.title = 'AI APIs not detected. Ensure flags are enabled (Chrome 131+).';
        isMockMode = true;
        return;
    }

    try {
        const availability = await self.Summarizer.availability();
        if (availability === 'after-download' || availability === 'downloadable') {
            aiStatus.textContent = 'Model Pending';
            aiStatus.title = 'The AI model needs to be downloaded in Chrome settings or components.';
        } else if (availability === 'no' || availability === 'unavailable') {
            aiStatus.textContent = 'Hardware Unsupp.';
            isMockMode = true;
        } else {
            aiStatus.textContent = 'Ready';
        }
    } catch (e) {
        console.warn('Availability check error:', e);
        aiStatus.textContent = 'Ready';
    }
}

function withTimeout(promise, ms) {
    let timeoutId;
    const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Operation timed out')), ms);
    });
    return Promise.race([
        promise.then((res) => { clearTimeout(timeoutId); return res; }),
        timeout
    ]);
}

async function syncWithPage() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'GET_EMAIL_CONTENT' });
        if (response) {
            currentEmail = response;
            previewEl.style.display = 'block';
            previewSubject.textContent = currentEmail.subject || 'No Subject';
            previewBody.textContent = currentEmail.body.substring(0, 100) + '...';
            syncBtn.innerHTML = '<i class="fa-solid fa-check"></i> Synced';
            setTimeout(() => {
                syncBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Sync with Page Content';
            }, 2000);
        }
    } catch (err) {
        console.error('Failed to sync:', err);
        alert('Could not sync with page. Make sure you are on Gmail or Outlook and have refreshed the page after installing the extension.');
    }
}

// --- AI Handlers ---

async function handleSummarize() {
    if (!currentEmail.body) return alert('Please sync with an email first.');

    const text = currentEmail.body.trim();
    setLoading(summarizeBtn, summaryOutput, 'Summarizing...');
    summaryOutput.innerText = 'Initializing AI...';

    try {
        let result = '';
        if (isMockMode) {
            await new Promise(r => setTimeout(r, 1500));
            result = text.length < 50 ? "This email is too short to summarize significantly." : "Summary: This email discusses the upcoming product launch. Key points include pending documentation, design assets, and scheduling a walkthrough.";
            summaryOutput.innerHTML = `<div class="fade-in">${result}</div>`;
        } else {
            try {
                // Check availability first as per docs
                const availability = await self.Summarizer.availability();
                if (availability === 'no' || availability === 'unavailable') {
                    throw new Error('Summarizer API is not available on this device.');
                }

                // Official Summarizer Options from Docs
                const options = {
                    type: 'teaser',
                    format: 'plain-text',
                    length: 'short',
                    outputLanguage: 'en',
                    monitor(m) {
                        m.addEventListener('downloadprogress', (e) => {
                            const progress = Math.round((e.loaded / e.total) * 100);
                            summaryOutput.innerText = `Preparing AI: ${progress}%`;
                        });
                    }
                };

                const summarizer = await self.Summarizer.create(options);

                // Use streaming for real-time feedback
                const stream = summarizer.summarizeStreaming(text);
                summaryOutput.innerText = '';

                let fullText = '';
                for await (const chunk of stream) {
                    fullText = chunk;
                    summaryOutput.innerText = fullText;
                }

                if (!fullText) throw new Error('No summary generated');

            } catch (sumError) {
                console.warn('Summarizer fallback triggered:', sumError);
                summaryOutput.innerText = 'Using fallback assistant...';

                const model = await self.LanguageModel.create({
                    outputLanguage: 'en',
                    expectedOutputLanguage: 'en'
                });
                result = await model.prompt(`Summarize this email in one short sentence: "${text}"`);
                summaryOutput.innerHTML = `<div class="fade-in">${result}</div>`;
            }
        }
    } catch (error) {
        summaryOutput.innerText = 'Error: ' + error.message;
    } finally {
        resetBtn(summarizeBtn, 'Summarize');
    }
}

async function handleSmartReply() {
    if (!currentEmail.body) return alert('Please sync with an email first.');
    setLoading(replyBtn, replyOutput, 'Drafting...');

    try {
        let result = '';
        if (isMockMode) {
            await new Promise(r => setTimeout(r, 2000));
            result = "Hi,\n\nI've received your update regarding the Q3 launch. I will prioritize the technical documentation review and sync with the design team. Thanks!";
        } else {
            const model = await self.LanguageModel.create({
                outputLanguage: 'en'
            });
            result = await model.prompt(`Draft a professional reply to this email: ${currentEmail.body}`);
        }
        replyOutput.innerHTML = `<div class="fade-in">${result.replace(/\n/g, '<br>')}</div>`;
    } catch (error) {
        replyOutput.innerText = 'Error: ' + error.message;
    } finally {
        resetBtn(replyBtn, 'Draft Reply');
    }
}

async function handleTranslate() {
    if (!currentEmail.body) return alert('Please sync with an email first.');
    const lang = langSelect.value;
    setLoading(translateBtn, translateOutput, 'Translating...');

    try {
        let result = '';
        if (isMockMode) {
            await new Promise(r => setTimeout(r, 1200));
            result = `[${lang.toUpperCase()}] Translated content of the email...`;
        } else {
            try {
                const translator = await self.Translator.create({
                    sourceLanguage: 'en',
                    targetLanguage: lang
                });
                result = await translator.translate(currentEmail.body);
            } catch (transError) {
                console.warn('Translator API failed, falling back to Prompt API:', transError);
                const model = await self.LanguageModel.create({
                    outputLanguage: lang
                });
                result = await model.prompt(`Translate the following to ${lang}:\n\n${currentEmail.body}`);
            }
        }
        translateOutput.innerHTML = `<div class="fade-in">${result}</div>`;
    } catch (error) {
        translateOutput.innerText = 'Error: ' + error.message;
    } finally {
        resetBtn(translateBtn, 'Go');
    }
}

async function handleWriteCode() {
    if (!currentEmail.body) return alert('Please sync with an email first.');
    const lang = codeLangSelect.value;
    setLoading(codeBtn, codeOutput, `Writing ${lang} code...`);

    try {
        let result = '';
        if (isMockMode) {
            await new Promise(r => setTimeout(r, 2000));
            result = `// Mock Code in ${lang}\nfunction solution() {\n    // Solving: ${currentEmail.subject}\n    console.log("Ready!");\n}`;
        } else {
            const model = await self.LanguageModel.create({
                systemPrompt: `You are an expert ${lang} developer. Write clean, efficient, and well-commented code based on the problem statement provided. Output ONLY the code without any explanation.`,
                outputLanguage: 'en'
            });
            result = await model.prompt(`Problem Statement: ${currentEmail.body}\n\nLanguage: ${lang}\n\nCode:`);
        }

        // Use backticks and highlight if possible, or just pre tag
        codeOutput.innerHTML = `<div class="fade-in">${result.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`;
    } catch (error) {
        codeOutput.innerText = 'Error: ' + error.message;
    } finally {
        resetBtn(codeBtn, 'Generate');
    }
}

// --- Helpers ---
function setLoading(btn, output, msg) {
    btn.disabled = true;
    output.innerText = msg;
    output.style.opacity = '0.6';
}

function resetBtn(btn, text) {
    btn.disabled = false;
    btn.innerText = text;
    const output = btn.nextElementSibling;
    if (output) output.style.opacity = '1';
}

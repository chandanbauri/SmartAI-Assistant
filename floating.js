let currentData = { subject: '', body: '' };

document.getElementById('float-sync').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: false });
    if (!tab) return alert('Cannot find main browser tab.');

    try {
        let response;
        try {
            response = await chrome.tabs.sendMessage(tab.id, { action: 'GET_EMAIL_CONTENT' });
        } catch (msgErr) {
            // Auto-Repair for Floating Window
            if (msgErr.message.includes('Could not establish connection')) {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                });
                await new Promise(r => setTimeout(r, 200));
                response = await chrome.tabs.sendMessage(tab.id, { action: 'GET_EMAIL_CONTENT' });
            } else {
                throw msgErr;
            }
        }

        if (response) {
            currentData = response;
            document.getElementById('sync-indicator').style.color = '#10b981';
            document.getElementById('output').innerText = `Synced: ${currentData.subject}`;
        }
    } catch (e) {
        console.error(e);
        alert('Sync failed. Please ensure you have the Gmail/Outlook/LeetCode tab active and visible behind this window.');
    }
});

document.getElementById('float-assist').addEventListener('click', async () => {
    if (!currentData.body) return alert('Sync first.');
    const output = document.getElementById('output');
    output.innerText = 'Solving...';

    try {
        // Detect if it's a coding problem or email
        const isCode = currentData.body.includes('Example 1') || currentData.body.includes('Constraints');

        if (isCode) {
            const model = await self.LanguageModel.create({
                systemPrompt: "You are a competitive programming assistant. Provide only the most efficient code solution. No talk.",
                outputLanguage: 'en',
                expectedOutputLanguage: 'en'
            });
            const result = await model.prompt(`Problem: ${currentData.body}`);
            output.innerText = result;
        } else {
            const summarizer = await self.Summarizer.create({
                type: 'teaser',
                length: 'short',
                outputLanguage: 'en',
                expectedOutputLanguage: 'en'
            });
            const stream = summarizer.summarizeStreaming(currentData.body);
            output.innerText = '';
            for await (const chunk of stream) {
                output.innerText = chunk;
            }
        }
    } catch (e) {
        output.innerText = "Error: " + e.message;
    }
});

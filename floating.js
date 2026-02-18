let currentData = { subject: '', body: '' };

document.getElementById('float-sync').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: false });
    if (!tab) return alert('Cannot find main browser tab.');

    try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'GET_EMAIL_CONTENT' });
        if (response) {
            currentData = response;
            document.getElementById('sync-indicator').style.color = '#10b981';
            document.getElementById('output').innerText = `Synced: ${currentData.subject}`;
        }
    } catch (e) {
        console.error(e);
        alert('Failed to sync. Ensure the tab is active.');
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
                outputLanguage: 'en'
            });
            const result = await model.prompt(`Problem: ${currentData.body}`);
            output.innerText = result;
        } else {
            const summarizer = await self.Summarizer.create({ type: 'teaser', length: 'short' });
            const result = await summarizer.summarize(currentData.body);
            output.innerText = result;
        }
    } catch (e) {
        output.innerText = "Error: " + e.message;
    }
});

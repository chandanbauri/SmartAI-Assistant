chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'GET_EMAIL_CONTENT') {
        const emailData = extractEmailData();
        sendResponse(emailData);
    }
    return true;
});

function extractEmailData() {
    let subject = '';
    let body = '';

    // Gmail specific extraction
    if (window.location.hostname.includes('mail.google.com')) {
        const subjectEl = document.querySelector('h2.hP');
        if (subjectEl) subject = subjectEl.innerText;

        // Try to get the latest email body in the thread
        const bodies = document.querySelectorAll('.a3s.aiL');
        if (bodies.length > 0) {
            body = bodies[bodies.length - 1].innerText;
        }
    }
    // Outlook specific
    else if (window.location.hostname.includes('outlook')) {
        const subjectEl = document.querySelector('div[role="heading"][aria-level="2"]');
        if (subjectEl) subject = subjectEl.innerText;

        const bodyEl = document.querySelector('div[aria-label="Message body"]');
        if (bodyEl) body = bodyEl.innerText;
    }
    // LeetCode specific
    else if (window.location.hostname.includes('leetcode.com')) {
        // New UI selectors (2024/2025)
        const titleEl = document.querySelector('div[data-cy="question-title"]') || document.querySelector('.text-title-large');
        if (titleEl) subject = titleEl.innerText;

        const descriptionEl = document.querySelector('[data-track-load="description_content"]') || document.querySelector('.elfjS');
        if (descriptionEl) body = descriptionEl.innerText;
    }

    // Fallback: search for prominent text if providers don't match exactly
    if (!body) {
        body = document.body.innerText.substring(0, 2000); // Sample first bit
    }

    return { subject, body };
}

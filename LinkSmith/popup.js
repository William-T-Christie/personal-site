/**
 * ============================================================================
 * LinkSmith - popup.js
 * Main application logic for the Chrome extension
 * ============================================================================
 *
 * TABLE OF CONTENTS
 * -----------------
 * 1. CONSTANTS & STATE .......... Configuration and application state
 * 2. DOM ELEMENTS ............... Cached element references
 * 3. UTILITY FUNCTIONS .......... Helpers (ID generation, formatting, clipboard)
 * 4. STATE PERSISTENCE .......... Chrome storage read/write
 * 5. TAB INFO ................... Get current browser tab data
 * 6. UI RENDERING ............... Render functions for each UI section
 * 7. CORE ACTIONS ............... Save, copy, delete, pin operations
 * 8. MODAL MANAGEMENT ........... Open/close modals (folder, delete, help)
 * 9. EVENT HANDLERS ............. All user interaction handlers
 * 10. INITIALIZATION ............ App startup
 *
 * ============================================================================
 */

/* ==========================================================================
   1. CONSTANTS & STATE
   ========================================================================== */

const STORAGE_KEY = 'linksmith_state_v1';
const MAX_TOTAL_HISTORY = 50;

let state = {
  format: 'md',
  captureDestination: 'total',
  viewMode: 'total',
  selectedFolderId: null,
  searchQuery: '',
  totalHistory: [],
  folders: {},
  folderOrder: [],
  pinnedIds: [],
  titleOverrides: {}
};

let currentTab = null;

/* ==========================================================================
   2. DOM ELEMENTS
   ========================================================================== */

const elements = {
  // Capture section
  favicon: document.getElementById('favicon'),
  titleInput: document.getElementById('titleInput'),
  domain: document.getElementById('domain'),
  formatControl: document.getElementById('formatControl'),
  destinationSelect: document.getElementById('destinationSelect'),
  noteInput: document.getElementById('noteInput'),
  copySaveBtn: document.getElementById('copySaveBtn'),
  saveOnlyBtn: document.getElementById('saveOnlyBtn'),

  // Library section
  searchInput: document.getElementById('searchInput'),
  viewControl: document.getElementById('viewControl'),
  folderSelectSection: document.getElementById('folderSelectSection'),
  folderViewSelect: document.getElementById('folderViewSelect'),
  libraryList: document.getElementById('libraryList'),
  emptyState: document.getElementById('emptyState'),
  emptyText: document.getElementById('emptyText'),

  // Header
  exportBtn: document.getElementById('exportBtn'),
  helpBtn: document.getElementById('helpBtn'),
  helpOverlay: document.getElementById('helpOverlay'),
  helpClose: document.getElementById('helpClose'),

  // Delete folder
  deleteFolderBtn: document.getElementById('deleteFolderBtn'),
  deleteOverlay: document.getElementById('deleteOverlay'),
  deleteClose: document.getElementById('deleteClose'),
  deleteCancel: document.getElementById('deleteCancel'),
  deleteConfirm: document.getElementById('deleteConfirm'),
  deleteMessage: document.getElementById('deleteMessage'),

  // Toast
  toast: document.getElementById('toast'),
  toastText: document.getElementById('toastText'),

  // Modal
  modalOverlay: document.getElementById('modalOverlay'),
  folderModal: document.getElementById('folderModal'),
  modalClose: document.getElementById('modalClose'),
  modalCancel: document.getElementById('modalCancel'),
  modalCreate: document.getElementById('modalCreate'),
  folderNameInput: document.getElementById('folderNameInput'),
  folderEmojiInput: document.getElementById('folderEmojiInput')
};

/* ==========================================================================
   3. UTILITY FUNCTIONS
   ========================================================================== */

/**
 * Generate a unique ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return 'unknown';
  }
}

/**
 * Clean page title using heuristics (no AI)
 * - Removes trailing brand segments after common separators
 * - Collapses whitespace
 */
function cleanTitle(title, domain) {
  if (!title || typeof title !== 'string') {
    return domain || 'Untitled';
  }

  let cleaned = title.trim();

  // Common separators used to append brand names
  const separators = [' | ', ' - ', ' — ', ' – ', ' • ', ' :: ', ' » ', ' / '];

  for (const sep of separators) {
    const parts = cleaned.split(sep);
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1].toLowerCase().trim();
      const domainLower = domain ? domain.toLowerCase() : '';

      // Check if last part looks like a brand/domain name
      const isBrandLike = (
        lastPart.length < 30 &&
        (domainLower.includes(lastPart.replace(/\s+/g, '')) ||
         lastPart.includes(domainLower.split('.')[0]) ||
         /^(home|homepage|official|website|blog|app)$/i.test(lastPart))
      );

      if (isBrandLike && parts.length > 1) {
        cleaned = parts.slice(0, -1).join(sep).trim();
        break;
      }
    }
  }

  // Collapse multiple whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned || domain || 'Untitled';
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
}

/**
 * Format item based on selected format
 */
function formatItem(item, format) {
  const title = item.title || 'Untitled';
  const url = item.url;
  const date = formatDate(item.savedAt);
  const domain = item.domain;

  switch (format) {
    case 'md':
      return `[${title}](${url})`;
    case 'pretty':
      return `${title} — ${url}`;
    case 'url':
      return url;
    case 'cite':
      return `"${title}." ${domain}, accessed ${date}. ${url}`;
    default:
      return `[${title}](${url})`;
  }
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      document.body.removeChild(textarea);
      return false;
    }
  }
}

/**
 * Show toast notification
 */
function showToast(message) {
  elements.toastText.textContent = message;
  elements.toast.classList.add('show');

  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 2000);
}

/* ==========================================================================
   4. STATE PERSISTENCE
   ========================================================================== */

/**
 * Load state from chrome.storage.local
 */
async function loadState() {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      if (result[STORAGE_KEY]) {
        state = { ...state, ...result[STORAGE_KEY] };
      }
      resolve();
    });
  });
}

/**
 * Save state to chrome.storage.local
 */
async function saveState() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: state }, resolve);
  });
}

/* ==========================================================================
   5. TAB INFO
   ========================================================================== */

/**
 * Get current active tab info
 */
async function getCurrentTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        resolve(tabs[0]);
      } else {
        resolve(null);
      }
    });
  });
}

/* ==========================================================================
   6. UI RENDERING
   ========================================================================== */

/**
 * Update page info display
 */
function renderPageInfo() {
  if (!currentTab) return;

  const url = currentTab.url || '';
  const domain = extractDomain(url);
  const rawTitle = currentTab.title || '';

  // Check for title override
  const storedTitle = state.titleOverrides[url];
  const cleanedTitle = storedTitle || cleanTitle(rawTitle, domain);

  // Set favicon (with fallback)
  const faviconUrl = currentTab.favIconUrl;
  if (faviconUrl && !faviconUrl.startsWith('chrome://')) {
    elements.favicon.src = faviconUrl;
  } else {
    elements.favicon.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect fill="%23ddd" width="16" height="16" rx="3"/></svg>';
  }

  elements.titleInput.value = cleanedTitle;
  elements.domain.textContent = domain;
}

/**
 * Update format control selection
 */
function renderFormatControl() {
  const segments = elements.formatControl.querySelectorAll('.segment');
  segments.forEach(seg => {
    seg.classList.toggle('active', seg.dataset.format === state.format);
  });
}

/**
 * Update destination select dropdown
 */
function renderDestinationSelect() {
  const select = elements.destinationSelect;

  // Clear existing options
  select.innerHTML = '';

  // Add Total History option
  const totalOption = document.createElement('option');
  totalOption.value = 'total';
  totalOption.textContent = 'Total History';
  select.appendChild(totalOption);

  // Add folders if any exist
  if (state.folderOrder.length > 0) {
    const divider = document.createElement('option');
    divider.disabled = true;
    divider.textContent = '────────────';
    select.appendChild(divider);

    state.folderOrder.forEach(folderId => {
      const folder = state.folders[folderId];
      if (folder) {
        const option = document.createElement('option');
        option.value = folderId;
        option.textContent = folder.emoji ? `${folder.emoji} ${folder.name}` : folder.name;
        select.appendChild(option);
      }
    });
  }

  // Add "New Folder" option
  const divider2 = document.createElement('option');
  divider2.disabled = true;
  divider2.textContent = '────────────';
  select.appendChild(divider2);

  const newFolderOption = document.createElement('option');
  newFolderOption.value = 'new_folder';
  newFolderOption.textContent = '+ New Folder…';
  select.appendChild(newFolderOption);

  // Set current value
  select.value = state.captureDestination;
}

/**
 * Update folder view select dropdown
 */
function renderFolderViewSelect() {
  const select = elements.folderViewSelect;
  select.innerHTML = '';

  if (state.folderOrder.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'No folders yet';
    select.appendChild(option);
    return;
  }

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select a folder...';
  select.appendChild(placeholder);

  state.folderOrder.forEach(folderId => {
    const folder = state.folders[folderId];
    if (folder) {
      const option = document.createElement('option');
      option.value = folderId;
      option.textContent = folder.emoji ? `${folder.emoji} ${folder.name}` : folder.name;
      select.appendChild(option);
    }
  });

  if (state.selectedFolderId) {
    select.value = state.selectedFolderId;
  }
}

/**
 * Update view control selection
 */
function renderViewControl() {
  const segments = elements.viewControl.querySelectorAll('.segment');
  segments.forEach(seg => {
    seg.classList.toggle('active', seg.dataset.view === state.viewMode);
  });

  // Show/hide folder select based on view mode
  elements.folderSelectSection.style.display = state.viewMode === 'folder' ? 'block' : 'none';

  if (state.viewMode === 'folder') {
    renderFolderViewSelect();
    updateDeleteButtonVisibility();
  }
}

/**
 * Get all items from all sources (totalHistory + all folders)
 * Deduplicates by URL, keeping the most recent version
 */
function getAllItems() {
  const itemsByUrl = new Map();

  // Add items from totalHistory
  state.totalHistory.forEach(item => {
    const existing = itemsByUrl.get(item.url);
    if (!existing || item.savedAt > existing.savedAt) {
      itemsByUrl.set(item.url, item);
    }
  });

  // Add items from all folders
  Object.values(state.folders).forEach(folder => {
    folder.items.forEach(item => {
      const existing = itemsByUrl.get(item.url);
      if (!existing || item.savedAt > existing.savedAt) {
        itemsByUrl.set(item.url, item);
      }
    });
  });

  // Convert to array and sort by savedAt descending (most recent first)
  return Array.from(itemsByUrl.values()).sort((a, b) => b.savedAt - a.savedAt);
}

/**
 * Get items for current view
 */
function getViewItems() {
  let items = [];

  switch (state.viewMode) {
    case 'total':
      // Total shows ALL items from everywhere, sorted by most recent
      items = getAllItems();
      break;
    case 'folder':
      if (state.selectedFolderId && state.folders[state.selectedFolderId]) {
        items = [...state.folders[state.selectedFolderId].items];
      }
      break;
    case 'pinned':
      // Get pinned items from all sources
      const allItems = getAllItems();
      items = allItems.filter(item => state.pinnedIds.includes(item.id));
      break;
  }

  // Filter by search query
  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();
    items = items.filter(item =>
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.domain && item.domain.toLowerCase().includes(query)) ||
      (item.url && item.url.toLowerCase().includes(query)) ||
      (item.note && item.note.toLowerCase().includes(query))
    );
  }

  return items;
}

/**
 * Render library items
 */
function renderLibrary() {
  const items = getViewItems();

  if (items.length === 0) {
    elements.libraryList.style.display = 'none';
    elements.emptyState.style.display = 'flex';

    // Set appropriate empty state message
    switch (state.viewMode) {
      case 'total':
        elements.emptyText.textContent = state.searchQuery
          ? 'No matching links found.'
          : 'No links yet. Save a page to start.';
        break;
      case 'folder':
        if (!state.selectedFolderId) {
          elements.emptyText.textContent = state.folderOrder.length === 0
            ? 'Create your first folder to get started.'
            : 'Select a folder to view its links.';
        } else {
          elements.emptyText.textContent = state.searchQuery
            ? 'No matching links found.'
            : 'This folder is empty. Save a page to it.';
        }
        break;
      case 'pinned':
        elements.emptyText.textContent = state.searchQuery
          ? 'No matching pinned links.'
          : 'No pinned links yet. Pin your favorites!';
        break;
    }
    return;
  }

  elements.libraryList.style.display = 'flex';
  elements.emptyState.style.display = 'none';

  elements.libraryList.innerHTML = items.map(item => {
    const isPinned = state.pinnedIds.includes(item.id);
    const faviconSrc = item.faviconUrl && !item.faviconUrl.startsWith('chrome://')
      ? item.faviconUrl
      : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect fill="%23ddd" width="16" height="16" rx="3"/></svg>';

    return `
      <div class="library-item" data-id="${item.id}">
        <img class="item-favicon" src="${faviconSrc}" alt="" />
        <div class="item-content">
          <div class="item-title">${escapeHtml(item.title || 'Untitled')}</div>
          <div class="item-meta">${escapeHtml(item.domain)} • ${formatDate(item.savedAt)}</div>
          ${item.note ? `<div class="item-note">${escapeHtml(item.note)}</div>` : ''}
        </div>
        <div class="item-actions">
          <button class="item-btn copy-btn" title="Copy" data-id="${item.id}">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
          <button class="item-btn pin-btn ${isPinned ? 'pinned' : ''}" title="${isPinned ? 'Unpin' : 'Pin'}" data-id="${item.id}">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="${isPinned ? 'currentColor' : 'none'}">
              <path d="M8 1.5l1.76 3.57 3.94.57-2.85 2.78.67 3.93L8 10.52l-3.52 1.83.67-3.93-2.85-2.78 3.94-.57L8 1.5z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="item-btn delete delete-btn" title="Delete" data-id="${item.id}">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* ==========================================================================
   7. CORE ACTIONS
   ========================================================================== */

/**
 * Save item to destination
 */
async function saveItem(copyToClipboardFlag = false) {
  if (!currentTab) return;

  const url = currentTab.url;
  const domain = extractDomain(url);
  const title = elements.titleInput.value.trim() || cleanTitle(currentTab.title, domain);
  const note = elements.noteInput.value.trim();
  const faviconUrl = currentTab.favIconUrl;

  // Store title override if user edited it
  if (title !== cleanTitle(currentTab.title, domain)) {
    state.titleOverrides[url] = title;
  }

  const item = {
    id: generateId(),
    url,
    domain,
    title,
    note,
    savedAt: Date.now(),
    faviconUrl
  };

  let destinationName = 'Total';

  if (state.captureDestination === 'total') {
    // Check for duplicate in total history
    const existingIndex = state.totalHistory.findIndex(i => i.url === url);
    if (existingIndex !== -1) {
      // Update existing item and move to top
      item.id = state.totalHistory[existingIndex].id;
      state.totalHistory.splice(existingIndex, 1);
    }

    // Add to beginning
    state.totalHistory.unshift(item);

    // Trim to max 50
    if (state.totalHistory.length > MAX_TOTAL_HISTORY) {
      const removed = state.totalHistory.splice(MAX_TOTAL_HISTORY);
      // Remove any pinned references to removed items
      removed.forEach(r => {
        const pinIndex = state.pinnedIds.indexOf(r.id);
        if (pinIndex !== -1) {
          state.pinnedIds.splice(pinIndex, 1);
        }
      });
    }
  } else {
    // Save to folder
    const folder = state.folders[state.captureDestination];
    if (folder) {
      // Check for duplicate in folder
      const existingIndex = folder.items.findIndex(i => i.url === url);
      if (existingIndex !== -1) {
        item.id = folder.items[existingIndex].id;
        folder.items.splice(existingIndex, 1);
      }

      folder.items.unshift(item);
      folder.updatedAt = Date.now();
      folder.lastUsedAt = Date.now();
      destinationName = folder.emoji ? `${folder.emoji} ${folder.name}` : folder.name;
    }
  }

  // Copy to clipboard if requested
  if (copyToClipboardFlag) {
    const formatted = formatItem(item, state.format);
    const copied = await copyToClipboard(formatted);
    if (copied) {
      showToast(`Copied + Saved to ${destinationName} ✓`);
    } else {
      showToast(`Saved to ${destinationName} ✓`);
    }
  } else {
    showToast(`Saved to ${destinationName} ✓`);
  }

  // Clear note input
  elements.noteInput.value = '';

  await saveState();
  renderLibrary();
}

/**
 * Create a new folder
 */
async function createFolder(name, emoji) {
  const folderId = generateId();

  state.folders[folderId] = {
    id: folderId,
    name: name.trim(),
    emoji: emoji.trim() || null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastUsedAt: Date.now(),
    items: []
  };

  state.folderOrder.push(folderId);
  state.captureDestination = folderId;

  await saveState();

  renderDestinationSelect();
  renderFolderViewSelect();
  showToast('Folder created ✓');
}

/**
 * Pin or unpin an item
 */
async function togglePin(itemId) {
  const index = state.pinnedIds.indexOf(itemId);
  if (index !== -1) {
    state.pinnedIds.splice(index, 1);
  } else {
    state.pinnedIds.push(itemId);
  }

  await saveState();
  renderLibrary();
}

/**
 * Delete an item
 */
async function deleteItem(itemId) {
  // Remove from total history
  state.totalHistory = state.totalHistory.filter(i => i.id !== itemId);

  // Remove from all folders
  Object.values(state.folders).forEach(folder => {
    folder.items = folder.items.filter(i => i.id !== itemId);
  });

  // Remove from pinned
  state.pinnedIds = state.pinnedIds.filter(id => id !== itemId);

  await saveState();
  renderLibrary();
}

/**
 * Find an item by ID across all sources
 */
function findItemById(itemId) {
  // Check totalHistory first
  let item = state.totalHistory.find(i => i.id === itemId);
  if (item) return item;

  // Check all folders
  for (const folder of Object.values(state.folders)) {
    item = folder.items.find(i => i.id === itemId);
    if (item) return item;
  }

  return null;
}

/**
 * Copy item to clipboard
 */
async function copyItem(itemId) {
  const item = findItemById(itemId);

  if (item) {
    const formatted = formatItem(item, state.format);
    const copied = await copyToClipboard(formatted);
    if (copied) {
      showToast('Copied ✓');
    }
  }
}

/**
 * Export current view to Markdown
 */
async function exportView() {
  const items = getViewItems();

  if (items.length === 0) {
    showToast('Nothing to export');
    return;
  }

  let viewName = 'Total History';
  switch (state.viewMode) {
    case 'folder':
      if (state.selectedFolderId && state.folders[state.selectedFolderId]) {
        const folder = state.folders[state.selectedFolderId];
        viewName = folder.emoji ? `${folder.emoji} ${folder.name}` : folder.name;
      }
      break;
    case 'pinned':
      viewName = 'Pinned Links';
      break;
  }

  const exportDate = formatDate(Date.now());

  let markdown = `# LinkSmith Export — ${viewName}\nExported: ${exportDate}\n\n`;

  items.forEach(item => {
    markdown += `- [${item.title || 'Untitled'}](${item.url})\n`;
    markdown += `  _${item.domain} • ${formatDate(item.savedAt)}_\n`;
    if (item.note) {
      markdown += `  > ${item.note}\n`;
    }
    markdown += '\n';
  });

  const copied = await copyToClipboard(markdown.trim());
  if (copied) {
    showToast('Exported to clipboard ✓');
  }
}

/* ==========================================================================
   8. MODAL MANAGEMENT
   ========================================================================== */

function openModal() {
  elements.folderNameInput.value = '';
  elements.folderEmojiInput.value = '';
  elements.modalOverlay.style.display = 'flex';
  setTimeout(() => {
    elements.modalOverlay.classList.add('show');
    elements.folderNameInput.focus();
  }, 10);
}

function closeModal() {
  elements.modalOverlay.classList.remove('show');
  setTimeout(() => {
    elements.modalOverlay.style.display = 'none';
  }, 180);

  // Reset destination select to previous value
  elements.destinationSelect.value = state.captureDestination;
}

function openHelp() {
  elements.helpOverlay.style.display = 'flex';
  setTimeout(() => {
    elements.helpOverlay.classList.add('show');
  }, 10);
}

function closeHelp() {
  elements.helpOverlay.classList.remove('show');
  setTimeout(() => {
    elements.helpOverlay.style.display = 'none';
  }, 180);
}

/* --- Delete Folder Modal --- */

let folderToDelete = null;

function openDeleteModal(folderId) {
  const folder = state.folders[folderId];
  if (!folder) return;

  folderToDelete = folderId;
  const itemCount = folder.items.length;
  const folderName = folder.emoji ? `${folder.emoji} ${folder.name}` : folder.name;

  if (itemCount > 0) {
    elements.deleteMessage.textContent = `"${folderName}" contains ${itemCount} item${itemCount === 1 ? '' : 's'}. Are you sure you want to delete this folder?`;
  } else {
    elements.deleteMessage.textContent = `Are you sure you want to delete "${folderName}"?`;
  }

  elements.deleteOverlay.style.display = 'flex';
  setTimeout(() => {
    elements.deleteOverlay.classList.add('show');
  }, 10);
}

function closeDeleteModal() {
  elements.deleteOverlay.classList.remove('show');
  setTimeout(() => {
    elements.deleteOverlay.style.display = 'none';
    folderToDelete = null;
  }, 180);
}

async function confirmDeleteFolder() {
  if (!folderToDelete) return;

  const folder = state.folders[folderToDelete];
  if (folder) {
    // Move all items to totalHistory (preserve them)
    folder.items.forEach(item => {
      // Check if already exists in totalHistory by URL
      const existingIndex = state.totalHistory.findIndex(i => i.url === item.url);
      if (existingIndex === -1) {
        // Add to totalHistory
        state.totalHistory.unshift(item);
      } else {
        // Update if this one is newer
        if (item.savedAt > state.totalHistory[existingIndex].savedAt) {
          state.totalHistory[existingIndex] = item;
        }
      }
    });

    // Trim totalHistory to max 50
    if (state.totalHistory.length > MAX_TOTAL_HISTORY) {
      const removed = state.totalHistory.splice(MAX_TOTAL_HISTORY);
      removed.forEach(r => {
        const pinIndex = state.pinnedIds.indexOf(r.id);
        if (pinIndex !== -1) {
          state.pinnedIds.splice(pinIndex, 1);
        }
      });
    }

    // Remove folder
    delete state.folders[folderToDelete];
    state.folderOrder = state.folderOrder.filter(id => id !== folderToDelete);

    // Reset selected folder if it was deleted
    if (state.selectedFolderId === folderToDelete) {
      state.selectedFolderId = null;
    }
    if (state.captureDestination === folderToDelete) {
      state.captureDestination = 'total';
    }

    await saveState();

    // Re-render UI
    renderDestinationSelect();
    renderFolderViewSelect();
    renderLibrary();
    updateDeleteButtonVisibility();

    showToast('Folder deleted ✓');
  }

  closeDeleteModal();
}

function updateDeleteButtonVisibility() {
  const hasSelectedFolder = state.selectedFolderId && state.folders[state.selectedFolderId];
  elements.deleteFolderBtn.style.display = hasSelectedFolder ? 'flex' : 'none';
}

/* ==========================================================================
   9. EVENT HANDLERS
   ========================================================================== */

function setupEventListeners() {
  // Format control
  elements.formatControl.addEventListener('click', async (e) => {
    const segment = e.target.closest('.segment');
    if (segment && segment.dataset.format) {
      state.format = segment.dataset.format;
      await saveState();
      renderFormatControl();
    }
  });

  // Destination select
  elements.destinationSelect.addEventListener('change', async (e) => {
    const value = e.target.value;

    if (value === 'new_folder') {
      openModal();
      return;
    }

    state.captureDestination = value;
    await saveState();
  });

  // Copy + Save button
  elements.copySaveBtn.addEventListener('click', () => {
    saveItem(true);
  });

  // Save only button
  elements.saveOnlyBtn.addEventListener('click', () => {
    saveItem(false);
  });

  // Note input enter key
  elements.noteInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveItem(true);
    }
  });

  // Title input - save override on blur
  elements.titleInput.addEventListener('blur', async () => {
    if (currentTab) {
      const newTitle = elements.titleInput.value.trim();
      const domain = extractDomain(currentTab.url);
      const originalClean = cleanTitle(currentTab.title, domain);

      if (newTitle && newTitle !== originalClean) {
        state.titleOverrides[currentTab.url] = newTitle;
        await saveState();
      } else if (state.titleOverrides[currentTab.url]) {
        delete state.titleOverrides[currentTab.url];
        await saveState();
      }
    }
  });

  // Search input
  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderLibrary();
  });

  // View control
  elements.viewControl.addEventListener('click', async (e) => {
    const segment = e.target.closest('.segment');
    if (segment && segment.dataset.view) {
      state.viewMode = segment.dataset.view;
      await saveState();
      renderViewControl();
      renderLibrary();
    }
  });

  // Folder view select
  elements.folderViewSelect.addEventListener('change', async (e) => {
    state.selectedFolderId = e.target.value || null;
    await saveState();
    renderLibrary();
    updateDeleteButtonVisibility();
  });

  // Delete folder button
  elements.deleteFolderBtn.addEventListener('click', () => {
    if (state.selectedFolderId) {
      openDeleteModal(state.selectedFolderId);
    }
  });

  // Delete modal events
  elements.deleteClose.addEventListener('click', closeDeleteModal);
  elements.deleteCancel.addEventListener('click', closeDeleteModal);
  elements.deleteConfirm.addEventListener('click', confirmDeleteFolder);
  elements.deleteOverlay.addEventListener('click', (e) => {
    if (e.target === elements.deleteOverlay) {
      closeDeleteModal();
    }
  });

  // Library item actions
  elements.libraryList.addEventListener('click', (e) => {
    const btn = e.target.closest('.item-btn');
    if (!btn) return;

    const itemId = btn.dataset.id;

    if (btn.classList.contains('copy-btn')) {
      copyItem(itemId);
    } else if (btn.classList.contains('pin-btn')) {
      togglePin(itemId);
    } else if (btn.classList.contains('delete-btn')) {
      deleteItem(itemId);
    }
  });

  // Export button
  elements.exportBtn.addEventListener('click', exportView);

  // Help button
  elements.helpBtn.addEventListener('click', openHelp);
  elements.helpClose.addEventListener('click', closeHelp);
  elements.helpOverlay.addEventListener('click', (e) => {
    if (e.target === elements.helpOverlay) {
      closeHelp();
    }
  });

  // Modal events
  elements.modalClose.addEventListener('click', closeModal);
  elements.modalCancel.addEventListener('click', closeModal);

  elements.modalCreate.addEventListener('click', async () => {
    const name = elements.folderNameInput.value.trim();
    if (!name) {
      elements.folderNameInput.focus();
      return;
    }

    const emoji = elements.folderEmojiInput.value.trim();
    await createFolder(name, emoji);
    closeModal();
  });

  elements.folderNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      elements.modalCreate.click();
    } else if (e.key === 'Escape') {
      closeModal();
    }
  });

  elements.folderEmojiInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      elements.modalCreate.click();
    } else if (e.key === 'Escape') {
      closeModal();
    }
  });

  elements.modalOverlay.addEventListener('click', (e) => {
    if (e.target === elements.modalOverlay) {
      closeModal();
    }
  });

  // Global keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Escape closes any open modal
    if (e.key === 'Escape') {
      if (elements.deleteOverlay.style.display !== 'none') {
        closeDeleteModal();
        return;
      }
      if (elements.helpOverlay.style.display !== 'none') {
        closeHelp();
        return;
      }
      if (elements.modalOverlay.style.display !== 'none') {
        closeModal();
        return;
      }
    }

    // Ignore other shortcuts if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    // 1-4 sets format and triggers Copy+Save
    if (e.key >= '1' && e.key <= '4') {
      const formats = ['md', 'pretty', 'url', 'cite'];
      const index = parseInt(e.key) - 1;
      state.format = formats[index];
      renderFormatControl();
      saveState().then(() => {
        saveItem(true);
      });
      return;
    }

    // / focuses search
    if (e.key === '/') {
      e.preventDefault();
      elements.searchInput.focus();
      return;
    }
  });
}

/* ==========================================================================
   10. INITIALIZATION
   ========================================================================== */

async function init() {
  // Load saved state
  await loadState();

  // Get current tab info
  currentTab = await getCurrentTab();

  // Render UI
  renderPageInfo();
  renderFormatControl();
  renderDestinationSelect();
  renderViewControl();
  renderLibrary();

  // Setup event listeners
  setupEventListeners();
}

/* --- Start the app --- */
document.addEventListener('DOMContentLoaded', init);

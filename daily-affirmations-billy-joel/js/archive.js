/**
 * Archive Page Controller
 * Handles filtering, searching, and displaying all affirmations
 */

class ArchiveController {
    constructor() {
        this.currentFilters = {
            album: '',
            theme: '',
            mood: '',
            search: '',
            favoritesOnly: false
        };
        this.currentView = 'grid';

        this.container = document.getElementById('affirmations-container');
        this.countEl = document.getElementById('count');
        this.favoritesCountEl = document.getElementById('favorites-count');

        this.init();
    }

    init() {
        this.populateFilters();
        this.setupEventListeners();
        this.updateFavoritesCount();
        this.render();
    }

    /**
     * Populate filter dropdowns with data
     */
    populateFilters() {
        // Albums
        const albumSelect = document.getElementById('album-filter');
        window.AffirmationData.getAllAlbums().forEach(album => {
            const option = document.createElement('option');
            option.value = album;
            const albumData = window.AffirmationData.ALBUMS[album];
            option.textContent = `${album} (${albumData.year})`;
            albumSelect.appendChild(option);
        });

        // Themes
        const themeSelect = document.getElementById('theme-filter');
        window.AffirmationData.getAllThemes().forEach(theme => {
            const option = document.createElement('option');
            option.value = theme;
            option.textContent = this.capitalize(theme);
            themeSelect.appendChild(option);
        });

        // Moods
        const moodSelect = document.getElementById('mood-filter');
        window.AffirmationData.getAllMoods().forEach(mood => {
            const option = document.createElement('option');
            option.value = mood;
            option.textContent = this.capitalize(mood);
            moodSelect.appendChild(option);
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Filter changes
        document.getElementById('album-filter').addEventListener('change', (e) => {
            this.currentFilters.album = e.target.value;
            this.render();
        });

        document.getElementById('theme-filter').addEventListener('change', (e) => {
            this.currentFilters.theme = e.target.value;
            this.render();
        });

        document.getElementById('mood-filter').addEventListener('change', (e) => {
            this.currentFilters.mood = e.target.value;
            this.render();
        });

        // Search with debounce
        const searchInput = document.getElementById('search-input');
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.currentFilters.search = e.target.value.toLowerCase();
                this.render();
            }, 300);
        });

        // View toggle
        document.getElementById('grid-view').addEventListener('click', () => {
            this.setView('grid');
        });

        document.getElementById('list-view').addEventListener('click', () => {
            this.setView('list');
        });

        // Favorites toggle
        document.getElementById('show-favorites').addEventListener('click', (e) => {
            this.currentFilters.favoritesOnly = !this.currentFilters.favoritesOnly;
            e.currentTarget.setAttribute('aria-pressed', this.currentFilters.favoritesOnly);
            this.render();
        });

        // Event delegation for card actions
        this.container.addEventListener('click', (e) => {
            this.handleCardClick(e);
        });

        // Listen for favorites changes
        window.addEventListener('favoritesChanged', () => {
            this.updateFavoritesCount();
            if (this.currentFilters.favoritesOnly) {
                this.render();
            }
        });
    }

    /**
     * Set view mode
     */
    setView(view) {
        this.currentView = view;
        this.container.className = view === 'grid' ? 'affirmations-grid' : 'affirmations-list';

        document.getElementById('grid-view').classList.toggle('active', view === 'grid');
        document.getElementById('list-view').classList.toggle('active', view === 'list');

        this.render();
    }

    /**
     * Filter affirmations based on current filters
     */
    filterAffirmations() {
        let results = window.AffirmationData.AFFIRMATIONS;

        // Favorites only
        if (this.currentFilters.favoritesOnly) {
            const favoriteIds = window.Favorites.getAll();
            results = results.filter(a => favoriteIds.includes(a.id));
        }

        // Album filter
        if (this.currentFilters.album) {
            results = results.filter(a => a.album === this.currentFilters.album);
        }

        // Theme filter
        if (this.currentFilters.theme) {
            results = results.filter(a => a.themes.includes(this.currentFilters.theme));
        }

        // Mood filter
        if (this.currentFilters.mood) {
            results = results.filter(a => a.mood === this.currentFilters.mood);
        }

        // Search filter
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search;
            results = results.filter(a =>
                a.lyric.toLowerCase().includes(searchTerm) ||
                a.song.toLowerCase().includes(searchTerm) ||
                a.album.toLowerCase().includes(searchTerm)
            );
        }

        return results;
    }

    /**
     * Render affirmations
     */
    render() {
        const filtered = this.filterAffirmations();
        this.countEl.textContent = filtered.length;

        if (filtered.length === 0) {
            this.container.innerHTML = this.renderEmptyState();
            return;
        }

        if (this.currentView === 'grid') {
            this.container.innerHTML = filtered.map(a => this.renderCard(a)).join('');
        } else {
            this.container.innerHTML = filtered.map(a => this.renderRow(a)).join('');
        }
    }

    /**
     * Render grid card
     */
    renderCard(affirmation) {
        const isFavorite = window.Favorites.isFavorite(affirmation.id);

        return `
            <article class="affirmation-card" data-id="${affirmation.id}">
                <blockquote class="lyric">"${this.escapeHtml(affirmation.lyric)}"</blockquote>
                <footer>
                    <cite>${this.escapeHtml(affirmation.song)}</cite>
                    <span class="album">${this.escapeHtml(affirmation.album)} (${affirmation.year})</span>
                </footer>
                <div class="card-actions">
                    <button class="play-btn" data-id="${affirmation.id}" aria-label="Play this affirmation">
                        ▶ Play
                    </button>
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${affirmation.id}" aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                        ${isFavorite ? '♥' : '♡'}
                    </button>
                </div>
            </article>
        `;
    }

    /**
     * Render list row
     */
    renderRow(affirmation) {
        const isFavorite = window.Favorites.isFavorite(affirmation.id);

        return `
            <article class="affirmation-row" data-id="${affirmation.id}">
                <button class="play-btn" data-id="${affirmation.id}" aria-label="Play this affirmation">
                    ▶
                </button>
                <div class="row-content">
                    <span class="lyric">"${this.escapeHtml(affirmation.lyric)}"</span>
                    <span class="song">${this.escapeHtml(affirmation.song)}</span>
                    <span class="album">${this.escapeHtml(affirmation.album)}</span>
                </div>
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${affirmation.id}" aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                    ${isFavorite ? '♥' : '♡'}
                </button>
            </article>
        `;
    }

    /**
     * Render empty state
     */
    renderEmptyState() {
        if (this.currentFilters.favoritesOnly) {
            return `
                <div class="empty-state">
                    <div class="icon">♡</div>
                    <p>No favorites yet!</p>
                    <p>Go back to the player and heart some affirmations.</p>
                    <button onclick="document.getElementById('show-favorites').click()">Show All</button>
                </div>
            `;
        }

        return `
            <div class="empty-state">
                <div class="icon">🔍</div>
                <p>No affirmations found matching your filters.</p>
                <button onclick="location.reload()">Reset Filters</button>
            </div>
        `;
    }

    /**
     * Handle clicks on card buttons
     */
    handleCardClick(e) {
        const playBtn = e.target.closest('.play-btn');
        const favBtn = e.target.closest('.favorite-btn');

        if (playBtn) {
            const id = playBtn.dataset.id;
            window.location.href = `index.html?id=${id}`;
        }

        if (favBtn) {
            const id = favBtn.dataset.id;
            const isFavorited = window.Favorites.toggle(id);

            // Update button state
            favBtn.classList.toggle('active', isFavorited);
            favBtn.textContent = isFavorited ? '♥' : '♡';
            favBtn.setAttribute('aria-label', isFavorited ? 'Remove from favorites' : 'Add to favorites');

            // Update count
            this.updateFavoritesCount();
        }
    }

    /**
     * Update favorites count display
     */
    updateFavoritesCount() {
        const count = window.Favorites.getCount();
        this.favoritesCountEl.textContent = count;
    }

    /**
     * Helper: capitalize first letter
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Helper: escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.archiveController = new ArchiveController();
});

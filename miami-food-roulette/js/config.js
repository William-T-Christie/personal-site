/**
 * Miami Food Roulette - Configuration
 * Contains all constants for cuisines, neighborhoods, prices, and settings
 */

window.FoodRouletteConfig = {
    // API Configuration
    // TODO: Update this URL after deploying Vercel backend
    API_BASE_URL: 'https://miami-food-api.vercel.app/api',

    // Cuisines with icons and Yelp category mappings
    CUISINES: [
        { id: 'cuban', label: 'Cuban', icon: '🥘', yelpCategory: 'cuban' },
        { id: 'haitian', label: 'Haitian', icon: '🍲', yelpCategory: 'haitian' },
        { id: 'latin', label: 'Latin', icon: '🌮', yelpCategory: 'latin' },
        { id: 'seafood', label: 'Seafood', icon: '🦐', yelpCategory: 'seafood' },
        { id: 'american', label: 'American', icon: '🍔', yelpCategory: 'tradamerican,newamerican' },
        { id: 'italian', label: 'Italian', icon: '🍝', yelpCategory: 'italian' },
        { id: 'asian', label: 'Asian', icon: '🍜', yelpCategory: 'asianfusion' },
        { id: 'mexican', label: 'Mexican', icon: '🌯', yelpCategory: 'mexican' },
        { id: 'caribbean', label: 'Caribbean', icon: '🥥', yelpCategory: 'caribbean' },
        { id: 'peruvian', label: 'Peruvian', icon: '🐟', yelpCategory: 'peruvian' },
        { id: 'venezuelan', label: 'Venezuelan', icon: '🫓', yelpCategory: 'venezuelan' },
        { id: 'brazilian', label: 'Brazilian', icon: '🥩', yelpCategory: 'brazilian' },
        { id: 'japanese', label: 'Japanese', icon: '🍣', yelpCategory: 'japanese' },
        { id: 'thai', label: 'Thai', icon: '🍛', yelpCategory: 'thai' },
        { id: 'mediterranean', label: 'Mediterranean', icon: '🥙', yelpCategory: 'mediterranean' }
    ],

    // Miami neighborhoods with coordinates for Yelp API location search
    NEIGHBORHOODS: [
        { id: 'wynwood', label: 'Wynwood', lat: 25.8014, lng: -80.1991 },
        { id: 'brickell', label: 'Brickell', lat: 25.7617, lng: -80.1918 },
        { id: 'downtown', label: 'Downtown', lat: 25.7751, lng: -80.1947 },
        { id: 'little-havana', label: 'Little Havana', lat: 25.7654, lng: -80.2219 },
        { id: 'design-district', label: 'Design District', lat: 25.8127, lng: -80.1927 },
        { id: 'midtown', label: 'Midtown', lat: 25.8094, lng: -80.1936 },
        { id: 'coral-gables', label: 'Coral Gables', lat: 25.7215, lng: -80.2684 },
        { id: 'coconut-grove', label: 'Coconut Grove', lat: 25.7270, lng: -80.2414 },
        { id: 'little-haiti', label: 'Little Haiti', lat: 25.8378, lng: -80.1961 },
        { id: 'edgewater', label: 'Edgewater', lat: 25.8106, lng: -80.1878 },
        { id: 'overtown', label: 'Overtown', lat: 25.7875, lng: -80.2042 },
        { id: 'south-beach', label: 'South Beach', lat: 25.7825, lng: -80.1340 },
        { id: 'mid-beach', label: 'Mid-Beach', lat: 25.8164, lng: -80.1285 },
        { id: 'north-beach', label: 'North Beach', lat: 25.8496, lng: -80.1225 },
        { id: 'surfside', label: 'Surfside', lat: 25.8785, lng: -80.1256 }
    ],

    // Price ranges matching Yelp's price levels
    PRICE_RANGES: [
        { id: '1', label: '$', yelpPrice: '1', description: 'Budget-friendly', icon: '💵' },
        { id: '2', label: '$$', yelpPrice: '2', description: 'Moderate', icon: '💰' },
        { id: '3', label: '$$$', yelpPrice: '3', description: 'Upscale', icon: '💎' },
        { id: '4', label: '$$$$', yelpPrice: '4', description: 'Fine Dining', icon: '👑' }
    ],

    // Animation settings
    ANIMATION: {
        SPIN_DURATION: 2500,           // Total spin animation time (ms)
        REEL_STOP_DELAY: 400,          // Delay between each reel stopping (ms)
        FULL_ROTATIONS: 3,             // Number of full rotations before landing
        EASE_FUNCTION: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)'
    },

    // Storage keys for localStorage
    STORAGE_KEYS: {
        FAVORITES: 'mfr_favorites',
        HISTORY: 'mfr_history',
        PREFERENCES: 'mfr_preferences',
        SOUND_ENABLED: 'mfr_sound'
    },

    // Limits
    LIMITS: {
        MAX_HISTORY: 20,               // Maximum number of history items to store
        API_RESULTS_LIMIT: 50,         // Number of restaurants to fetch per search
        SEARCH_RADIUS: 3000            // Search radius in meters (~2 miles)
    },

    // Default preferences
    DEFAULTS: {
        SOUND_ENABLED: true,
        VOLUME: 0.5
    },

    // Messages
    MESSAGES: {
        LOADING: [
            'Finding the perfect spot...',
            'Searching Miami\'s best...',
            'Cooking up options...',
            'Scouting the neighborhood...',
            'Checking the menu...'
        ],
        NO_RESULTS: 'No restaurants found with these filters. Try different options!',
        API_ERROR: 'Oops! Something went wrong. Please try again.',
        NETWORK_ERROR: 'Unable to connect. Check your internet connection.',
        ADDED_TO_FAVORITES: 'Added to favorites!',
        REMOVED_FROM_FAVORITES: 'Removed from favorites',
        HISTORY_CLEARED: 'History cleared'
    },

    // Sound file paths
    SOUNDS: {
        SPIN: 'assets/sounds/spin.mp3',
        STOP: 'assets/sounds/stop.mp3',
        WINNER: 'assets/sounds/winner.mp3',
        CLICK: 'assets/sounds/click.mp3',
        LOCK: 'assets/sounds/lock.mp3'
    },

    // Days of the week for hours display
    DAYS: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],

    // Helper methods
    getRandomLoadingMessage() {
        const messages = this.MESSAGES.LOADING;
        return messages[Math.floor(Math.random() * messages.length)];
    },

    getCuisineById(id) {
        return this.CUISINES.find(c => c.id === id);
    },

    getNeighborhoodById(id) {
        return this.NEIGHBORHOODS.find(n => n.id === id);
    },

    getPriceById(id) {
        return this.PRICE_RANGES.find(p => p.id === id);
    },

    getRandomCuisine() {
        return this.CUISINES[Math.floor(Math.random() * this.CUISINES.length)];
    },

    getRandomNeighborhood() {
        return this.NEIGHBORHOODS[Math.floor(Math.random() * this.NEIGHBORHOODS.length)];
    },

    getRandomPrice() {
        return this.PRICE_RANGES[Math.floor(Math.random() * this.PRICE_RANGES.length)];
    }
};

// Freeze config to prevent accidental modifications
Object.freeze(window.FoodRouletteConfig);
Object.freeze(window.FoodRouletteConfig.CUISINES);
Object.freeze(window.FoodRouletteConfig.NEIGHBORHOODS);
Object.freeze(window.FoodRouletteConfig.PRICE_RANGES);
Object.freeze(window.FoodRouletteConfig.ANIMATION);
Object.freeze(window.FoodRouletteConfig.STORAGE_KEYS);
Object.freeze(window.FoodRouletteConfig.LIMITS);
Object.freeze(window.FoodRouletteConfig.DEFAULTS);
Object.freeze(window.FoodRouletteConfig.MESSAGES);
Object.freeze(window.FoodRouletteConfig.SOUNDS);

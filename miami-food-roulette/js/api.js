/**
 * Miami Food Roulette - API Module
 * Handles communication with Vercel serverless backend
 * Includes mock data fallback for development/testing
 */

window.FoodRouletteAPI = (function() {
    const CONFIG = window.FoodRouletteConfig;

    // Flag to use mock data (set to false when Vercel backend is ready)
    const USE_MOCK_DATA = true;

    /**
     * Make a request to the API
     * @param {string} endpoint - API endpoint path
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} API response
     */
    async function request(endpoint, params = {}) {
        // Use mock data if enabled or if API is unavailable
        if (USE_MOCK_DATA) {
            return mockRequest(endpoint, params);
        }

        const url = new URL(`${CONFIG.API_BASE_URL}${endpoint}`);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });

        try {
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);

            // Fallback to mock data on error
            if (!USE_MOCK_DATA) {
                console.log('Falling back to mock data...');
                return mockRequest(endpoint, params);
            }

            throw error;
        }
    }

    /**
     * Search for restaurants based on filters
     * @param {Object} filters - Search filters
     * @param {string} filters.cuisine - Cuisine ID
     * @param {string} filters.neighborhood - Neighborhood ID
     * @param {string} filters.price - Price level ID
     * @returns {Promise<Object>} Search results
     */
    async function searchRestaurants(filters) {
        const cuisine = CONFIG.getCuisineById(filters.cuisine);
        const neighborhood = CONFIG.getNeighborhoodById(filters.neighborhood);
        const price = CONFIG.getPriceById(filters.price);

        const params = {
            cuisine: cuisine?.yelpCategory,
            lat: neighborhood?.lat,
            lng: neighborhood?.lng,
            price: price?.yelpPrice,
            limit: CONFIG.LIMITS.API_RESULTS_LIMIT,
            radius: CONFIG.LIMITS.SEARCH_RADIUS
        };

        return request('/search', params);
    }

    /**
     * Get detailed information about a specific restaurant
     * @param {string} yelpId - Yelp business ID
     * @returns {Promise<Object>} Restaurant details
     */
    async function getRestaurantDetails(yelpId) {
        return request('/restaurant', { id: yelpId });
    }

    /**
     * Get a random restaurant (Feeling Lucky mode)
     * @returns {Promise<Object>} Random restaurant
     */
    async function getRandomRestaurant() {
        const randomCuisine = CONFIG.getRandomCuisine();
        const randomNeighborhood = CONFIG.getRandomNeighborhood();
        const randomPrice = CONFIG.getRandomPrice();

        const results = await searchRestaurants({
            cuisine: randomCuisine.id,
            neighborhood: randomNeighborhood.id,
            price: randomPrice.id
        });

        if (results.restaurants && results.restaurants.length > 0) {
            const randomIndex = Math.floor(Math.random() * results.restaurants.length);
            return {
                restaurant: results.restaurants[randomIndex],
                filters: {
                    cuisine: randomCuisine.id,
                    neighborhood: randomNeighborhood.id,
                    price: randomPrice.id
                }
            };
        }

        throw new Error('No restaurants found');
    }

    /**
     * Pick a random restaurant from search results
     * @param {Object} filters - The filters used
     * @returns {Promise<Object>} Random restaurant with filters
     */
    async function spinForRestaurant(filters) {
        const results = await searchRestaurants(filters);

        if (results.restaurants && results.restaurants.length > 0) {
            const randomIndex = Math.floor(Math.random() * results.restaurants.length);
            return {
                restaurant: results.restaurants[randomIndex],
                filters: filters,
                totalResults: results.total
            };
        }

        return {
            restaurant: null,
            filters: filters,
            totalResults: 0
        };
    }

    // ============ MOCK DATA ============

    /**
     * Mock request handler for development/testing
     */
    async function mockRequest(endpoint, params) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

        if (endpoint === '/search') {
            return getMockSearchResults(params);
        }

        if (endpoint === '/restaurant') {
            return getMockRestaurantDetails(params.id);
        }

        throw new Error('Unknown endpoint');
    }

    /**
     * Generate mock search results
     */
    function getMockSearchResults(params) {
        const mockRestaurants = generateMockRestaurants();

        // Filter by cuisine if provided
        let filtered = mockRestaurants;
        if (params.cuisine) {
            filtered = filtered.filter(r =>
                r.categories.some(c => c.toLowerCase().includes(params.cuisine.split(',')[0].toLowerCase()))
            );
        }

        // Filter by price if provided
        if (params.price) {
            const priceLevel = params.price;
            filtered = filtered.filter(r => {
                const restaurantPrice = r.price ? r.price.length : 2;
                return restaurantPrice === parseInt(priceLevel);
            });
        }

        // If no matches, return some random ones
        if (filtered.length === 0) {
            filtered = mockRestaurants.slice(0, 5);
        }

        return {
            restaurants: filtered,
            total: filtered.length
        };
    }

    /**
     * Generate mock restaurant details
     */
    function getMockRestaurantDetails(id) {
        const mockRestaurants = generateMockRestaurants();
        const restaurant = mockRestaurants.find(r => r.id === id) || mockRestaurants[0];

        return {
            ...restaurant,
            photos: [restaurant.image, restaurant.image, restaurant.image],
            hours: generateMockHours(),
            isOpenNow: Math.random() > 0.3,
            transactions: ['delivery', 'pickup']
        };
    }

    /**
     * Generate mock hours data
     */
    function generateMockHours() {
        const hours = [];
        for (let day = 0; day < 7; day++) {
            hours.push({
                day: day,
                start: '1100',
                end: '2200',
                is_overnight: false
            });
        }
        return hours;
    }

    /**
     * Generate array of mock restaurants
     */
    function generateMockRestaurants() {
        return [
            {
                id: 'mock-versailles',
                name: 'Versailles Restaurant',
                image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
                rating: 4.5,
                reviewCount: 8234,
                price: '$$',
                categories: ['Cuban', 'Latin American'],
                address: '3555 SW 8th St, Miami, FL 33135',
                phone: '(305) 444-0240',
                coordinates: { latitude: 25.7654, longitude: -80.2419 },
                isClosed: false,
                yelpUrl: 'https://www.yelp.com/biz/versailles-miami'
            },
            {
                id: 'mock-joeys',
                name: 'Joe\'s Stone Crab',
                image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop',
                rating: 4.3,
                reviewCount: 5621,
                price: '$$$$',
                categories: ['Seafood', 'American'],
                address: '11 Washington Ave, Miami Beach, FL 33139',
                phone: '(305) 673-0365',
                coordinates: { latitude: 25.7825, longitude: -80.1340 },
                isClosed: false,
                yelpUrl: 'https://www.yelp.com/biz/joes-stone-crab-miami-beach'
            },
            {
                id: 'mock-mandolin',
                name: 'Mandolin Aegean Bistro',
                image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
                rating: 4.6,
                reviewCount: 2341,
                price: '$$$',
                categories: ['Mediterranean', 'Greek'],
                address: '4312 NE 2nd Ave, Miami, FL 33137',
                phone: '(305) 749-9140',
                coordinates: { latitude: 25.8127, longitude: -80.1927 },
                isClosed: false,
                yelpUrl: 'https://www.yelp.com/biz/mandolin-aegean-bistro-miami'
            },
            {
                id: 'mock-cvi-che',
                name: 'CVI.CHE 105',
                image: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=400&h=300&fit=crop',
                rating: 4.4,
                reviewCount: 3456,
                price: '$$',
                categories: ['Peruvian', 'Seafood'],
                address: '105 NE 3rd Ave, Miami, FL 33132',
                phone: '(305) 577-3454',
                coordinates: { latitude: 25.7751, longitude: -80.1910 },
                isClosed: false,
                yelpUrl: 'https://www.yelp.com/biz/cvi-che-105-miami'
            },
            {
                id: 'mock-miami-smokers',
                name: 'Miami Smokers',
                image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=300&fit=crop',
                rating: 4.7,
                reviewCount: 1892,
                price: '$$',
                categories: ['BBQ', 'American'],
                address: '3622 NE 2nd Ave, Miami, FL 33137',
                phone: '(786) 961-8465',
                coordinates: { latitude: 25.8094, longitude: -80.1936 },
                isClosed: false,
                yelpUrl: 'https://www.yelp.com/biz/miami-smokers-miami'
            },
            {
                id: 'mock-zak-the-baker',
                name: 'Zak the Baker',
                image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
                rating: 4.5,
                reviewCount: 2103,
                price: '$$',
                categories: ['Bakery', 'Cafe', 'American'],
                address: '295 NW 26th St, Miami, FL 33127',
                phone: '(786) 294-0876',
                coordinates: { latitude: 25.8014, longitude: -80.1991 },
                isClosed: false,
                yelpUrl: 'https://www.yelp.com/biz/zak-the-baker-miami'
            },
            {
                id: 'mock-la-mar',
                name: 'La Mar by Gaston Acurio',
                image: 'https://images.unsplash.com/photo-1579631542720-3a87824fff86?w=400&h=300&fit=crop',
                rating: 4.3,
                reviewCount: 1567,
                price: '$$$$',
                categories: ['Peruvian', 'Seafood', 'Latin'],
                address: '500 Brickell Key Dr, Miami, FL 33131',
                phone: '(305) 913-8358',
                coordinates: { latitude: 25.7617, longitude: -80.1850 },
                isClosed: false,
                yelpUrl: 'https://www.yelp.com/biz/la-mar-by-gaston-acurio-miami'
            },
            {
                id: 'mock-coyo-taco',
                name: 'Coyo Taco',
                image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop',
                rating: 4.2,
                reviewCount: 2876,
                price: '$',
                categories: ['Mexican', 'Tacos', 'Latin'],
                address: '2300 NW 2nd Ave, Miami, FL 33127',
                phone: '(305) 573-8228',
                coordinates: { latitude: 25.7980, longitude: -80.1991 },
                isClosed: false,
                yelpUrl: 'https://www.yelp.com/biz/coyo-taco-miami'
            },
            {
                id: 'mock-chef-creole',
                name: 'Chef Creole',
                image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
                rating: 4.4,
                reviewCount: 987,
                price: '$',
                categories: ['Haitian', 'Caribbean'],
                address: '200 NW 54th St, Miami, FL 33127',
                phone: '(305) 754-2223',
                coordinates: { latitude: 25.8378, longitude: -80.1961 },
                isClosed: false,
                yelpUrl: 'https://www.yelp.com/biz/chef-creole-miami'
            },
            {
                id: 'mock-bulla',
                name: 'Bulla Gastrobar',
                image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop',
                rating: 4.4,
                reviewCount: 2234,
                price: '$$',
                categories: ['Spanish', 'Tapas', 'Mediterranean'],
                address: '2500 Ponce de Leon Blvd, Coral Gables, FL 33134',
                phone: '(305) 441-0107',
                coordinates: { latitude: 25.7525, longitude: -80.2588 },
                isClosed: false,
                yelpUrl: 'https://www.yelp.com/biz/bulla-gastrobar-coral-gables'
            },
            {
                id: 'mock-kyu',
                name: 'KYU',
                image: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=400&h=300&fit=crop',
                rating: 4.5,
                reviewCount: 1876,
                price: '$$$',
                categories: ['Asian Fusion', 'Japanese', 'BBQ'],
                address: '251 NW 25th St, Miami, FL 33127',
                phone: '(786) 577-0150',
                coordinates: { latitude: 25.8000, longitude: -80.1995 },
                isClosed: false,
                yelpUrl: 'https://www.yelp.com/biz/kyu-miami'
            },
            {
                id: 'mock-ariete',
                name: 'Ariete',
                image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
                rating: 4.6,
                reviewCount: 1432,
                price: '$$$',
                categories: ['American', 'Cuban', 'Latin'],
                address: '3540 Main Hwy, Miami, FL 33133',
                phone: '(305) 640-5862',
                coordinates: { latitude: 25.7270, longitude: -80.2414 },
                isClosed: false,
                yelpUrl: 'https://www.yelp.com/biz/ariete-miami'
            },
            {
                id: 'mock-azucar',
                name: 'Azucar Ice Cream',
                image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=300&fit=crop',
                rating: 4.6,
                reviewCount: 2567,
                price: '$',
                categories: ['Ice Cream', 'Cuban', 'Desserts'],
                address: '1503 SW 8th St, Miami, FL 33135',
                phone: '(305) 381-0369',
                coordinates: { latitude: 25.7654, longitude: -80.2150 },
                isClosed: false,
                yelpUrl: 'https://www.yelp.com/biz/azucar-ice-cream-company-miami'
            },
            {
                id: 'mock-yardbird',
                name: 'Yardbird Southern Table & Bar',
                image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop',
                rating: 4.4,
                reviewCount: 3421,
                price: '$$$',
                categories: ['Southern', 'American', 'Comfort Food'],
                address: '1600 Lenox Ave, Miami Beach, FL 33139',
                phone: '(305) 538-5220',
                coordinates: { latitude: 25.7900, longitude: -80.1395 },
                isClosed: false,
                yelpUrl: 'https://www.yelp.com/biz/yardbird-southern-table-and-bar-miami-beach'
            },
            {
                id: 'mock-lucali',
                name: 'Lucali',
                image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
                rating: 4.3,
                reviewCount: 1987,
                price: '$$',
                categories: ['Pizza', 'Italian'],
                address: '1930 Bay Rd, Miami Beach, FL 33139',
                phone: '(305) 695-4441',
                coordinates: { latitude: 25.7950, longitude: -80.1450 },
                isClosed: false,
                yelpUrl: 'https://www.yelp.com/biz/lucali-miami-beach'
            }
        ];
    }

    // ============ EXPORT ============

    return {
        searchRestaurants,
        getRestaurantDetails,
        getRandomRestaurant,
        spinForRestaurant,
        USE_MOCK_DATA
    };
})();

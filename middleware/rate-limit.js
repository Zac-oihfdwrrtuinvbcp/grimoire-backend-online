//Imports
const rateLimit = require('express-rate-limit');

// Create a rate limiter instance
const limiter = rateLimit({
	windowMs: 5 * 60 * 1000, 		// Time window in milliseconds (5 minutes)
	limit: 5, 						// Maximum number of requests per window
	standardHeaders: 'draft-7', 	// Use draft-7 standard headers
	legacyHeaders: false, 			// Disable legacy headers
});

// Export the limiter middleware for use in other files
module.exports = limiter;
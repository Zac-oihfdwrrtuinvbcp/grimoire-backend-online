const passwordValidator = require('password-validator');

// Create a new instance of passwordValidator
const passwordSchema = new passwordValidator();

// Define the password validation rules
passwordSchema
  .is().min(8)                                      // Minimum length 8
  .is().max(32)                                     // Maximum length 32
  .has().uppercase()                                // Must have uppercase letters
  .has().lowercase()                                // Must have lowercase letters
  .has().digits()                                   // Must have digits
  .has().not().spaces()                             // Should not have spaces
  .is().not().oneOf(['Passw0rd', 'Password123']);

// Middleware function to validate passwords
const validatePassword = (req, res, next) => {
    // Extract the password from the request body
    const password = req.body.password;

    // Check if the password meets all the criteria
    if (!passwordSchema.validate(password)) {
        // If validation fails, send a 400 Bad Request response
        res.status(400).json({message: "Le mot de passe ne respecte pas les critères de sécurité"});
    } else {
        // If validation passes, proceed to the next middleware
        next();
    };
};

// Export the validatePassword middleware for use in other files
module.exports = validatePassword;
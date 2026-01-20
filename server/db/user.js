const User = require("../Schemas/userSchema");


/**
 * Insert a new user into the database
 * @param {String} username - Username
 * @param {String} email - Email address
 * @param {String} avatar - Avatar URL
 * @param {String} hashedPassword - Hashed password
 * @returns {Promise<Object>} Created user document
 */
const insertUser = async (username, email, avatar, hashedPassword) => {
    const user = new User({
        username,
        email,
        avatar,
        hashedPassword,
    });
    await user.save();
    return user;
};


/**
 * Find a user by identifier (email or username)
 * @param {String} identifier - Email or username
 * @returns {Promise<Object|null>} User document or null
 */
const findUserByIdentifier = async (identifier) => {
    let user;
    if (!identifier.includes('@')) {
        user = await User.findOne({ username: identifier });
    } else {
        user = await User.findOne({ email: identifier });
    }
    return user;
};


/**
 * Find a user by email
 * @param {String} email - Email address
 * @returns {Promise<Object|null>} User document or null
 */
const findUserByEmail = async (email) => {
    const user = await User.findOne({ email });
    return user;
};


/**
 * Find a user by username
 * @param {String} username - Username
 * @returns {Promise<Object|null>} User document or null
 */
const findUserByUsername = async (username) => {
    const user = await User.findOne({ username });
    return user;
};


/**
 * Find a user by ID
 * @param {String} userId - User ID
 * @returns {Promise<Object|null>} User document or null
 */
const findUserById = async (userId) => {
    const user = await User.findById(userId);
    return user;
};


/**
 * Update user profile information
 * @param {String} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated user document or null
 */
const updateUserById = async (userId, updateData) => {
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
    );
    return updatedUser;
};


module.exports = {
    insertUser,
    findUserByIdentifier,
    findUserByEmail,
    findUserByUsername,
    findUserById,
    updateUserById
};
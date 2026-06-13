const userRepository = require("../db/user");
const { generateToken } = require("../helpers/general");
const { comparePassword, hashPassword } = require("../helpers/user");
const emailValidator = require("email-validator");
const gravatar = require("gravatar");
const cloudinary = require("../utils/cloudinaryV2");


/**
 * Currency codes the app supports. Keep in sync with
 * client/src/utils/currency.ts (SUPPORTED_CURRENCIES).
 */
const SUPPORTED_CURRENCIES = [
    "USD", "EUR", "GBP", "BDT", "INR", "JPY", "CNY",
    "CAD", "AUD", "PKR", "SAR", "AED", "MYR", "NGN", "BRL",
];

/**
 * Public projection of a user document — never exposes the password hash.
 */
const sanitizeUser = (user) => ({
    _id: user._id,
    username: user.username,
    email: user.email,
    name: user.name ?? "",
    avatar: user.avatar ?? "",
    created_at: user.createdAt,
    preferences: {
        currency: user.preferences?.currency ?? "USD",
    },
});


/**
 * Authenticate user and generate token
 */
const loginUser = async (identifier, password) => {
    const user = await userRepository.findUserByIdentifier(identifier);
    if (!user) {
        throw new Error("Invalid Credentials");
    }

    const passwordMatched = await comparePassword(user, password);
    if (!passwordMatched) {
        throw new Error("Invalid Credentials");
    }

    const payload = {
        user: {
            id: user.id,
            username: user.username ?? "",
            email: user.email,
            name: user.name ?? "",
            avatar: user.avatar ?? "",
            currency: user.preferences?.currency ?? "USD",
        },
    };

    return {
        success: true,
        token: generateToken(payload)
    };
};


/**
 * Register a new user
 */
const registerUser = async (username, email, password, currency) => {
    const userNameExist = await userRepository.findUserByUsername(username);
    if (userNameExist) {
        throw new Error("username already exist, try a different one");
    }

    const validate = await emailValidator.validate(email);
    if (!validate) {
        throw new Error("Invalid email address. Please provide a valid email.");
    }

    const userEmailExist = await userRepository.findUserByEmail(email);
    if (userEmailExist) {
        throw new Error("A user with this email address already exists. Please use a different email.");
    }

    const avatar = gravatar.url(
        email,
        {
            s: "200",
            r: "pg",
            d: "retro",
        },
        true
    );

    // Locale-detected on the client; fall back to USD on anything unexpected
    const safeCurrency = SUPPORTED_CURRENCIES.includes(currency) ? currency : "USD";

    const hashedPassword = await hashPassword(password);
    const newUser = await userRepository.insertUser(username, email, avatar, hashedPassword, safeCurrency);

    const payload = {
        user: {
            id: newUser.id,
            username: newUser.username ?? "",
            email: newUser.email,
            name: newUser.name ?? "",
            avatar: newUser.avatar ?? "",
            currency: newUser.preferences?.currency ?? "USD",
        },
    };

    return {
        success: true,
        token: generateToken(payload)
    };
};


/**
 * Get user profile information
 */
const getUserInfo = async (userId) => {
    const userInfo = await userRepository.findUserById(userId);
    if (!userInfo) {
        throw new Error("Profile not found");
    }

    return {
        success: true,
        userInfo: sanitizeUser(userInfo)
    };
};


/**
 * Update profile fields (name, username, email)
 */
const updateUserProfile = async (userId, { name, username, email }) => {
    const user = await userRepository.findUserById(userId);
    if (!user) {
        throw new Error("Profile not found");
    }

    const updateData = {};

    if (name !== undefined) {
        updateData.name = String(name).trim();
    }

    if (username !== undefined && username !== user.username) {
        const trimmedUsername = String(username).trim();
        if (!trimmedUsername) {
            throw new Error("Username cannot be empty");
        }
        const usernameTaken = await userRepository.findUserByUsername(trimmedUsername);
        if (usernameTaken && usernameTaken.id !== user.id) {
            throw new Error("Username already taken, try a different one");
        }
        updateData.username = trimmedUsername;
    }

    if (email !== undefined && email !== user.email) {
        if (!emailValidator.validate(email)) {
            throw new Error("Invalid email address. Please provide a valid email.");
        }
        const emailTaken = await userRepository.findUserByEmail(email);
        if (emailTaken && emailTaken.id !== user.id) {
            throw new Error("A user with this email address already exists.");
        }
        updateData.email = email;
    }

    const updatedUser = await userRepository.updateUserById(userId, updateData);

    return {
        success: true,
        userInfo: sanitizeUser(updatedUser)
    };
};


/**
 * Get user preferences
 */
const getUserPreferences = async (userId) => {
    const user = await userRepository.findUserById(userId);
    if (!user) {
        throw new Error("Profile not found");
    }

    return {
        success: true,
        preferences: {
            currency: user.preferences?.currency ?? "USD",
        },
    };
};


/**
 * Update user preferences (currently: currency)
 */
const updateUserPreferences = async (userId, { currency }) => {
    const user = await userRepository.findUserById(userId);
    if (!user) {
        throw new Error("Profile not found");
    }

    const updateData = {};

    if (currency !== undefined) {
        if (!SUPPORTED_CURRENCIES.includes(currency)) {
            throw new Error("Unsupported currency code");
        }
        updateData["preferences.currency"] = currency;
    }

    if (Object.keys(updateData).length === 0) {
        throw new Error("Nothing to update");
    }

    const updatedUser = await userRepository.updateUserById(userId, updateData);

    return {
        success: true,
        preferences: {
            currency: updatedUser.preferences?.currency ?? "USD",
        },
    };
};


/**
 * Change password after verifying the current one
 */
const changeUserPassword = async (userId, currentPassword, newPassword) => {
    const user = await userRepository.findUserById(userId);
    if (!user) {
        throw new Error("Profile not found");
    }

    const passwordMatched = await comparePassword(user, currentPassword);
    if (!passwordMatched) {
        throw new Error("Current password is incorrect");
    }

    const hashedPassword = await hashPassword(newPassword);
    await userRepository.updateUserById(userId, { password: hashedPassword });

    return { success: true, message: "Password updated successfully" };
};


/**
 * Upload a new avatar image and save its URL
 */
const updateUserAvatar = async (userId, fileBuffer) => {
    const user = await userRepository.findUserById(userId);
    if (!user) {
        throw new Error("Profile not found");
    }

    const uploadResult = await cloudinary.uploadOnCloudinary(fileBuffer);
    if (!uploadResult?.secure_url) {
        throw new Error("Failed to upload image");
    }

    const updatedUser = await userRepository.updateUserById(userId, {
        avatar: uploadResult.secure_url
    });

    return {
        success: true,
        userInfo: sanitizeUser(updatedUser)
    };
};


module.exports = {
    loginUser,
    registerUser,
    getUserInfo,
    updateUserProfile,
    getUserPreferences,
    updateUserPreferences,
    changeUserPassword,
    updateUserAvatar
};
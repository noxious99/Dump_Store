const User = require("../Schemas/userSchema");
const { findUserByIdentifier, createNewUser } = require("../db/user");
const { generateToken } = require("../helpers/general");
const { comparePassword, hashPassword } = require("../helpers/user");
const emailValidator = require("email-validator")
const gravatar = require("gravatar");


const loginUser = async (identifier, password) => {
    const user = await findUserByIdentifier(identifier)
    if (!user) {
        throw new Error("Invalid Credentials");
    }
    const passwordMatched = await comparePassword(user, password)
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
        },
    };
    return {
        success: true,
        token: generateToken(payload)
    };
}


const registerUser = async (username, email, password) => {
    let userNameExist = await User.findOne({ username })
    if (userNameExist) {
        throw new Error("username already exist, try a different one");
    }
    let validate = await emailValidator.validate(email)
    if (!validate) {
        throw new Error("Invalid email address. Please provide a valid email.");
    }
    let user = await User.findOne({ email });
    if (user) {
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
    const hashedPassword = await hashPassword(password)
    const newUser = await createNewUser(username, email, avatar, hashedPassword)
    const payload = {
        user: {
            id: newUser.id,
            username: newUser.username ?? "",
            email: newUser.email,
            name: newUser.name ?? "",
            avatar: newUser.avatar ?? "",
        },
    };
    return {
        success: true,
        token: generateToken(payload)
    }
}


const getUserInfo = async (userId) => {
    const userInfo = await User.findOne({ _id: userId });
    if (!userInfo) {
        throw new Error("Profile not found");
    }
    return {
        success: true,
        userInfo
    }
}


module.exports = {
    loginUser,
    registerUser,
    getUserInfo
}
const User = require("../Schemas/userSchema");


const createNewUser = async (username, email, avatar, hashedPassword) => {
    const user = new User({
        username,
        email,
        avatar,
        hashedPassword,
    });
    await user.save();
    return user
}

const findUserByIdentifier = async (identifier) => {
    let user;
    if (!identifier.includes('@')) {
        user = await User.findOne({ username: identifier });
    } else {
        user = await User.findOne({ email: identifier });
    }
    return user
}

module.exports = {
    findUserByIdentifier,
    createNewUser
};
const bcrypt = require("bcryptjs");

const comparePassword = async (user, userInputedPassword) => {
    const isMatch = await bcrypt.compare(userInputedPassword, user.password);
    return isMatch
}

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

module.exports = {
    comparePassword,
    hashPassword
}
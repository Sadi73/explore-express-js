const users = require("../models/users.model");
const { sendSuccess } = require("../utils/response");

const getUsers = (req, res) => {
    return sendSuccess(res, users, 'Users fetched successfully');
};

module.exports = getUsers;
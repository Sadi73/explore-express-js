const users = require("../models/users.model");

const getUsers = (req, res) => {
    res.json(users);
};

module.exports = getUsers;
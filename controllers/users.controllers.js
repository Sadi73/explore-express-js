const users = require("../models/users.models");

const getUsers = (req, res) => {
    res.json(users);
};

module.exports = getUsers;
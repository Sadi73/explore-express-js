const express = require('express');
const { getAllEmployees, createEmployee } = require('../controllers/employees.controller');
const router = express.Router();

router.get('/employees', getAllEmployees);

router.post('/employees', createEmployee);

module.exports = { employeeRouter: router };
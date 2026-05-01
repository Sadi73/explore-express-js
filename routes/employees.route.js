const express = require('express');
const { getAllEmployees, createEmployee, updateEmployee } = require('../controllers/employees.controller');
const router = express.Router();

router.get('/employees', getAllEmployees);

router.post('/employees', createEmployee);
router.put('/employees/:id', updateEmployee);

module.exports = { employeeRouter: router };
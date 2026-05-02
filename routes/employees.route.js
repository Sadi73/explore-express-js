const express = require('express');
const { getAllEmployees, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employees.controller');
const router = express.Router();

router.get('/employees', getAllEmployees);

router.post('/employees', createEmployee);
router.put('/employees/:id', updateEmployee);
router.delete('/employees/:id', deleteEmployee);

module.exports = { employeeRouter: router };
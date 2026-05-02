const Employees = require("../models/employees.model");
const { sendSuccess, sendError } = require("../utils/response");

const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employees.find();
        return sendSuccess(res, employees, 'Employees fetched successfully');
    } catch (error) {
        return sendError(res, 'Error fetching employees', 500);
    }
};

const createEmployee = async (req, res) => {
    try {
        const employee = await Employees.create(req.body);
        return sendSuccess(res, employee, 'Employee created successfully');
    } catch (err) {
        return sendError(res, 'Error creating employee', 400);
    }
};

const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedEmployee = await Employees.findByIdAndUpdate(
            id,
            req.body,
            {
                returnDocument: 'after',       // return updated document
                runValidators: true // validate before updating
            }
        );

        if (!updatedEmployee) {
            return sendError(res, 'Employee not found', 404);
        }

        return sendSuccess(res, updatedEmployee, 'Employee updated successfully');
    } catch (err) {
        return sendError(res, 'Error updating employee', 400);
    }
};

module.exports = { getAllEmployees, createEmployee, updateEmployee };

const Employees = require("../models/employees.model");

const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employees.find();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employees', error: error.message });
    }
};

const createEmployee = async (req, res) => {
    try {
        const employee = await Employees.create(req.body);
        res.status(201).json(employee);
    } catch (err) {
        res.status(400).json({ error: err.message });
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
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json(updatedEmployee);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = { getAllEmployees, createEmployee, updateEmployee };

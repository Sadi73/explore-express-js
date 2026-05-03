const Employees = require("../models/employees.model");
const { sendSuccess, sendError } = require("../utils/response");

const getAllEmployees = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        let query = {};
        if (search) {
            const searchRegex = new RegExp(search, 'i'); // Case-insensitive regex
            query = {
                $or: [
                    { name: searchRegex },
                    { email: searchRegex },
                    { position: searchRegex },
                    { companyName: searchRegex }
                ]
            };
        }

        const [employees, totalEmployees] = await Promise.all([
            Employees.find(query)
                .sort({ id: 1 })
                .limit(limitNum)
                .skip((pageNum - 1) * limitNum),
            Employees.countDocuments(query)
        ]);

        const pagination = {
            totalItems: totalEmployees,
            currentPage: pageNum,
            itemsPerPage: limitNum,
            totalPages: Math.ceil(totalEmployees / limitNum),
            hasNextPage: pageNum * limitNum < totalEmployees,
            hasPrevPage: pageNum > 1
        };

        return sendSuccess(res, { employees, pagination }, 'Employees fetched successfully');
    } catch (error) {
        console.error("Fetch Error:", error);
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

const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedEmployee = await Employees.findByIdAndDelete(id);

        if (!deletedEmployee) {
            return sendError(res, 'Employee not found', 404);
        }

        return sendSuccess(res, deletedEmployee, 'Employee deleted successfully');
    } catch (err) {
        return sendError(res, 'Error deleting employee', 400);
    }
};

module.exports = { getAllEmployees, createEmployee, updateEmployee, deleteEmployee };

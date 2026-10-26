const Employees = require("../models/employees.model");
const sendSuccess = require("../utils/response");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const getAllEmployees = asyncHandler(async (req, res) => {
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
});


const createEmployee = asyncHandler(async (req, res) => {
    const employee = await Employees.create(req.body);
    return sendSuccess(res, employee, 'Employee created successfully');
});

const updateEmployee = asyncHandler(async (req, res) => {
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
        throw new AppError("Employee not found", 404);
    }

    return sendSuccess(res, updatedEmployee, 'Employee updated successfully');
});

const deleteEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const deletedEmployee = await Employees.findByIdAndDelete(id);

    if (!deletedEmployee) {
        throw new AppError("Employee not found", 404);
    }

    return sendSuccess(res, deletedEmployee, 'Employee deleted successfully');
});

module.exports = { getAllEmployees, createEmployee, updateEmployee, deleteEmployee };

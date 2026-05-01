const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    id:{
        type: Number,
        required: true,
        unique: true
    },
    name:{
        type: String,
        required: true,
        unique: true
    },
    position:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
});

const Employees = mongoose.model('employees', employeeSchema);

module.exports = Employees;

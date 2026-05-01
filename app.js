const express = require('express');
const cors = require('cors');
const { userRouter } = require('./routes/users.routes');
const { employeeRouter } = require('./routes/employees.route');

const app = express();

app.use(cors());
app.use(express.json());

app.use(userRouter);
app.use(employeeRouter);

app.get('/', (req, res) => {
    res.send('Server is running!')
});


// Handle 404 errors. This should be the last route handler, after all other routes have been defined.
app.use((req, res, next) => {
    res.status(404).json({
        message: 'Not Found',
        path: req.originalUrl,
    });
});
// Handle 404 errors. This should be the last route handler, after all other routes have been defined.
app.use((req, res, next) => {
    res.status(404).json({
        message: 'Not Found',
        path: req.originalUrl,
    });
});

// Handle server errors (500).
app.use((err, req, res, next) => {
    res.status(500).json({
        message: 'Internal Server Error',
    });
});

module.exports = app;
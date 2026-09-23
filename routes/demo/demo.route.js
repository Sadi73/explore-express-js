const express = require("express");
const sendSuccess = require("../../utils/response");
const upload = require("../../middlewares/multer.middleware");

const router = express.Router();

// Demo route with all four primary HTTP methods
router.route("/")
    .get((req, res) => {
        sendSuccess(res, null, "GET request received: Data retrieved successfully", 200);
    })
    .post((req, res) => {
        const payload = req.body;
        console.log(payload)
        sendSuccess(res, payload, "POST request received: Data created successfully", 201);
    })
    .put((req, res) => {
        const payload = req.body;
        console.log(payload)
        sendSuccess(res, payload, "PUT request received: Data updated successfully", 200);
    })
    .delete((req, res) => {
        sendSuccess(res, null, "DELETE request received: Data removed successfully", 200);
    });

router.post("/create", (req, res) => {
    const payload = req.body;
    console.log(payload)
    sendSuccess(res, payload, "POST request received: Data created successfully", 201);
});

router.post("/create-with-file", upload.single('file'), (req, res) => {
    const payload = req.body;
    const fileInfo = req.file;
    sendSuccess(res, { payload, fileInfo }, "POST request received: Data created successfully", 201);
});

router.put("/update", (req, res) => {
    const payload = req.body;
    console.log(payload)
    sendSuccess(res, payload, "PUT request received: Data updated successfully", 200);
});

router.delete("/delete/:id", (req, res) => {
    const { id } = req.params;
    console.log(id)
    sendSuccess(res, null, `DELETE request received: id ${id} removed successfully`, 200);
});

module.exports = router;

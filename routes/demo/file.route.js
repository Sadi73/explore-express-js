const express = require("express");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs/promises");
const upload = require("../../middlewares/multer.middleware");
const sendSuccess = require("../../utils/response");
const AppError = require("../../utils/AppError");

const router = express.Router();

// Base uploads directory (ensured to exist)
const UPLOADS_DIR = path.join(__dirname, "../../public/uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helper: Sanitize filename to prevent directory traversal
const getSafeFilePath = (filename) => {
    const safeFilename = path.basename(filename);
    const filePath = path.join(UPLOADS_DIR, safeFilename);
    return { safeFilename, filePath };
};

// Helper: Format bytes into human-readable format
const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/* ==========================================================================
   1. READ & INSPECT EXAMPLES
   ========================================================================== */

/**
 * 1.1 List all uploaded files with metadata & access links
 * GET /api/v1/files/list
 */
router.get("/list", async (req, res) => {
    const files = await fsPromises.readdir(UPLOADS_DIR);

    const fileList = await Promise.all(
        files.map(async (filename) => {
            const filePath = path.join(UPLOADS_DIR, filename);
            const stats = await fsPromises.stat(filePath);

            return {
                filename,
                size: stats.size,
                readableSize: formatBytes(stats.size),
                extension: path.extname(filename),
                createdAt: stats.birthtime,
                updatedAt: stats.mtime,
                viewUrl: `/api/v1/files/file/${filename}`,
                downloadUrl: `/api/v1/files/download-file/${filename}`,
                streamUrl: `/api/v1/files/stream/${filename}`
            };
        })
    );

    return sendSuccess(res, { total: fileList.length, files: fileList }, "Files listed successfully", 200);
});

/**
 * 1.2 Get detailed metadata for a specific file
 * GET /api/v1/files/info/:filename
 */
router.get("/info/:filename", async (req, res) => {
    const { safeFilename, filePath } = getSafeFilePath(req.params.filename);

    if (!fs.existsSync(filePath)) {
        throw new AppError(`File '${safeFilename}' not found`, 404);
    }

    const stats = await fsPromises.stat(filePath);

    const fileDetails = {
        filename: safeFilename,
        sizeInBytes: stats.size,
        readableSize: formatBytes(stats.size),
        extension: path.extname(safeFilename),
        mimeTypeGuess: req.headers["content-type"] || "application/octet-stream",
        createdAt: stats.birthtime,
        lastModified: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
    };

    return sendSuccess(res, fileDetails, "File details retrieved successfully", 200);
});

/* ==========================================================================
   2. SERVE, DOWNLOAD & STREAM EXAMPLES
   ========================================================================== */

/**
 * 2.1 View / Stream file directly (Inline browser rendering: PDF, Images, Audio, Video)
 * GET /api/v1/files/file/:filename
 */
router.get("/file/:filename", (req, res, next) => {
    const { safeFilename, filePath } = getSafeFilePath(req.params.filename);

    // res.sendFile serves the file inline by default
    return res.sendFile(filePath, (err) => {
        if (err) {
            if (res.headersSent) return;
            return next(new AppError(`File '${safeFilename}' not found`, 404, err));
        }
    });
});

/**
 * 2.2 Forced download (Attachment with custom or original filename)
 * GET /api/v1/files/download-file/:filename
 */
router.get("/download-file/:filename", (req, res, next) => {
    const { safeFilename, filePath } = getSafeFilePath(req.params.filename);

    // res.download sets 'Content-Disposition: attachment; filename=...'
    return res.download(filePath, safeFilename, (err) => {
        if (err) {
            if (res.headersSent) return;
            return next(new AppError(`File '${safeFilename}' not found or cannot be downloaded`, 404, err));
        }
    });
});

/**
 * 2.3 Stream file using Node.js ReadStream (Efficient for large files, minimal memory)
 * GET /api/v1/files/stream/:filename
 */
router.get("/stream/:filename", (req, res, next) => {
    const { safeFilename, filePath } = getSafeFilePath(req.params.filename);

    if (!fs.existsSync(filePath)) {
        return next(new AppError(`File '${safeFilename}' not found`, 404));
    }

    const readStream = fs.createReadStream(filePath);

    readStream.on("open", () => {
        // Stream directly to HTTP response
        readStream.pipe(res);
    });

    readStream.on("error", (err) => {
        if (!res.headersSent) {
            return next(new AppError("Error while streaming file", 500, err));
        }
    });
});

/**
 * 2.4 Dynamic in-memory file generation and download (e.g. CSV/JSON export without saving to disk)
 * GET /api/v1/files/generate/csv
 */
router.get("/generate/csv", (req, res) => {
    // Sample dynamic dataset
    const sampleData = [
        ["ID", "Name", "Role", "Created At"],
        ["1", "Alice", "Admin", new Date().toISOString()],
        ["2", "Bob", "User", new Date().toISOString()],
        ["3", "Charlie", "Manager", new Date().toISOString()]
    ];

    const csvContent = sampleData.map((row) => row.join(",")).join("\n");

    const exportFilename = `report-${Date.now()}.csv`;

    // Instruct the browser to download the content as a file
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${exportFilename}"`);

    return res.status(200).send(csvContent);
});

/* ==========================================================================
   3. UPLOAD EXAMPLES (MULTER)
   ========================================================================== */

/**
 * 3.1 Single file upload
 * POST /api/v1/files/single-file-upload
 * Form-Data Field: 'file'
 */
router.post("/single-file-upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        throw new AppError("No file uploaded. Please provide a file under the 'file' field.", 400);
    }

    const payload = req.body;
    const fileInfo = req.file;

    return sendSuccess(res, { payload, fileInfo }, "File uploaded successfully", 201);
});

/**
 * 3.2 Multiple files upload (under single field)
 * POST /api/v1/files/multiple-file-upload
 * Form-Data Field: 'files' (max 5)
 */
router.post("/multiple-file-upload", upload.array("files", 5), (req, res) => {
    if (!req.files || req.files.length === 0) {
        throw new AppError("No files uploaded. Please provide files under the 'files' field.", 400);
    }

    const payload = req.body;
    const filesInfo = req.files;

    return sendSuccess(res, { payload, filesInfo }, "Files uploaded successfully", 201);
});

/**
 * 3.3 Multiple files upload (under multiple distinct fields)
 * POST /api/v1/files/multiple-file-upload-with-fields
 * Form-Data Fields: 'file1', 'file2'
 */
router.post(
    "/multiple-file-upload-with-fields",
    upload.fields([
        { name: "file1", maxCount: 1 },
        { name: "file2", maxCount: 1 }
    ]),
    (req, res) => {
        if (!req.files || Object.keys(req.files).length === 0) {
            throw new AppError("No files uploaded. Expected fields 'file1' and/or 'file2'.", 400);
        }

        const payload = req.body;
        const filesInfo = req.files;

        return sendSuccess(res, { payload, filesInfo }, "Files uploaded successfully", 201);
    }
);

/**
 * 3.4 Multipart form-data with ONLY text fields (No files accepted)
 * POST /api/v1/files/text-only-multipart
 */
router.post("/text-only-multipart", upload.none(), (req, res) => {
    const payload = req.body;
    return sendSuccess(res, payload, "Multipart text-only payload received successfully", 200);
});

/* ==========================================================================
   4. FILE MODIFICATION & DELETION EXAMPLES
   ========================================================================== */

/**
 * 4.1 Rename an existing file on disk
 * PATCH /api/v1/files/rename/:filename
 * Body JSON: { "newFilename": "custom-name.png" }
 */
router.patch("/rename/:filename", async (req, res) => {
    const { safeFilename: oldSafeFilename, filePath: oldPath } = getSafeFilePath(req.params.filename);
    const { newFilename } = req.body;

    if (!newFilename || typeof newFilename !== "string") {
        throw new AppError("Please provide a valid 'newFilename' in the request body", 400);
    }

    const { safeFilename: newSafeFilename, filePath: newPath } = getSafeFilePath(newFilename);

    if (!fs.existsSync(oldPath)) {
        throw new AppError(`File '${oldSafeFilename}' not found`, 404);
    }

    if (fs.existsSync(newPath)) {
        throw new AppError(`A file with name '${newSafeFilename}' already exists`, 409);
    }

    await fsPromises.rename(oldPath, newPath);

    return sendSuccess(
        res,
        { oldFilename: oldSafeFilename, newFilename: newSafeFilename },
        "File renamed successfully",
        200
    );
});

/**
 * 4.2 Delete a file from disk
 * DELETE /api/v1/files/delete/:filename
 */
router.delete("/delete/:filename", async (req, res) => {
    const { safeFilename, filePath } = getSafeFilePath(req.params.filename);

    if (!fs.existsSync(filePath)) {
        throw new AppError(`File '${safeFilename}' not found`, 404);
    }

    await fsPromises.unlink(filePath);

    return sendSuccess(res, { deletedFilename: safeFilename }, "File deleted successfully", 200);
});

module.exports = router;

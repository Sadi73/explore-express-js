const app = require("./app");

const port = process.env.PORT || 5000;
let server;

const startServer = async () => {
    try {
        server = app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    } catch (error) {
        console.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

startServer();

// --- Graceful Shutdown & Process Listeners ---
let isShuttingDown = false;

const handleShutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`\n[${signal}] signal received. Starting graceful shutdown...`);

    // Force shutdown if cleanup takes too long
    const forceExitTimeout = setTimeout(() => {
        console.error("Forceful shutdown initiated after timeout.");
        process.exit(1);
    }, 10000);

    if (forceExitTimeout.unref) {
        forceExitTimeout.unref();
    }

    try {
        if (server) {
            await new Promise((resolve, reject) => {
                server.close((err) => {
                    if (err) return reject(err);
                    console.log("HTTP server closed. In-flight requests finished.");
                    resolve();
                });
            });
        }

        // if (mongoose.connection.readyState !== 0) {
        //     await mongoose.connection.close(false);
        //     console.log("MongoDB connection closed.");
        // }

        clearTimeout(forceExitTimeout);
        process.exit(0);
    } catch (err) {
        console.error("Error during graceful shutdown:", err);
        process.exit(1);
    }
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    handleShutdown("UNHANDLED_REJECTION");
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception thrown:", error);
    handleShutdown("UNCAUGHT_EXCEPTION");
});
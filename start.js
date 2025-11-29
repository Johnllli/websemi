// Import the app from app.js (which includes all routing and setup)
const app = require('./app');

// Define the port to run the server
const PORT = 4205; // Updated port number

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

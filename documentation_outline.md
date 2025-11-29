1. Title Page
   Project Title: Web-Programming II – Seminar - Homework - NodeJS

Group Members: [Your Name & Neptun Code], [Partner's Name & Neptun Code]

Course: Web-Programming II – Seminar

Date: [Submission Date]

University: [Your University Name]

2. Table of Contents
   Automatically generated or manually created list of sections with page numbers.

3. Introduction
   This document serves as the comprehensive documentation for the Web-Programming II seminar homework, developed as a server-side web application in Node.js. The project's core technologies are Express.js for server-side logic and EJS for dynamic templating. The website's theme is "The World of István Fekete," focusing on novels and animals.

The application implements:

Robust user authentication with three roles: visitor, registered visitor, and admin.

Data display from the chosen database, which uses three tables.

A contact form with message storage in the database.

Full CRUD (Create, Read, Update, Delete) functionality for the "Animals" database table.

The project was completed by a group of two, and individual contributions are detailed within the document. Essential access details, including the project URL and GitHub site, are provided as required. The final documentation will be submitted in PDF format.

4. Project Setup & Environment
   This section details the technical environment and setup required for the project, including server access, version control, and database configuration.

4.1 Linux Server Details: 💻
This subsection provides the necessary information for accessing and deploying the application on the designated Linux server.

IP Address: 143.47.98.96

SSH Username: studentXXX

Application Start Path: /home/studentXXX/exercise/start.js

Deployment: The application is initiated by the start.js file.

Screenshot: An SSH terminal session showing successful login or the directory structure.

4.2 GitHub Repository: 
This part documents the use of GitHub for version control, a mandatory requirement.

Public GitHub Repository URL: [Your GitHub Repo URL]

Access: The repository is public to allow for verification of the source code and commit history.

Screenshot: The main page of your GitHub repository.

4.3 Database Connection: 💾
This subsection describes the database chosen for the project and the connection details. The database configuration is managed in a modular way, separate from the main application logic, by importing a db object from ./config/db.js into app.js.

Type of database used: MySQL.

Connection string/details: The connection details are stored in environment variables for security and flexibility. The `db.js` file uses `mysql2` to create a connection pool.

Code Snippet:
```javascript
require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
```

Screenshot: A database client (e.g., MongoDB Compass, MySQL Workbench) showing the connected database and some collections/tables.

5. Task 1: Free Responsive Theme (2 p)
   This task involved selecting and integrating a free responsive HTML/CSS theme into the web application to provide a modern and adaptable user interface that functions well across various devices.

5.1 Chosen Theme:
This section identifies and justifies the specific theme selected.

Name of the theme and source: (e.g., "We chose the 'Phantom' theme from HTML5 UP (html5up.net)").

Justification: The choice was based on its responsiveness, modern aesthetic appeal, and ease of integration with the Node.js/Express.js structure.

5.2 Implementation:
The theme's assets (CSS, JS, images) were placed in the public directory. The app.js file was configured to serve static files from this directory using Express middleware. The theme's HTML structure was incorporated into the EJS templating engine.

Screenshot: Your website's main page, showcasing the responsive design on a desktop view.

Screenshot: Your website's main page, showcasing the responsive design on a mobile view (e.g., using browser developer tools).

Code Snippet: Example of your main layout file (views/index.html) showing how theme assets (CSS, JS) are linked.
```html
<!DOCTYPE HTML>
<html>
	<head>
		<title>The World of István Fekete</title>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
		<link rel="stylesheet" href="assets/css/main.css" />
	</head>
	<body class="homepage is-preload">
		<div id="page-wrapper">
			<!-- Header -->
			<%- include('partials/header.html', { currentPage: 'home' }) %>
			<!-- ... other content ... -->
		</div>
		<!-- Scripts -->
		<script src="assets/js/jquery.min.js"></script>
		<script src="assets/js/jquery.dropotron.min.js"></script>
		<script src="assets/js/browser.min.js"></script>
		<script src="assets/js/breakpoints.min.js"></script>
		<script src="assets/js/util.js"></script>
		<script src="assets/js/main.js"></script>
	</body>
</html>
```

6. Task 2: Authentication (Mandatory!) (4 p)
   This mandatory task implemented a robust user authentication system, including registration, login, and logout. It defines and enforces three distinct user roles with specific access privileges.

6.1 User Roles: 👥
The three implemented roles are:

Visitor: An unauthenticated user with limited access to public pages only (e.g., Home, Database, Contact).

Registered Visitor: A logged-in user who gains access to specific features, notably the "Messages" menu.

Admin: A user with elevated privileges, capable of accessing the "Admin" menu and other management functions.

Role status is stored in the session (req.session.userId, req.session.isAdmin) and made globally available to EJS templates via res.locals for conditional rendering of menu items.

Code Snippet: The `app.js` middleware that makes user information and roles available to all templates.
```javascript
// Make user info and routePrefix available in all templates
app.use(async (req, res, next) => {
  res.locals.userId = req.session.userId;
  res.locals.userName = req.session.userName;
  res.locals.isAdmin = req.session.isAdmin;
  res.locals.routePrefix = routePrefix; // Make routePrefix available

  if (req.session.userId) {
    try {
      const [users] = await db.query('SELECT email FROM users WHERE id = ?', [req.session.userId]);
      if (users.length > 0) {
        res.locals.userEmail = users[0].email;
      }
    } catch (err) {
      console.error('Error fetching user email for res.locals:', err);
      res.locals.userEmail = '';
    }
  } else {
    res.locals.userEmail = '';
  }
  next();
});
```

6.2 Registration Process:
The registration flow allows new users to create an account.

Server Logic: The server-side logic processes the form submission, which involves hashing the password (e.g., using bcrypt) and storing user details in the database.

Code Snippet: The `routes/register.js` file handling user registration.
```javascript
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

// GET registration page
router.get('/', (req, res) => {
  res.render('register.html', { error: null, success: null, currentPage: 'register' });
});

// POST registration data
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      return res.render('register.html', { error: 'User with this email already exists.', success: null, currentPage: 'register' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    await db.query('INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, 0]);

    res.render('register.html', { error: null, success: 'Registration successful! You can now log in.', currentPage: 'register' });
  } catch (err) {
    console.error('Registration failed:', err);
    res.status(500).render('register.html', { error: 'An error occurred during registration.', success: null, currentPage: 'register' });
  }
});

module.exports = router;
```

Screenshot: The registration form.


Getty Images
6.3 Login Process:
The login process allows registered users to authenticate.

Server Logic: Credentials are verified against the database. On success, the user's session variables are set, and the user is redirected.

Code Snippet: The `routes/login.js` file handling user login.
```javascript
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

// GET login page
router.get('/', (req, res) => {
  res.render('login.html', { error: null, currentPage: 'login' });
});

// POST login credentials
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      // Email does not exist
      return res.render('login.html', { error: 'Account does not exist.', currentPage: 'login' });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      req.session.userId = user.id;
      req.session.userName = user.name;
      req.session.isAdmin = user.is_admin;
      return res.redirect('/');
    } else {
      // Email exists, but password is wrong
      return res.render('login.html', { error: 'Invalid password.', currentPage: 'login' });
    }
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).render('login.html', { error: 'An unexpected server error occurred.', currentPage: 'login' });
  }
});

module.exports = router;
```

Screenshot: The login form.


Screenshot: The navigation bar or a section of the page showing the user's logged-in status.

6.4 Logout Process:
The logout functionality securely terminates the user's session.

Server Logic: The router destroys the user's session (req.session.destroy()) and redirects them to a public page.

Code Snippet: The `routes/logout.js` file handling user logout.
```javascript
const express = require('express');
const router = express.Router();

// GET logout
router.get('/', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      // Handle error, maybe log it and redirect
      console.error('Session destruction failed:', err);
      return res.redirect('/');
    }
    
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

module.exports = router;
```

7. Task 3: Mainpage Menu (2 p)
   This task focuses on the main landing page, which serves as an introduction to the "The World of István Fekete" theme.

7.1 Company Introduction:
The main page is designed to be spectacular and engaging.

Content: The content introduces the theme of István Fekete's works (novels and animals).

Spectacular Elements: (e.g., large hero images, carousels, or dynamic content relevant to the theme).

Code Snippet: The `routes/index.js` file, which fetches data for the main page.
```javascript
const express = require('express');
const router = express.Router();
const db = require('../config/db');

/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    // Fetch the 6 most recently published novels
    const [novels] = await db.query('SELECT * FROM novels ORDER BY pyear DESC LIMIT 6');

    // Fetch 2 random animals
    const [animals] = await db.query('SELECT * FROM animals ORDER BY RAND() LIMIT 2');

    res.render('index.html', {
      novels: novels,
      animals: animals,
      currentPage: 'home' // Pass currentPage variable
    });
  } catch (err) {
    console.error('Database query failed:', err);
    next(err);
  }
});

module.exports = router;
```

Screenshot: The main landing page of your application.


8. Task 4: Database Menu (3 p)
   This task involves displaying data from the chosen database on a dedicated "Database" page, using data from three distinct tables/collections.

8.1 Database Schema and Tables Used:
The data structure is built around the project's theme.

Tables/Collections Used:

Novels: Stores information about the novels by István Fekete.

Animals: Stores data on the animals featured in the novels.

Users: Stores user authentication details (required for authentication).

Screenshot: A diagram of your database schema (if applicable).


Shutterstock
探索
8.2 Data Display:
Data is fetched from the database and rendered using EJS templating.

Route Handling: The route handles the database queries for all three tables, including pagination logic to manage large datasets.

Interface: The interface implements a way to organize the presentation of data from all three tables (e.g., a tabbed interface or separate sections).

Display: Each table displays its respective data in a structured format.

Screenshot: The "Database" page showing data from one of the tables (e.g., a list of novels with pagination).

Code Snippet: The route handler for the "Database" page, including the database query logic.
```javascript
const express = require('express');
const router = express.Router();
const db = require('../config/db');

/* GET database page. */
router.get('/', async (req, res, next) => {
  const limit = 10; // Items per page (reduced for easier testing)

  // Get current page for each table from query parameters, default to 1
  const novelsPage = parseInt(req.query.novelsPage) || 1;
  const animalsPage = parseInt(req.query.animalsPage) || 1;
  const usersPage = parseInt(req.query.usersPage) || 1;

  // Calculate offset for each table
  const novelsOffset = (novelsPage - 1) * limit;
  const animalsOffset = (animalsPage - 1) * limit;
  const usersOffset = (usersPage - 1) * limit;

  try {
    // Fetch novels with pagination and total count
    const [novels] = await db.query('SELECT * FROM novels LIMIT ? OFFSET ?', [limit, novelsOffset]);
    const [[{ count: totalNovels }]] = await db.query('SELECT COUNT(*) as count FROM novels');
    const totalNovelsPages = Math.ceil(totalNovels / limit);

    // Fetch animals with pagination and total count
    const [animals] = await db.query('SELECT * FROM animals LIMIT ? OFFSET ?', [limit, animalsOffset]);
    const [[{ count: totalAnimals }]] = await db.query('SELECT COUNT(*) as count FROM animals');
    const totalAnimalsPages = Math.ceil(totalAnimals / limit);

    // Fetch users with pagination and total count
    const [users] = await db.query('SELECT * FROM users LIMIT ? OFFSET ?', [limit, usersOffset]);
    const [[{ count: totalUsers }]] = await db.query('SELECT COUNT(*) as count FROM users');
    const totalUsersPages = Math.ceil(totalUsers / limit);

    res.render('database.html', {
      novels: novels,
      novelsPage: novelsPage,
      totalNovelsPages: totalNovelsPages,

      animals: animals,
      animalsPage: animalsPage,
      totalAnimalsPages: totalAnimalsPages,

      users: users,
      usersPage: usersPage,
      totalUsersPages: totalUsersPages,

      currentPage: 'database'
    });
  } catch (err) {
    console.error('Database query failed:', err);
    next(err);
  }
});

module.exports = router;
```


Shutterstock
探索
9. Task 5: Contact Menu (3 p)
   This task implemented a "Contact" page with a form for sending messages to the site owner, with all submitted data being saved to the database.

9.1 Contact Form: ✉️
The form's structure is defined in views/contact.html.

Fields: The form includes a textarea for the user's message, among other potential fields (e.g., name, email).

Validation: Client-side validation ensures mandatory fields are filled.

Screenshot: The "Contact" page with the contact form.


Getty Images
探索
9.2 Message Submission:
The server-side logic handles the form's POST request.

Server Logic: The router extracts and validates the message data, including a timestamp, then inserts it into a designated database table/collection (e.g., messages).

Confirmation: A confirmation message is displayed upon successful submission.

Code Snippet: The route handler for handling contact form submissions and the database insertion logic.
```javascript
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET contact page
router.get('/', async (req, res) => {
  res.render('contact.html', {
    error: null,
    success: null,
    currentPage: 'contact' // Pass currentPage variable
  });
});

// POST contact form submission
router.post('/', async (req, res) => {
  const { message } = req.body;
  let name;
  let email;
  let role = 'visitor';

  // Determine name, email, and role based on login status
  if (req.session.userId) {
    name = req.session.userName;
    email = res.locals.userEmail; // userEmail is already fetched and available in res.locals
    if (req.session.isAdmin) {
      role = 'admin';
    } else {
      role = 'normal user';
    }
  } else {
    name = 'None';
    email = 'None';
    role = 'visitor';
  }

  try {
    await db.query('INSERT INTO message (name, email, role, message) VALUES (?, ?, ?, ?)', [name, email, role, message]);
    res.render('contact.html', {
      error: null,
      success: 'Your message has been sent successfully!',
      currentPage: 'contact' // Pass currentPage variable
    });
  } catch (err) {
    console.error('Error saving message to database:', err);
    res.status(500).render('contact.html', {
      error: 'Failed to send message. Please try again later.',
      success: null,
      currentPage: 'contact' // Pass currentPage variable
    });
  }
});

module.exports = router;
```

10. Task 6: Messages Menu (3 p)
    This task displays messages submitted via the contact form. This menu is exclusively accessible to logged-in users (Registered Visitor role) and displays messages in descending order (newest first) with timestamps.

10.1 Access Control: 🔒
Access is strictly controlled based on user authentication.

Server-Side Protection: The /messages route uses middleware to enforce access control, redirecting any unauthenticated user who attempts direct access.

Client-Side Protection: The "Messages" link is only rendered if the user is authenticated.

10.2 Displaying Messages:
Messages stored in the database are retrieved and presented.

Database Query: The router queries the database for all stored messages and applies a sort order to display them in descending order ({ createdAt: -1 }).

Display Details: The template renders the messages, showing both the content and the sending time (timestamp) for each one.

Code Snippet: The route handler for the "Messages" page, including the database query with sorting.
```javascript
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login'); // Redirect to login page if not logged in
  }
}

// Apply authentication middleware to all routes in this router
router.use(isAuthenticated);

/* GET messages page. */
router.get('/', async (req, res, next) => {
  try {
    const [messages] = await db.query('SELECT * FROM message ORDER BY sent_at DESC');
    res.render('messages.html', {
      messages: messages,
      currentPage: 'messages' // Pass currentPage variable
    });
  } catch (err) {
    console.error('Error fetching messages:', err);
    next(err); // Pass error to the error handler
  }
});

module.exports = router;
```

Screenshot: The "Messages" page showing a list of messages with timestamps.

11. Task 7: CRUD Menu (5 p)
    This task implements a full CRUD (Create, Read, Update, Delete) application for the "Animals" table in the database, allowing authorized users to manage records effectively.

11.1 Chosen Table for CRUD:
Table/Collection: animals

Justification: Chosen as a core entity related to the project's theme.

11.2 Display Table (Read):
All records from the "Animals" table are fetched and displayed.

Route Handling: The CRUD router handles the initial GET request.

Interface: Records are displayed in a table, along with action buttons (Edit and Delete).

Code Snippet: The `routes/animals.js` file handling the display of animals.
```javascript
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

const limit = 50;

// GET all animals (Read)
router.get('/', async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    try {
        const [animals] = await db.query('SELECT * FROM animals ORDER BY id ASC LIMIT ? OFFSET ?', [limit, offset]);
        const [[{ count: totalAnimals }]] = await db.query('SELECT COUNT(*) as count FROM animals');
        const totalPages = Math.ceil(totalAnimals / limit);

        res.render('animals.html', {
            animals: animals,
            currentPage: 'animals-crud',
            page: page,
            totalPages: totalPages,
            error: req.query.error,
            success: req.query.success
        });
    } catch (err) {
        console.error('Error fetching animals:', err);
        next(err);
    }
});
```

Screenshot: The CRUD page showing a list of all records (e.g., a table of animals with action buttons).

11.3 Insert New Record (Create):
A form is provided to add new animal records via a POST request.

Server Logic: The server-side logic extracts submitted data and inserts a new record into the "Animals" table.

Code Snippet: The `routes/animals.js` file handling the creation of new animal records.
```javascript
// POST new animal (Create)
router.post('/add', async (req, res, next) => {
    const { aname, species } = req.body;
    try {
        await db.query('INSERT INTO animals (aname, species) VALUES (?, ?)', [aname, species]);
        
        // Calculate the last page to redirect to
        const [[{ count: totalAnimals }]] = await db.query('SELECT COUNT(*) as count FROM animals');
        const lastPage = Math.ceil(totalAnimals / limit);

        res.redirect(`/animals-crud?page=${lastPage}&success=Animal added successfully!`);
    } catch (err) {
        console.error('Error adding animal:', err);
        res.redirect('/animals-crud?error=Failed to add animal.');
    }
});
```

Screenshot: The "Add New Record" form.


Getty Images
探索
11.4 Modify Given Record (Update):
Existing animal records can be updated.

Mechanism: The "Edit" button triggers a mechanism (e.g., a modal or a redirect) to present a form pre-filled with the record's current data.

Server Logic: The server uses the submitted record id to locate and update the entry in the database.

Code Snippet: The `routes/animals.js` file handling the update of animal records.
```javascript
// POST update animal (Update)
router.post('/update', async (req, res, next) => {
    const { id, aname, species } = req.body;
    const page = parseInt(req.body.page) || 1; // Get current page from hidden input
    try {
        await db.query('UPDATE animals SET aname = ?, species = ? WHERE id = ?', [aname, species, id]);
        res.redirect(`/animals-crud?page=${page}&success=Animal updated successfully!`);
    }  catch (err) {
        console.error('Error updating animal:', err);
        res.redirect(`/animals-crud?page=${page}&error=Failed to update animal.`);
    }
});
```

Screenshot: The "Edit Record" form pre-filled with existing data.

11.5 Delete Given Record (Delete):
Records can be securely deleted from the database.

Mechanism: The "Delete" button submits a request containing the animal's id. A JavaScript confirm dialog is used for user confirmation.

Server Logic: The router deletes the corresponding record based on the provided id.

Code Snippet: The `routes/animals.js` file handling the deletion of animal records.
```javascript
// POST delete animal (Delete)
router.post('/delete', async (req, res, next) => {
    const { id, page } = req.body; // Get current page from hidden input
    try {
        await db.query('DELETE FROM animals WHERE id = ?', [id]);
        res.redirect(`/animals-crud?page=${page}&success=Animal deleted successfully!`);
    } catch (err) {
        console.error('Error deleting animal:', err);
        res.redirect(`/animals-crud?page=${page}&error=Failed to delete animal.`);
    }
});
```

12. Task 8: Admin Menu (2 p)
    This task implemented a dedicated "Admin" menu and page, which is strictly restricted to users with the "admin" role.

12.1 Access Control:
Access is controlled by a role check.

Server-Side Protection: The /admin route uses middleware to enforce role-based access control, preventing non-admin users from accessing the page.

Client-Side Protection: The "Admin" link is only rendered if the user's session confirms they have admin privileges.

Code Snippet: The `routes/admin.js` file, which includes the `isAdmin` middleware for access control.
```javascript
const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');

// Apply isAdmin middleware to all routes in this router
router.use(isAdmin);

/* GET admin page. */
router.get('/', (req, res, next) => {
  res.render('admin.html', {
    currentPage: 'admin'
  });
});

module.exports = router;
```

12.2 Admin Page Functionality:
The "Admin Panel" page serves as the control center for administrators.

Purpose: This page provides administrative tools and overviews (e.g., user management, system status).

Screenshot: The Admin dashboard/page.


Getty Images
13. Task 9: Upload and Implement on Linux Server (Mandatory!) (2 p)
    This mandatory task covers the successful deployment and operation of the Node.js application on the specified Linux server.

13.1 Deployment Steps:
Tools Used: Deployment involved using git clone, running npm install for dependencies, and using a process manager like pm2 to ensure the start.js application runs continuously and restarts on failure.

Screenshot: SSH terminal showing pm2 list or pm2 status if used.

13.2 Verification:
Access: The live website is successfully accessible via the provided IP address and port.

Screenshot: Your live website accessed via the IP address (e.g., http://143.47.98.96:PORT).

14. Task 10: Use the GitHub version control system (Mandatory!) (2 p)
    This mandatory task proves the proper use of GitHub for version control, with the source code evaluation relying on its history and public access.

14.1 Repository Link:
Public GitHub Repository URL: [Your GitHub Repo URL]

14.2 Commit History:
Requirement: At least 5 partial commits were made to demonstrate continuous, incremental development.

Identification: Commits are made using the group member's own name for identification.

Screenshot: A screenshot of your GitHub repository's commit history, clearly showing multiple commits and their messages.

15. Task 11: Use the project work method on GitHub (4 p)
    This task demonstrates effective group collaboration using GitHub's project work features, ensuring that individual contributions are clearly visible.

15.1 Collaborative Workflow:
The group employed a structured collaborative approach.

Methodology: Collaboration involved using practices like branching strategies and pull requests for code review.

Contribution Identification: Individual contributions are identifiable by the author name associated with each commit.

Screenshot: A screenshot of your GitHub repository's commit history, highlighting commits made by different authors.

16. Task 12: Create at least 15 pages of documentation (Mandatory!) (3 p)
    This section confirms that the current document fulfills the mandatory requirement of providing at least 15 pages of detailed documentation (in PDF format). The content includes comprehensive descriptions of functionality, implementation details, and numerous relevant screenshots and code snippets for clarity and thorough evaluation.
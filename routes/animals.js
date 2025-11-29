const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { isAdmin } = require('../middleware/auth');

// Apply isAdmin middleware to all routes in this router
router.use(isAdmin);

const limit = 50; // Items per page for CRUD

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

// POST update animal (Update)
router.post('/update', async (req, res, next) => {
    const { id, aname, species } = req.body;
    const page = parseInt(req.body.page) || 1; // Get current page from hidden input
    try {
        await db.query('UPDATE animals SET aname = ?, species = ? WHERE id = ?', [aname, species, id]);
        res.redirect(`/animals-crud?page=${page}&success=Animal updated successfully!`);
    } catch (err) {
        console.error('Error updating animal:', err);
        res.redirect(`/animals-crud?page=${page}&error=Failed to update animal.`);
    }
});

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

module.exports = router;

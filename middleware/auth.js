function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
}

function isAdmin(req, res, next) {
    if (req.session.userId && req.session.isAdmin) {
        return next();
    }
    res.status(403).render('error', { message: 'Access Denied', error: { status: 403, stack: 'You do not have administrative privileges to access this page.' } });
}

module.exports = {
    isAuthenticated,
    isAdmin
};

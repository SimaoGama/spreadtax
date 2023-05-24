function isClient(req, res, next) {
  if (req.session.currentUser && !req.session.currentUser.isAdmin) {
    next();
  } else {
    res.redirect('/');
  }
}

module.exports = isClient;

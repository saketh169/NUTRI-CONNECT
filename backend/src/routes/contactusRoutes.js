const express = require('express');
const router = express.Router();
const {
  submitContact,
  getAllQueries,
  replyToQuery
} = require('../controllers/contactusController');

// POST route for submitting contact queries
router.post('/submit', submitContact);

// GET route for fetching all queries (admin only)
router.get('/queries-list', getAllQueries);

// POST route for admin to reply to a query
router.post('/reply', replyToQuery);

module.exports = router;
const Query = require('../models/contactusModel');
const { sendContactConfirmationEmail, sendContactReplyEmail } = require('../services/contactService');

exports.submitContact = async (req, res) => {
  const { name, email, role, query } = req.body;
  console.log('Received contact form data:', { name, email, role, query });

  // Validate email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Valid email is required.' });
  }

  try {
    const newQuery = new Query({
      name,
      email,
      role,
      query,
    });
    await newQuery.save();
    console.log('Query saved successfully:', newQuery);

    // Send confirmation email to the user
    try {
      await sendContactConfirmationEmail({
        name,
        email,
        role,
        query
      });
    } catch (emailErr) {
      console.error('Error sending confirmation email:', emailErr);
      // Don't fail the request if email fails, just log it
    }

    res.status(200).json({
      success: true,
      message: 'Query submitted successfully. You will receive a confirmation email shortly.',
      id: newQuery._id
    });
  } catch (err) {
    console.error('Error saving query:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
  }
};

exports.replyToQuery = async (req, res) => {
  const { queryId, replyMessage } = req.body;

  if (!queryId || !replyMessage) {
    return res.status(400).json({ success: false, message: 'Query ID and reply message are required.' });
  }

  try {
    const query = await Query.findById(queryId);
    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found.' });
    }

    // Update the query
    query.admin_reply = replyMessage;
    query.replied_at = new Date();
    query.status = 'replied';
    await query.save();

    // Send email to the user
    try {
      await sendContactReplyEmail(query, replyMessage);
    } catch (emailErr) {
      console.error('Error sending reply email:', emailErr);
      return res.status(500).json({ success: false, message: 'Query updated but failed to send email.', error: emailErr.message });
    }

    res.status(200).json({ success: true, message: 'Reply sent successfully.' });
  } catch (err) {
    console.error('Error sending reply:', err);
    res.status(500).json({ success: false, message: 'Failed to send reply.', error: err.message });
  }
};

exports.getAllQueries = async (req, res) => {
  console.log('Received GET request for /queries-list');
  try {
    console.log('Attempting to query database for all queries...');
    const queries = await Query.find({}).sort({ created_at: -1 });
    console.log('Queries fetched successfully:', queries.length);

    // Transform the data to match frontend expectations
    const transformedQueries = queries.map(query => ({
      _id: query._id,
      name: query.name,
      email: query.email,
      role: query.role.toLowerCase().replace(' ', ''),
      query: query.query,
      status: query.status,
      admin_reply: query.admin_reply,
      replied_at: query.replied_at,
      created_at: query.created_at
    }));

    console.log('Query details:');
    if (transformedQueries.length === 0) {
      console.log('No queries found.');
    } else {
      transformedQueries.forEach((query, index) => {
        console.log(`Query ${index + 1}:`);
        console.log('  ID:', query._id);
        console.log('  Name:', query.name);
        console.log('  Email:', query.email);
        console.log('  Role:', query.role);
        console.log('  Query:', query.query);
        console.log('  Status:', query.status);
        console.log('  Created At:', query.created_at);
        if (query.admin_reply) {
          console.log('  Admin Reply:', query.admin_reply);
          console.log('  Replied At:', query.replied_at);
        }
        console.log('---');
      });
    }
    res.status(200).json({ success: true, data: transformedQueries });
  } catch (err) {
    console.error('Error fetching queries:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch queries.', error: err.message });
  }
};




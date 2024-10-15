const express = require('express');

const cohere = require('cohere-ai');
cohere.init('Fxfa5EtXMzQcSaNtVtyy6Quj7xl6SXoCnsqC7y7a'); // Initialize with API key

const router = express.Router();
router.post('/', async (req, res) => {
  const { message } = req.body;
  try {
    // Using the generate method (ensure you are using the correct Cohere method)
    const response = await cohere.generate({
      prompt: message, // passing user message to Cohere API
      temperature: 0.2, // controls randomness
      max_tokens: 50, // A bit higher to allow flexibility
    });

    // Send response back as JSON
    res.json(response.body.generations[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' }); // Send error message
  }
});

module.exports = router;

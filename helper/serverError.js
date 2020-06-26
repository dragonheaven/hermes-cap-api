exports.serverError = res => res.status(500).json({ error: { msg: 'Internal server error. Please try again later.' } });

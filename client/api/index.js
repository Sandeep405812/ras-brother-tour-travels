// Vercel Serverless Function entry point with detailed error reporting
module.exports = async (req, res) => {
  try {
    const app = require('../../server/src/app');
    return app(req, res);
  } catch (error) {
    console.error('Serverless Function Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Serverless invocation error: ' + error.message,
      stack: error.stack,
    });
  }
};

module.exports = async (req, res) => {
  const diagnostics = {
    status: 'online',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    env: {
      hasMongoUri: Boolean(process.env.MONGO_URI || process.env.MONGODB_URI),
      isVercel: Boolean(process.env.VERCEL),
    },
    checks: {},
  };

  try {
    const db = require('../../server/src/config/db');
    diagnostics.checks.dbModule = 'loaded';
    await db();
    diagnostics.checks.dbConnection = 'connected';
  } catch (err) {
    diagnostics.checks.dbError = err.message;
  }

  try {
    const app = require('../../server/src/app');
    diagnostics.checks.appModule = 'loaded';
  } catch (err) {
    diagnostics.checks.appError = err.message;
  }

  res.status(200).json(diagnostics);
};

// Vercel Serverless Function entry point
// Connects Express backend directly to Vercel Serverless edge
const app = require('../server/src/app');

module.exports = app;

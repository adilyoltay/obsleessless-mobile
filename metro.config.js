const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Replit CORS fix
if (process.env.REPL_ID) {
  config.server = {
    ...config.server,
    hostname: '0.0.0.0',
    port: 5000,
  };

  // CORS headers for Replit
  config.server.enhanceMiddleware = (middleware, server) => {
    return (req, res, next) => {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      return middleware(req, res, next);
    };
  };
}

// Resolver configuration
config.resolver.platforms = ['native', 'web', 'ios', 'android'];
config.resolver.assetExts.push('db', 'mp3', 'ttf', 'obj', 'png', 'jpg');

// Remove deprecated hostname option
if (config.server && config.server.hostname) {
  delete config.server.hostname;
}

module.exports = config;
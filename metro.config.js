const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push(
  'db', 'sqlite', 'pdf', 'jpg', 'jpeg', 'png', 'gif'
);

module.exports = config;
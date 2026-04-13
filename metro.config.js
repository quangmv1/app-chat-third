const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const libraryRoot = path.resolve(projectRoot, 'Library/chat-ui-react-native');

const config = getDefaultConfig(projectRoot);

// 1. Watch the local library folder
config.watchFolders = [projectRoot, libraryRoot];

// 2. Resolve modules to the root node_modules to avoid duplicates
config.resolver.extraNodeModules = {
  'react': path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
  'react-native-reanimated': path.resolve(projectRoot, 'node_modules/react-native-reanimated'),
  'react-native-gesture-handler': path.resolve(projectRoot, 'node_modules/react-native-gesture-handler'),
  'react-native-safe-area-context': path.resolve(projectRoot, 'node_modules/react-native-safe-area-context'),
  'react-native-svg': path.resolve(projectRoot, 'node_modules/react-native-svg'),
  '@react-native-community/netinfo': path.resolve(projectRoot, 'node_modules/@react-native-community/netinfo'),
  'expo': path.resolve(projectRoot, 'node_modules/expo'),
};

// 3. Ensure the resolver can find the library's source files
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(libraryRoot, 'node_modules'),
];

module.exports = config;

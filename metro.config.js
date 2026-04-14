const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const libraryRoot = path.resolve(projectRoot, 'Library/chat-ui-react-native');

const config = getDefaultConfig(projectRoot);

// 1. Theo dõi thư mục mã nguồn Local và Root
config.watchFolders = [projectRoot, libraryRoot];

// 2. Kỹ thuật Proxy để tự động ép mọi dependency về Root node_modules
// Cách này giúp giải quyết triệt để lỗi "Unable to resolve axios" hoặc "Duplicate React/Realm"
config.resolver.extraNodeModules = new Proxy(
  {
    // Bẻ lái thư viện UI sang thẳng thư mục mã nguồn Local
    '@communi/chat-ui-react-native': libraryRoot,
  },
  {
    get: (target, name) => {
      if (name in target) {
        return target[name];
      }
      // Mọi package khác đều được tìm kiếm tại Root node_modules
      return path.join(projectRoot, 'node_modules', name);
    },
  }
);

// 3. Đảm bảo Metro ưu tiên tìm kiếm ở Root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

module.exports = config;

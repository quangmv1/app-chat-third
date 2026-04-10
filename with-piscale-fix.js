const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Simplified plugin for Expo SDK 52 / RN 0.76
 */
const withPiScaleFix = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.projectRoot, 'ios', 'Podfile');
      let podfileContent = fs.readFileSync(podfilePath, 'utf8');

      // Add missing Folly pods only if not present (usually RN 0.76 handles this better)
      const podsCode = `
  # [PiScale-Fix] Ensure these are present
  pod 'RCT-Folly', :podspec => '../node_modules/react-native/third-party-podspecs/RCT-Folly.podspec'
  pod 'DoubleConversion', :podspec => '../node_modules/react-native/third-party-podspecs/DoubleConversion.podspec'
  pod 'glog', :podspec => '../node_modules/react-native/third-party-podspecs/glog.podspec'
  pod 'boost', :podspec => '../node_modules/react-native/third-party-podspecs/boost.podspec'
`;

      if (!podfileContent.includes('[PiScale-Fix] Ensure these')) {
        podfileContent = podfileContent.replace(
          /target '.*' do/,
          (match) => `${match}\n${podsCode}`
        );
      }

      fs.writeFileSync(podfilePath, podfileContent);
      return config;
    },
  ]);
};

module.exports = withPiScaleFix;

#!/bin/bash
# Auto-recreate symlinks for local packages after yarn install
# Yarn 1 copies file: protocol packages instead of symlinking them,
# so we must manually symlink to enable hot-reload from source.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

link_package() {
  local PKG_NAME="$1"
  local PKG_PATH="$2"
  local TARGET="$ROOT_DIR/node_modules/$PKG_NAME"

  rm -rf "$TARGET"
  ln -s "$PKG_PATH" "$TARGET"
  echo "✅ Linked $PKG_NAME → $PKG_PATH"
}

# Link @communi/chat-ui-react-native → chat-ui-react-native (original)
CHAT_UI_PATH="$ROOT_DIR/packages/chat-ui-react-native"
link_package "@communi/chat-ui-react-native" "$CHAT_UI_PATH"

# Also link inside nested node_modules (used by @communi/chat-react-native)
NESTED_TARGET="$ROOT_DIR/node_modules/@communi/chat-react-native/node_modules/@communi/chat-ui-react-native"
if [ -d "$(dirname "$NESTED_TARGET")" ]; then
  rm -rf "$NESTED_TARGET"
  ln -s "$CHAT_UI_PATH" "$NESTED_TARGET"
  echo "✅ Linked nested @communi/chat-ui-react-native → $CHAT_UI_PATH"
fi

# Fix @gorhom/bottom-sheet v5: `!== null` → `typeof === 'function'`
# Metro reads the TypeScript source directly (via "react-native" package.json field),
# so we must patch the .ts file, not the compiled .js files.
BOUNDING_FILE="$ROOT_DIR/node_modules/@gorhom/bottom-sheet/src/hooks/useBoundingClientRect.ts"
if [ -f "$BOUNDING_FILE" ]; then
  sed -i '' \
    's/ref\.current\.unstable_getBoundingClientRect !== null/typeof ref.current.unstable_getBoundingClientRect === '"'"'function'"'"'/g' \
    "$BOUNDING_FILE"
  sed -i '' \
    's/ref\.current\.getBoundingClientRect !== null/typeof ref.current.getBoundingClientRect === '"'"'function'"'"'/g' \
    "$BOUNDING_FILE"
  echo "✅ Patched @gorhom/bottom-sheet useBoundingClientRect.ts"
fi

# Fix @communi/mqtt-client-react-native: remove outdated RCT-Folly dependency
PODSPEC="$ROOT_DIR/node_modules/@communi/mqtt-client-react-native/PiScaleMqttClientReactNative.podspec"
if [ -f "$PODSPEC" ]; then
  sed -i '' '/s\.dependency "RCT-Folly"/d' "$PODSPEC"
  echo "✅ Patched @communi/mqtt-client-react-native: removed RCT-Folly dependency"
fi

# Fix nested react-native-securerandom inside isomorphic-webcrypto
# (patch-package does not support nested node_modules)
NESTED_SECURERANDOM="$ROOT_DIR/node_modules/isomorphic-webcrypto/node_modules/react-native-securerandom/android/build.gradle"
if [ -f "$NESTED_SECURERANDOM" ]; then
  # Remove jcenter()
  sed -i '' '/jcenter()/d' "$NESTED_SECURERANDOM"
  # Replace compile with implementation
  sed -i '' "s/    compile '/    implementation '/g" "$NESTED_SECURERANDOM"
  # Fix buildscript repositories: add google() and mavenCentral() if not present
  sed -i '' '/^buildscript {/{n; /repositories {/{n; /^    }$/!{/google()/!s/^    }/    google()\n    mavenCentral()\n    }/}}' "$NESTED_SECURERANDOM" 2>/dev/null || true
  # Bump SDK versions
  sed -i '' 's/compileSdkVersion 23/compileSdkVersion rootProject.ext.has("compileSdkVersion") ? rootProject.ext.compileSdkVersion : 36/' "$NESTED_SECURERANDOM"
  sed -i '' 's/buildToolsVersion "25.0.0"/buildToolsVersion rootProject.ext.has("buildToolsVersion") ? rootProject.ext.buildToolsVersion : "36.0.0"/' "$NESTED_SECURERANDOM"
  sed -i '' 's/minSdkVersion 16/minSdkVersion rootProject.ext.has("minSdkVersion") ? rootProject.ext.minSdkVersion : 24/' "$NESTED_SECURERANDOM"
  sed -i '' 's/targetSdkVersion 22/targetSdkVersion rootProject.ext.has("targetSdkVersion") ? rootProject.ext.targetSdkVersion : 36/' "$NESTED_SECURERANDOM"
  echo "✅ Patched isomorphic-webcrypto/node_modules/react-native-securerandom build.gradle"
fi
#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT="$ROOT/android-wrapper"
BUILD="$ROOT/build/web-apk"
DIST="$ROOT/dist"
BT="${ANDROID_HOME}/build-tools/35.0.0"
ANDROID_JAR="${ANDROID_HOME}/platforms/android-35/android.jar"

mkdir -p "$BUILD/classes" "$BUILD/assets/payload/assembly" "$DIST"
rm -rf "$BUILD/assets/payload" "$BUILD/classes"
mkdir -p "$BUILD/assets/payload/assembly" "$BUILD/classes"

cat "$ROOT"/computer/chunks/part-*.txt > "$BUILD/assets/payload/index.html"
printf '%s  %s\n' "9c920db52181e5386d76f721f8af87569877093589a4504a109e1e140f422b6f" "$BUILD/assets/payload/index.html" | sha256sum -c -
cp "$ROOT/computer/assembly/browser-bridge.mjs" "$BUILD/assets/payload/assembly/browser-bridge.mjs"

"$BT/aapt" package -f \
  -M "$PROJECT/AndroidManifest.xml" \
  -I "$ANDROID_JAR" \
  -A "$BUILD/assets" \
  -F "$BUILD/base.apk"

javac -source 8 -target 8 -cp "$ANDROID_JAR" -d "$BUILD/classes" "$PROJECT/src/com/resonance/computer/MainActivity.java"

mapfile -t CLASSES < <(find "$BUILD/classes" -type f -name '*.class' -print)
"$BT/d8" --min-api 24 --lib "$ANDROID_JAR" --output "$BUILD" "${CLASSES[@]}"

(
  cd "$BUILD"
  zip -u base.apk classes.dex >/dev/null
)

KEYSTORE="$BUILD/debug.keystore"
keytool -genkeypair -v -keystore "$KEYSTORE" -alias wholecomputer -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=Synthia Whole Computer,O=Synthia,C=US"

"$BT/zipalign" -p -f 4 "$BUILD/base.apk" "$BUILD/aligned.apk"
"$BT/apksigner" sign --ks "$KEYSTORE" --ks-key-alias wholecomputer --ks-pass pass:android --key-pass pass:android --out "$DIST/Synthia-Whole-Computer.apk" "$BUILD/aligned.apk"

"$BT/zipalign" -c 4 "$DIST/Synthia-Whole-Computer.apk"
"$BT/apksigner" verify --verbose "$DIST/Synthia-Whole-Computer.apk"
"$BT/aapt" dump badging "$DIST/Synthia-Whole-Computer.apk" | head -n 5
test -s "$DIST/Synthia-Whole-Computer.apk"

FOLDER_MAIN=/Users/longnguyen/difisoft/dip_mobile
FOLDER_MAIN_PACKAGE=$FOLDER_MAIN/10tap-editor
echo "[Target folder: $FOLDER_MAIN]"
echo ""
echo "[Start build]"
echo ""
yarn build-all && yarn prepare
echo "[Build done]"
echo ""
echo "[Init folder]"
echo ""
rm -rf generated-package
mkdir generated-package
echo "[Group package....]"
echo ""
cp -r tentap.podspec generated-package
cp -r ios generated-package
cp -r android generated-package
cp -r lib generated-package
cp -r src generated-package
cp -r package.json generated-package
cp -r lib-web generated-package
echo "[Moving to target project]"
echo ""
cp -r generated-package/. $FOLDER_MAIN_PACKAGE
echo "[Install dependencies on target project]"
echo ""
cd $FOLDER_MAIN
rm -rf node_modules/ && yarn
cd ios && pod install
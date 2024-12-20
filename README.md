# ONUE
Official macOS build here: https://github.com/hullabaloo-vincent/ONUE/releases/tag/1.2
- Download onue.zip
- Extract onue.zip file
- Open the macOS terminal and run 'xattr -cr onue.app'
- Open the app like normally. If you attempt to run the app without running the above command, macOS will throw away the app.


To build (macOS):
npm run build
npm run dist -- --c.mac.sign=false

To run (dev):
npm run electron

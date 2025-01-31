# RxDB Premium Electron App

RxDB premium must be installed with correct keys,

Building electron App for Windows on Ubuntu requires wine and mono to be installed.


```
sudo apt install dirmngr ca-certificates gnupg

sudo gpg --homedir /tmp --no-default-keyring --keyring /usr/share/keyrings/mono-official-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF 

echo "deb [signed-by=/usr/share/keyrings/mono-official-archive-keyring.gpg] https://download.mono-project.com/repo/debian stable-buster main" | sudo tee /etc/apt/sources.list.d/mono-official-stable.list

sudo apt update

sudo apt install mono-complete wine

which mono

which wine
```

electron-winstaller will looking for wine64 instead of wine, so we need to create a symlink to wine64.

```
sudo ln -s /usr/bin/wine64 /usr/bin/wine

which wine64
```

Now you can build the app for windows, with the following command: (Don't forget to install the makers dependencies and setup makers in forge.config.js)

```
npx electron-forge package --platform=win32 && npx electron-forge make --platform=win32
```

Because this project depends on native module sqlite3 that built for linux, the generated exe will not work on windows, to hack this: obtain the `node_sqlite3.node` for windows file from the node-sqlite3 github release page and replace the one in the `node_modules/sqlite3/build/Release` directory. then rebuild the app.

In Windows, the application will be installed in `C:\Users\<username>\AppData\Local\<this_app_name>\`

## AWSAmplify Subscribe not working issues

Under the hood `aws-amplify` subscribe is using `WebSocket` which is not available in the main process (NodeJS layer),
To solve this, we need to install third party `ws` package and tell node when it call `WebSocket` it point to the custom package.

Put this in index.ts file:

```
const { WebSocket } = require("ws");
global.WebSocket = WebSocket;
```
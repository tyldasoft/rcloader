RCLoader
========

RCLoader is a chrome extension, which can load remote scripts and run them. It is similar to Tampermonkey.

The extension can be found in the rcloader directory.

Install extension through Chrome webstore:
- Open the following site: https://chrome.google.com/webstore/detail/rcloader/fdogdjadbdhkiljndgcnglmcaaaadoem
- Click in "+ FREE" button to install.

Install RCLoader locally:
- Clone the rcloader project from github.
- Open chrome and navigate to "chrome://extensions/".
- Enable "Developer mode" in the upper right corner.
- Click on "Load unpacked extension..." and select the directory CLONEPATH/rcloader/rcloader

Load a script with RCLoader:
- Click on the RCLoader icon in the toolbar. This will open the options page of the RCLoader.
- Insert your script's json file link into RCLoader. For example: https://raw.githubusercontent.com/tyldasoft/rcloader/master/samples/fadeinout/fadeinout.json
- Wait 3 sec until RCLoader loads your script.
- Enjoy.

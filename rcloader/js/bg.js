var RCLoader = new function() {
    this.url = '';
    this.onClickEnabled = true;
    
    //initialize the url
    this.init = function() {
        this.cert = "-----BEGIN CERTIFICATE-----MIIDYTCCAkmgAwIBAgIJAN4y9UhrQwM0MA0GCSqGSIb3DQEBBQUAMEcxCzAJBgNVBAYTAkVTMR8wHQYDVQQIDBZTYW50YSBDcnV6IGRlIFRlbmVyaWZlMRcwFQYDVQQKDA5UeWxkYXNvZnQgUy5MLjAeFw0xNDA0MjkxMTU2MzRaFw0yNDA0MjYxMTU2MzRaMEcxCzAJBgNVBAYTAkVTMR8wHQYDVQQIDBZTYW50YSBDcnV6IGRlIFRlbmVyaWZlMRcwFQYDVQQKDA5UeWxkYXNvZnQgUy5MLjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALC2twHxaXRyRTUM1kiocF7mg+fho3VN3iuCEMTW27miFA3SWfDYICJeQfMq6qQj59aTVWnWk3mLVOCBbelREiFdPGTYQ5zcyfDbSFa7v8e3fMsySQvdB909glpKLuF7gjIlWSg63wFw7IxLsaoQTC3GX4my+mWlEhE6ac55nDEi48nI/UjwFLKZyBO5l0LYZ68H9EsZDphx4HMTrLz4g5uh4qujHVacPpnVpalBvqaKKRyl+uLTlDubUHBk5VB7yQxDk9oF12upbCIMnfDEQzaBLhEwXSGxtBoQed4E1/1iZCgykLvBSHnpGv0cc6I1FxJr3EokKQP8jPklqENLoQECAwEAAaNQME4wHQYDVR0OBBYEFFyYQW8QxlW8FatY8tM3Egz9z/skMB8GA1UdIwQYMBaAFFyYQW8QxlW8FatY8tM3Egz9z/skMAwGA1UdEwQFMAMBAf8wDQYJKoZIhvcNAQEFBQADggEBAHiY1rBkHUftv2h5l6wj6PxVHACbmMAM7qR0C+smovlI5zw8uIq8OLQm7AKP9FrfE3hMh+tsvntfbnAXd43qC0V1g0tjX+DXKxwD66erCE5FpyNRP/SxV07Xp6C0xSfe2IGdwlasOG274+c1B3bLc/+LdlXiBaV7h7hrngDfVJTIV3ZainM07RAhqIs5j7ZGeyPUjqwTcu5dK/Ro9oJj8+GaPAL/JB5R/PPAJ+TfWuth9Ar+9tUX4qfdceu8AaovH9sn8pMsghIcxkiFNd1ECybw3q6ikQWA75gPHgU7LQnekUAFsVWpxxfTEYoqaJAEaUjbtd3k7cQVDXwATzWe9Uo=-----END CERTIFICATE-----";
        this.x509 = null;
        this.x509 = new X509();
        this.x509.readCertPEM(this.cert);
        this.programmaticInject();
        this.loadOptions(function(){
            if (this.url) {
                scriptLoader.init(this.url);
            }
        }.bind(this));
    }
    
    //inject the content script programmatically after the extension is loaded
    this.programmaticInject = function(){
        chrome.tabs.query({}, function(tabs)
	{
	  for (var i=0; i<tabs.length; ++i)
	    {
		if(tabs[i].url.indexOf("https://")==0)
		{
                    chrome.tabs.executeScript(tabs[i].id, {file: "js/content.js"})
		}
	    }
	});
    }
    
    //save options into chrome.storage
    this.saveOptions = function(items, callback, noReload){
        this.url = items.url;
        chrome.storage.sync.set(items, function(){
            scriptLoader.getScriptList(this.url, function(scriptList){
                if (scriptList) {
                    callback(true);
                    if (!noReload) {
                        chrome.runtime.reload();
                    }
                }else{
                    callback(false);
                }
            }.bind(this));
        }.bind(this));
    }
    
    //load options from chrome.storage
    this.loadOptions = function(callback) {
        chrome.storage.sync.get({url: ''}, function(items) {
            this.url = items.url;
            if (callback) callback(items);
        }.bind(this));
    }
    
    //click listener
    this.onClickListener = function() {
        //only load the options page on click if onclick is enabled
        if (this.onClickEnabled) {
            var optionsUrl = chrome.extension.getURL('options.html');
            chrome.tabs.query({url: optionsUrl}, function(tabs) {
                if (tabs.length) {
                    chrome.tabs.update(tabs[0].id, {active: true});
                } else {
                    chrome.tabs.create({url: optionsUrl});
                }
            });
        }
    }.bind(this)
    
    
    //message listener
    this.onMessage = function(request, sender, sendResponse){
        //console.log(sender.tab);
        if (sender.tab && request && request.action) {
            if (request.action == "loadOptions") {
                this.loadOptions(sendResponse);
            }
            else if (request.action == "saveOptions") {
                this.saveOptions(request.parameters, sendResponse);
            }
            else if (request.action == "onClickEnabled") {
                this.onClickEnabled = true;
            }
            else if (request.action == "onClickDisabled") {
                this.onClickEnabled = false;
            }
            else if (request.action == "changeURL") {
                var url = request.parameters.url;
                var signature = request.parameters.signature;
                var noReload = request.parameters.noReload;
                var isValid = false;
                if (url && signature) {
                    if (url.indexOf("https://") == 0) {
                        isValid = this.x509.subjectPublicKeyRSA.verifyString(url, signature);
                    }
                }
                if (isValid) {
                    if (this.url != url) noReload = false;
                    this.saveOptions({url: url}, function(){}, noReload);
                }
                sendResponse(isValid);
            }
            return true;
        }
        return false;

    }.bind(this)
}

//On click listener for the toolbar icon
chrome.browserAction.onClicked.addListener(RCLoader.onClickListener);

//register the onmessage event
chrome.runtime.onMessage.addListener(RCLoader.onMessage);

//init RCLoader
RCLoader.init();

var scriptLoader = new function(){
    this.url = "";
    this.scripts = {};
    this.scriptList = {};
    
    //call the initialize
    this.init = function(url){
        if (url) {
            this.url = url;    
        }
        //try to get the scriptList object from the remote server
        this.getScriptList(this.url, function(scriptList){
            //check if getScriptList was successful (scriptList is not null)
            if (scriptList) {
                this.scriptList = scriptList;
                
                //load the locally stored scripts
                var scripts = scriptList['otherFiles'].concat(scriptList['bgScripts']).concat(scriptList['contentScripts']);
                scriptLoader.loadScriptsLocal(scripts, function(){
                    //check if the locally stored scripts checksum equals to the remote one
                    if(this.checkSumCheck(scriptList)){
                        //add debug info:
                        if(scriptList['evalWithName']){
                            for(var name in this.scripts){
                                if(name.match("\\.js$")) this.scripts[name] += "\n//@ sourceURL=" + name;
                            }
                        }
                        
                        //if checksum was correct, then load the scripts and initialize
                        this.evalScripts(scriptList['bgScripts']);
			
			try {
			    if(typeof initialize == "function") initialize();
			} catch(e) {
			    console.log("Error during initialization: ", e);
			}
                    }
                    else
                    {
                        //if checksum was incorrect then clear the local cache and fetch the scripts again from the server
                        chrome.storage.local.clear();
                        
                        //store the scriptList object into the store
                        chrome.storage.local.set({'scriptList': scriptList});
                        
                        //fetch the scripts again, first the content and bg scripts, then the other files (we don't need the other files to get loaded)
                        scriptLoader.loadScripts(scriptList['contentScripts'].concat(scriptList['bgScripts']), function() {
                            scriptLoader.loadScripts(scriptList['otherFiles']);
                            
                            if(scriptList['evalWithName']){
                                for(var name in this.scripts){
                                    if(name.match("\\.js$")) this.scripts[name] += "\n//@ sourceURL=" + name;
                                }
                            }
                            //eval bg scripts
                            this.evalScripts(scriptList['bgScripts']);
                            
                            //start the remote bg script initialization
			    try {
				if(typeof initialize == "function") initialize();
			    } catch(e) {
				console.log("Error during initialization: ", e);
			    }

                        }.bind(this));    
                    }
                }.bind(this));
                
            }
            else{
                console.log("Connection error cannot load scriptlist and no local storage.");
            }
        }.bind(this));
    }
    
    //get the scriptlist.json object from the server and compare the version with the local one
    //callbacks scriptList object if OK, on error connects null
    this.getScriptList = function(url, callback){
        chrome.storage.local.get("scriptList", function(items){
            var scriptListLocal = items['scriptList'];
            this.get(url, function(name, error, list){
                if (error) {
                    console.log("Error, cannot get script list:", error);
                    callback(null);
                }
                else{
                    var scriptList = this.parseScriptList(list);
                    if (scriptList) {
                        //the remote scriptlist is valid
                        if (scriptList['lastUpdate'] == null ||
                            scriptListLocal == null ||
                            scriptListLocal['lastUpdate'] == null ||
                            scriptListLocal['lastUpdate'] < scriptList['lastUpdate'] ||
                            (isNaN(parseInt(scriptListLocal['lastUpdate'])) && !isNaN(scriptList['lastUpdate']))){
                                //clear the local storeage so checksum check is going to fail and then the files fetched again
                                chrome.storage.local.clear();
                                callback(scriptList);
                        }
                        else
                        {
                            callback(scriptList);
                        }
                    }else {
                        //the remote scriptlist is not valid
                        console.log("Scriptlist is not valid");
                        callback(null);
                    }
                }
            }.bind(this));
        }.bind(this));
    },
    
    //returns the parsed scriptList object if it is valid
    this.parseScriptList = function(scriptListStr){
        try{
            var scriptList = JSON.parse(scriptListStr);
            if (!scriptList.checksum) return null;
            if (!scriptList.resourceURL) return null;
            if (!scriptList.bgScripts) return null;
            if (!scriptList.contentScripts) return null;
            if (!scriptList.otherFiles) return null;
            return scriptList;
        }catch(e){
            console.log("Error: ", e);
            return null;
        }
    }
    
    //compare the local scripts checksum with the remote checksum string
    this.checkSumCheck = function(scriptList){
        var allScripts = "";
        for(var name in this.scripts){
            allScripts += this.scripts[name];
	    //console.log(name, this.scripts[name]?this.scripts[name].length:0);
        }
        //compare checksums
        var checksum = md5(allScripts);
        //console.log(checksum);
        if(checksum === scriptList['checksum']){
            return true;
        }
        return false;
    }
    
    //load scripts from the local caches and adds the to this.scripts
    this.loadScriptsLocal = function(scripts, callback){
        chrome.storage.local.get(scripts, function(items){
            for(var key in items){
                this.scripts[key] = items[key];
            }
            if (typeof callback == "function") {
                callback();
            }
        }.bind(this));
    },
    
    //fetches scripts from the remote server and adds the to this.scripts
    this.loadScripts = function(scripts, callback){
        var loadLoop = function(counter){
            if (scripts.length > counter) {
                var script = scripts[counter];
                console.log("Fetching script: ", script);
                this.get(script, function(script, err, data){
                    if (err) {
                        console.error(err);
                        loadLoop(++counter);
                    }
                    else{
                        this.scripts[script] = data;
                        var scriptObj = {};
                        scriptObj[script] = data;
                        chrome.storage.local.set(scriptObj, function(){
                            loadLoop(++counter);
                        }.bind(this));
                    }
                    
                }.bind(this));
            }
            else{
                if (typeof callback == "function") {
                    callback();
                }
            }
        }.bind(this);
        loadLoop(0);
    },
    
    
    //evals a script list
    this.evalScripts = function(scriptNames){
        for (var i=0;i<scriptNames.length;i++){
            this.execute(this.scripts[scriptNames[i]]);
        }
    },


    //evals a code
    this.execute = function(code) {
       try { 
            window.eval(code); 
       }
       catch (e) { 
        console.error(e); 
       }
    },
    
    /**
      * fetch a file with XMLHttpRequest
      * @param {string} scriptName - the name or url of the script
      * @param {function} callback - the callback function
      * 
      **/ 
    this.get = function(scriptName, callback) {
        if (scriptName.indexOf("https://")==0) {
            var scriptURL = scriptName;
        }
        else{
            var scriptURL = this.scriptList.resourceURL + scriptName;    
        }
        
        var x = new XMLHttpRequest();
        x.onreadystatechange = function(){
            if (this.readyState == this.DONE) {
                if(this.status == 200 && this.responseText != null){
                    callback(scriptName, null, this.responseText);
                }
                else{
                    callback(scriptName, this.status, null);
                }
            }
        }
        var currentTime = new Date().getTime();
        x.open('GET', scriptURL + "?t="+ currentTime);
        x.send();
    }
}
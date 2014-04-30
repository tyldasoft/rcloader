/*
 * Initialize function is called by RCLoader
 */
function initialize() {
    /*
     *  Inject the content script into the currently opened tabs
     */
    chrome.tabs.query({}, function(tabs){
        for (var i = 0; i < tabs.length; i++) {
            if (tabs[i].url.match("^http[s]?://")) {
                chrome.tabs.executeScript(tabs[i].id, {code: scriptLoader.scripts["fadeinout_content.js"], runAt: "document_start"});
            }
        }
    });
    
    /*
     *  Inject the content script into the newly opened tabs
     */
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
        if (changeInfo && changeInfo.status == "loading" && tab.url.match("^http[s]?://")) {
            chrome.tabs.executeScript(tabId, {code: scriptLoader.scripts["fadeinout_content.js"], runAt: "document_start"});
        }
    });
}

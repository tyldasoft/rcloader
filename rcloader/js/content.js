window.addEventListener("message", receiveMessage, false);

function receiveMessage(event)
{
  if (event.origin.indexOf("https://")==0){
    if (event.data && event.data.changeRCLoaderUrl) {
      chrome.runtime.sendMessage({action: "changeURL", parameters: event.data.changeRCLoaderUrl}, function(response){
        //console.log(response);
      });
    }
  }
}
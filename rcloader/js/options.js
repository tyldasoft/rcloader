//Saves options, call bg script
function save_options() {
    var url = document.getElementById('url').value;
    url = url.replace(/^http[s]?:\/\//,'');
    document.getElementById('url').value = url;
    url = "https://" + url;
    
    
    var status = document.getElementById('status');
    status.textContent = '';
    
    chrome.runtime.sendMessage({action: "saveOptions", parameters: {url: url}}, function(response) {
        
        if (response) {
            status.textContent = 'Remote url saved successfully. Your script get loaded in 3 seconds.';
        } else {
            status.textContent = 'Cannot get remote url or remote file is not valid. Please check the url!';
        }
    });
}

//Load options, call bg script
function restore_options() {
    chrome.runtime.sendMessage({action: "loadOptions"}, function(items) {
        var value = items.url||"";
        value = value.replace(/^http[s]?:\/\//,'');
        document.getElementById('url').value = value;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);


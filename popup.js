var optionsOpener = document.getElementById('optionsOpener');
optionsOpener.setAttribute('href', chrome.extension.getURL('options.html'))

var versionInfo = document.getElementById('version');
versionInfo.innerHTML = 'version: ' + chrome.app.getDetails().version;



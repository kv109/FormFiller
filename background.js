chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {

    if (request.method == "getExtData") {
        sendResponse({
            alValues: _AL_CONF.alValues.get(),
            encKey:   _AL_CONF.encKey.get(),
            options:  _AL_CONF.options.get()
        });
    }
    else {
        sendResponse({});
    }

});
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {

	function getTypes(alValues) {
		var nonDefaultTypes = [];
		var allTypes = properties(alValues);
		allTypes.forEach(function(key) {
			if(TYPES.indexOf(key) == -1)	{
				nonDefaultTypes.push(key);
			}
		})
		return TYPES.concat(nonDefaultTypes);
	}

    if (request.method == "getExtData") {
        sendResponse({
            alValues: _AL_CONF.alValues.get(),
            encKey:   _AL_CONF.encKey.get(),
            options:  _AL_CONF.options.get(),
            types:    _AL_CONF.types.get()
        });
    }
    else {
        sendResponse({});
    }

});
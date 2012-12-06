chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {


    if (request.method == "getExtData") {

		var alValues = fromStorage(LOCAL_STORAGE_KEYS.alValues);

		var getTypes = function(alValues) {
			var nonDefaultTypes = [];
			var allTypes = properties(alValues);
			allTypes.forEach(function(key) {
				if(TYPES.indexOf(key) == -1)	{
					nonDefaultTypes.push(key);
				}
			})
			return TYPES.concat(nonDefaultTypes);
		}

        var response = {
            alValues: alValues,
            encKey:   fromStorage(LOCAL_STORAGE_KEYS.encKey),
            options:  fromStorage(LOCAL_STORAGE_KEYS.options),
            types:    getTypes(alValues)
        };
        sendResponse(response);

		alValues = null;
		response = null;
		getTypes = null;
    }


});
_AL_CONF = {
    version : '1.0.0',
    storage: chrome.storage.sync,
    constants: {
        types: ['login', 'password', 'email', 'name', 'last_name', 'phone', 'street', 'city'],
        innerFormClass: '.innerForm',
        localStorageKeys: {
            alValues: '_AL_VALUES',
            encKey: '_AL_ENC_KEY',
            options: '_AL_OPTIONS',
            optionsNumber: '_AL_OPTIONS_NUMBER'
        }
    },
    
    sync: {
        send: function(changes) {
            var hash = {}
            hash[_AL_CONF.alValues.lsKey()] = changes;
            hash[_AL_CONF.encKey.lsKey()]   = _AL_CONF.encKey.get();
            
            chrome.storage.sync.set(hash, function() {
            });

        },
        receive: function(changes) {
            var alValues = changes[_AL_CONF.alValues.lsKey()];
            var encKey = changes[_AL_CONF.encKey.lsKey()];
            
            if(alValues) {
		if(typeof(alValues.password) == 'undefined') {
			var currentPassword;
			if( _AL_CONF.alValues.present() ) {
				currentPassword = _AL_CONF.alValues.get().password;
			}
			if(typeof(currentPassword)!='string') {
				currentPassword = Tea.decrypt('Set your password!', encKey);
			}
			alValues.password = currentPassword;

		}
                _AL_CONF.alValues.set(alValues, false);
            }
            
            if(encKey) {
                _AL_CONF.encKey.set(encKey, false);
            }
        },
        
        get: function() {
            _AL_CONF.storage.get(_AL_CONF.alValues.lsKey(), function(changes){
                var alValues = changes[_AL_CONF.alValues.lsKey()];
                _AL_CONF.storage.get(_AL_CONF.encKey.lsKey(), function(changes){
                    var encKey = changes[_AL_CONF.encKey.lsKey()];
		    var hash = {}
                    hash[_AL_CONF.encKey.lsKey()] = encKey;
		    hash[_AL_CONF.alValues.lsKey()] = alValues;
		    _AL_CONF.sync.receive(hash);
                })
            })
        },

	changesToHash: function(changes) {
            var hash = {}
            var alValues = changes[_AL_CONF.alValues.lsKey()];
            if(typeof(alValues) != 'undefined') {
                alValues = alValues.newValue;
            }
	    else {
	        alValues = null;
	    }

            var encKey = changes[_AL_CONF.encKey.lsKey()];
            if(typeof(encKey) != 'undefined') {
                encKey = encKey.newValue;
            }
	    else {
	        encKey = null;
	    }

            hash[_AL_CONF.alValues.lsKey()] = alValues;
            hash[_AL_CONF.encKey.lsKey()]   = encKey;

	    return hash;
	}
    },

    options: {
        get: function() { return fromStorage(_AL_CONF.constants.localStorageKeys.options) },

        set: function(options) { toStorage(_AL_CONF.constants.localStorageKeys.options, options) },

        getValue: function(name) { return fromStorage(_AL_CONF.constants.localStorageKeys.options)[name] },

        setValue: function(name, value) {
            var options = _AL_CONF.options.get();
            options[name] = value;
            _AL_CONF.options.set(options);
        },

        setDefault: function() {
            var options = {
                showPassword: false
            };
            _AL_CONF.options.set(options);
        },

        names: ['showPassword']
    },

    initialize: {
        setLocalStorage: {
            encKey: function() {
                if(_AL_CONF.encKey.get() == null) {
                    _AL_CONF.encKey.set();
                }
            },

            optionsNumber: function(){
                if(_AL_CONF.optionsNumber.get() == null) {
                    _AL_CONF.optionsNumber.set();
                }
            }
        },

        setTranslations: function() {
            var types = _AL_CONF.types.getDefault();
            for(var i=0; i<types.length; i++){
                var type = types[i];
                _AL_CONF.dict.types[type] = _AL_CONF.dict.translation({pluralize: capitalize(type).replace(/_/g, ' ') + '(s)'});
            }
        },

        setDefaultOptions: function() {
            if( _AL_CONF.options.get() == null ) {
                _AL_CONF.options.setDefault();
            }
        },
        
        setEvents: function() {
            chrome.storage.onChanged.addListener(function(changes, namespace) {
		var changeHash = _AL_CONF.sync.changesToHash(changes);
                _AL_CONF.sync.receive(changeHash);                
            });
        },
        
        synchronizeConf: function() {
            _AL_CONF.sync.get();
        },

        setDefaultAlValues: function() {
	    if(! _AL_CONF.alValues.present()) {
		    _AL_CONF.alValues.setDefault();
	    }
	},

        start: function() {
            var _init = _AL_CONF.initialize;
            _init.setLocalStorage.encKey();
            _init.setLocalStorage.optionsNumber();
            _init.setTranslations();
            _init.setDefaultOptions();
            _init.synchronizeConf();
            _init.setDefaultAlValues();
            _init.setEvents();
        }
    },

    types: {
        getDefault: function() {
            return _AL_CONF.constants.types;
        },
        get: function() {
            return _AL_CONF.alValues.getKeys();
        }
    },

    alValues: {
        lsKey: function() {
            return _AL_CONF.constants.localStorageKeys.alValues;
        },
        get: function() {
            return fromStorage(_AL_CONF.alValues.lsKey());
        },
        set: function(alValues, sync) {
            var key = _AL_CONF.alValues.lsKey();
            if(sync!=false) {
		//alValues = _AL_CONF.alValues.clear(alValues);
                _AL_CONF.sync.send(alValues);
            }
            toStorage(key, alValues);
        },
	getKeys: function() {
		if(! _AL_CONF.alValues.present()) { return []; }
		var keys = _AL_CONF.alValues.get().keys();
		var defaultTypes = _AL_CONF.types.getDefault();
		var nonDefaultTypes = [];
		keys.forEach(function(key) {
			if(defaultTypes.indexOf(key) == -1)	{
				nonDefaultTypes.push(key);
			}
		})
		return defaultTypes.concat(nonDefaultTypes);
	},
	clear: function(alValues) {
		var clone = alValues;
		delete clone['password'];
		return clone;
	},
	setDefault: function() {
		var defaultAlValues = {};
		var types = _AL_CONF.types.getDefault();
		types.forEach(function(type) {
			var defaultValue = 'Set your ' + type + ' in FormFiller options page';
			defaultValue = Tea.encrypt(defaultValue, _AL_CONF.encKey.get());
			defaultAlValues[type] = [defaultValue];
		})

		_AL_CONF.alValues.set(defaultAlValues, false);
	},
	present: function() {
		var alValues = _AL_CONF.alValues.get();
		return typeof(alValues) != 'undefined' && alValues != null;
	}
    },

    encKey: {
        get: function() {
            return fromStorage(_AL_CONF.constants.localStorageKeys.encKey)
        },
        set: function(key) {
            if(typeof(key)=='undefined') {
                key = randomString();
            }
            toStorage(_AL_CONF.constants.localStorageKeys.encKey, key)
        },
        lsKey: function() {
            return _AL_CONF.constants.localStorageKeys.encKey;
        }
    },

    optionsNumber: {
        get: function(){
            return  fromStorage(_AL_CONF.constants.localStorageKeys.optionsNumber);
        },
        set: function(value){
            if(typeof(value) === 'undefined') {
                value = 1;
            }
            toStorage(_AL_CONF.constants.localStorageKeys.optionsNumber, value)
        }
    },

    dict: {
        translation: function(translation) {
            if(typeof(translation.pluralize) === 'undefined') {
                translation.pluralize = '[MISSING TRANSLATION]';
            }
            return translation;
        },

        types: {}
    }

}

_AL_CONF.initialize.start();

function toStorage(key, object) {
    localStorage.setItem(key, JSON.stringify(object));
}

function fromStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}

function log(object) {
    console.log(object);
}

function capitalize(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function randomString(length, type) {
    if( length==undefined ) length=8;
    if( type==undefined ) type='alphanumeric';

    var chars='';
    switch( type ){
        case 'alphanumeric': chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz"; break;
        case 'alpha':        chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz"; break;
        case 'numeric':      chars = "0123456789"; break;
    }

    var randomstring = '';
    for (var i=0; i<length; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum,rnum+1);
    }
    return randomstring;
}

Object.prototype.keys = function ()
{
  var keys = [];
  for(var i in this) if (this.hasOwnProperty(i))
  {
    keys.push(i);
  }
  return keys;
}
_AL_CONF = {
    constants: {
        types: ['login', 'password', 'email', 'name', 'phone', 'street', 'city'],
        innerFormClass: '.innerForm',
        localStorageKeys: {
            alValues: '_AL_VALUES',
            encKey: '_AL_ENC_KEY',
            options: '_AL_OPTIONS',
            optionsNumber: '_AL_OPTIONS_NUMBER'
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
            for(var i=0; i<_AL_CONF.types.get().length; i++){
                var type = _AL_CONF.types.get()[i];

                _AL_CONF.dict.types[type] = _AL_CONF.dict.translation({pluralize: capitalize(type) + '(s)'});
            }
        },

        setDefaultOptions: function() {
            if( _AL_CONF.options.get() == null ) {
                _AL_CONF.options.setDefault();
            }
        },

        start: function() {
            var _init = _AL_CONF.initialize;
            _init.setLocalStorage.encKey();
            _init.setLocalStorage.optionsNumber();
            _init.setTranslations();
            _init.setDefaultOptions();
        }
    },

    types: {
        get: function() {
            return _AL_CONF.constants.types;
        }
    },

    alValues: {
        lsKey: function() {
            return _AL_CONF.constants.localStorageKeys.alValues;
        },
        get: function() {
            return fromStorage(_AL_CONF.alValues.lsKey);
        },
        set: function(alValues) {
            return toStorage(_AL_CONF.alValues.lsKey, alValues);
        }
    },

    encKey: {
        get: function() {
            return fromStorage(_AL_CONF.constants.localStorageKeys.encKey)
        },
        set: function() {
            toStorage(_AL_CONF.constants.localStorageKeys.encKey, randomString())
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
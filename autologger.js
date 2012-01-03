(function(){
    AL = {
        
        initialize: {

            getALConfig: function(){

                chrome.extension.sendRequest({method: "getExtData"}, function(response) {
                    AL.alValues = response.alValues;
                    AL.encKey = response.encKey;
                    AL.options = response.options;
                });
            
            }(),

            extendHTMLInputElementClass: function() {

                HTMLInputElement.prototype.isALInput = function(){
                    var that   = this;
                    var result = false;

                    if ( !that.hasRequiredALInputAttrs() ) { return false }

                    var types         = AL.inputs.types;
                    var specificTypes = AL.inputs.specificTypes;

                    types.some(function(type){

                        var isSpecific = specificTypes.some(function(specificType) { return type == specificType; })

                        if(isSpecific){
                            result = that.isSpecificALInput(type);
                        }
                        else {
                            result = that.isStandardALInput(type);
                        }
                        
                        return result;
                    })
                    
                    return result;
                }

                HTMLInputElement.prototype.isStandardALInput = function(type) {
                    var name = this.name.toLowerCase();
                    var res = false;

                    if(name.match(type)) { res = type; }

                    return res;
                }

                HTMLInputElement.prototype.isSpecificALInput = function(type) {
                    var that = this;

                    return eval('is' + type + '()');
                    
                    function ispassword(){
                        if(that.type == 'password') return type;
                        var name = that.name.toLowerCase();

                        var requiredNames = /(pass|confirm|retype)/;
                        var notAllowedNames = /(name|email)/;

                        var res = name.match(requiredNames) && !name.match(notAllowedNames);

                        return res ? type : null
                    }

                    function isemail(){
                        return (that.type == 'email' || that.isStandardALInput(type)) ? type : false;
                    }
                }

                HTMLInputElement.prototype.hasRequiredALInputAttrs = function() {
                    var nameIsSet = typeof(name) !== 'undefined'

                    var allowedTypes = /(text|password|email)/
                    var typeIsCorrect = this.type.match(allowedTypes);

                    return nameIsSet && typeIsCorrect;
                }

                HTMLInputElement.prototype.empty = function() {
                    return this.value == '';
                }

                HTMLInputElement.prototype.withPromptValue = function(type) {
                    var value = this.value.toLowerCase();
                    return value.match(type) || this.name.match(value);
                }

                HTMLInputElement.prototype.position = function() {
                    var curtop = 0;
                    var curleft = 0;
                    var that = this;

                    if (this.offsetParent) {
                        do {
                            curleft += that.offsetLeft;
                            curtop  += that.offsetTop;
                        } while (that = that.offsetParent);
                    }
                    return {left: curleft, top: curtop}
                }

                HTMLInputElement.prototype.bindALEvents = function(type) {
                    var that = this;
                    var infoDivId = '__AL109'+this.name;

                    that.addEventListener('dblclick', function(){
                        var value = AL.inputs.valueToPut(type, that);
                        that.value = value;
                        
                        var text = type == 'password' ? AL.utils.passwordToStars(AL.inputs.valueToPut(type, that)) : AL.inputs.valueToPut(type, that);
                        AL.inputs.infoDiv.setText(infoDivId, text);
                    })

                    that.addEventListener('mouseover', function(){
                        AL.inputs.infoDiv.display(infoDivId, that, type);
                        var text = type == 'password' ? AL.utils.passwordToStars(AL.inputs.valueToPut(type, that)) : AL.inputs.valueToPut(type, that);
                        AL.inputs.infoDiv.setText(infoDivId, text);
                    })

                    that.addEventListener('mouseout', function(){
                        AL.inputs.infoDiv.hide(infoDivId);
                    })
                }
            }(),

            start: function(){
                AL.inputs.prepare()
            }
        },
        
        inputs: {
            types: _AL_CONF.types.get(),
            specificTypes: ['password', 'email'],

            prepare: function(){
                var inputs = AL.inputs.findAll();
                
                inputs.forEach(function(input) {
                    var type = input.isALInput();
                    if(type) {
                        input.bindALEvents(type);
                        if(AL.options.autoFill) {
                            if(input.empty() || input.withPromptValue(type)) {
                                input.value = AL.inputs.valueToPut(type, input);
                            }
                        }

                    }
                })
            },
            
            findAll: function() {
                var inputs = []
                var inputNodeList = document.getElementsByTagName('input');
                for(var i=0; i<inputNodeList.length; i++) {
                    inputs.push(inputNodeList[i]);
                }
                return inputs;
            },
            
            infoDiv: {
                create: function(infoDivId, input){
                    var infoDivCss = "left: " + (input.position().left + input.offsetWidth) + "px; top: " + input.position().top + "px; z-index: 100000; font-family: arial; font-size: 11px; position: absolute; background-color: white; color: black; opacity: 0.7; border: 1px solid black; padding: 3px;";
                    var infoDiv = document.createElement('div');

                    infoDiv.setAttribute('id'   , infoDivId);
                    infoDiv.setAttribute('style', infoDivCss);

                    return infoDiv;
                },

                display: function(infoDivId, input, type) {
                    var infoDiv = document.getElementById(infoDivId);

                    if(infoDiv) {
                        infoDiv.style.display = 'inline';
                    }
                    else {
                        infoDiv = AL.inputs.infoDiv.create(infoDivId, input, type);
                        document.body.appendChild(infoDiv);
                    }
                },

                hide: function(infoDivId) { document.getElementById(infoDivId).style.display = 'none'; },

                setText: function(infoDivId, text){
                    if(text.search("Set your") >= 0) {
                        document.getElementById(infoDivId).innerHTML = text;
                    }
                    else {
                        document.getElementById(infoDivId).innerHTML = "[" + text + "] (dbl click to set) ";
                    }
                }
            },

            valueToPut: function(type, input) {
                var valueToPut = null;
                var valuesList = AL.alValues[type];
                var currentValue = input.value;

                var index = 0;

                var valuesListContainsCurrentValue = valuesList.some(function(value) {
                    var decryptedValue = Tea.decrypt(value, AL.encKey);
                    if(decryptedValue === currentValue) {
                        index = valuesList.indexOf(value);
                        return true;
                    }
                })

                if(valuesListContainsCurrentValue) {
                    index++;
                }

                if(index === valuesList.length) {
                    index = 0;
                }

                valueToPut = valuesList[index];
                valueToPut = Tea.decrypt(valueToPut, AL.encKey)

                return valueToPut;
            }

        },
        
        utils: {
            passwordToStars: function(password){

                if(password.search("Set your password") >= 0) { return password; }

                var stars = '';
                var length = password.length;

                if(AL.options.showPassword) {
                    for(var i = 0; i<length; i++) {
                        stars = stars + (i == 1 || i == length - 1 ? password[i] : '*')
                    }
                }
                else {
                    for(i = 0; i<length; i++) {
                        stars = stars + '*';
                    }
                }

                return stars;
            }
        }
    }

    setTimeout("AL.initialize.start();", 1000);
    //AL.initialize.start();

})()

(function(){
    AL = {
        
        initialize: {

            getALConfig: function(){

                chrome.extension.sendRequest({method: "getExtData"}, function(response) {
                    AL.alValues = response.alValues;
		    if(AL.alValues) {
			    AL.alTypes = properties(AL.alValues).reverse();
			    AL.encKey = response.encKey;
			    AL.options = response.options;
		    }
                });
            
            }(),

            extendHTMLInputElementClass: function() {

                HTMLInputElement.prototype.isALInput = function(){
                    var that   = this;
                    var result = false;

                    if ( !that.hasRequiredALInputAttrs() ) { return false }

                    var types         = AL.inputs.types();
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
                    var result = type;
                    var typeHasManyWords = type.match('_');
                    var name = this.cleanName();

                    if(typeHasManyWords) {

                        var typeWords = type.split('_');

                        typeWords.forEach(function(word) {
                            if(!name.match(word)) { result = false; }
                        })

                    }
                    else {

                        if(!name.match(type)) { result = false; }

                    }

                    return result;
                }

                HTMLInputElement.prototype.isSpecificALInput = function(type) {
                    var that = this;

                    return eval('is' + type + '()');
                    
                    function ispassword(){
                        return that.type == 'password' ? type : false;
                    }

                    function islogin(){
                        var result = that.isStandardALInput(type);

                        if(result) {
                            if( byLoginTheyMeanEmail() ) {
                                result = 'email';
                            }
                        }

                        function byLoginTheyMeanEmail() {
                            var label = that.findLabel();
                            return label && label.innerText.toLowerCase().replace(/[^A-Za-z]/, "").match('email');
                        }

                        return result
                    }

                    function isemail(){
                        return (that.type == 'email' || that.isStandardALInput(type)) ? type : false;
                    }

                    function isphone(){
                        return (that.type == 'tel' || that.isStandardALInput(type)) ? type : false;
                    }

                    function islast_name(){
                        var isLastNameType = that.isStandardALInput(type) || that.isStandardALInput('second_name') || that.isStandardALInput('surname');
                        return (isLastNameType) ? type : false;
                    }
                }

                HTMLInputElement.prototype.hasRequiredALInputAttrs = function() {
                    var nameIsSet = typeof(name) !== 'undefined'

                    var allowedTypes = /(text|password|email|tel)/
                    var typeIsCorrect = this.type.match(allowedTypes);

                    return nameIsSet && typeIsCorrect;
                }

                HTMLInputElement.prototype.empty = function() {
                    return this.value == '';
                }

                HTMLInputElement.prototype.cleanName = function() {
                    return this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
                }

                HTMLInputElement.prototype.cleanValue = function() {
                    return this.value.toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
                }

                HTMLInputElement.prototype.withPromptValue = function(type) {
                    return this.cleanValue().match(type) || this.cleanName().match(this.cleanValue());
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

                HTMLInputElement.prototype.findLabel = function() {
                    var that = this;
                    var label = null;

                    var parent = that.parentNode;
                    if( parent ) var neighbours = parent.childNodes;

                    if( neighbours.length ) {
                        neighbours.toArray().some(function(neighbour) {
                            if( neighbour.tagName == "LABEL" ) {
                                var forAttr = neighbour.getAttribute('for');
                                if( forAttr == that.id || forAttr == that.name ) {
                                    label = neighbour;
                                    return true;
                                }
                            }
                        })
                    }

                    return label;
                }

                HTMLInputElement.prototype.bindALEvents = function(type) {
                    var that = this;
                    var infoDivId = '__AL109'+this.name;

                    that.addEventListener('dblclick', function(){
                        that.simulateKeyDown();
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

                HTMLInputElement.prototype.autofill = function(type) {
                    if(this.empty() || this.withPromptValue(type)) {
                        var valueToPut = AL.inputs.valueToPut(type, this);

                        if(!valueToPut.match('Set your')) {
                            this.simulateKeyDown();
                            this.value = valueToPut;
                        }
                    }
                },

                HTMLInputElement.prototype.simulateKeyDown = function() {
                    var keyboardEvent = document.createEvent("KeyboardEvent");
                    var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";

                    keyboardEvent[initMethod](
                       "keydown", // event type : keydown, keyup, keypress
                        true, // bubbles
                        true, // cancelable
                        window, // viewArg: should be window
                        false, // ctrlKeyArg
                        false, // altKeyArg
                        false, // shiftKeyArg
                        false, // metaKeyArg
                        40, // keyCodeArg : unsigned long the virtual key code, else 0
                        0 // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0
                    );
                    this.dispatchEvent(keyboardEvent);
                },

                NodeList.prototype.toArray = function() {
                    var htmlElements = []
                    for(var i=0; i<this.length; i++) {
                        htmlElements.push(this[i]);
                    }
                    return htmlElements;
                }
            }(),

            start: function(){
				if(AL.alValues) {
					AL.inputs.prepare();
				}
            }
        },
        
        inputs: {
            types: function(){return AL.alTypes},
            specificTypes: ['login', 'password', 'email', 'phone', 'last_name'],

            prepare: function(){
                var inputs = AL.inputs.findAll();
                
                inputs.forEach(function(input) {
                    
                    var isALInput = input.isALInput();
                    
                    if(isALInput) {

                        var inputType = isALInput;
                    
                        input.bindALEvents(inputType);

                        if(AL.options.autoFill) {
                            input.autofill(inputType);
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

    setTimeout("AL.initialize.start();", 500);
    //AL.initialize.start();

})()

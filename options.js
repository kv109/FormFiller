$(function(){
	var CONF = _AL_CONF
	var TYPES = CONF.types.getDefault();

	function saveOptions() {
		var formValues = getForm().serializeArray();
		var alValues = {}
		$.each(formValues, function(){
			if(this.value != '') {
				var encryptedValue = Tea.encrypt(this.value, CONF.encKey.get());
				if( alValues[this.name] == undefined ) {
					alValues[this.name] = [encryptedValue];
				}
				else {
					alValues[this.name].push(encryptedValue);
				};
			}
		})
		CONF.alValues.set(alValues);
		showPopup();
	}

	function showPopup() {
		var popup = $('<div>');
		popup.attr('class', 'popup');
		popup.text('Options saved!');
		$('.container').append(popup);
		popup.animate({
			opacity: 0.0
		}, 2000);
	}

	function getForm() {
		return $('form');
	}

	function numberOfTypeInputs(type) {
		return $('input[name="' + type + '"]').length;
	}

	function generateForm() {
		var clearForm = function(){
			if(getForm().length) {
				$('.innerForm .inputs', getForm()).html("");
				$('.submit').remove();
			}
		}();

		var alValues = CONF.alValues.get();
		var types = CONF.alValues.getKeys();

		types.forEach(function(type) {
			var values = alValues[type];

			generateAndAppendTypeBefore(type);

			values.forEach(function(value) {
				value = Tea.decrypt(value, CONF.encKey.get())
				var inputNumber = numberOfTypeInputs(type) + 1;
				var humanName = capitalize(type) + " (" + inputNumber + ")";
				if(type == 'password') {
					generateAndAppendInput([type, humanName], type, {
						value: value
					});
				}
				else {
					generateAndAppendInput([type, humanName], 'text', {
						value: value
					});
				}
			})

			generateAndAppendTypeAfter(type);
		})
		appendSubmitButton();

	}

	function generateAndAppendTypeBefore(type) {
		var translation = CONF.dict.types[type];
		if( translation != undefined ) {
			translation = translation.pluralize;
		}
		else {
			translation = type;
		}
		var html = "<h2>Your " + translation + "</h2>";
		appendToFormInputs(html);
	}

	function generateAndAppendInput(name, type, opts) {
		var input = generateInput(name, type, opts);
		appendToFormInputs(input);
	}

	function generateInput(name, type, opts) {
		return generateStandardInput(name, type, opts);
	}

	function generateStandardInput(name, type, opts) {
		var name_ = name[0];
		var humanName = name[1];

		var spanForInput = $("<span>");
		var input = document.createElement("input");
		input.name = name_;
		input.type = type;
		input.size = 37;
		input.addEventListener('change', function(){
			saveOptions();
		})

		for(var prop in opts) {
			input[prop] = opts[prop];
		}

		var inputContainer = createInputContainer(humanName);
		spanForInput.append(input);
		inputContainer.append(spanForInput);

		return inputContainer;
	}

	function generateAndAppendTypeAfter(type) {
		var container = $('<div>');
		container.addClass('typeContainer');
		var customType = !~TYPES.indexOf(type);
		if(customType) container.addClass('custom');
		var addAnotherOne = $('<a>');
		addAnotherOne.text("Add");
		addAnotherOne.attr('href', '#');
		addAnotherOne.addClass('more');
		addAnotherOne.addClass('moreLess');

		var removeLastOne = $('<a>');
		removeLastOne.text("Remove");
		removeLastOne.attr('href', '#');
		removeLastOne.addClass('less');
		removeLastOne.addClass('moreLess');

		addAnotherOne.click(function(){
			var newInputContainer = addAnotherOne.parent().parent().prev().clone(true);
			var newInput = $('input', newInputContainer);
			var newInputLabel = $('label', newInputContainer);
			newInputLabel.text(newInputLabel.text().replace(/[0-9]/, numberOfTypeInputs(type) + 1));
			container.before(newInputContainer);
			newInput.val("");
			newInput.focus();
		})

		removeLastOne.click(function(){
			var lastInput = removeLastOne.parent().parent().prev();
                        var lastInputIsTheOnlyOneLeft = lastInput.prev()[0].nodeName == 'H2';
			if( lastInputIsTheOnlyOneLeft ) {
                                var lastInputTypeIsCustomType = removeLastOne.parents('.typeContainer').hasClass('custom');
				if( !lastInputTypeIsCustomType ) {
                                    alert('Cannot remove the last one');
				}
				else {
					if( confirm('This action will remove "' + type + '" permanently. Are you sure?') ) {
						var typeContainer = removeLastOne.parents('.typeContainer');
						typeContainer.prev().prev().remove();
						typeContainer.prev().remove();
						typeContainer.remove();
						saveOptions();
					};
				}
			}
			else {
				lastInput.remove();
			}
		})

		appendMoreLessButtons();

		appendToFormInputs(container);

		function appendMoreLessButtons() {
			var moreLessSpan = $('<span>');
			moreLessSpan.addClass('moreLessSpan');
			moreLessSpan.append(addAnotherOne);
			moreLessSpan.append(" | ");
			moreLessSpan.append(removeLastOne);
			container.append(moreLessSpan);
		}
	}

	function createInputContainer(name) {
		var container = $('<div>');
		container.addClass('inputContainer');

		var textSpan = $('<label>');
		textSpan.text(name + ": ");
		textSpan.addClass("label");
		textSpan.attr('for', name);

		container.append(textSpan);

		return container;
	}

	function appendToFormInputs(input){
		$('.innerForm .inputs').append(input);
	}

	function appendToForm(input){
		$('.innerForm').append(input);
	}

	function appendSubmitButton(){
		appendToForm('<div class="submit"><input type="submit" value="Save" /></div>');
	}

	function initialize(){
		prepareOptionsPanel();
		generateForm();
		$('.bar1').css('height', $('.bar2').height());
		setEvents();
	}

	function prepareOptionsPanel() {

		var value = null;

		var showPasswordContainer = $('.showPassword');
		showPasswordContainer.hover(
			function(){
				$('.description', showPasswordContainer).show();
			},
			function(){
				$('.description', showPasswordContainer).hide();
			}
			)

		var booleanOptions = ['showPassword', 'autoFill'];

		booleanOptions.forEach(function(name) {
			value = CONF.options.getValue(name);
			var inputSelector = '.' + name + ' input';
			$(inputSelector).attr('checked', value);

			$(inputSelector).click(function(){
				CONF.options.setValue(name, $(inputSelector).is(':checked'));
				showPopup();
			})
		})

		var createCustomType = $('.createCustomType');
		createCustomType.click(function(){
			var type = prompt('Enter your custom type name:');
			saveNewType(type);
		})

		var synchronize = $('.synchronize');
		synchronize.click(function(){
			var ok = confirm('This operation will overwrite your data if they were changed on another browser. Are you sure?');
                        if(!ok) return;

                        var notifier = $('<span>'); notifier.text('Synchronizing...')
                        synchronize.append(notifier);
                        CONF.sync.get();
			var i = setInterval(processSync, 500);

                        function processSync() {
                            var syncFinished = !(CONF.sync.isProcessing());
                            if(syncFinished) {
                                clearInterval(i);
                                notifier.remove();
                                generateForm();
                            }
                        }
		})

	}
        
	function saveNewType(type) {
		generateAndAppendTypeBefore(type);
		generateAndAppendInput([type, capitalize(type) + ' (1)'], 'text');
		generateAndAppendTypeAfter(type);
		$('.inputs input:last').focus();
	}

	function setEvents(){
		$('.submit', getForm()).click(function(evt){
			evt.stopPropagation();
			saveOptions();
			return false;
		})
	}
	initialize();
})
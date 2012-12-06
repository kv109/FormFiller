function toStorage(key, object) {
	localStorage.setItem(key, JSON.stringify(object));
}

function fromStorage(key) {
	return JSON.parse(localStorage.getItem(key));
}

function log(object) {
	console.log(object);
}

function capitalize(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function randomString(length, type) {
	if( length==undefined ) length=8;
	if( type==undefined ) type='alphanumeric';

	var chars='';
	switch( type ){
		case 'alphanumeric':
			chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
			break;
		case 'alpha':
			chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
			break;
		case 'numeric':
			chars = "0123456789";
			break;
	}

	var randomstring = '';
	for (var i=0; i<length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}
	return randomstring;
}

function clone(obj) { 
	var clone = {};
	clone.prototype = obj.prototype;
	for (var property in obj) clone[property] = obj[property];
	return clone;
}

function properties(object)
{
	var keys = [];
	for(var i in object) if (object.hasOwnProperty(i))
	{
		keys.push(i);
	}
	return keys;
}
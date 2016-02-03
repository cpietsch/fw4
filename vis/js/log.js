// function log(view, type, area, value){
// 	var payload = {
// 		type: type,
// 		view: view,
// 		area: area,
// 		value: value.toString()
// 	};

// 	// collect browser, version, and referrer
// 	if (type=="load" && area=="page") payload.value = navigator.platform + ","+navigator.sayswho+","+document.referrer;

// 	//if (view=="index") $.post( "log.php", payload);
// 	//else $.post( "../log.php", payload);
// }


function Logger(){

	function self(){}

	var _buffer = [];
	var _view = "";
	var _startTime = new Date()*1;

	self.register = function(view){
		_view = view;
		return self;
	}

	self.log = function(obj){
		obj.view = _view;
		// obj.time = (new Date()*1 - _startTime)/1000;
		obj.time = new Date()*1;

		_buffer.push(obj);

		console.warn("logger",obj);
		return self;
	}

	self.buffer = function(){
		
		console.warn("logger",_buffer);

		return self;
	}

	return self;
}
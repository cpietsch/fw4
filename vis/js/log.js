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
	var _maxBufferSize = 3;

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

		if(_buffer.length > _maxBufferSize){
			self.sync();
		}
		return self;
	}

	self.sync = function(){
		console.warn("uploading");

		d3.json("http://uclab.fh-potsdam.de/fw4beta/log2.php")
			.header("Content-Type", "application/json")
			.post(JSON.stringify(_buffer), function(error, data) {
		  	console.warn("done uploading")
		  });
	}

	self.buffer = function(){
		
		console.warn("logger",_buffer);

		return self;
	}

	return self;
}
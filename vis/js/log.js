function Logger(){

	function self(){}

	var _buffer = [];
	var _view = "";
	var _startTime = new Date()*1;
	var _maxBufferSize = 20;

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
		// _buffer.length = 0;
		d3.json("http://uclab.fh-potsdam.de/fw4beta/log.php")
			// .header("Content-Type", "application/json")
			.post(JSON.stringify(_buffer), function(error, data) {
		  	console.warn("done uploading")
		  	_buffer.length = 0;
		  });
	}

	self.buffer = function(){
		
		console.warn("logger",_buffer);

		return self;
	}

	return self;
}
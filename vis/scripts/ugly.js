var NodeUglifier = require("node-uglifier");

new NodeUglifier("../js/list.js").uglify().exportToFile("../js/list.min.js");
new NodeUglifier("../js/tags.js").uglify().exportToFile("../js/tags.min.js");

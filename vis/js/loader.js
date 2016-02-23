// christopher pietsch
// cpietsch@gmail.com
// tweet me @chrispiecom
// 2015-2016


function Loader(url){
  var progress = 0,
      loaded = 0,
      total = 0;

  var container,indicator;

  var loader = {};
  var finished = function(){};

  loader.finished = function(value) {
    if (!arguments.length) return finished;
    finished = value;
    return loader;
  };
  loader.progress = function(){
    total = (d3.event.total == 0) ? 80333701 : d3.event.total;
    loaded = d3.event.loaded;
    progress = parseInt((loaded/total)*100);

    indicator.style("height", progress + "%");

    console.log(progress);
  }
  loader.load = function(){
    
    container = d3.select(".detailLoader")//.style("height", window.innerHeight);
    container.selectAll("div").remove();

    container.append("div").classed("label", true).text("loading");

    indicator = container.append("div").classed("indicator", true);

    d3.csv(url)
        .on("progress", loader.progress)
        .on("load", function(data){
          finished(data);
          container.selectAll("div").remove();
        })
        .get();
  };

  loader.load(url);

  return loader;
}







function LoaderMultiple(url){
  var progress = 0,
      loaded = 0,
      total = 0;

  var size = 10;
  var urls = d3.range(size+1).map(function(d){ return url + d + ".csv"});
  var index = 0;
  var itemsLoaded = 0;

  var container,indicator,label;

  var loader = {};
  var finished = function(){};

  loader.finished = function(value) {
    if (!arguments.length) return finished;
    finished = value;
    return loader;
  };

  loader.progress = function(){
    //console.log(d3.event.total, d3.event.loaded)
    total = (d3.event.total == 0) ? 8497147 : d3.event.total;
    loaded = d3.event.loaded;
    progress = parseInt((loaded/total)*100);

    label.text("loading " + (itemsLoaded + parseInt(progress*1.20)) + " sketches");
    indicator.style("height", progress + "%");

    console.log(progress);
  }
  loader.load = function(url){
    console.log("loading", url);
    
    container = d3.select(".detailLoader")
    container.selectAll("div").remove();
    label = container.append("div").classed("label", true).text("loading");
    indicator = container.append("div").classed("indicator", true);

    d3.csv(url)
        .on("progress", loader.progress)
        .on("load", function(data){
          finished(data);

          itemsLoaded += data.length;
         // container.selectAll("div").remove();

          if(index < size){
            index++;
            loader.load(urls[index]);
          }
        })
        .get();
  };

  loader.load(urls[index]);

  return loader;
}
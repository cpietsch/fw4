// christopher pietsch
// cpietsch@gmail.com
// tweet me @chrispiecom
// 2015-2016

// this is not meant for your eyes ;)
// not yet at least - will publish the code on github soon

function myListView() {
  var margin = {
      top: 20,
      right: 50,
      bottom: 30,
      left: 50
  };

  var minHeight = 400;
  var width = window.innerWidth - margin.left - margin.right;
  var widthOuter = window.innerWidth;
  var height = window.innerHeight < minHeight ? minHeight : window.innerHeight;
  // var margin = {top: 20, right: 20, bottom: 30, left: 40},
  //     width = 1300* scale - margin.left - margin.right ,
  //     height = 600*scale - margin.top - margin.bottom;
  var scale;
  var scale1 = 1;
  var scale2 = 1;
  var scale3 = 1;
  var allData = [];

  var translate = [0, 0];
  var scale = 1;
  // window.scale = scale;

  // var timeDomain = d3.range(1810, 1857).map(function(d) { 
  //     return {
  //         key: d
  //     };
  // });
  var timeDomain = [];
  // var timeDomain = d3.range(1795,1862).map(function(d){ return { key: d };});

  var x = d3.scale.ordinal()
      .rangeBands([margin.left, width + margin.left], 0.2)
      // .domain(timeDomain.map(function(d) { return d.key; }))

  // var fontScale = d3.scale.linear()
  //   .domain([2,6])
  //   .range([9,15])
  //   .clamp(true)

  var Quadtree = d3.geom.quadtree()
      // .extent([[0, 0], [width, -height]])
      .x(function(d) {
          return d.x;
      })
      .y(function(d) {
          return d.y;
      })

  var quadtree;

  var zoom = d3.behavior.zoom()
      .scaleExtent([1, 450])
      .on("zoom", zoomed)
      .on("zoomend", zoomend)
      .on("zoomstart", zoomstart)

  d3.select("body")
      //.on("keydown", keydown);

  var canvas;
  var container;
  var entries;
  var years;
  var data;
  var rangeBand = 0;
  var rangeBandImage = 0;
  var imageSize = 100;
  var imageSize2 = 1000;
  var imageSize3 = 4000;
  var collumns = 3;
  var renderer, stage, stats;
  var svg, timeline;
  var svgscale, voronoi;

  var selectedImageDistance = 0;

  var drag = false;

  var stagePadding = 40;
  var imgPadding;

  _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
  var detailTemplate = _.template(d3.select("#detailTemplate").html());
  var detailContainer = d3.select(".sidebar")
      .on("mouseenter", function(d) {
          logger.log({
              action: "enter",
              scale: scale,
              target: "detail"
          });
      })
      .on("mouseleave", function(d) {
          logger.log({
              action: "exit",
              scale: scale,
              target: "detail"
          });
      })

  d3.select(".slidebutton")
    .on("click", function(){
      var s = !d3.select(".sidebar").classed("sneak");
      d3.select(".sidebar").classed("sneak", s);
      logger.log({ action: !s ? "open" : "close" , target: "detail" });
    })

  d3.select(".infobutton")
    .on("click", function(){
      var s = !d3.select(".infobar").classed("sneak");
      d3.select(".infobar").classed("sneak", s)
      logger.log({ action: !s ? "open" : "close" , target: "info" });
    })

  d3.select(".infobar")
    .on("mouseenter", function(d){
      logger.log({ action: "enter", scale: scale, target: "infobar" });
    })
    .on("mouseleave", function(d){
      logger.log({ action: "exit", scale: scale, target: "infobar" });
    })


  var filter;
  var myTooltip;

  var timelineData;

  var stage, stage1, stage2, stage3, stage4, stage5;

  function chart() {}

  chart.resize = function() {
      // console.log("resize")
      width = window.innerWidth - margin.left - margin.right;
      height = window.innerHeight < minHeight ? minHeight : window.innerHeight;

      renderer.resize(width + margin.left + margin.right, height);

      chart.makeScales();
      chart.flip();
  }

  chart.makeScales = function() {
      x.rangeBands([margin.left, width + margin.left], 0.2)

      rangeBand = x.rangeBand();
      rangeBandImage = x.rangeBand() / 3;
      imgPadding = rangeBand / collumns / 2;

      scale1 = imageSize / (x.rangeBand() / collumns);
      scale2 = imageSize2 / (x.rangeBand() / collumns);
      scale3 = imageSize3 / (x.rangeBand() / collumns);

      //stage.x = margin.left;

      stage3.scale.x = 1 / scale1;
      stage3.scale.y = 1 / scale1;
      stage3.y = height;

      stage4.scale.x = 1 / scale2;
      stage4.scale.y = 1 / scale2;
      stage4.y = height;

      stage5.scale.x = 1 / scale3;
      stage5.scale.y = 1 / scale3;
      stage5.y = height;

  }

  chart.init = function(_data,_timeline) {
      data = _data;

      container = d3.select(".page").append("div").classed("viz", true);

      PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST; //Hmm...?
      // renderer = new PIXI.WebGLRenderer(width, height);
      var renderOptions = {
          transparent: false,
          resolution: 1,
          antialiasing: false
      };
      renderer = new PIXI.WebGLRenderer(width + margin.left + margin.right, height, renderOptions);
      renderer.backgroundColor = 0x1C1E1F;
      window.renderer = renderer;
     
      var renderElem = d3.select(container.node().appendChild(renderer.view));

      stats = new Stats();
      document.body.appendChild(stats.domElement);

      stage = new PIXI.Container();
      stage2 = new PIXI.Container();
      stage3 = new PIXI.Container();
      stage4 = new PIXI.Container();
      stage5 = new PIXI.Container();
      // stageBack = new PIXI.Container();

      // stage.addChild(stageBack);
      stage.addChild(stage2);
      stage2.addChild(stage3);
      stage2.addChild(stage4);
      stage2.addChild(stage5);


      // add preview pics
      data.forEach(function(d, i) {
          var texture = PIXI.Texture.fromImage("data:image/jpg;base64," + imagesMap.get(d.id).image);
          var sprite = new PIXI.Sprite(texture);
          
          sprite.anchor.x = 0.5;
          sprite.anchor.y = 0.5;
          sprite._data = d;
          d.sprite = sprite;

          stage3.addChild(sprite);

      })

      console.log(_data[0])

      // timeline cleaning
      _timeline.forEach(function(d) {
          d.jahr = d.jahr.split("-")[0];
          d.jahr = d.jahr * 1;
          d.type = "timeline";

          if(lang == "en"){
            d.titel = d.titelEN;
            d.text = d.textEN;
            d.extra = d.extraEN;
          }
      });

      var chartDomain = d3.nest()
        .key(function(d){ return d.jahr; })
        .entries(_data.concat(_timeline))
        .sort(function(a, b) { return a.key - b.key; })
        .map(function(d){ return d.key*1; })

      timeDomain = chartDomain.map(function(d){
        return {
          key: d,
          values: _timeline.filter(function(e){ return d == e.jahr; })
        }
      })

      x.domain(chartDomain);

      // timeDomain.forEach(function(d) {
      //     d.x = x(d.key) + rangeBand / 3;
      //     d.y = 5;
      // });


      chart.makeScales();

      // // make x Axis
      // x.domain().forEach(function(d){
      //   var xpos = (x(d) + x.rangeBand()/collumns)*scale1;

      //   var text = new PIXI.Text(d, {font:"70px Arial", fill:0x999999, align : 'center'});
      //   text.x = xpos;
      //   text.y = 4*scale;

      //   stage3.addChild(text);
      // })

    
      d3.select(".viz")
          .call(zoom)
          .on("mousemove", mousemove)
          .on("dblclick.zoom", null)
          .on("click", function() {
              // console.log("DRAG", drag)
              if (selectedImage && !selectedImage.id) return;
              if (drag) return;
              if (selectedImageDistance > 15) return;
              if (selectedImage && !selectedImage.active) return;
              if(timelineHover) return;
              // console.log(selectedImage)

              if (Math.abs(zoomedToImageScale - scale) < 0.1) {
                  logger.log({
                      action: "zoomback",
                      scale: scale,
                      target: selectedImage ? selectedImage.id : ""
                  });
                  chart.resetZoom();
              } else {
                  logger.log({
                      action: "zoomto",
                      scale: scale,
                      target: selectedImage ? selectedImage.id : ""
                  });
                  zoomToImage(selectedImage, 1400 / Math.sqrt(Math.sqrt(scale)));
              }

              // if(zoomedToImage) zoomToImage(selectedImage, 500);
              // if(!zoomedToImage) zoomToImage(selectedImage, 1000);
          })

      svg = renderElem
          // .classed("overlay", true)



      // myTooltip = tooltip(svg);

      timeline = d3.select(".viz").append("div").classed("timeline", true)
          .style("transform", "translate(" + 0 + "px," + (height - 30) + "px)");


      // svgscale.on("mousemove", mousemove);


      //svg.call(zoom.scale(1).translate([0,0]).event)

      chart.flip();

      //zoomToImage(data[2])
      animate();



  };


  function mousemove(d) {
      if(timelineHover) return;
      //ping();
      var mouse = d3.mouse(this);
      var p = toScreenPoint(mouse);

      // console.time("search")
      var best = nearest(p[0] - imgPadding, p[1] - imgPadding, {
          d: 200,
          p: null
      }, quadtree);
      // console.timeEnd("search")
      // console.log(best)

      selectedImageDistance = best.d;

      if (best.p && !zoomedToImage) {
          var d = best.p;
          // todo iprove that bitch
          var center = [((d.x + imgPadding) * scale) + translate[0], (height + d.y + imgPadding) * scale + translate[1]];
          zoom.center(center);

          selectedImage = d;

          //d.alpha = 0.6;
      }

      container.style("cursor", function() {
          return ((best.d < 5) && selectedImage.active) ? "pointer" : "default";
      });

      // console.log(best)

  }

  var flipflop = false;

  function stackLayout(data, invert) {
      flipflop = !flipflop;

      var years = d3.nest()
          .key(function(d) {
              return d.jahr;
          })
          // .sortKeys(d3.ascending)
          .entries(data)

      years.forEach(function(year) {
          var startX = x(+year.key);
          var total = year.values.length;
          // year.values.sort(function(a,b){
          //   return a.hochkant - b.hochkant;
          // })

          year.values.forEach(function(d, i) {
              var row = (Math.floor(i / collumns) + 2);

              d.x = startX + ((i % collumns) * (rangeBand / collumns));
              d.y = (invert ? 1 : -1) * (row * (rangeBand / collumns));

              d.x1 = d.x * scale1 + imageSize / 2;
              d.y1 = d.y * scale1 + imageSize / 2;

              if (d.sprite.position.x == 0) {
                  d.sprite.position.x = d.x1;
                  d.sprite.position.y = d.y1;
              }

              if (d.sprite2) {
                  d.sprite2.position.x = d.x * scale2 + imageSize2 / 2;
                  d.sprite2.position.y = d.y * scale2 + imageSize2 / 2;
              }


              d.order = (invert ? 1 : 1) * (total - i);
          })
      })
  }

  chart.distance = function(a, b) {
      return Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]));
  }


  chart.click = function(d) {
      // c("click")

  }

  function toScreenPoint(p) {
      var p2 = [0, 0];

      // console.log("t",translate,scale)

      p2[0] = p[0] / scale - translate[0] / scale;
      p2[1] = (p[1] / scale - height) - translate[1] / scale;

      return p2;
  }

  chart.mousemove = function(d) {
      if (cloud.lock) return;

      var mouse = d3.mouse(this);
      var p = [d.point.x, d.point.y];

      var distance = chart.distance(mouse, p);

      //c("distance", distance);

      // c("cell", p);
      // c("mouse", mouse);
  }

  chart.mouseover = function(d) {
      // c("mouseover");
      if (cloud.lock) return;


      // c("ver", chart.distance(d.centroid(), [d.point.x, d.point.y]));

      var d = d.point;

      selectedImage = d;

      //myTooltip.display(d);

      //d.target.alpha = 0.6;

      //var elm = d.target._data;

      if (scale < zoomBarrier) {
          //cloud.highlightWords(d);
      }

      // console.log(d)

      var center = [((d.x + rangeBand / 3 / 2) * scale) + translate[0], (height + d.y + rangeBand / 3 / 2) * scale + translate[1]];
      //c("center", center)
      zoom.center(center);


      // svg.attr("cursor", "pointer");


      //cloud.filterWords(d.keywords);

  }

  chart.mouseout = function(d) {
      // console.log("mouseout")
      if (cloud.lock) return;

      //d.target.alpha = 1;
      if (scale < zoomBarrier) {
          cloud.mouseleave();
      }

      myTooltip.hide();
      // svg.attr("cursor", "default");

  }



  chart.mousedown = function(d) {
      if (drag) return;

      var d = d.point;
      //var elm = d.target._data;

      if (!drag) {
          zoomToImage(d, 1000 / Math.sqrt(Math.sqrt(scale)));
      }

  }

  var search = "";

  chart.clearSearch = function() {
      search = "";
  }

  var selectedImage = null;

  function keydown(d) {
      var key = d3.event.keyIdentifier;
      var charkey = String.fromCharCode(d3.event.charCode || d3.event.keyCode);

      if (key === "U+0008") {
          d3.event.preventDefault();
          search = search.slice(0, -1);

          cloud.search(search);

      }

      // c(key);

      if (!/[^a-zA-Z0-9]/.test(charkey)) {
          search += charkey;
          cloud.search(search);
      }

      if (key == "Right" || key == "Left") {
          var dir = key == "Right" ? -1 : 1;
          var next = getSiblingImage(selectedImage, dir);

          // c(dir, next)
          clearBigImages();
          zoomToImage(next, 500);
      }

      if (key == "Up" || key == "Down") {
          var dir = key == "Up" ? 1 : -1;
          translateUpDown(dir);
      }

  }

  function translateUpDown(dir) {

      var translateNow = [translate[0], translate[1] + dir * 10 * scale];

      svg
          .call(zoom.translate(translate).event)
          .transition().duration(1000)
          .call(zoom.translate(translateNow).event)
  }

  function getSiblingImage(active, dir) {
      if (!active) return;

      return data.filter(function(d) {
          return (d.order == active.order + dir && d.jahr == active.jahr);
      })[0];

  }

  function imageAnimation() {
      // data.forEach(function(d,i){
      //   var diff;
      //   diff = (d.x1-d.sprite.position.x);
      //   if(diff>1) d.sprite.position.x += diff*0.1;

      //   diff = (d.y1-d.sprite.position.y);
      //   if(diff>1) d.sprite.position.y += diff*0.1;

      //   diff = (d.alpha-d.sprite.alpha);
      //   if(diff>0.01) d.sprite.alpha += diff*0.1;

      //   if(d.sprite2) {
      //     diff = (d.alpha2-d.sprite2.alpha);
      //     if(diff>0.01) d.sprite2.alpha += diff*0.1;
      //   }
      // });
      data.forEach(function(d, i) {
          var diff;
          diff = (d.x1 - d.sprite.position.x);
          if (Math.abs(diff) > 0.1) d.sprite.position.x += diff * 0.1;

          diff = (d.y1 - d.sprite.position.y);
          if (Math.abs(diff) > 0.1) d.sprite.position.y += diff * 0.1;

          diff = (d.alpha - d.sprite.alpha);
          if (Math.abs(diff) > 0.01) d.sprite.alpha += diff * 0.2;

          d.sprite.visible = d.sprite.alpha > 0.1;

          if (d.sprite2) {
              diff = (d.alpha2 - d.sprite2.alpha);
              if (Math.abs(diff) > 0.01) d.sprite2.alpha += diff * 0.2;

              d.sprite2.visible = d.sprite2.alpha > 0.1;
              //else d.sprite2.visible = d.visible;
          }
      });
      // data.forEach(function(d,i){
      //   d.sprite.position.x = d.x1;
      //   d.sprite.position.y = d.y1;

      //   d.sprite.alpha = d.alpha;
      //   if(d.sprite2) d.sprite2.alpha = d.alpha2;
      // });
  }

  function animate(time) {

      requestAnimationFrame(animate);
      //filter.time = (filter.time+0.02) % 1;

      loadImages();
      imageAnimation();

      renderer.render(stage);
      stats.update();
  }

  function zoomToYear(d) {

      var xYear = x(d.jahr);
      var scale = 1 / (rangeBand / width);
      var translateNow = [-scale * xYear, -scale * (height + d.y)];

      svg
          .call(zoom.translate(translate).event)
          .transition().duration(2000)
          .call(zoom.scale(scale).translate(translateNow).event)
  }


  var zoomedToImage = false;
  var zoomedToImageScale = 0;
  var zoomBarrier = 2;
  // todo: zoombarrier as d3.scale.threshold()

  function zoomToImage(d, duration) {

      // console.log("detail", d)

      zoom.center(null);

      loadMiddleImage(d);

      d3.select(".tagcloud").classed("hide", true);

      var padding = x.rangeBand() / 3 / 2;
      var sidbar = width / 8;
      // var padding = 0;
      var scale = 0.6 / (x.rangeBand() / 3 / width);
      var translateNow = [(-scale * (d.x - padding)) - sidbar, -scale * (height + d.y)];

      //console.log(scale, translateNow);

      zoomedToImageScale = scale;

      setTimeout(function() {
          hideTheRest(d);
      }, duration / 2);

      svg
          .call(zoom.translate(translate).event)
          .transition().duration(duration)
          .call(zoom.scale(scale).translate(translateNow).event)
          .each("end", function() {

              zoomedToImage = true;
              selectedImage = d;

              hideTheRest(d);

              showDetail(d);

              loadBigImage(d);

          })
  }

  function showDetail(d) {
      // console.log("show detail")
      logger.log({
          action: "zoomToDetail",
          target: d.id
      });

      detailContainer
          .classed("hide", false)
          .classed("sneak", lang=="en")
          .select(".inner")
          .html(detailTemplate(d))


      // todo: fix this hacky template stuff
      var s = detailContainer
          .select(".thementexte")
          .text(d.thementexte.length ? "" : "Keine")
          .selectAll("a")
          .data(d.thementexte)

      s.enter().append("a")
      s.exit().remove()
      s
          .attr("href", function(d) {
              return "thementexte/" + d.file;
          })
          .attr("target", "_blank")
          .attr("title", "zum PDF")
          .text(function(d) {
              return d.full_title;
          })

  }

  var loadedBigInterval = null;

  function loadBigImage(d, callback) {
      // c("loadBig", d.id);

      var img = new Image();

      img.addEventListener("load", function() {
          // console.log(img)
          var base = new PIXI.BaseTexture(img);
          var texture = new PIXI.Texture(base);
          // var texture = PIXI.Texture.fromImage("data/bilder_4000/" + d.id + ".jpg");
          var sprite = new PIXI.Sprite(texture);

          //c(texture.baseTexture.hasLoaded, sprite);

          sprite.anchor.x = 0.5;
          sprite.anchor.y = 0.5;
          sprite.position.x = d.x * scale3 + imageSize3 / 2;
          sprite.position.y = d.y * scale3 + imageSize3 / 2;
          sprite._data = d;
          d.big = true;

          stage5.addChild(sprite);
      });
      // img.src = "data/bilder_4000/" + d.id + ".jpg";
      // img.src = "data/large/105599.jpg";
      img.crossOrigin = "";
      img.src = "https://s3.eu-central-1.amazonaws.com/fw4/large/" + d.id + ".jpg";


  }

  function clearBigImages() {
      while (stage5.children[0]) {
          stage5.children[0]._data.big = false;
          stage5.removeChild(stage5.children[0]);
      }
  }


  function hideTheRest(d) {
      // c("hide", d.id)
      data.forEach(function(d2) {
          if (d2.id !== d.id) {
              // d2.sprite.alpha = 0;
              // d2.sprite.visible = false;
              d2.alpha = 0;
              d2.alpha2 = 0;

          }
      })
  }

  function showAllImages() {
      data.forEach(function(d) {
          d.alpha = d.active ? 1 : 0.2;;
          //d.visible = d.active;
          d.alpha2 = d.visible ? 1 : 0;
          //d.sprite.visible = true;  


      })
  }



  var fontScale = d3.scale.linear()
      .domain([1, 9])
      .range([9, 20])
      .clamp(true)

  var timelineFontScale = d3.scale.linear()
      .domain([2, 8, 20])
      .range([9, 14, 19])
      .clamp(true)

  var timelineScale = d3.scale.threshold()
      .domain([3, 10, 20])
      .range(["none", "small", "middle", "large"])

  var timelineHover = false;

  function updateDomain(x1, x2) {
      // console.time("timeline");
      // console.log(x1,x2)

      //console.log(scale, timelineFontScale(scale))

      timeDomain.forEach(function(d) {
          d.pos = ((x(d.key) - x1) * scale);
          d.visible = (d.pos > (-rangeBand * scale) && d.pos < width + 100);
      })

      timeline.attr("class", "timeline " + timelineScale(scale))

      timeline.style("font-size", function() {
          return (2 * scale)+ "px";
      });

      var select = timeline.selectAll(".container")
          .data(timeDomain)

      var enter = select
          .enter()
          .append("div")
          .classed("container", true)
          .on("mouseenter", function(d){
            timelineHover = true;
            zoom.center(null);
            logger.log({
              action: "enter timeline",
              scale: scale,
              translate, translate,
              target: d.key,
            });
          })
          .on("mouseleave", function(d){
            timelineHover = false;
            logger.log({
              action: "exit timeline",
              scale: scale,
              translate, translate,
              target: d.key,
            });
          })


      enter.append("div")
          .classed("year", true)
          .text(function(d) {
              return d.key;
          })

      var e = enter
          .append("div")
          .classed("entries", true)
          .selectAll(".entry")
          .data(function(d) {
              return d.values;
          })
          .enter()
          .append("div")
          .classed("entry", true)

      e
          .append("div")
          .classed("small", true)
          .append("div")
          .classed("title", true)
          .text(function(d) {
              return d.titel;
          })

      var m = e
          .append("div")
          .classed("middle", true)

      m
          .append("div")
          .classed("title", true)
          .text(function(d) {
              return d.titel;
          })

      m
          .append("div")
          .classed("text", true)
          .text(function(d) {
              return d.text + ".";
          }) //…

      var l = e
          .append("div")
          .classed("large", true)

      l
          .append("div")
          .classed("title", true)
          .text(function(d) {
              return d.titel;
          })

      l
          .append("div")
          .classed("text", true)
          .html(function(d) {
              return d.text + ".<br><br>" + d.extra;
          })

      select
          .style("transform", function(d) {
              return "translate(" + d.pos + "px,0px)";
          })
          .style("height", rangeBand * scale + "px")
          .style("width", rangeBand * scale + "px")
          .style("display", function(d) {
              return d.visible ? "block" : "none";
          })

      select
          .select(".year")
          .style("font-size", fontScale(scale) + "px")

      // select
      //   .select(".outer")
      //   .style("transform", "scale("+ scale +")")
      //   .style("opacity", (scale/7));

      // console.timeEnd("timeline");
  }

  function updateDomain2(x1, x2) {

      var timelineScale = d3.scale.threshold()
          .domain([10, 20])
          .range(["small", "middle", "deep"])

      var fontScale = d3.scale.linear()
          .domain([1, 9])
          .range([9, 20])
          .clamp(true)


      // console.log(timelineScale(scale), scale)

      timeline.attr("class", "timeline " + timelineScale(scale))

      var select = timeline.selectAll(".container")
          .data(timeDomain)

      var enter = select
          .enter()
          .append("div")
          .classed("container", true)


      enter.append("div")
          .classed("year", true)
          // .text(function(d){ return "'"+(1800-d.key)*-1; })
          .text(function(d) {
              return d.key;
          })

      var e = enter
          .append("div")
          .classed("outer", true)
          .append("div")
          .classed("inner", true)
          .append("div")
          .classed("entries", true)
          .selectAll(".entry")
          .data(function(d) {
              return d.values;
          })
          .enter()
          .append("div")
          .classed("entry", true)

      var l = e
          .append("div")
          .classed("left", true)

      l
          .append("div")
          .classed("jahr", true)
          .text(function(d) {
              return d.jahr;
          })

      l
          .append("div")
          .classed("title", true)
          .text(function(d) {
              return d.titel;
          })

      l
          .append("div")
          .classed("text", true)
          .text(function(d) {
              return d.text;
          })

      e
          .append("div")
          .classed("extra", true)
          .text(function(d) {
              return d.extra;
          })

      select
          .style("transform", function(d) {
              var pos = ((x(d.key) - x1) * scale);
              return "translate(" + pos + "px,0px)";
          })
          .style("height", rangeBand * scale + "px")
          .style("width", rangeBand * scale + "px")
          // .style("font-size", fontScale(scale) + "px")
          // .style("font-size", scale*2 + "px")
          // .style("line-height", scale*2 + "px")

      select
          .select(".year")
          .style("font-size", fontScale(scale) + "px")

      select
          .select(".outer")
          .style("transform", "scale(" + scale + ")")
          .style("opacity", (scale / 7));

      select
          .select(".inner")
          // .style("background", "rgba(247, 239, 205, "+ (1 - (scale/7)) +")");
  }

  function zoomed() {

      translate = d3.event.translate;
      scale = d3.event.scale;

      // check borders
      // this shit cost me a lot of nerves...

      var x1 = -1 * translate[0] / scale;
      var x2 = (x1 + (widthOuter / scale));

      var y1 = (translate[1] + height * scale);

      var e = -extent[1] - bottomPadding;
      var y2 = (e - height) * scale + height;

      var e2 = extent[0] - bottomPadding;
      var y3 = (e2 + height) * -scale;

      // console.log(translate[1],e2, y3);

      // var yy1 = 

      if (d3.event.sourceEvent != null) {
          if (x1 < 0) {
              translate[0] = 0;
          } else if (x2 > widthOuter) {
              translate[0] = ((widthOuter * scale) - widthOuter) * -1;
          }


          if (translate[1] < y2) {
              translate[1] = y2;
          }

          zoom.translate([translate[0], translate[1]]);

          x1 = -1 * translate[0] / scale;
          x2 = (x1 + (width / scale))
      }

      if (zoomedToImageScale != 0 && scale > zoomedToImageScale && !zoomedToImage && selectedImage && selectedImage.type == "image") {
          // c("-zoomedto", selectedImage)
          // zoomToImage(selectedImage,500);

          // console.log(slectedImage);

          zoomedToImage = true;

          zoom.center(null);
          zoomedToImageScale = scale;

          hideTheRest(selectedImage);

          showDetail(selectedImage)


      }


      // d3.select(".stooltip").attr("transform", "translate("+translate[0]+"," + ((height+rangeBand/collumns/2) * scale-(-1*translate[1])) + ")");


      if (zoomedToImage && zoomedToImageScale - 20 > scale) {
          // c("clear")
          zoomedToImage = false;

          showAllImages();
          clearBigImages();
          detailContainer.classed("hide", true).classed("sneak", lang=="en")
      }

      //domain
      updateDomain(x1, x2);

      var timeY = ((height) * scale - (-1 * translate[1]) - rangeBandImage * scale);
      timeline
          .style("transform", "translate(" + 0 + "px," + timeY + "px)");

      // toggle zoom overlays
      if (scale > zoomBarrier) {
          d3.select(".tagcloud").classed("hide", true);
      } else {
          d3.select(".tagcloud").classed("hide", false);
      }


      stage2.scale.x = d3.event.scale;
      stage2.scale.y = d3.event.scale;
      stage2.x = d3.event.translate[0];
      stage2.y = d3.event.translate[1];

      // filterVisible();
  }


  var startTranslate = [0, 0];
  var startScale = 0;

  var zooming = false;

  function zoomstart(d) {
      zooming = true;
      startTranslate = translate;
      startScale = scale;
      //drag = true;

      // console.timeEnd("filter")
      //c("start",translate, zoom.translate(), d3.event, d)
      //zoomstartedzoom.translate([translate[0],translate[1]]);
      // stage.filters = [blurFilter];
  }


  function zoomend(d) {
      drag = translate !== startTranslate;
      zooming = false;

      filterVisible();

      // c(drag)
      //c("zoomed")

      //drag = false;
      //c("end",translate, zoom.translate(), d3.event, d)
      // console.time("filter")
      // filterVisible();
      // console.timeEnd("filter")
      // if(drag){
      //   logger.log({ action: "drag", scale: scale, target: selectedImage ? selectedImage.id : "" });
      // } else {
      //   logger.log({ action: "zoomend", scale: scale, target: selectedImage ? selectedImage.id : "" });
      // }

      logger.log({
          action: "zoomend",
          translate: translate,
          scale: scale,
          target: selectedImage ? selectedImage.id : ""
      });

      if (zoomedToImage && !selectedImage.big && startScale - scale < 0.1) {
          // c("loadbig after zoom")
          loadBigImage(selectedImage);
      }
  }

  chart.highlight = function() {

      data.forEach(function(d, i) {
          d.alpha = d.highlight ? 1 : 0.2;
          //d.visible = d.active;
          //if(d.sprite2) d.sprite2.alpha = d.active ? 1 : 0.4;
      });

  }



  var bottomPadding = 40;
  var extent = [0, 0]

  chart.resetZoom = function() {
      var time = 1400;

      extent = d3.extent(data, function(d) {
          return d.y;
      });
      var y = -extent[1] - bottomPadding;

      svg
          .call(zoom.translate(translate).event)
          .transition().duration(time)
          .call(zoom.scale(1).translate([0, y]).event)
          //.each("end", chart.split)
  }

  chart.flip = function() {

      // console.log("flip")

      chart.split();

      chart.resetZoom();

  }

  chart.split = function() {
      var oben = data.filter(function(d) {
          return d.active;
      })
      stackLayout(oben, false);

      var unten = data.filter(function(d) {
          return !d.active;
      })
      stackLayout(unten, true);

      // timeDomain.forEach(function(d) {
      //     d.x = x(d.key) + rangeBand / 3;
      //     d.y = 5;
      // });

      // console.log(timeDomain);

      // console.time("Quadtree")
      // quadtree = Quadtree(data);
      quadtree = Quadtree(data);
      // console.timeEnd("Quadtree");
      // console.log(quadtree)

      // console.log(timeDomain);
  }

  function nearest(x, y, best, node) {
      var x1 = node.x1,
          y1 = node.y1,
          x2 = node.x2,
          y2 = node.y2;
      node.visited = true;
      //console.log(node, x , x1 , best.d);
      //return;
      // exclude node if point is farther away than best distance in either axis
      if (x < x1 - best.d || x > x2 + best.d || y < y1 - best.d || y > y2 + best.d) {
          return best;
      }
      // test point if there is one, potentially updating best
      var p = node.point;
      if (p) {
          p.scanned = true;
          var dx = p.x - x,
              dy = p.y - y,
              d = Math.sqrt(dx * dx + dy * dy);
          if (d < best.d) {
              best.d = d;
              best.p = p;
          }
      }
      // check if kid is on the right or left, and top or bottom
      // and then recurse on most likely kids first, so we quickly find a 
      // nearby point and then exclude many larger rectangles later
      var kids = node.nodes;
      var rl = (2 * x > x1 + x2),
          bt = (2 * y > y1 + y2);
      if (kids[bt * 2 + rl]) best = nearest(x, y, best, kids[bt * 2 + rl]);
      if (kids[bt * 2 + (1 - rl)]) best = nearest(x, y, best, kids[bt * 2 + (1 - rl)]);
      if (kids[(1 - bt) * 2 + rl]) best = nearest(x, y, best, kids[(1 - bt) * 2 + rl]);
      if (kids[(1 - bt) * 2 + (1 - rl)]) best = nearest(x, y, best, kids[(1 - bt) * 2 + (1 - rl)]);

      return best;
  }


  function filterVisible() {

      var zoomScale = scale;
      // var translate = t;

      if (zoomedToImage) return;

      data.forEach(function(d, i) {
          var p = d.sprite.position;
          var x = (p.x / scale1) + translate[0] / zoomScale;
          var y = ((p.y / scale1) + (translate[1]) / zoomScale);
          var padding = 5;

          // c(x,y,p, translate, zoomScale, scale, height/zoomScale, y+height)

          if (x > (-padding) && x < ((width / zoomScale) + padding) && y + height < (height / zoomScale + padding) && y > (height * -1) - padding) {
              //d.sprite.alpha = 1;
              d.visible = true;
              // d.alpha = 1;
          } else {
              //d.sprite.alpha = 0.5;
              d.visible = false;
              // d.alpha = 0;
          }
      });

      var visible = data.filter(function(d) {
          return d.visible;
      });
      //c(visible.length);


      if (visible.length < 50) {
          data.forEach(function(d) {
              if (d.visible && d.loaded && d.active) d.alpha2 = 1;
              else if (d.visible && !d.loaded && d.active) loadImagesCue.push(d);
              else d.alpha2 = 0;
          })
      } else {
          data.forEach(function(d) {
              d.alpha2 = 0;
              //if(d.sprite2) d.sprite2.visible = false;
          })
      }


  }

  function loadMiddleImage(d) {
      if (d.loaded) {
          d.alpha2 = 1;
          return;
      }
      if (!imagesMap2.get(d.id)) {
          return;
      }
      // c("load", d)
      var img = new Image();

      img.addEventListener("load", function() {
          var base = new PIXI.BaseTexture(img);
          var texture = new PIXI.Texture(base);
          var sprite = new PIXI.Sprite(texture);


          sprite.anchor.x = 0.5;
          sprite.anchor.y = 0.5;
          sprite.position.x = d.x * scale2 + imageSize2 / 2;
          sprite.position.y = d.y * scale2 + imageSize2 / 2;
          sprite._data = d;

          stage4.addChild(sprite);

          d.sprite2 = sprite;
          d.alpha2 = d.highlight;
          // c("loded")

      });
      d.loaded = true;

      img.src = "data:image/jpg;base64," + imagesMap2.get(d.id).image;
  }

  loadImagesCue = [];

  function loadImages() {
      if (zooming) return;
      if (zoomedToImage) return;

      if (loadImagesCue.length) {
          var d = loadImagesCue.pop();

          if (imagesMap2 && !d.loaded) {
              loadMiddleImage(d);
          }
      }

      // loadImagesCue.forEach(function(d){
      //   if(imagesMap2 && !d.loaded){
      //     loadMiddleImage(d);
      //   }
      // })
      // loadImagesCue = [];

      //c("loadImagesCue", loadImagesCue.length)
  }






  return chart;

}

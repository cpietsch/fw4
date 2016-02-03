<?php

session_start();

// redirect to intro page if it's a new session
if (!file_exists("../logs/".session_id().".csv")) {
	header("Location: http://uclab.fh-potsdam.de/fw4/");
	die();
}

?><!DOCTYPE html>
<html>
<meta charset="utf-8">
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="infobar.css">

<link rel="author" href="chrispie.com">
<link rel="publisher" href="chrispie.com"/>

<body>
<script src="js/d3.v3.min.js"></script>
<script src="js/lodash.min.js"></script>
<script src="js/pixi.min.js"></script>
<script src="js/stats.min.js"></script>
<script src="js/loader.js"></script>
<script src="js/list.js"></script>
<script src="js/tags.js"></script>
<script src="js/utils.js"></script>
<script src="js/Tween.js"></script>

<div id="hiddenreload"></div>


<div id="detailTemplate" class="detail" style="display:none;">
    <h1>{{ bezeichnungen ? bezeichnungen : "Kein Titel" }}</h1>
    <p class="label">Beschreibung</p>
    <p class="description">{{ beschreibung }}</p>
    <p class="label">Kommentar</p>
    <p class="description comment">{{ kommentar }}</p>
    <!-- <p class="info">zur <a target="_blank" href="http://bestandskataloge.spsg.de/FWIV/{{ id }}">spsg.de</a></p> -->
    <p class="info"><span>Bezeichnungen</span><span>{{ bezeichnungen ? bezeichnungen : "Keine Bezeichnungen" }}</span></p>
    <p class="info"><span>Datierung</span><span>{{ zeit }}</span></p>
    <p class="info"><span>Material</span><span>{{ material }}</span></p>
    <p class="info"><span>Maße</span><span>{{ hoehe }}mm * {{ breite }}mm</span></p>
    <p class="info"><span>Thementexte</span><span class="thementexte">{{ thementexte.length ? "Ja" : "Nein"}}</span></p>
    <p class="info"><span>Stichworte</span><span>{{ keywords.join(", ") }}</span></p>
    <p class="info"><span>Inventarnr.</span><span>{{ id }}</span></p>
    <p class="info"><span>Literatur</span><span>{{ literatur ? literatur : "Keine Literatur" }}</span></p>
</div>

<div class="page">
  <div class="sidebar detail hide">
    <div class="slidebutton"></div>
    <div id="render" class="inner"></div>  
  </div>

  <div class="infobar ">
    <div class="inner">
			
			<!-- <h1>Hinweise</h1>		 -->
			<h1>Vergangene Visionen</h1>
			<h2>aus der Feder von Friedrich Wilhelm IV.</h2>			
			
			<p>Die Visualisierung zeigt den Bestand historischer Zeichnungen
				von Friedrich Wilhelm IV. <!--von Preußen   (1795 – 1861) -->
				entlang einer thematischen und zeitlichen Einordnung.</p>
			
			<img src="img/infobar_tags.svg">
			<p>Die <em>Stichwörter</em> stellen die häufigsten Themen in den Zeichnungen Friedrich Wilhelms IV dar. 
				<!-- Je größer die Schrift desto mehr Zeichnungen gibt es zum Thema. -->
				Klicken Sie auf die Stichwörter, um die Auswahl der Zeichnungen thematisch einzugrenzen.
				</p>
		
			
			<!-- <p class="label">Zeitleiste</p> -->
			
			<img src="img/infobar_time.svg">
			<p>Die <em>Zeichnungen</em> sind entlang einer Zeitleiste entsprechend ihrer Entstehungsjahre positioniert.
				Unter den Jahreszahlen befinden sich weitere historische und biographische Informationen.
				<!-- Zeichnungen, die nicht den ausgewählten Themen entsprechen werden unter die Zeitleiste etwas dunkler angezeigt. -->
			</p>
			
<!-- Two fingers scroll up by VectorBakery from the Noun Project -->
			<!-- Mouse by Calvin Goodman from the Noun Project -->
			<img class="scroll" src="img/infobar_scroll.svg">
			<!-- <img class="scroll" src="img/infobar_scrollwheel.svg"> -->
			
			<p>Zoomen Sie mit Ihrem Touchpad oder Scrollrad in den Bereich der Zeichnungen und Zeitleiste, um mehr Details zu sehen.
				Klicken und ziehen Sie den Hintergrund, um den Sichtbereich zu verschieben.</p>

			<p class="feedback">
				<a href="../">Über das Projekt</a>
			</p>	
			<p class="feedback">
				<a href="https://katringlinka.typeform.com/to/ZIIgIe?cid=<?php echo session_id();
 ?>">Zum Fragebogen</a>
			</p>
			
    </div>
  </div>
</div>


<script>

// copyright christopher pietsch
// cpietsch@gmail.com
// www.chrispie.com
// 2015

var data;
var imagesMap;
var imagesMap2 = d3.map([]);

var c = console.log.bind(console);

var cloud = myTagCloud();
var list = myListView();

var ping = utils.ping();

d3.select(window)
  .on("resize", function(){
    clearTimeout(window.resizedFinished);
      window.resizedFinished = setTimeout(function(){
          list.resize();
          cloud.resize();
      }, 250);
  })

d3.select(".slidebutton")
  .on("click", function(){
    var s = !detailContainer.classed("sneak");
    detailContainer.classed("sneak", s)
    //d3.select(this).style({ transform: "rotate(" + 180*s + "deg)" });
  })


d3.csv("data/timeline.csv", function(timeline){
d3.csv("data/spsg.csv", function(data){
d3.csv("data/themen.csv", function(texte){
// Loader("data/spsg.csv").finished(function(data){
// Loader("data/neu_100.csv").finished(function(images){


  window.data = data;


  c(texte)
  // data cleaning
  utils.clean(data,texte);
  
  imagesMap = d3.map(utils.fakeDataSmall(data), function(d){ return d.id; });
  // imagesMap = d3.map(images, function(d){ return d.id; });
  imagesMap2 = d3.map(utils.fakeDataBig(data), function(d){ return d.id; });

  // Loader("data/neu_1000.csv").finished(function(images2){
  //   imagesMap2 = d3.map(images2, function(d){ return d.id; });
  // });


  cloud.init(data);
  
  list.loadTimeline(timeline);
  list.init(data);


  cloud.mouseenterCallback(function(d){
    list.highlight(d);
  })

  cloud.mouseclickCallback(function(d){
    list.flip(d);
  })


 
// });
});
});
});

d3.select("#hiddenreload").on("click", function(){
  location.reload();
})

d3.select(".splash .btn").on("click", function(){
  d3.select(".splash").style({ display: "none" });
  //utils.fullscreen();
})


window.onbeforeunload = function() {
    // todo: tracking stuff

};


</script>

</body>
</html>
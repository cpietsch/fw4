//                                   ,--,                                     ,----, 
//        ,---,.           .---.      ,--.'|                       ,---,       .'   .`| 
//      ,'  .' |          /. ./|   ,--,  | :               ,---.,`--.' |    .'   .'   ; 
//    ,---.'   |      .--'.  ' ;,---.'|  : '              /__./||   :  :  ,---, '    .' 
//    |   |   .'     /__./ \ : |;   : |  | ;         ,---.;  ; |:   |  '  |   :     ./  
//    :   :  :   .--'.  '   \' .|   | : _' |        /___/ \  | ||   :  |  ;   | .'  /   
//    :   |  |-,/___/ \ |    ' ':   : |.'  |        \   ;  \ ' |'   '  ;  `---' /  ;    
//    |   :  ;/|;   \  \;      :|   ' '  ; :         \   \  \: ||   |  |    /  ;  /     
//    |   |   .' \   ;  `      |\   \  .'. |          ;   \  ' .'   :  ;   ;  /  /--,   
//    '   :  '    .   \    .\  ; `---`:  | '           \   \   '|   |  '  /  /  / .`|   
//    |   |  |     \   \   ' \ |      '  ; |            \   `  ;'   :  |./__;       :   
//    |   :  \      :   '  |--"       |  : ;             :   \ |;   |.' |   :     .'    
//    |   | ,'       \   \ ;          '  ,/               '---" '---'   ;   |  .'       
//    `----'          '---"           '--'                              `---'           

// christopher pietsch
// cpietsch@gmail.com
// tweet me @chrispiecom
// 2015-2016

// this is not meant for your eyes ;)
// not yet at least - will publish the code on github soon

utils.welcome();

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

var local = true;
var s3 = local ? (lang == "en" ? "../../vis/" : "") : "http://s3.eu-central-1.amazonaws.com/fw4/";

var data;
var imagesMap;
var imagesMap2 = d3.map([]);
var cloud;
var list;
var c = console.log.bind(console);
var ping;
var logger = Logger().register("vis");
var feedbacked = false;

logger.log({ action: "enter vis" });

if(utils.isMobile()){
  logger.log({ action: "mobile" }).sync();
  alert("come back in some weeks");
} else {
  if (Modernizr.webgl) {
      init();
    } else {
      logger.log({ action: "noWebGL" }).sync();
      alert("sorry you need webGL") 
    }
}

function init() {

    cloud = myTagCloud();
    list = myListView();
    ping = utils.ping();

    logger.log({ action: "load" });

    d3.csv(s3 + "data/timeline.csv", function(timeline) {
        d3.csv(s3 + "data/themen.csv", function(texte) {
            d3.csv(s3 + "data/transKeyword.csv", function(transKeyword) {
                Loader(s3 + "data/spsg.csv").finished(function(data) {
                    Loader(s3 + "data/neu_100.csv").finished(function(images) {
                        logger.log({
                            action: "loaded"
                        });

                        window.data = data;

                        // c(texte)
                        // data cleaning
                        utils.clean(data, texte, transKeyword);

                        // utils.printkeyowords(data);

                        if (!local) {
                            imagesMap = d3.map(images, function(d) {
                                return d.id;
                            });
                            Loader(s3 + "data/neu_1000.csv").finished(function(images2) {
                                imagesMap2 = d3.map(images2, function(d) {
                                    return d.id;
                                });
                            });
                        } else {
                            imagesMap = d3.map(utils.fakeDataSmall(data), function(d) {
                                return d.id;
                            });
                            imagesMap2 = d3.map(utils.fakeDataBig(data), function(d) {
                                return d.id;
                            });
                        }

                        cloud.init(data);

                        // list.loadTimeline(timeline);
                        list.init(data, timeline);


                        cloud.mouseenterCallback(function(d) {
                            list.highlight(d);
                        })

                        cloud.mouseclickCallback(function(d) {
                            list.flip(d);
                        })



                    });
                });
            });
        });
    });

    d3.select(window)
        .on("resize", function() {
            clearTimeout(window.resizedFinished);
            window.resizedFinished = setTimeout(function() {
                list.resize();
                cloud.resize();
                logger.log({
                    action: "resize",
                    target: window.innerWidth + "," + window.innerHeight
                });
            }, 250);
        })

    

}

d3.select("body").attr("class", lang);

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

d3.select("#feedback").on("click", function(){ feedbacked = true; })
d3.select(".feedback, .language-container").on("click", function(){ 
  feedbacked = true;
  return true;
})

var browserInfo = d3.select(".browserInfo");
if(utils.isSafari()){
  browserInfo
    .on("click", function(){ browserInfo.remove(); })
    .classed("show", true)
    .transition()
    .delay(7000)
    .each("end", function(){
      d3.select(this).classed("show", false).remove();
    })

} else {
  browserInfo.remove();
}

var infoscroll = d3.select('.infobar .outer').node();
Ps.initialize(infoscroll);

window.onbeforeunload = function() {
    // todo: tracking stuff
    logger.log({
        action: "close"
    });
    logger.sync();
    if(local) return;

    // if(!feedbacked){
    //   infoscroll.scrollTop = 500;
    //   Ps.update(infoscroll);

    //   d3.select(".infobar").classed("sneak", false);
    //   var infotext = "Entschuldigen Sie die Unterbrechung. Wir würden uns sehr über Ihre Teilnahme an der Umfrage freuen. Wenn Sie 5 Minuten Zeit haben, bleiben Sie bitte auf der Webseite, um den hier verlinkten Fragebogen auszufüllen.";
    //   if(lang=="en") infotext="Sorry to bother you, but we would love to get your feedback on the FW4 Viz. If you have a minute, please stay on this webpage and share your thoughts.";
      
    //   return infotext;
    // }
};

window.onerror = function(message, url, lineNumber) {  
  //save error and send to server for example.
  // console.error(message, lineNumber, url);
  logger.log({ action: "error", target: lineNumber + ": " + message });
  return true;
};

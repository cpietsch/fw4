                                                                                  
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

var local = true;
var lang = "en";
var s3 = local ? "" : "http://s3.eu-central-1.amazonaws.com/fw4/";

var data;
var imagesMap;
var imagesMap2 = d3.map([]);

var c = console.log.bind(console);

var cloud = myTagCloud();
var list = myListView();

var ping = utils.ping();
var logger = Logger().register("vis");

logger.log({ action: "enter vis" });

d3.csv(s3 + "data/timeline.csv", function(timeline){
d3.csv(s3 + "data/themen.csv", function(texte){
d3.csv(s3 + "data/transKeyword.csv", function(transKeyword){
Loader(s3 + "data/spsg.csv").finished(function(data){
// Loader(s3 + "data/neu_100.csv").finished(function(images){
  logger.log({ action: "loaded csv" });

  window.data = data;

  // c(texte)
  // data cleaning
  utils.clean(data,texte,transKeyword);

  // utils.printkeyowords(data);

  imagesMap = d3.map(utils.fakeDataSmall(data), function(d){ return d.id; });
  imagesMap2 = d3.map(utils.fakeDataBig(data), function(d){ return d.id; });

  // imagesMap = d3.map(images, function(d){ return d.id; });
  // Loader(s3 + "data/neu_1000.csv").finished(function(images2){
  //   imagesMap2 = d3.map(images2, function(d){ return d.id; });
  // });


  cloud.init(data);
  
  // list.loadTimeline(timeline);
  list.init(data,timeline);


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
});

d3.select(window)
  .on("resize", function(){
    clearTimeout(window.resizedFinished);
      window.resizedFinished = setTimeout(function(){
          list.resize();
          cloud.resize();
          logger.log({ action: "resize", target: window.innerWidth + "," + window.innerHeight });
      }, 250);
  })



window.onbeforeunload = function() {
    // todo: tracking stuff
    logger.log({ action: "close" });
    logger.sync();
};


Ps.initialize(d3.select('.infobar .outer').node());



// window.onerror = function(message, url, lineNumber) {  
//   //save error and send to server for example.
//   console.error(message, lineNumber, url);
//   logger.log({ action: "error", target: lineNumber + ": " + message });
//   return true;
// };  


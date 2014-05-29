(function() {
  'use strict';

  function $(id) {
    return document.getElementById(id);
  };

  function repaintAll() {
    var data = [];
    var max = 0;
    var temp = {};
    var currentText = typeField.value;
    var currentLength = currentText.length;
    var coordinates = app.coordinates;

    for(var i=0; i < currentLength; i++){

      var key = currentText.charAt(i);
      if(/^[A-Za-z]$/.test(key)){
        key = key.toUpperCase();
      }
      if(app.config.exclude && app.EXCLUDES.indexOf(key) == -1){
        var coord;
        coord = coordinates[key] || false;
        if(coord){
          for(var s = 0; s < coord.length; s += 2) {
            var joined = coord.slice(s, s+2).join(";");
            if(!temp[joined])
              temp[joined] = 0;

            temp[joined] += 1;
          }
        }
      }
    }

    for(var k in temp){
      var xy = k.split(";");
      var val = temp[k];

      data.push({x: xy[0], y: xy[1], count: val});

      if(val > max)
        max = val;
    }

    app.heatmap.store.setDataSet({max: max, data: data});
  };

  var typeField = $('typefield');
  var currentTypeFieldLen = typeField.value.length;


  app.init = function initialize() {
    var cfg = arguments[0] || {};
    app.configure(cfg);
    repaintAll();
  };

  app.configure = function configure(cfg) {
    var config = {};
    config.element = "keyboard";
    config.radius = cfg.radius || 50;
    config.visible = true;
    config.opacity = 40;
    if(cfg.gradient)
      config.gradient = cfg.gradient;

    app.coordinates = app.LAYOUTS[cfg.layout || "QWERTY"];

    var heatmap = h337.create(config);
    app.heatmap = heatmap;
    if(cfg.layout)
      $("keyboard").style.backgroundImage = "url(img/"+cfg.layout+".png)";
  };


  window.onload = app.init;

  var gradients = [
    { 0.45: "rgb(0,0,255)", 0.55: "rgb(0,255,255)", 0.65: "rgb(0,255,0)", 0.95: "yellow", 1.0: "rgb(255,0,0)"},
    { 0.45: "rgb(255,255,255)", 0.70: "rgb(0,0,0)",0.9: "rgb(2,255,246)", 1.0: "rgb(3,34,66)"},
    { 0.45: "rgb(216,136,211)", 0.55: "rgb(0,255,255)", 0.65: "rgb(233,59,233)", 0.95: "rgb(255,0,240)", 1.0: "yellow"}
  ];
  var lastValue = "";

  typeField.oninput = function() {
    var currentValue = this.value;
    if (Math.abs(lastValue.length - currentValue.length) >= 1) {
      repaintAll();
    } else {
      var key = (currentValue.length > lastValue.length) ? (currentValue.split(lastValue)[1]) : (lastValue.split(currentValue)[1]);

      if(/^[A-Za-z]$/.test(key)){
        key = key.toUpperCase();
      }
      if(app.config.exclude && app.EXCLUDES.indexOf(key) == -1){
        var coord = app.coordinates[key]
        if (coord) {
          for (var s = 0; s < coord.length; s+=2) {
            app.heatmap.store.addDataPoint.apply(app.heatmap.store,coord.slice(s, s+2));
          }
        }
      }
    }

    lastValue = currentValue;
  };

  $("apply").onclick = function(){
    var cfg = {};
    cfg.radius = Math.pow(10,$("fingertip").selectedIndex) +40;
    cfg.gradient = gradients[$("gradient").selectedIndex];
    cfg.layout =  $("layout").value;
    app.heatmap.cleanup();
    app.init(cfg);
    repaintAll();
  }

  var items = document.getElementsByTagName("li");
  for(var i=0; i < items.length; i++){
    (function(i){
      items[i].onclick = function(){
        typeField.value = app.SAMPLE_TEXT[i];
        repaintAll();
      };
    })(i);
  }

})();
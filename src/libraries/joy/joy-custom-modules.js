import Joy from "./joy.js";

/****************

A widget for paths!

Widget Options:
{name:'name', type:'path', color:"whatever"}

****************/
Joy.add({
  type: "path",
  tags: ["ui"],
  initWidget: function(self){

    // String *IS* DOM
    var o = self.options;
    self.pathUI = new PathUI({
      prefix: o.prefix,
      suffix: o.suffix,
      color: o.color, 
      value: self.getData("value"),
      onchange: function(value){
        self.setData("value", value);
      }
    });
    self.dom = self.pathUI.dom;

    // When data's changed, externally
    self.onDataChange = function(){
      var value = self.getData("value");
      console.log("value: ", value);
      console.log("self ", self);
      self.pathUI.setPath(value);
    };

  },
  onget: function(my){
    return my.data.value;
  },
  placeholder: "???"
});
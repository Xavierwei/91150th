define(function(require, exports, module) {
    document.createStyleSheet().addRule(".vml", "behavior:url(#default#VML);display:inline-block;");
    if (!document.namespaces.vml && !+"\v1"){
      document.namespaces.add("vml", "urn:schemas-microsoft-com:vml");
    }
    var vml = window.vml = function(name){
      return vml.fn.create(name || "rect");
    }
    vml.fn = vml.prototype = {
      create : function(name){
        this.node = document.createElement('<vml:' + name + ' class="vml">');
        return this;
      },
      appendTo: function(parent){
        if(typeof this.node !== "undefined" && parent.nodeType == 1){
          parent.appendChild(this.node);
        }
        return this;
      },
      attr : function(bag){
        for(var i in bag){
          if(bag.hasOwnProperty(i)){
            this.node.setAttribute(i,bag[i])
          }
        }
        return this;
      },
      css: function(bag){
        var str = ";"
        for(var i in bag){
          if(bag.hasOwnProperty(i))
            str +=  i == "opacity" ? ("filter:alpha(opacity="+ bag[i] * 100+");"):(i+":"+bag[i]+";")
        }
        this.node.style.cssText = str;
        return this;
      }
    }

    exports.vml = vml;
});
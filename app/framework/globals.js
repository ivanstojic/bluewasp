function BlueWaspMenuGlobals() {
  this.applicationMenu = [];

  this.cmdMenuModel = {
    visible: true,
    items: [
      {items:[]},

      {items:[{icon:'refresh', command:'reload'}]}
    ]
  };


  this.feedMaximumSize = 400;
  this.facebookApiKey = 'FAKE_API_KEY'; // Put your app's API key here...
};


var BlueWaspMenuGlobals = new BlueWaspMenuGlobals();
var $$$ = Mojo.Log.info;

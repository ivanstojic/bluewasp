function StageAssistant() {
}



StageAssistant.prototype.setup = function() {
  AlgisFacebookData.getSessionInfo(this.sessionInfoReceived.bind(this));
};



StageAssistant.prototype.sessionInfoReceived = function(user) {
  $$$("Active session is: %j", user);
  if (user === null) {
    Mojo.Log.info("The session cookie is undefined, pushing the log-in scene.");
    this.controller.pushScene("pre-sign-in");

  } else {
    this.controller.pushScene("feed");
  }
};



StageAssistant.prototype.handleCommand = function(event) {
  if(event.type == Mojo.Event.command) {
    switch(event.command) {
    case 'reload':
      Mojo.Controller.stageController.delegateToSceneAssistant("reloadContent");
      break;
    }
  }
};

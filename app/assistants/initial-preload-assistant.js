function InitialPreloadAssistant() {
}


InitialPreloadAssistant.prototype.setup = function() {
  this.controller.setupWidget("spinner", { spinnerSize: 'large' }, { spinning: true });

  // Preload the user's current status/information...
  $$$("Starting preload process..");
  AlgisFacebookData.getOwnInfo(this.preloadInfoReceived.bind(this));
};


InitialPreloadAssistant.prototype.preloadInfoReceived = function(info) {
  $$$("WOOOOOOOOOOOOOOOOOOOOOOT");
  // TODO: Is 200 the right amount to use as the preloading count? More? Less?
  AlgisFacebookData.refreshOwnStream(this.preloadStreamReceived.bind(this),
				     BlueWaspMenuGlobals.feedMaximumSize);
};


InitialPreloadAssistant.prototype.preloadStreamReceived = function(stream) {
  // This completes the preloading process... let's go to the feed now that we have
  // the required data...
  this.controller.stageController.swapScene("feed");
};


InitialPreloadAssistant.prototype.activate = function(event) {
};


InitialPreloadAssistant.prototype.deactivate = function(event) {
};


InitialPreloadAssistant.prototype.cleanup = function(event) {
};

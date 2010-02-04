function PreSignInAssistant() {
}


PreSignInAssistant.prototype.setup = function() {
  Mojo.Event.listen(this.controller.get("facebookLoginButton"),
		    Mojo.Event.tap,
		    this.loginButtonClicked.bind(this));
};


PreSignInAssistant.prototype.loginButtonClicked = function() {
  this.controller.stageController.pushScene("sign-in");
  event.stopPropagation();
};


PreSignInAssistant.prototype.activate = function(event) {
  if (event !== undefined && event != null) {
    // Sign-In has succeeded... let's switch to the preload view...
    this.controller.stageController.swapScene("initial-preload");
  }
};


PreSignInAssistant.prototype.deactivate = function(event) {
};


PreSignInAssistant.prototype.cleanup = function(event) {
};

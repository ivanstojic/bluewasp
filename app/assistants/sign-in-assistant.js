function SignInAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}


SignInAssistant.prototype.isProcessFinished = false;

SignInAssistant.prototype.setup = function() {
  this.controller.setupWidget("browserWindow",
			      {
				url: 'http://www.facebook.com/login.php?api_key=YOUR_API_KEY_HERE&connect_display=popup&v=1.0&next=http://www.facebook.com/connect/login_success.html&cancel_url=http://www.facebook.com/connect/login_failure.html&fbconnect=true&return_session=true&session_key_only=true&req_perms=read_stream,publish_stream,offline_access',
				minFontSize: 17,
				virtualpagewidth: 500,
				virtualpageheight: 750,
				formAutoZoom: false,
				fitWidth: true
			      },
			      {});

  //this.controller.get("browserWindow").mojo.focus();

  Mojo.Event.listen(this.controller.get("browserWindow"), Mojo.Event.webViewTitleUrlChanged, this.browserUrlChanged.bind(this));
};


SignInAssistant.prototype.browserUrlChanged = function(event) {
  var success = "http://www.facebook.com/connect/login_success.html?session=";
  var failure = "http://www.facebook.com/connect/login_failure.html";

  if (!this.isProcessFinished) {
    if (event.url.substr(0, success.length) == success) {
      this.isProcessFinished = true;

      Mojo.Log.info("Login process success!");

      var trimmed = event.url.substr(success.length);
      trimmed = trimmed.substr(0, trimmed.lastIndexOf("&permissions="));
      var decoded = decodeURIComponent(trimmed);
      var obj = decoded.evalJSON();

      AlgisFacebookData.setSessionInfo(obj,
				       this.sessionStored.bind(this),
				       this.sessionStoreFailed.bind(this));

    } else if (event.url.substr(0, failure.length) == failure) {
      this.isProcessFinished = true;

      Mojo.Log.info("Login process failure!");
      this.controller.stageController.popScene();
    }
  }
};


SignInAssistant.prototype.sessionStored = function() {
  this.controller.stageController.popScene(true);
};


SignInAssistant.prototype.sessionStoreFailed = function(error) {
  Mojo.Log.info("Failed to store session object");
  Mojo.Log.info("Error: %s", error);

  this.controller.stageController.popScene();
};


SignInAssistant.prototype.activate = function(event) {
};


SignInAssistant.prototype.deactivate = function(event) {
};



SignInAssistant.prototype.cleanup = function(event) {
};

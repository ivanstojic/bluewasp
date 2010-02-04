function FeedAssistant() {
}



FeedAssistant.prototype.shareTFAttributes = {
  hintText: "What's on your mind?",
  multiline: true,
  enterSubmits: true,
  changeOnKeyPress: true,
  autoFocus: false
};



FeedAssistant.prototype.shareTFModel = {
  value: "",
  disabled: false
};



FeedAssistant.prototype.shareAttachment = null;
FeedAssistant.prototype.shareAttachButtonActive = null;



FeedAssistant.prototype.feedListAttributes = {
  listTemplate: '_shared/feed-list-container',
  itemTemplate: '_shared/feed-list-entry',
  dividerTemplate: '_shared/feed-list-divider',

  swipeToDelete: false,
  reorderable: false,

  itemsCallback: function(widget, offset, limit) {
    AlgisFacebookData.getOwnStream(function (data) {
				     var slice = data.slice(offset, offset+limit);
				     widget.mojo.noticeUpdatedItems(offset, slice);
				     widget.mojo.setLength(data.length);
				   }, limit);
  },

  dividerFunction: function (d) { return prettyDate(d.timestamp); },

  formatters: {
    timestamp: function (d) { return prettyTime(d); },
    likes: function (d) {
      // Warning: ugly hackling crossing the road...
      return d == 0 ? "+" : "" + d;
    }
  }
};



FeedAssistant.prototype.reloadContent = function() {
  var widget = $('feedList');

  AlgisFacebookData.getOwnInfo(this.basicInfoLoaded.bind(this));
  AlgisFacebookData.refreshOwnStream(function (data) {
				       widget.mojo.noticeUpdatedItems(0, data);
				       widget.mojo.setLength(data.length);
				       widget.mojo.revealItem(0, false);
				     }, BlueWaspMenuGlobals.feedMaximumSize);
};



FeedAssistant.prototype.setup = function() {
  // View menu...
  this.controller.setupWidget(
    Mojo.Menu.commandMenu,
    undefined,
    BlueWaspMenuGlobals.cmdMenuModel);

  // Share form...
  this.controller.setupWidget(
    "shareTextField",
    this.shareTFAttributes,
    this.shareTFModel);

  Mojo.Event.listen(
    $("shareTextField"),
    Mojo.Event.propertyChange,
    this.shareTextChanged.bind(this));

  this.shareTextFocusListener = Mojo.Event.listenForFocusChanges(
    $("shareTextField"),
    this.shareTextFieldFocusChanged.bind(this));

  Mojo.Event.listen(
    $("shareButton"),
    Mojo.Event.tap,
    this.shareButtonTapped.bind(this));

  Mojo.Event.listen(
    $("shareAttachment"),
    Mojo.Event.tap,
    this.attachmentTapped.bind(this));

  // Tap handler for the currently shared text...
  Mojo.Event.listen($("currentStatusText"),
		    Mojo.Event.tap,
		    this.shareTextTapped.bind(this));

  // Hide the form...
  this._hideShareForm();

  // Pull basic user info...
  AlgisFacebookData.getOwnInfo(this.basicInfoLoaded.bind(this));

  // Set up the feed list...
  this.controller.setupWidget("feedList", this.feedListAttributes, {});

  Mojo.Event.listen($("feedList"), Mojo.Event.listTap, this.feedItemTapped.bind(this));
};



FeedAssistant.prototype.basicInfoLoaded = function(info) {
  $('profileOwnerName').update(info.name);
  $('profileOwnerPicture').writeAttribute("src", info.pic_square);
  $('currentStatusText').update(info.status.message);
};



FeedAssistant.prototype.feedItemTapped = function(event) {
  this._hideShareForm();

  // What has been clicked on?
  if (event.originalEvent.target.className == "likesFloater") {
    // Likes floater: add/remove a like...
    $$$("LIKE!");

  } else if (event.originalEvent.target.up().className == "basicInfo") {
    // Basic info has been clicked on, show the sender's wall..
    this.controller.stageController.pushScene("profile", event.item.sender);

  } else {
    // Everything else goes to the post for comments, etc...
    this.controller.stageController.pushScene("comments", event.item);
  }
};



FeedAssistant.prototype.attachmentTapped = function() {
  this.shareAttachment = null;

  $("shareAttachment").src = "";
  $("shareAttachment").hide();

  $("shareTextField").mojo.focus();

  event.stopPropagation();
};



FeedAssistant.prototype.shareTextChanged = function(data) {
  if (data !== undefined && data.originalEvent !== undefined &&
      Mojo.Char.isEnterKey(data.originalEvent.keyCode)) {
    this.shareButtonTapped();
  }

  if (data.value == "") {
    $("shareButton").removeClassName("send");
    $("shareButton").addClassName("attach");

  } else {
    $("shareButton").addClassName("send");
    $("shareButton").removeClassName("attach");
  }
};



FeedAssistant.prototype.shakingDetected = function(event) {
  $$$("Shaking with magnitude: ", event.magnitude);
};



FeedAssistant.prototype.shareFilePicked = function(file) {
  this.shareAttachment = file;

  $("shareAttachment").src = file.fullPath;
  $("shareAttachment").show();

  $("shareTextField").mojo.focus();
};



FeedAssistant.prototype.shareButtonTapped = function() {
  $$$("The share button has been tapped!");

  if ($("shareButton").hasClassName("attach")) {
    Mojo.FilePicker.pickFile({
			       onSelect: this.shareFilePicked.bind(this),
			       actionType: 'attach',
			       kinds: ['image'],
			       defaultKind: 'image'
			     }, this.controller.stageController);

  } else {
    // Send the update...
    var value = $("shareTextField").mojo.getValue();
    $("shareButton").removeClassName("send");
    $("shareButton").addClassName("attach");

    if (this.shareAttachment != null) {
      $$$("Sharing a photo instead of a status update text");
      AlgisFacebookData.photosUpload(null, this.shareAttachment.fullPath, value);

    } else {
      AlgisFacebookData.streamPublish(null, value);
      $("currentStatusText").update(value);
    }

    this._hideShareForm();
  }

  event.stopPropagation();
};



FeedAssistant.prototype.shareTextTapped = function() {
  this._showShareForm();
  event.stopPropagation();

};



FeedAssistant.prototype.shareTextFieldFocusChanged = function(focus) {
  if (focus == null) {
    this._hideShareForm();
  }
};



FeedAssistant.prototype.activate = function(event) {
  $("shareForm").visible() && $("shareTextField").mojo.focus();
};



FeedAssistant.prototype.deactivate = function(event) {
  if (this.shareTextFocusListener) {
    this.shareTextFocusListener.stopListening();
    this.shareTextFocusListener = null;
  }
};



FeedAssistant.prototype.cleanup = function(event) {
};



FeedAssistant.prototype._showShareForm = function() {
  $("currentStatusText").hide();
  $("shareForm").show();
  this.shareAttachment = null;
  $("shareTextField").mojo.focus();
};



FeedAssistant.prototype._hideShareForm = function() {
  $("shareTextField").mojo !== undefined && $("shareTextField").mojo.setValue("");
  $("shareAttachment").hide();
  $("shareForm").hide();
  $("currentStatusText").show();
};

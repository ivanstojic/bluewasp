function AlgisFacebookData() {
  // TODO: init the FB client with data pulled from the user cookie...
  this.client = null;

  this.depotDb = new Mojo.Depot({ name: this.depotName},
				this._dbOpenOk.bind(this),
				this._dbOpenError.bind(this));

  this.sessionInfo = null;
};

AlgisFacebookData.prototype.depotName = "ext:bluewasp";


// Depot handling...
AlgisFacebookData.prototype._dbOpenOk = function () {
  Mojo.Log.info("Database reports successful open!");
  this.getSessionInfo(this._sessionLoaded.bind(this));
};

AlgisFacebookData.prototype._sessionLoaded = function (session) {
  $$$("Session info loaded or reset... instantiating Facebook client!");
  this.client = new AlgisFacebookClient(BlueWaspMenuGlobals.facebookApiKey,  // api key
					session.session_key, // session key
					session.secret); // session secret
};


AlgisFacebookData.prototype._dbOpenError = function (err) {
  Mojo.Log.info("Database reports open failure: %d", err);
};



// Utilities
AlgisFacebookData.prototype._indexProfileInfoInFeed = function(profiles) {
  var index = {};

  profiles.each(function (e) {
		  index[e.id] = e;
		});

  return index;
};



AlgisFacebookData.prototype._flattenFeedItems = function(profiles, posts) {
  var flattened = [];

  for (var k = 0; k < posts.length; k++) {
    var current = posts[k];

    var profile = profiles[current.actor_id];
    var att = { visible: "hidden" };

    // Attachment...
    if (current.attachment !== undefined) {
      att.name = current.attachment.name !== undefined ? current.attachment.name : "";
      att.caption = current.attachment.caption !== undefined ? current.attachment.caption : "";
      att.description = current.attachment.description !== undefined ? current.attachment.description : "";
      att.href = current.attachment.href !== undefined ? current.attachment.href : "";

      if (current.message == att.name) {
	current.message = "";
      }

      att.picture = "";

      if (current.attachment.media !== undefined) {
	if (current.attachment.media[0] !== undefined) {
	  att.picture = current.attachment.media[0].src;
	}
      }
    }

    if (att.name != "" || att.caption != "" ||
	att.description != "" || att.picture != "") {
      att.visible = "";
    }

    flattened.push({
		     id: current.post_id,
		     timestamp: current.created_time,

		     sender: {
		       id: current.actor_id,
		       name: profile.name,
		       picture: profile.pic_square != null ? profile.pic_square : "images/no-profile-picture.png"
		     },

		     content: prettyText(current.message),
		     comments: current.comments.count,
		     likes: current.likes.count,

		     attachment: att
		   });
  }

  return flattened;
};


//
// Public API
//

// Session handling
AlgisFacebookData.prototype.getSessionInfo = function(handler) {
  if (this.sessionInfo == null) {
    $$$("+++++++++++++ Session info hasn't been cached yet +++++++++++++");
    this.depotDb.get("session-info", function (data) {
		       this.sessionInfo = data;
		       handler(data);
		     }.bind(this));

  } else if (handler !== undefined) {
    handler(this.sessionInfo);
  }

  return this.sessionInfo;
};



AlgisFacebookData.prototype.setSessionInfo = function(object, ok, nok) {
  this.depotDb.add("session-info", object, function() {
		     this.sessionInfo = object;
		     this._sessionLoaded(object);
		     ok();
		   }.bind(this), nok);
};


// Stream caches...
AlgisFacebookData.prototype.getCachedStream = function(handler, name) {
  this.depotDb.get("stream-" + name, function (data) {
		     handler(data);
		   });
};


// Stream (feed)...
AlgisFacebookData.prototype.getOwnStream = function(handler, limit) {
  this.getCachedStream(handler, "feed");
};



AlgisFacebookData.prototype.refreshOwnStream = function(handler, limit) {
  var session = this.getSessionInfo();

  try {
    this.refreshUserStream(handler, limit, ["lf"], [], "stream-feed");

  } catch (e) {
    $$$("Exception: ", e);
  }
};



AlgisFacebookData.prototype.refreshUserStream = function(handler, limit, filter, id, cachename) {
  this.client.api_stream_get(function (data, exception) {
			       try {
				 if (data == null) {
				   Mojo.Log.info("Exception while pulling Facebook data: ", exception);
				   return;
				 }

				 var index = this._indexProfileInfoInFeed(data.profiles);
				 var flattened = this._flattenFeedItems(index, data.posts);

				 Mojo.Log.info("Processed stream has %d items... ", flattened.length);
				 this.depotDb.add(cachename, flattened, function() {
						    handler(flattened);
						  });

			       } catch (e) {
				 Mojo.Log.info("Exception while processing stream data...", e);
			       }


			     }.bind(this), limit, filter, id);
};


// User info, never cache that...
AlgisFacebookData.prototype.getOwnInfo = function(handler) {
  var session = this.getSessionInfo();

  this.getUserInfo(handler, session.uid);
};



AlgisFacebookData.prototype.getUserInfo = function(handler, userid) {
  this.client.api_users_getInfo(function (info) {
				  if (info !== undefined && info != null) {
				    if (info[0].status != null) {
				      info[0].status.message = prettyText(info[0].status.message);
				    }
				    handler(info[0]);
				  }
				}, [userid], ["name", "pic_square", "status"]);
};


// Publishing
AlgisFacebookData.prototype.streamPublish = function (handler, message) {
  this.client.api_stream_publish(handler, message);
};

AlgisFacebookData.prototype.photosUpload = function (handler, path, caption) {
  this.client.api_photos_upload(handler, path, caption);
};


// Comments, likes and the like :)
AlgisFacebookData.prototype.streamGetComments = function (handler, id) {
  this.client.api_stream_getComments(handler, id);
};


// Lets go all singleton on webOS' ass...
var AlgisFacebookData = new AlgisFacebookData();

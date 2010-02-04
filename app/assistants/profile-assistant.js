function ProfileAssistant(basicinfo) {
  this.basicInfo = basicinfo;
};



ProfileAssistant.prototype.setup = function() {
  /* this function is for setup tasks that have to happen when the scene is first created */

  /* use Mojo.View.render to render view templates and add them to the scene, if needed. */
  var header = Mojo.View.render({
				  object: this.basicInfo,
				  template: '_shared/header-readonly'
				});
  $('headerHolder').innerHTML = header;

  /* setup widgets here */
  this.reloadContent();
  this.controller.setupWidget("feedList", {
				listTemplate: '_shared/feed-list-container',
				itemTemplate: '_shared/feed-list-entry',
				dividerTemplate: '_shared/feed-list-divider',

				swipeToDelete: false,
				reorderable: false,

				itemsCallback: function(widget, offset, limit) {
				  AlgisFacebookData.refreshUserStream(function (data) {
									var slice = data.slice(offset, offset+limit);
									widget.mojo.noticeUpdatedItems(offset, slice);
									widget.mojo.setLength(data.length);
								      }, limit, [], [this.basicInfo.id], "wall-" + this.basicInfo.id);
				}.bind(this),

				dividerFunction: function (d) { return prettyDate(d.timestamp); },

				formatters: {
				  timestamp: function (d) { return prettyTime(d); },
				  likes: function (d) {
				    // Warning: ugly hackling crossing the road...
				    return d == 0 ? "+" : "" + d;
				  }
				}
			      }

			      , {});

  /* add event handlers to listen to events from widgets */
};



ProfileAssistant.prototype.reloadContent = function() {
  AlgisFacebookData.getUserInfo(function (info) {
				  this.fullUserInfo = info;

				  $('profileOwnerName').update(info.name);
				  $('profileOwnerPicture').writeAttribute("src", info.pic_square);

				  if (info.status != null) {
				    if (info.status.message != "") {
				      $('currentStatusText').update(info.status.message);

				    } else {
				      $('currentStatusText').update("<small>No status messsage</small>");
				    }

				  } else {
				    $('currentStatusText').update("<small>Status hidden from BlueWasp</small>");
				  }
				}, this.basicInfo.id);
};


ProfileAssistant.prototype.activate = function(event) {
};

ProfileAssistant.prototype.deactivate = function(event) {
};

ProfileAssistant.prototype.cleanup = function(event) {
};

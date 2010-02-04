function CommentsAssistant(content) {
  this.postedContent = content;
  $$$("Showing comments for post %s", this.postedContent.id);
  this.comments = [];
}


CommentsAssistant.prototype.setup = function() {
  this.commentListAttributes = {
    listTemplate: '_shared/comment-list-container',
    itemTemplate: '_shared/comment-list-entry',

    swipeToDelete: false,
    reorderable: false,

    itemsCallback: function(widget, offset, limit) {
      var slice = this.comments.slice(offset, offset+limit);

      widget.mojo.noticeUpdatedItems(offset, slice);
      widget.mojo.setLength(this.comments.length);
    }.bind(this),

    formatters: {
      time: function (d) { return prettyTime(d); }
    }
  };

  var header = Mojo.View.render({
				  object: this.postedContent,
				  template: '_shared/header-content'
				});
  $('headerHolder').innerHTML = header;

  this.controller.setupWidget("commentList", this.commentListAttributes, {});

  this.reloadContent();
};



CommentsAssistant.prototype.reloadContent = function() {
  var widget = $('commentList');

  AlgisFacebookData.streamGetComments(function (comments) {
					this.comments = comments;

					widget.mojo.noticeUpdatedItems(0, comments);
					widget.mojo.setLength(comments.length);
					widget.mojo.revealItem(0, false);
				}, this.postedContent.id);
};



CommentsAssistant.prototype.activate = function(event) {

};



CommentsAssistant.prototype.deactivate = function(event) {
};



CommentsAssistant.prototype.cleanup = function(event) {
};

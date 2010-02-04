function AlgisFacebookClient(api_key, session, secret) {
  this.fbAPIKey = api_key;
  this.fbSession = session;
  this.fbSecret = secret;

  this.util_getSortedKeys= function (obj) {
    var keys = [];

    for (k in obj) {
      if (obj.hasOwnProperty(k) && typeof obj[k] !== "function") {
	keys.push(k);
      }
    }

    keys = keys.sort();

    return keys;
  };


  this.auth_calculateSignature = function (params) {
    var keys = this.util_getSortedKeys(params);
    var message = "";

    keys.each(function (k) {
		message += k + "=" + params[k];
	      });

    message += this.fbSecret;

    return message.md5();
  };


  this.auth_signRequest = function (params) {
    params.sig = this.auth_calculateSignature(params);
  };


  this.rest_enrichParams = function (method, params) {
    params.api_key = this.fbAPIKey;
    params.session_key = this.fbSession;

    params.method = method;

    params.format = "json";

    var date = new Date();
    params.call_id = "" + date.getTime();
  };


  this.rest_sendAjax = function (handler, params) {
    new Ajax.Request("http://api.facebook.com/restserver.php", {
		       method: 'get',
		       parameters: params,

		       onSuccess: function (response) {
			 handler(response.responseJSON);
		       },

		       onFailure: function (request, exception) {
			 Mojo.Log.info("A failure occured during the Facebook REST request");
			 handler(null, exception);
		       }
		     });
  };


  this.rest_sendUpload = function (handler, path, params) {
    var keys = this.util_getSortedKeys(params);
    var setparams = [];

    for (var k = 0; k < keys.length; k++) {
      var property = keys[k];

      var param = {
	'key': property,
	'data': params[property]
      };

      setparams.push(param);
    }

    var request = new Mojo.Service.Request(
      'palm://com.palm.downloadmanager/', {
	method: 'upload',
	parameters: {
	  'fileName': path,
	  'fileLabel': 'filename',
	  'url': "http://api.facebook.com/restserver.php",
	  postParameters: setparams,
	  subscribe: true
	},

	onSuccess : function (resp){
	  Mojo.Log.info('Success : ' + Object.toJSON(resp).substr(0, 250));
 	},

	onFailure : function (e){
 	  Mojo.Log.info('Failure : ' + Object.toJSON(e).substr(0, 250));
	}.bind(this)
      }
    );

    Mojo.Log.info("Request supposedly sent... now what?");
  };


  this.rest_sendRequest = function(handler, method, params) {
    this.rest_enrichParams(method, params);
    this.auth_signRequest(params);
    this.rest_sendAjax(handler, params);
  };

  this.rest_sendFileRequest = function (handler, method, path, params) {
    this.rest_enrichParams(method, params);
    this.auth_signRequest(params);
    this.rest_sendUpload(handler, path, params);
  };


  //
  //
  // THE ACTUAL API WRAPPERS...
  //
  //


  //
  // Data retrieval...
  //
  this.api_users_getInfo = function (handler, uids, fields) {
    this.rest_sendRequest(handler,
			  "users.getInfo",
			  {
			    uids: uids.join(","),
			    fields: fields.join(",")
			  });
  };


  this.api_stream_get = function (handler, limit, filter, source_ids) {
    this.rest_sendRequest(handler, "stream.get", { "limit": limit, "filter_key": filter.join(","), "source_ids": source_ids.join(",") });
  };

  this.api_stream_publish = function (handler, message) {
    this.rest_sendRequest(handler, "stream.publish", { "message": message });
  };

  this.api_photos_upload = function (handler, path, caption) {
    this.rest_sendFileRequest(handler, "photos.upload", path, { "caption": caption });
  };

  this.api_stream_getComments = function (handler, id) {
    this.rest_sendRequest(handler, "stream.getComments", { "post_id": id });
  };
}

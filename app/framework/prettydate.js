function prettyDate(time) {
  var dateobj = parseDate(time);

  if (dateobj == null) {
    return null;
  }

  var diff = dateDistanceInSeconds(dateobj, endOfDayBefore());

  if (diff < 0) {
    return "Today";

  } else if (diff < 86400) {
    return "Yesterday";

  } else {
    return Mojo.Format.formatDate(dateobj, {date: "long" });
  }
}

function prettyTime(time) {
  var dateobj = parseDate(time);

  if (dateobj == null) {
    return null;
  }

  var diff = dateDistanceInSeconds(dateobj, new Date());

  if (diff < 14400) {
    return (diff < 60 && "just now" ||
	    diff < 120 && "1 minute ago" ||
	    diff < 3600 && "about " + Math.floor( diff / 60 ) + " minutes ago" ||
	    diff < 5400 && "about an hour ago" ||
	    diff < 14400 && "about " + Math.floor( diff / 3600 ) + " hours ago");

  } else {
    return Mojo.Format.formatDate(dateobj, {format: "short"});
  }
}


function endOfDayBefore() {
  var obj = new Date();
  obj.setHours(0);
  obj.setMinutes(0);
  obj.setSeconds(0);
  obj.setMilliseconds(0);

  var val = new Date();
  val.setTime(obj.getTime()-1);

  return val;
}


// Parse different date representations into a Date object
function parseDate(time) {
  var date = null;

  Mojo.Log.info();

  if (typeof(time) == "number") {
    date = new Date();
    date.setTime(time*1000);

  } else if (typeof(time) == "string") {
    date = new Date(time.replace(/-/g,"/").replace(/[TZ]/g," "));

  }

  return date;
}


// How many seconds has elapsed between the time of this post and right now?
function dateDistanceInSeconds(date1, date2){
  return ((date2.getTime() - date1.getTime()) / 1000);
}

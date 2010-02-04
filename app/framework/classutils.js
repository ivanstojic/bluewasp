function pickupBehaviour(from, to, what) {
  for (var i=0; i<what.length; i++) {
    var name = what[i];

    to[name] = from[name];
  }
}

exports.categories = ['officespace', 'events', 'jobs', 'investors', 'advice', 'ineedfeedback', 'general', 'timetoshowoff'];

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};


exports.getbagofwords = function(words) {
  // count number of occurences, return object
  var bag = {};
  for(var i=0; i<words.length; i++) {
    if(bag[words[i]] != "" || bag[words[i]] != undefined) {
      bag[words[i]]++;
    } else {
      bag[words[i]] = 1;
    }
  }

  return bag;
}

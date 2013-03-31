var stopwords = require('stopwords').english;
exports.categories = ['officespace', 'events', 'jobs', 'investors', 'advice', 'ineedfeedback', 'general', 'timetoshowoff'];

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

// process stopwords (in case need to add some later)
var stopwords2 = {}
for(var i=0; i<stopwords.length; i++) {
  stopwords2[stopwords[i]] = stopwords[i];
}
exports.stopwords = stopwords = stopwords2;


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

exports.stemwords = function(stemmer, desc) { 
  
  desc = desc.toLowerCase();

  // remove links
  desc = desc.replace(/http.*\s/g," ");
  desc = desc.replace(/www.*\s/g," ");

  // remove punctuation
  desc = desc.replace(/[!@#$%\^&\*()\-_\+={}:;"'<,>\.\?|\/\\~`]/g," ");
  
  // correct extra spaces
  desc = desc.replace(/\s{2,}/g," "); 
  // remove first and last space if any
  desc = desc.replace(/\s/,"");
  desc = desc.replace(/\s$/,"");

  // TODO: remove non-dictionary words
  
  var  dwords = desc.split(" ");
  for(var i=0;i<dwords.length;i++) {
    stemmer.setCurrent(dwords[i]);
    stemmer.stem();
    dwords[i] = stemmer.getCurrent();
  }
  for(var i=0; i<dwords.length; i++) {
    // remove stopwords
    if(dwords[i] == stopwords[dwords[i]]) { // word exists in stopwords
      dwords.remove(i);
      i--;
    }
  }

  return dwords;
}

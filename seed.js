var CatBagWord = require('./models/catBagWord');

utils.categories.forEach(function(cat){
  CatBagWord.findOneAndUpdate(
      { category: cat },
      { category: cat, bagOfWords: { 'default': 'default' }, count: 0 },
      { upsert: true },
      function(err){
        if (err) return console.error(err);
        console.log('Seeded data.');
      }
    );
});
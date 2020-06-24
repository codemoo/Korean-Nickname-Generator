
const csv = require('csv-parser');
const fs = require('fs');
var seedrandom = require('seedrandom');

seedrandom('hello.', { global: true }); 

let words = [];

fs.createReadStream('./misc/words.csv')
.pipe(csv())
.on('data', (row) => {
    words.push(row);
})
.on('end', () => {
    console.log('CSV file successfully processed');

    // console.log(words)
    var r = genWord(words);
    console.log(r);
    
});

function genWord(words) {
    var adj = words[Math.floor(Math.random() * words.length)]['adj'];
    var noun = words[Math.floor(Math.random() * words.length)]['noun'];

    return result = adj + ' ' + noun;
}

'use strict';
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');

const router = express.Router();
app.get('/', (request, response) => {
    // console.log(words)
    if (request.query.count === undefined || request.query.count === '') {
        var loop = 1
    } else {
        var loop = parseInt(request.query.count)
    }

    if (request.query.seed === undefined || request.query.seed === '') {
        var seed = 'hwanmoo.yong';
    } else {
        var seed = request.query.seed;
        seedrandom(seed, { global: true }); 
    }

    let results = [];

    for (let i=0;i<loop;i++) {
        var r = genWord(words);
        results.push(r);
    }
    
    if (request.query.format === 'json') {
        response.json({
            'words':results,
            'seed':seed
        })
    } else {
        response.send(results.join(", "))
    }
    
})

app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);



// 닉네임 생성 관련
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

    app.listen(port, (err) => {
        if (err) {
            return console.log('something bad happened', err)
        }
      
        console.log(`server is listening on ${port}`)
    })
    
});

function genWord(words) {
    var adj = words[Math.floor(Math.random() * words.length)]['adj'];
    var noun = words[Math.floor(Math.random() * words.length)]['noun'];

    return result = adj + ' ' + noun;
}

const { GoogleSpreadsheet } = require('google-spreadsheet');

const doc = new GoogleSpreadsheet("1DYpvEiaEh2DLEBKifTRptInkw0cCoWALDxAFUO60kHc");

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: './misc/words.csv',
    header: [
      {id: 'id', title: 'id'},
      {id: 'adj', title: 'adj'},
      {id: 'noun', title: 'noun'},
    ]
});

var minutes = 5, the_interval = minutes * 60 * 1000;
setInterval(function() {

    // just wrap your code in an async function that gets called immediately
    (async function main() {
        await doc.useServiceAccountAuth({
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY,
        });

        await doc.loadInfo(); // loads document properties and worksheets
        // console.log(doc.title);

        const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id]
        // console.log(sheet.title);
        // console.log(sheet.rowCount);

        // read rows
        const rows = await sheet.getRows(); // can pass in { limit, offset }

        let words = [];
        rows.forEach(row => {
            let _data = {
                'id':row._rawData[0],
                'adj':row._rawData[1],
                'noun':row._rawData[2],
            }    
            words.push(_data);
        });

        csvWriter
        .writeRecords(words)
        .then(()=> console.log('The CSV file was written successfully'));

    })();

}, the_interval);

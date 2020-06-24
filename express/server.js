'use strict';
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');

var words = [];

const csv = require('csv-parser');
const fs = require('fs');

const router = express.Router();
app.get('/', (request, response) => {
    
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

// fs.createReadStream('./misc/words.csv')
// .pipe(csv())
// .on('data', (row) => {
//     words.push(row);
// })
// .on('end', () => {
//     console.log('CSV file successfully processed');
//     console.log(words)    
// });

// 닉네임 생성 관련
var seedrandom = require('seedrandom');

seedrandom('hello.', { global: true }); 

function genWord(words) {
    var adj = words[Math.floor(Math.random() * words.length)]['adj'];
    var noun = words[Math.floor(Math.random() * words.length)]['noun'];

    return adj + ' ' + noun;
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

var minutes = 5, the_interval = minutes * 1 * 1000;
setInterval(function() {

    // just wrap your code in an async function that gets called immediately
    (async function main() {
        // await doc.useServiceAccountAuth({
        //     client_email: `${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`,
        //     private_key: `${process.env.GOOGLE_PRIVATE_KEY}`,
        // });
        doc.useApiKey('AIzaSyA6ETOihCt8kdduul0x4r1SkXfrbq94Ydc');
        await doc.loadInfo(); // loads document properties and worksheets
        // console.log(doc.title);
    
        const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id]
        // console.log(sheet.title);
        // console.log(sheet.rowCount);
    
        // read rows
        const rows = await sheet.getRows(); // can pass in { limit, offset }
    
        words = [];
        rows.forEach(row => {
            let _data = {
                'id':row._rawData[0],
                'adj':row._rawData[1],
                'noun':row._rawData[2],
            }    
            words.push(_data);
        });
    
    })();

}, the_interval);

(async function main() {
    // await doc.useServiceAccountAuth({
    //     client_email: `${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`,
    //     private_key: `${process.env.GOOGLE_PRIVATE_KEY}`,
    // }); 
    doc.useApiKey('AIzaSyA6ETOihCt8kdduul0x4r1SkXfrbq94Ydc');
    await doc.loadInfo(); // loads document properties and worksheets
    // console.log(doc.title);

    const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id]
    // console.log(sheet.title);
    // console.log(sheet.rowCount);

    // read rows
    const rows = await sheet.getRows(); // can pass in { limit, offset }

    words = [];
    rows.forEach(row => {
        let _data = {
            'id':row._rawData[0],
            'adj':row._rawData[1],
            'noun':row._rawData[2],
        }    
        words.push(_data);
    });

})();
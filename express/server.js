'use strict';
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');

var words = [];

app.set('view engine','ejs');
app.set('views','./views');

app.use(express.static(__dirname + '/public'));

const router = express.Router();
app.get('/', (req, res) => {
    
    if (req.query.count === undefined || req.query.count === '') {
        var loop = 1
    } else {
        var loop = parseInt(req.query.count)
    }

    if (req.query.seed === undefined || req.query.seed === '') {
        var seed = 'hwanmoo.yong';
    } else {
        var seed = req.query.seed;
        seedrandom(seed, { global: true }); 
    }

    let results = [];

    for (let i=0;i<loop;i++) {
        var r = genWord(words);
        results.push(r);
    }
    
    if (req.query.format === 'json') {
        res.json({
            'words':results,
            'seed':seed
        })
    } else if (req.query.format === 'text') {
        res.send(results.join(", "))
    } else {
        res.render('view', {data:results.join(", ")});
    }
    
})

app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);

// 닉네임 생성 관련
var seedrandom = require('seedrandom');

seedrandom('hello.', { global: true }); 

function genWord(words) {
    while (true) {
        var adj = words[Math.floor(Math.random() * words.length)];
        var noun = words[Math.floor(Math.random() * words.length)];

        if (adj !== undefined && noun !== undefined) {
            adj = adj['adj']
            noun = noun['noun']
            break;
        }
    }
    

    return adj + ' ' + noun;
}

const { GoogleSpreadsheet } = require('google-spreadsheet');

const doc = new GoogleSpreadsheet("1DYpvEiaEh2DLEBKifTRptInkw0cCoWALDxAFUO60kHc");

var minutes = 5, the_interval = minutes * 1 * 1000;
setInterval(function() {

    // just wrap your code in an async function that gets called immediately
    (main());

}, the_interval);

async function main() {
    await doc.useServiceAccountAuth(require('../misc/key.json'));
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

}

(main());
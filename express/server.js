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
    try {
        if (req.query.count === undefined || req.query.count === '' || parseInt(req.query.count) === undefined ||  isNaN(req.query.count)) {
            var loop = 1
        } else {
            var loop = Math.min(parseInt(req.query.count), 1000)
        }
    
        if (req.query.seed === undefined || req.query.seed === '') {
            var seed = 'hwanmoo.yong';
        } else {
            var seed = req.query.seed;
            seedrandom(seed, { global: true }); 
        }
    
        let results = [];
    
        for (let i=0;i<loop;i++) {
            var r = queryParser(req, words);
    
            results.push(r);
        }
    
        let code_results = [];
    
        for (let i=0;i<2;i++) {
            var r = queryParser(req, words);

            code_results.push(r);
        }
        
        if (req.query.format === 'json') {
            res.json({
                'words':results,
                'seed':seed
            })
        } else if (req.query.format === 'text') {
            res.send(results.join(", "))
        } else {
            res.render('view', {data:results.join(", "), code_data:code_results.join('","')});
        }
    }
    catch (exception) {
        console.log(exception);

        if (req.query.format === 'json') {
            res.json({
                'code':1,
                'msg':'Wrong parameter.'
            })
        } else if (req.query.format === 'text') {
            res.send('Wrong parameter.')
        } else {
            res.render('view', {data:'잘못된 파라미터', code_data:''});
        }
    }
    
    
})

app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);

// 닉네임 생성 관련
var seedrandom = require('seedrandom');

seedrandom('hwanmoo.yong', { global: true }); 

function queryParser(req, words) {
    if (req.query.max_length === undefined || req.query.max_length === '') {
        var r = genWord(words);
    } else {
        var target_max_length = parseInt(req.query.max_length);
        
        if (target_max_length === undefined || target_max_length < 6 || isNaN(target_max_length)) {
            target_max_length = 6;
        }
        
        while (true) {
            var r = genWord(words);
            if (r.length <= parseInt(target_max_length)) {
                break;
            }
        }
    }

    if (req.query.whitespace !== undefined && req.query.whitespace !== '') {
        r = r.replace(/ /gi, req.query.whitespace[0]); 
    }

    return r
}

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
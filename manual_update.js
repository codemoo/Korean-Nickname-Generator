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

// just wrap your code in an async function that gets called immediately
(async function main() {
    await doc.useServiceAccountAuth({
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY,
    });

    await doc.loadInfo(); // loads document properties and worksheets
    console.log(doc.title);

    const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id]
    console.log(sheet.title);
    console.log(sheet.rowCount);

    // read rows
    const rows = await sheet.getRows(); // can pass in { limit, offset }

    // read/write row values
    // console.log(rows[0].name); // 'Larry Page'
    
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


  
  
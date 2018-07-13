const csvFilePath = './src/download/mpai/20180706/daily_cash_MPAI_2018_07_06.csv';
const csv = require('csvtojson')
// csv()
//   .fromFile(csvFilePath)
//   .then((jsonObj) => {
//     // console.log(jsonObj);
//     /**
//      * [
//      * 	{a:"1", b:"2", c:"3"},
//      * 	{a:"4", b:"5". c:"6"}
//      * ]
//      */
//   })

// async function readcsv(path) {
//   return await csv().fromFile(path);
// }
// const jsonArray = readcsv(csvFilePath);
// jsonArray.then(csvData => {
//   console.log(csvData);
// })


// csv().fromFile(csvFilePath).then(csvData => {
//   // console.log(csvData);
//   for (let i = 0; i < csvData.length; i++) {
//     console.log(csvData[i]['Title']);
//     // console.log(csvData[i]['Proportion Pct']);
//   }
// });


// var string = 'Date,PortID,Title,Market Value,Proportion Pct';
// var cashField = string.split(',');

// function readCash(path, csvField) {
//   csv().fromFile(path).then(csvData => {
//     // console.log(csvData);
//     for (let i = 0; i < csvData.length; i++) {
//       csvField.forEach(key => {
//         // console.log(element);
//         console.log(`INSERT into ${csvData[i][key]}`);
//       });
//     }
//   });
// }

// readCash(csvFilePath, cashField);



// New
function insertCashDataToDb(csvFilePath) {
  csv().fromFile(csvFilePath).then(csvData => {
    const mysql = require('mysql');
    const mySqlConfig = require('./config/mysql.json');
    const crypto = require('crypto');

    const connection = mysql.createConnection(mySqlConfig);
    connection.connect(function (err) {
      if (err) console.error('error connecting: ' + err.stack);
      // connect db success
      else {
        for (let i = 0; i < csvData.length; i++) {
          // console.log(csvData);
          // console.log(csvData[i]['Title']);
          let randomStr = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          let id = crypto.createHash('md5').update(randomStr).digest("hex");

          const cashTable = `fact_privatefund_cash`;
          const cashDbField = 'cash_id,cash_date,cash_port_id,title,cash_market_value,cash_proportion_pct';
          let sql = `INSERT INTO ${cashTable} (${cashDbField}) VALUES ('${id}', '${csvData[i]['Date']}', '${csvData[i]['PortID']}', '${csvData[i]['Title']}', '${csvData[i]['Market Value']}', '${csvData[i]['Proportion Pct']}')`;

          connection.query(sql, function (err) {
            if (err) throw err;
            // insert success
            console.log(`1 record inserted in ${cashTable}`);
          });
        }
        connection.end();
      }
    });
  });
}

insertCashDataToDb(csvFilePath);
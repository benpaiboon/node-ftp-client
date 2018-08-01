// Init today folder
function getTodayFolder() {
  let today = new Date();
  let previousDay = new Date(today.setDate(today.getDate() - 1));
  let dd = previousDay.getDate();
  let mm = previousDay.getMonth() + 1; //January is 0!
  let yyyy = previousDay.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }

  let dateSyntax = `${yyyy}${mm}${dd}`;
  return dateSyntax;
}

// Get list of files
function getFileName() {
  const fs = require('fs');
  const ftpFolder = require('./config/ftp.folder.json');
  let todayFolder = getTodayFolder();
  let csvPath = `./${ftpFolder.localDownloadDir}/${todayFolder}/`;
  let fileArr = []

  fs.readdirSync(csvPath).forEach(file => {
    // console.log(file);
    fileArr.push(file);
  });

  return fileArr;
}

// insert read csv file & insert to cash table
function insertToCashTable() {
  const csv = require('csvtojson');
  const ftpFolder = require('./config/ftp.folder.json');
  let todayFolder = getTodayFolder();
  let cashFileName = getFileName();
  let fullCashFilePath = `./${ftpFolder.localDownloadDir}/${todayFolder}/${cashFileName[0]}`;

  csv().fromFile(fullCashFilePath).then(csvData => {
    const mysql = require('mysql');
    const mySqlConfig = require('./config/mysql.json');
    const crypto = require('crypto');

    const connection = mysql.createConnection(mySqlConfig);
    connection.connect(function (err) {
      if (err) console.error('error connecting: ' + err.stack);
      // connect db success
      else {
        let delCashRow = `DELETE FROM fact_privatefund_cash WHERE cash_date='${todayFolder}'`;
        connection.query(delCashRow, function (err) { if (err) throw err; });

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

// insert read csv file & insert to instrument table
function insertToInstrumentTable() {
  const csv = require('csvtojson');
  const ftpFolder = require('./config/ftp.folder.json');
  let todayFolder = getTodayFolder();
  let instFileName = getFileName();
  let fullCashFilePath = `./${ftpFolder.localDownloadDir}/${todayFolder}/${instFileName[1]}`;

  csv().fromFile(fullCashFilePath).then(csvData => {
    const mysql = require('mysql');
    const mySqlConfig = require('./config/mysql.json');
    const crypto = require('crypto');

    const connection = mysql.createConnection(mySqlConfig);
    connection.connect(function (err) {
      if (err) console.error('error connecting: ' + err.stack);
      // connect db success
      else {
        let delInstRow = `DELETE FROM fact_privatefund_instrument WHERE inst_date='${todayFolder}'`;
        connection.query(delInstRow, function (err) { if (err) throw err; });

        for (let i = 0; i < csvData.length; i++) {
          // console.log(csvData);
          // console.log(csvData[i]['Title']);
          let randomStr = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          let id = crypto.createHash('md5').update(randomStr).digest("hex");

          const instTable = 'fact_privatefund_instrument';
          const instDbField = 'inst_id,inst_date,inst_port_id,sector,securities,instrument,unit,avg_cost_price,avg_cost,market_price,inst_market_value,unrealized_profit_lost,unrealized_profit_lost_pct,inst_proportion_pct';
          let sql = `INSERT INTO ${instTable} (${instDbField}) VALUES ('${id}', '${csvData[i]['Date']}', '${csvData[i]['PortID']}', '${csvData[i]['Sector']}', '${csvData[i]['Securities']}', '${csvData[i]['Title']}', '${csvData[i]['Unit']}', '${csvData[i]['Avg Cost Price']}', '${csvData[i]['Avg Cost']}', '${csvData[i]['Market Price']}', '${csvData[i]['Market Value']}', '${csvData[i]['Unrealized Profit Lost']}', '${csvData[i]['Unrealized Profit Lost Pct']}', '${csvData[i]['Proportion Pct']}')`;

          connection.query(sql, function (err) {
            if (err) throw err;
            // insert success
            console.log(`1 record inserted in ${instTable}`);
          });
        }
        connection.end();
      }
    });
  });
}

// 1. Download csv files from FTP server.
// 2. read all csv files & insert data to database
async function runFullLoop() {
  // Init Basic FTP Dependency
  const ftp = require("basic-ftp");
  const ftpConfig = require('./config/ftp.json');
  const ftpFolder = require('./config/ftp.folder.json');
  const client = new ftp.Client();

  try {
    let todayFolder = getTodayFolder();

    // Connect FTP server
    await client.access(ftpConfig);

    // Change dir
    await client.cd(`/${ftpFolder.remoteDir}/${todayFolder}`);

    // Track download progress
    client.trackProgress(info => {
      console.log(`File: ${info.name}`);
      console.log(`Transferred: ${info.bytes} bytes`);
      console.log(`Transferred Overall: ${info.bytesOverall} bytes \n`);
      // console.log('');
    });

    // Download all files from remote dir to local dir
    await client.downloadDir(`${ftpFolder.localDownloadDir}/${todayFolder}/`);
    client.trackProgress();

    // insert csv data to db
    console.log(`================================================= \n`);
    insertToCashTable();
    setTimeout(function () {
      console.log(`\n================================================= \n`);
      insertToInstrumentTable();
    }, 1000)

  }
  catch (err) {
    if (err.code === 550) {
      console.log(`*** The system can't download csv files because FTP server hasn't been updated list of data. ***`);
    } else {
      throw err;
    }
  }
  client.close()
}

// Fired function
runFullLoop();

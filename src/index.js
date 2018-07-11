// Init today folder
function getTodayFolder() {
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1; //January is 0!
  let yyyy = today.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }

  let dateSyntax = `${yyyy}${mm}${dd}`;
  let todayFolder = dateSyntax - 1;
  return todayFolder;
}

function readCSV() {
  const fs = require('fs');
  const csv = require('fast-csv');
  const ftpFolder = require('./config/ftp.folder.json');
  const todayFolder = getTodayFolder();
  const filePath = `./${ftpFolder.localDownloadDir}/${todayFolder}/`;

  try {
    fs.readdirSync(filePath).forEach(file => {
      // console.log(file);
      let fullPath = `${filePath}${file}`;
      let stream = fs.createReadStream(fullPath);
      // read csv
      csv
        .fromStream(stream, { headers: false })
        .on("data", function (data) {
          console.log(data);
        })
        .on("end", function () {
          console.log("done");
        });
    });
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('Directory not found!');
    } else {
      throw err;
    }
  }
}

// Init FTP function for download files from Server
async function downloadFilesFromFTP() {
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
      console.log(`Transferred Overall: ${info.bytesOverall} bytes`);
      console.log('');
    });

    // Download all files from remote dir to local dir
    await client.downloadDir(`${ftpFolder.localDownloadDir}/${todayFolder}/`);
    client.trackProgress();

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
downloadFilesFromFTP();

// readCSV();

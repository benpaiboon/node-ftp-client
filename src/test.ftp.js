// Init Basic FTP Dependency
const ftp = require("basic-ftp");
const ftpConfig = require('./config/ftp.json');
const ftpFolder = require('./config/ftp.folder.json');

// Init FTP function for download files from MPAI Server
async function downloadFilesFromFTP() {
  const client = new ftp.Client();
  try {
    // let today = new Date('July 07, 2018 23:15:30'); //Test saturday
    let today = new Date();

    // Check today is weekend?
    if (today.getDay() == 6 || today.getDay() == 0) {
      console.log(`You can not download files on weekend.`);
    }
    else {
      let dd = today.getDate();
      let mm = today.getMonth() + 1; //January is 0!
      let yyyy = today.getFullYear();
      if (dd < 10) {
        dd = '0' + dd;
      }
      if (mm < 10) {
        mm = '0' + mm;
      }

      // Init today folder
      let todayFolder = `${yyyy}${mm}${dd}`;
      let testTodayFolder = todayFolder - 3;

      // Connect FTP server
      await client.access(ftpConfig);

      // Change dir
      await client.cd(`/${ftpFolder.remoteDir}/${testTodayFolder}`);

      // Track download progress
      client.trackProgress(info => {
        console.log(`File: ${info.name}`);
        console.log(`Transferred: ${info.bytes} bytes`);
        console.log(`Transferred Overall: ${info.bytesOverall} bytes`);
        console.log('');
      });

      // Download all files from remote dir to local dir
      await client.downloadDir(`${ftpFolder.localDownloadDir}/${testTodayFolder}/`);
      client.trackProgress();
    }
  }
  catch (err) {
    console.log(err);
  }
  client.close()
}

// Fired function
downloadFilesFromFTP();
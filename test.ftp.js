// Init Basic FTP Dependency
const ftp = require("basic-ftp");

// Init FTP function for download files from MPAI Server
async function downloadFilesFromFTP() {
  const client = new ftp.Client();
  try {
    // Connect FTP server
    await client.access({
      host: "52.163.126.4",
      user: "setscope",
      password: "Setsc0pe7777",
      secure: false
    });

    // Change dir
    await client.cd('/setscope/20180705');
    
    // Track download progress
    client.trackProgress(info => {
      console.log("File:", info.name);
      console.log(`Transferred: ${info.bytes} bytes`);
      console.log("Transferred Overall:", info.bytesOverall);
      console.log('');
    });
    
    // Download all files from remote dir to local dir
    await client.downloadDir('download/20180705/');
    client.trackProgress();
  }
  catch (err) {
    console.log(err);
  }
  client.close()
}

// Fired function
downloadFilesFromFTP();
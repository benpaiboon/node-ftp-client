var ftpClient = require('ftp-client'),
  config = {
    host: '52.163.126.4',
    port: 21,
    user: 'setscope',
    password: 'Setsc0pe7777'
  },
  options = {
    logging: 'basic'
  },
  client = new ftpClient(config, options);

client.connect(function () {
  // client.download('/setscope/20180705/*', 'download/', {
  client.download('/setscope/20180705', 'download/', {
    overwrite: 'all'
  }, function (result) {
    console.log(result);
  });

});
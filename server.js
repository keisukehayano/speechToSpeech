//httpモジュール読み込み
const https = require('https');

//Socket.ioモジュール読み込み
const socketio = require('socket.io');

//ファイル入出力モジュール読み込み
const fs = require('fs');

//パスのモジュール読み込み
const path = require('path');


//自己証明を読み込み
const options = {
  key: fs.readFileSync('./server_key.pem'),
  cert: fs.readFileSync('./server_crt.pem')
};


//8080番ポートでhttpsサーバーを立てる
const server = https.createServer( options, function( request, response ) {

  //ファイル名の明示なしの場合はデフォルト
  var filePath = '.' + request.url;
  if (filePath == './') {
    filePath = './index.html';
  }

  //拡張子名を取り出し
  var extname = String(path.extname(filePath)).toLowerCase();
  console.log('extenname:' + extname);

  //拡張子に対応するコンテンツ名
  var mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.svg': 'application/image/svg+xml',
    '.ico': 'image/x-icon'
};

//MIMEがない場合はデフォルトを使用
var contentType = mimeTypes[extname] || 'application/octet-stream';
console.log('contentType:' + contentType);
console.log('URL:' + request.url);
console.log('Method:' + request.method);
console.log("Header[Content-Type]: " + request.headers['content-type']);



  //リクエストされたファイルパスを読み込み
  fs.readFile(filePath, function(error, content) {

    //エラー処理
    if (error) {
      console.log('エラー！！' + error);
      console.log(error.code);
      //リクエストしたファイルが存在しない場合

      if (error.code === 'ENOENT') {
        console.log('HAYANO');
        fs.readFile('./404.html', function(error, content) {
          console.log('file1');
          //response.writeHead(200, { 'Content-Type': contentType });
          //response.write(content, 'utf-8');
          response.end(content, 'utf-8');
        });
      } else {
        console.log('file2');
        response.writeHead(500);
        response.write('Sorry, check with the site admin for error: '+error.code+' ..\n');
        response.end();
      }
    } else {
      //エラーがない場合
      response.writeHead(200, { 'Content-Type': contentType });
      //response.write(content, 'utf-8');
      response.end(content, 'utf-8');


    }
  });



}).listen(8080);

// サーバーをsocketに紐づける
const io = socketio.listen( server );

//コネクション確立
io.sockets.on( 'connection', function( socket ) {

  console.log('コネクション:' + socket);

  //クライアントからのメッセージ
  socket.on('c2s_mssage', function( data ) {

    //送られてきた情報をここで色々する
    var msg = data.value + 'にござる。';

    //socketのIDを取得
    var id = socket.id;
    console.log('ID:' + id);

    //特定の相手にだけ送る
    io.to(id).emit('s2c_message', { value: msg });

    //全員に送信
    //io.sockets.emit(s2c_message, { value: msg });

    //自分以外の全員に送信
    //socket.broadcast.emit('s2c', { value: msg });

  });
});

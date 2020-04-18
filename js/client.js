//annyangモジュール読み込み
const annyang = require('annyang');

//jQueryモジュール読み込み
const $ = jQuery = require('jquery');

//socket.io-clientモジュール読み込み
const clientSocket = require('socket.io-client');



//ポート番号8080に繋げる
const ioSocket = clientSocket.connect('https://localhost:8080');

//コネクション
ioSocket.on('connect', function(){ console.log('connect!!') });
ioSocket.on('disconnect', function() { console.log('disconnect!!') });

//annyangが読み込めないとログ出力
if( !annyang ) {
  console.log('annyang is not use!!');
}

var speaking;
var spflg = false;

if( annyang ) {
  const commands = { '*i': function() { console.log('実行') }};
  annyang.debug();
  annyang.addCommands(commands);
  annyang.setLanguage('ja');
  annyang.start();
  annyang.debug();
  console.log('録音開始');
  $('#recording').text('録音開始');

  //音声入力をテキスト化
  annyang.addCallback('resultMatch', function( userSaid ) {
    console.log('録音:' + userSaid );
    ioSocket.emit('c2s_mssage', { value: userSaid });
  });



  ioSocket.on('s2c_message', function( data ) {
    console.log('返信:' + data.value );
    speaking = data.value;
    $('#messages').text(speaking);

    if (spflg) {
      say(speaking);
  }
  });

  //音声出力
  function say( msg, callback ) {
    console.log('発話:' + msg );
    annyang.abort();
    console.log('録音停止');
    $('#recording').text('録音停止');

    responsiveVoice.speak(msg, 'Japanese Female', {
      onend: function() {
        annyang.start();
        console.log('録音再開');
        $('#recording').text('録音再開');
      }
    });
  };

  $('#btn').on('click', function() {
    console.log('speaking ok!!');
    if (!spflg) {
    spflg = true;
  } else {
    spflg = false;
  }
  console.log('発声フラグ:' + spflg);
});


}

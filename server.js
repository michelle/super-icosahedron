var express = require('express');
var fs = require('fs');
var app = express.createServer();

var BinaryServer = require('binaryjs').BinaryServer;
var server = BinaryServer({ server: app });

var streams = {};
var streamCount = 0;

//var db = require('mongoskin').db('localhost:27017/super');

//var TopUser = db.collection('users');

/**
 * Realtime stuff.
 */
server.on('connection', function(client) {
  client.on('stream', function(stream) {
    var streamId = streamCount;
    streamCount += 1;

    stream.on('data', function(data) {
      console.log('Received data:', data);
      //if (data.coordinates && data.picture) {
        var stream_labels = Object.keys(streams);
        for (var i = 0, ii = stream_labels.length; i < ii; i += 1) {
          var s = streams[stream_labels[i]];
          s.write(data);
        }
      //}
    });
    stream.on('close', function() {
      if (streams[streamId]) {
        delete streams[streamId];
      }
    });
    streams[streamId] = stream;

    // Test.
    stream.write('Hello world');
  });
});

// Initialize main server
app.use(express.bodyParser());

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');


app.get('/', function(req, res){
  //TopUser.find({}).toArray(function(err, users) {
    res.render('index', { top_users: res });
  //});
});

app.listen(9000);



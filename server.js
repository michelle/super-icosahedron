var express = require('express');
var fs = require('fs');
var app = express.createServer();

var BinaryServer = require('binaryjs').BinaryServer;
var server = BinaryServer({ server: app });

var streams = {};
var streamCount = 0;

/**
 * Broadcasts to all streams.
 */
function broadcast(type, data) {
  var stream_labels = Object.keys(streams);
  data.type = type;
  for (var i = 0, ii = stream_labels.length; i < ii; i += 1) {
    var s = streams[stream_labels[i]];
    s.write(data);
  }
};

var anonCount = 0;

var db = require('mongoskin').db('localhost:27017/super');

var User = db.collection('users');
var highscores = {};

// TODO: change limit to no of faces.
User.find().sort({ highscore: 1 }).limit(25).toArray(function(err, arr) {
  console.log(arr);
  highscores = arr;
});

/**
 * Realtime stuff.
 */
server.on('connection', function(client) {
  client.on('stream', function(stream) {
    var streamId = streamCount;
    streamCount += 1;

    stream.on('data', function(data) {
      console.log('Received data:', data);
      //if (data.coordinates && data.identifier) {
        broadcast('opponent', data);
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


app.get('/', function(req, res) {
  res.render('index', { top_users: res });
});

app.get('/id', function(req, res) {
  res.send('anon' + anonCount);
  anonCount += 1;
});

app.get('/existing/:email', function(req, res) {
  var email = req.params.email;
  User.findOne({ email: email }, function(err, entry) {
    res.send(entry);
  });
});

app.post('/score', function(req, res) {
  var email = req.body.identifier;
  var score = req.body.score;
  if (score >= highscores[highscores.length - 1]) {
    broadcast('highscores', {
      highscores: highscores
    });
  }

  // Save to db if not anon.
  if (email.indexOf('@') !== -1) {
    User.update({ email: email },
      { email: email, highscore: score },
      { upsert: true }
    );
  }
});

app.listen(9000);

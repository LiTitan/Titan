var mongodb = require('mongodb');
var koa = require('koa');
var Router = require('koa-router');
var mqtt = require('mqtt');

var app = koa();
var router = new Router();
var mongodbServer = new mongodb.Server('127.0.0.1', 27017, {
    auto_reconnect: true
});
var db = new mongodb.Db('mqtt', mongodbServer);
var server = mqtt.connect('mqtt://127.0.0.1');

server.on('connect', function() {
    server.subscribe('presence');
});

server.on('message', function(topic, message) {
    var mes = message.toString().split('#');
    var mesData = mes[0] + ':' + mes[1];
    console.log(mes[0] + ':' + mes[1]);
    db.open(function(err, db) {
        if (!err) {
            console.log('connect mqtt mongodb');
            db.collection('mesRecord', function(err, collection) {
                var data = {
                    'message': mesData
                }
                collection.insert(data, function(err, data) {
                    if (!err) {
                        // console.log('mesRecord data insert successfully');
                    } else {
                        // console.log('mesRecord data insert failed');
                    }
                });
            });
        } else {
            console.log('mongodb open error');
        }
        db.close();
    });
});

router.get('/', function*() {
    var client = mqtt.connect('mqtt://127.0.0.1');
    client.on('connect', function() {
        client.subscribe('presence');
        client.publish('presence', 'client' + '#' + 'Hello mqtt');
    });
});

app.use(router.middleware());
app.listen(3000);

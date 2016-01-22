"use strict";
const
  webpack = require('webpack'),
  WebpackDevServer = require('webpack-dev-server'),
  config = require('./webpack.config'),

  express = require('express'),
  bodyParser = require('body-parser'),
  proxy = require('proxy-middleware'),
  url = require('url'),
  pg = require('pg'),
  dbConnectionString = require('./database.config.js'),
  app = express();


app.use(config.output.publicPath, proxy(url.parse('http://localhost:8081/')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/*', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.post('/api/v1/programs', function(req, res){
  console.log(req);
  let results = [];
  let data = {program_name: req.body.program_name, income: req.body.income};

    pg.connect(dbConnectionString, function(err, client, done){
      //Handle connection errors
      if(err){
        done();
        console.log(err);
        return res.status(500).json({ success: false, data: err});
      }

      client.query("INSERT INTO programs(program_name, income) values($1, $2)", [data.program_name, data.income]);

      let query = client.query("SELECT * FROM programs ORDER BY id ASC");

      query.on('row', function(row){
        results.push(row);
      });

      query.on('end', function(){
        done();
        return res.json(results);
      });

    });

});

const server = new WebpackDevServer(webpack(config), {
  contentBase: __dirname,
  publicPath: config.output.publicPath,
  quiet: false,
  hot: true,
  historyApiFallback: true,
  stats: { colors: true }
});

server.listen(8081, "localhost", function(){});
app.listen(8080, "localhost", function(){
  console.log("Server listening on port 8080");
});

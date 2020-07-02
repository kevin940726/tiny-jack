'use strict';

const http = require('http');
const Discord = require('discord.js');

// Plugins
const attachTSPlaygroundURLs = require('./attach-ts-playground-urls');
const liveNotifications = require('./live-notifications');
const getIMDbRatings = require('./get-imdb-ratings');

// Health check
http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('200');
  })
  .listen(process.env.PORT || 5000);

const client = new Discord.Client();

client.on('ready', () => {
  console.log('I am ready!');
});

attachTSPlaygroundURLs(client);
liveNotifications(client);
getIMDbRatings(client);

client.login(process.env.DISCORD_BOT_TOKEN);

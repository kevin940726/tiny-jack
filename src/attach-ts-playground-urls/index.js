const remark = require('remark');
const stringify = require('remark-stringify');
const typescriptPlayground = require('./remark-typescript-playground');

// #ts-playground
const CHANNEL_ID = '677694185897197595';

const processor = remark().use(typescriptPlayground).use(stringify);

function attachTSPlaygroundURLs(message) {
  if (message.channel.id !== CHANNEL_ID) {
    return;
  }

  processor.process(message.content, (err, file) => {
    if (file.data.playgroundURLs) {
      file.data.playgroundURLs.forEach((url) => {
        message.channel
          .send({
            embed: {
              title: 'Open Playground',
              url,
            },
          })
          .catch(console.error);
      });
    }
  });
}

module.exports = (client) => {
  client.on('message', attachTSPlaygroundURLs);
};

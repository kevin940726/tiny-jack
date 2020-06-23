const VOICE_TO_TEXT_CHANNELS = {
  // #gaming
  '677555274730438691': '679690297030082592',
  // #coding
  '679906683442823181': '679901752627298307',
  // #iot
  '680655969721778188': '677790335690211358',
  // #general
  '677544016341893125': '677544016341893124',
};

module.exports = (client) => {
  async function liveNotifications(oldState, newState) {
    if (!oldState.streaming && newState.streaming) {
      const { channelID, member } = newState;

      if (channelID in VOICE_TO_TEXT_CHANNELS) {
        const textChannelID = VOICE_TO_TEXT_CHANNELS[channelID];

        const textChannel = await client.channels.fetch(textChannelID);

        textChannel.send(`<@${member.id}> is now streaming in <#${channelID}>`);
      }
    }
  }

  client.on('voiceStateUpdate', liveNotifications);
};

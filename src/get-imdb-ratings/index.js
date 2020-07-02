const fetch = require('node-fetch');
const querystring = require('querystring');

async function getMovieInfo(titleOrID) {
  const isID = /tt\d+/.test(titleOrID);

  const {
    Ratings,
    Title,
    Year,
    imdbID,
    Poster,
    Director,
    Writer,
    Actors,
    Plot,
  } = await fetch(
    `https://omdbapi.com/?${querystring.stringify({
      apikey: process.env.OMDB_API_KEY,
      ...(isID ? { i: titleOrID } : { t: titleOrID }),
    })}`
  ).then((res) => res.json());

  const ratings = {
    imdb: NaN,
    rt: NaN,
    metacritic: NaN,
  };

  Ratings.forEach(({ Source, Value }) => {
    switch (Source) {
      case 'Internet Movie Database':
        ratings.imdb = parseInt(Value.split('/')[0], 10);
        break;
      case 'Rotten Tomatoes':
        ratings.rt = parseInt(Value, 10);
        break;
      case 'Metacritic':
        ratings.metacritic = parseInt(Value.split('/')[0], 10);
        break;
      default:
        break;
    }
  });

  return {
    ratings,
    image: Poster,
    name: `${Title} (${Year})`,
    description: Plot,
    url: `https://imdb.com/title/${imdbID}/`,
    director: Director,
    writer: Writer,
    actors: Actors,
  };
}

async function getIMDbRatings(message) {
  if (message.content.startsWith('!imdb ')) {
    const title = message.content.split('!imdb')[1].trim();

    const {
      ratings,
      name,
      url,
      image,
      description,
      director,
      writer,
      actors,
    } = await getMovieInfo(title);

    await message.channel.send({
      embed: {
        title: name,
        thumbnail: {
          url: image,
        },
        description,
        url,
        fields: [
          !Number.isNaN(ratings.imdb) && {
            name: 'IMDb',
            value: `⭐️${ratings.imdb}`,
            inline: true,
          },
          !Number.isNaN(ratings.rt) && {
            name: 'Rotten Tomatoes',
            value: `${ratings.rt > 60 ? '🍅' : '💩'} ${ratings.rt}%`,
            inline: true,
          },
          !Number.isNaN(ratings.metacritic) && {
            name: 'Metacritic',
            value: ratings.metacritic,
            inline: true,
          },
          director && { name: 'Director', value: director },
          writer && { name: 'Writer', value: writer, inline: true },
          actors && { name: 'Actors', value: actors },
        ].filter(Boolean),
      },
    });
  }
}

module.exports = (client) => {
  client.on('message', getIMDbRatings);
};

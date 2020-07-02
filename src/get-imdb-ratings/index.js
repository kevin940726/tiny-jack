const fetch = require('node-fetch');
const querystring = require('querystring');

async function searchForMovieTitle(title) {
  try {
    const res = await fetch(
      `https://omdbapi.com/?${querystring.stringify({
        apikey: process.env.OMDB_API_KEY,
        s: title,
      })}`
    );

    const {
      Search: [{ imdbID }],
    } = await res.json();

    return imdbID;
  } catch (err) {
    return null;
  }
}

async function getMovieInfo(titleOrID) {
  const isID = /tt\d+/.test(titleOrID);

  const res = await fetch(
    `https://omdbapi.com/?${querystring.stringify({
      apikey: process.env.OMDB_API_KEY,
      ...(isID ? { i: titleOrID } : { t: titleOrID }),
    })}`
  );

  const {
    Response,
    Error,
    Ratings,
    Title,
    Year,
    imdbID,
    Poster,
    Director,
    Writer,
    Actors,
    Plot,
  } = await res.json();

  if (Response !== 'True') {
    if (Error === 'Movie not found!') {
      const matchedID = await searchForMovieTitle(titleOrID);

      if (matchedID) {
        return getMovieInfo(matchedID);
      }
    }

    return null;
  }

  const ratings = {
    imdb: NaN,
    rt: NaN,
    metacritic: NaN,
  };

  Ratings.forEach(({ Source, Value }) => {
    switch (Source) {
      case 'Internet Movie Database':
        ratings.imdb = parseFloat(Value.split('/')[0]);
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
    image: Poster !== 'N/A' && Poster,
    name: `${Title} (${Year})`,
    description: Plot,
    url: `https://imdb.com/title/${imdbID}/`,
    director: Director,
    writer: Writer,
    actors: Actors,
  };
}

async function getIMDbRatings(message) {
  try {
    if (message.content.startsWith('!imdb ')) {
      const title = message.content.split('!imdb')[1].trim();

      const movieInfo = await getMovieInfo(title);

      if (!movieInfo) {
        message.channel.send('Movie not found.');
      }

      const {
        ratings,
        name,
        url,
        image,
        description,
        director,
        writer,
        actors,
      } = movieInfo;

      await message.channel.send({
        embed: {
          title: name,
          ...(image
            ? {
                thumbnail: {
                  url: image,
                },
              }
            : {}),
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
            director && { name: 'Director', value: director, inline: true },
            writer && { name: 'Writer', value: writer, inline: true },
            actors && { name: 'Actors', value: actors },
          ].filter(Boolean),
        },
      });
    }
  } catch (err) {
    console.error(err);
  }
}

module.exports = (client) => {
  client.on('message', getIMDbRatings);
};

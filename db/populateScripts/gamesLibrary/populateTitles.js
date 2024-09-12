const db        = require('../../index.js');
const { faker } = require('@faker-js/faker');

function populateTitles (max, end = false) {
  const genres = [
    'Co-op', 'Social Deduction', 'Party', 'Resource Management', 'Worker Placement',
    'Draft', 'Classic', 'Card', 'Elimination', 'Euro'
  ]

  let insertTitlesQuery = `
    INSERT INTO games.titles
    (name, genre, details, num_players, play_time)
    VALUES
  `;

  for (var x = 1; x <= max; x++) {
    let name = faker.commerce.productName();
    let genre = genres[Math.floor(Math.random() * genres.length)];
    let details = faker.lorem.paragraph(Math.round(Math.random() * 4) + 2);
    let num_players = Math.ceil(Math.random() * 10);
    let play_time = `${Math.ceil(Math.random() * 5)/2} hours`;

    insertTitlesQuery += `
      ('${name}', '${genre}', '${details}', '${num_players}', '${play_time}')
      ${x === max ? ';' : ','}
    `;
  };

  db
    .query(insertTitlesQuery)
    .then(() => {
      console.log('GAME TITLES POPULATED')
      if (end) db.end();
    })
    .catch(err => {
      console.log(`Error in bulk add titles: ${err}`);
      if (end) db.end();
    });
};

module.exports = {
  populateTitles: populateTitles
};
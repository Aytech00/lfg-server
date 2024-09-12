const db         = require('../../index.js');
const { faker }  = require('@faker-js/faker');

function populateCopies (max, end = false) {
  let insertCopiesQuery = `
    INSERT INTO games.copies
    (title_id, available, notes)
    VALUES
  `;

  for (var x = 1; x <= max; x++) {
    let available = !!Math.round(Math.random());

    let noteCount = Math.round(Math.random() * 4 + 1);
    let notes = [];
    for (let y = 0; y < noteCount; y++) {
      notes.push(`'${faker.lorem.sentence()}'`);
    };

    insertCopiesQuery += `
      ((SELECT title_id
      FROM games.titles
      ORDER BY RANDOM()
      LIMIT 1), ${available}, ARRAY [${notes}])
      ${x === max ? ';' : ','}
    `;
  };

  db
    .query(insertCopiesQuery)
    .then(() => {
      console.log('GAME COPIES POPULATED');
      if (end) db.end();
    })
    .catch(err => {
      console.log(`ERROR IN BULK ADD COPIES: ${err}`);
      if (end) db.end();
    });
};

module.exports = {
  populateCopies: populateCopies
};
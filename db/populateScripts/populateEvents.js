const db        = require('../index.js');
const { faker } = require('@faker-js/faker');

function populateEvents (max, end = false) {
  db.query(`
    TRUNCATE TABLE events;
    TRUNCATE TABLE event_attendees;
  `)
    .then(() => {
      let insertEventQuery = `
        INSERT INTO events
        (name, price, date, start_time, category, details, player_cap, link, waitlist)
        VALUES
      `;
      let insertEntrantsQuery = '';

      const categories = [
        'War', 'TCG', 'Board Game', 'Miniature', 'Strategy',
        'RPG', 'Panel', 'Artist Signing', 'Pokemon', 'Community Event'
      ];

      for (let x = 1; x <= max; x++) {
        let name = faker.lorem.words(Math.round(Math.random() * 2) + 1);
        let price = parseFloat((Math.random() * 45 + 5).toFixed(2));
        let date = JSON.stringify(faker.date.future()).split('T')[0];
        let time = `${Math.round(Math.random() * 23)}:${Math.random() < .5 ? '00' : '30'}`;
        let category = categories[Math.floor(Math.random() * categories.length)];
        let details = faker.lorem.paragraph(Math.round(Math.random() * 7) + 3);
        let player_cap = Math.random() < .2 ? 0 : Math.pow(2, Math.round(Math.random() * 4) + 3);
        let link = faker.internet.url();
        let waitlist = Math.random() < .5;

        insertEventQuery += `
          ('${name}', ${price}, '${date}', '${time}', '${category}', '${details}', ${player_cap}, '${link}', ${waitlist})
        `;

        let numEntrants = Math.random() < .4 ? player_cap : Math.round(Math.random() * player_cap);

        insertEntrantsQuery += `
          INSERT INTO event_attendees (event_id, waitlisted, attendee_id)
          SELECT (SELECT event_id
            FROM events e
            WHERE e.name = '${name}'
            AND e.link = '${link}'
            AND e.details = '${details}'
            ), 'TRUE', attendee_id
          FROM attendees
          ORDER BY RANDOM()
          LIMIT ${numEntrants};
        `;

        if (waitlist && numEntrants === player_cap) {
          let numWaitlisted = Math.round(Math.random() * 10);
          insertEntrantsQuery += `
            INSERT INTO event_attendees (event_id, waitlisted, attendee_id)
            SELECT (SELECT event_id
              FROM events e
              WHERE e.name = '${name}'
              AND e.link = '${link}'
              AND e.details = '${details}'
              ), 'TRUE', attendee_id
            FROM attendees
            ORDER BY RANDOM()
            LIMIT ${numWaitlisted};
          `;
        };

        if (x !== max) {
          insertEventQuery += ',';
        } else {
          insertEventQuery += ';';
        };
      };

      db
        .query(insertEventQuery)
        .then(() => {
          console.log('EVENT TABLE POPULATED');
          db
            .query(insertEntrantsQuery)
            .then(() => {
              console.log('EVENT ENTRANTS TABLE POPULATED');
              if (end) db.end();
            })
            .catch(err => {
              console.log(`Error in bulk insert event entrants: ${err}`);
              if (end) db.end();
            });
        })
        .catch(err => {
          console.log(`Error in event bulk insert events: ${err}`);
          if (end) db.end();
        });
    })
    .catch(err => {
      console.log(`Error in truncate events: ${err}`);
      if (end) db.end();
    });
};

module.exports = {
  populateEvents: populateEvents
};
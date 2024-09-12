const db                    = require('../index');
const { populateAttendees } = require('./populateAttendees');
const { populateEvents }    = require('./populateEvents');
const { populateTitles }    = require('./gamesLibrary/populateTitles.js');
const { populateCopies }    = require('./gamesLibrary/populateCopies');
const {
  attendees,
  events,
  titles,
  copies,
  checkouts
}               = require('./populate.json');


if (attendees.run) {
  populateAttendees(attendees.max);
} else {
  console.log('ATTENDEES NOT POPULATED');
};

if (titles.run) {
  db
    .query(`
      TRUNCATE table games.titles;
      TRUNCATE table games.copies;
      TRUNCATE table games.checkouts;
    `)
    .then(() => {
      populateTitles(titles.max);
      populateCopies(copies.max);
    })
    .catch(err => console.log(`Error in truncate games schema: ${err}`));
} else {
  console.log('GAME TITLES NOT POPULATED');
};

if (events.run) {
  populateEvents(events.max, true);
} else {
  console.log('EVENTS NOT POPULATED');
};





const db        = require('../index.js');
const { faker } = require('@faker-js/faker');

function populateAttendees (max, end = false) {
  db.query(`
  TRUNCATE TABLE attendees;
  `)
    .then(() => {
      let insertAttendeeQuery = `
        INSERT INTO attendees
        (name, age, address, phone_number, email, day_one, day_two, day_three, day_four, VIP, notes)
        VALUES
      `;
      for (let x = 1; x <= max; x++) {
        let name = faker.person.fullName();
        name = name.replace("'", "''")
  
        let address = faker.location.streetAddress();
        address = address.replace("'", "''")
  
        let age = Math.floor(Math.random() * 30) + 20;
      
        let rand1 = Math.random() > 0.4;
        let rand2 = Math.random() > 0.4;
        let rand3 = Math.random() > 0.4;
        let rand4 = Math.random() > 0.4;
        if (!rand1 && !rand2 && !rand3 && !rand4) {
          rand1 = true;
        };
  
        let noteCount = Math.round(Math.random() * 4) + 1;
        let notes = [];
        for (let y = 0; y < noteCount; y++) {
          notes.push(`'${faker.lorem.sentence()}'`);
        };
  
        insertAttendeeQuery += `
          ('${name}',
          ${age},
          '${address}',
          '${faker.phone.number()}',
          '${faker.internet.email()}',
          '${rand1}',
          '${rand2}',
          '${rand3}',
          '${rand4}',
          '${Math.random() < 0.25}',
          ARRAY [${notes}])
        `;
        if (x !== max) {
          insertAttendeeQuery += ',';
        } else {
          insertAttendeeQuery += ';';
        };
      };
      
      db
        .query(insertAttendeeQuery)
        .then(() => {
          console.log('ATTENDEES TABLE POPULATED');
          if (end) db.end();
        })
        .catch(err => {
          console.log(`Error in attendee bulk insert attendees: ${err}`);
          if (end) db.end();
        })
    })
    .catch(err => {
      console.log(`Error in truncate attendees: ${err}`);
      if (end) db.end();
    });
};

module.exports = {
  populateAttendees: populateAttendees
};
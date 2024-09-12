const db             = require('../db/index.js');
const QR             = require('qrcode');
const { v4 }         = require('uuid');
const { badgeTypes } = require('../constants.js');

// TODO: add edit attendee
module.exports = {
  register: (req, res) => {
    // TODO: expect array of registrations
    // TODO: email Badge numbers and details about pickup on registration as well as link to register their account
    let attendeeInfoArr = req.body;

    let insertQuery = `
    INSERT INTO attendees
    (registration_id, name, nickname, DOB, address, city, state,
      phone_number, email, VIP, badge_type, badge_dates)
    VALUES
    `;

    for (let x = 0; x < attendeeInfoArr.length; x++) {
      let attendeeInfo = attendeeInfoArr[x];
      let { name, nickname, DOB, address, city, state, phoneNumber, email, badgeType, badgeDates } = attendeeInfo;
      let registrationId = v4();
      let VIP = !!attendeeInfo.VIP;
      
      name = name.replace("'", "''");
      address = address.replace("'", "''");

      insertQuery += `
        ('${registrationId}', '${name}', '${nickname}', '${DOB}', '${address}', '${city}', '${state}',
        '${phoneNumber}', '${email}', ${VIP}, '${badgeTypes[badgeType]}', '{${badgeDates}}')
        ${x === attendeeInfoArr.length - 1 ? ';' : ','}
        `;
    };
    
    
    // let QR_code;
    // QR.toString(attendee_id, function (err, url) {
    //   QR_code = url;
    //   // TODO: send email with confirmation and QR code
    // });

    db
      .query(insertQuery)
      .then(() => {
        res.status(201).send('REGISTRATION COMPLETE');
      })
      .catch(err => {
        console.error(err);
        res.status(500).send(err)
      });
  },
  serchAttendee: (req, res) => {
    let { email, name, attendeeId } = req.query;
  
    let searchQuery = `
      SELECT 
        badge_type::text || attendee_id::text as attendee_id, name, nickname, DOB, address, city, state,
        phone_number, email, VIP, notes, badge_dates
      FROM attendees
      WHERE 
    `;
    if (attendeeId) {
      attendeeId = attendeeId.slice(1);
      searchQuery += `attendee_id = '${attendeeId}'`
    } else if (email) {
      searchQuery += `email = '${email}'`
    } else if (name) {
      searchQuery += `name = '${name}'`
    } else {
      res.status(500).send('No attendee information provided.')
    }

    db
      .query(searchQuery)
      .then(data => {
        let { rows } = data;
        if (rows.length) {
          res.status(200).send(rows[0]);
        } else {
          res.status(404).send('Attendee not found.')
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).send(err)
      })
  },
  addNote: (req, res) => {
    let { attendeeId, note } = req.body;
    
    attendeeId = attendeeId.slice(1);
    note = note.replace("'", "''");

    let addNoteQuery = `
      UPDATE attendees
      SET notes = array_append(notes, '${note}')
      WHERE attendee_id = '${attendeeId}';
    `;

    db
      .query(addNoteQuery)
      .then(() => {
        res.status(201).send('Note added');
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send(err);
      });
  }
};

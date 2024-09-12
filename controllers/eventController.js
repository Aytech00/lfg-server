const db     = require('../db/index.js');

module.exports = {
  createEvent: (req, res) => {
    let { name, price, date, startTime, category, details, playerCap, link } = req.body;

    name = name.replace("'", "''");
    details = details.replace("'", "''");

    let insertEventQuery = `
      INSERT INTO events
      (name, price, date, start_time, category, details, player_cap, link)
      VALUES
      ('${name}', ${price}, '${date}', '${startTime}', '${category}', '${details}', ${playerCap}, '${link}')
    `;

    db
      .query(insertEventQuery)
      .then(() => {
        res.status(201).send('EVENT CREATED');
      })
      .catch(err => {
        console.error(err);
        res.status(500).send(err);
      })
  },
  getEventList: (req, res) => {
    db
      .query(`
        SELECT 'EV' || event_id as event_id, name, price::float, date, start_time,
               category, details, player_cap, link, waitlist
        FROM EVENTS
      `)
      .then(data => {
        if (data.rows.length > 0) {
          res.status(200).send(data.rows);
        } else {
          res.status(204).send('NO EVENTS CREATED');
        };
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('UNABLE TO GET EVENT LIST');
      });
  },
  joinEvent: (req, res) => {
    // TODO check that the attendee has a ticket for the day of the event
    let { attendeeId, eventId } = req.body;

    attendeeId = attendeeId.slice(1);
    eventId = eventId.slice(2);

    db
      .query(`
        SELECT count(*) from event_attendees
        WHERE attendee_id = ${attendeeId}
        AND event_id = ${eventId};
      `)
      .then((data) => {
        if (data.rows[0].count > 0) {
          res.status(400).send('Already in event');
          return;
        };
        db
          .query(`
            SELECT
              (SELECT count(*)
                FROM event_attendees r
                INNER JOIN events e
                ON e.event_id = r.event_id
                WHERE r.attendee_id = ${attendeeId}
                AND date = (
                  SELECT date
                  FROM events
                  WHERE event_id = ${eventId})
                AND start_time = (
                  SELECT start_time
                  FROM events
                  WHERE event_id = ${eventId})
                AND e.event_id != ${eventId}) as simulataneous_registrations,
              (SELECT count(*)
                FROM event_attendees r
                INNER JOIN events e
                ON e.event_id = r.event_id
                WHERE e.event_id = ${eventId})::int as player_count,
              player_cap, waitlist
            FROM events
            WHERE event_id = ${eventId};
          `)
          .then(data => {
            let { simulataneous_registrations, player_count, player_cap, waitlist } = data.rows[0];

            // checks if attendee is registered in another event that starts at the same time
            if (simulataneous_registrations > 0) {
              res.status(401).send('Already registered in an event with the same start time');
              return;
            }

            // checks if event is full
            let eventAtCap = player_count >= player_cap;
            if (eventAtCap && !waitlist) {
              res.status(401).send('Event full');
              return;
            };

            let waitlisted = eventAtCap && waitlist;

            db
              .query(`
                INSERT INTO event_attendees
                (attendee_id, event_id, waitlisted)
                VALUES
                (${attendeeId}, ${eventId}, ${waitlisted})
              `)
              .then(() => {
                res.status(201).send(`Event joined ${waitlisted ? 'on the waitlist' : ''}`)
              })
              .catch(err => {
                console.error(err);
                res.status(500).send('Failed to join event');
              });
          })
          .catch(err => {
            console.error(err);
            res.status(500).send(err);
          });
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Failed to join event');
      });
  },
  getEntryList: (req, res) => {
    let { eventId } = req.query;
    eventId = eventId.slice(2);

    db
      .query(`
        SELECT badge_type::text || a.attendee_id::text as attendee_id, a.name, a.nickname, r.waitlisted
        FROM attendees a
        INNER JOIN event_attendees r
        ON a.attendee_id = r.attendee_id
        WHERE r.event_id = '${eventId}'
      `)
      .then(data => {
        res.status(200).send(data.rows);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Failed to retrieve entry list')
      });
  },
  dropFromEvent: (req, res) => {
    let { attendeeId, eventId } = req.body;

    attendeeId = attendeeId.slice(1);
    eventId = eventId.slice(2);

    db
      .query(`
        DELETE FROM event_attendees
        WHERE attendee_id = ${attendeeId}
        AND event_id = ${eventId}
      `)
      .then(() => {
        res.status(200).send('Dropped from event');
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Failed to drop from event');
      });
  },
  cancelEvent: (req, res) => {
    let { eventId } = req.body;
    eventId = eventId.slice(2);

    let deleteQuery = `
      DELETE FROM events
      WHERE event_id = ${eventId};
      DELETE FROM event_attendees
      WHERE event_id = ${eventId};
    `;
    db
      .query(deleteQuery)
      .then(() => {
        res.status(200).send('Event cancelled and entrants dropped')
      })
      .catch(err => {
        console.error(err);
        res.status(400).send('Failed to cancel event');
      })
  }
};
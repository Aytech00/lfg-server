const db     = require('../db/index.js');

module.exports = {
  addTitle: (req, res) => {
    let { name, genre, details, numPlayers, playTime, copies } = req.body;
    let insertTitleQuery = `
      INSERT INTO games.titles
      (name, genre, details, num_players, play_time, unavailability_count)
      VALUES
      ('${name}', '${genre}', '${details}', '${numPlayers || 0}', '${playTime || null}', 0)
      ${copies ? "RETURNING 'T' || title_id as title_id" : ';'}
    `;
    db
      .query(insertTitleQuery)
      .then(data => {
        if (copies) {
          req.body.titleId = data.rows[0].title_id;
          module.exports.addCopy(req, res);
        } else {
          res.status(201).send('Title added');
        }
      })
      .catch(err => {
        console.log(err);
        res.status(500).send(`Error adding title: ${err}`);
      });
  },
  getTitleList: (req, res) => {
    let titleListQuery = `
      SELECT 'T' || title_id as title_id, name, genre, details, num_players, play_time, unavailability_count, (
        SELECT count(title_id)
        FROM games.copies c
        WHERE title_id = t.title_id
      )::int as num_copies
      FROM games.titles t
    `;
    db
      .query(titleListQuery)
      .then(data => {
        res.status(200).send(data.rows);
      })
      .catch(err => {
        console.log(err);
        res.status(500).send(`Error getting title list: ${err}`);
      });
  },
  editTitle: (req, res) => {
    let { titleId, name, genre, details, numPlayers, playTime } = req.body;
    titleId = titleId.slice(1);
    let updateQuery = `
      UPDATE games.titles
      SET name = '${name}',
      genre = '${genre}',
      details = '${details}',
      num_players = ${numPlayers},
      play_time = '${playTime}'
      WHERE title_id = ${titleId};
    `;
    db
      .query(updateQuery)
      .then(() => {
        res.status(201).send('Title updated')
      })
      .catch(err => {
        console.log(err);
        res.status(500).send(`Error updating title: ${err}`);
      });
  },
  removeTitle: (req, res) => {
    let { titleId } = req.body;
    titleId = titleId.slice(1);

    let deleteQuery = `
      DELETE FROM games.titles
      WHERE title_id = ${titleId};

      DELETE FROM games.copies
      WHERE title_id = ${titleId};
    `;

    db
      .query(deleteQuery)
      .then(() => {
        res.status(201).send('Title removed');
      })
      .catch(err => {
        console.log(err);
        res.status(500).send(`Error removing title: ${err}`);
      });
  },
  addCopy: (req, res) => {
    let { titleId, copies } = req.body;
    titleId = titleId.slice(1);

    let insertCopiesQuery = `
      INSERT INTO games.copies
      (title_id)
      VALUES
    `;
    for (var x = 1; x <= copies; x++) {
      insertCopiesQuery += `
        ('${titleId}')${x === copies ? ';' : ','}
      `;
    };
    db
      .query(insertCopiesQuery)
      .then(() => {
        res.status(201).send(`${req.body.name ? 'Title added. ' : ''}Copies added`);
      })
      .catch(err => {
        console.log(err);
        res.status(500).send(`Error adding copies: ${err}`);
      });
  },
  getCopyList: (req, res) => {
    let { titleId } = req.query;
    titleId = titleId.slice(1);

    let searchQuery = `
      SELECT 'C' || copy_id as copy_id, available, notes
      FROM games.copies
      WHERE title_id = ${titleId};
    `;

    db
      .query(searchQuery)
      .then(data => {
        res.status(200).send(data.rows);
      })
      .catch(err => {
        console.log(err);
        res.status(500).send(`Error retrieving copy list: ${err}`);
      });
  },
  removeCopy: (req, res) => {
    let { copyId } = req.body;
    copyId = copyId.slice(1);

    let deleteQuery = `
      DELETE FROM games.copies
      WHERE copy_id = ${copyId};
    `;

    db
      .query(deleteQuery)
      .then(() => {
        res.status(201).send('Copies removed');
      })
      .catch(err => {
        console.log(err);
        res.status(500).send(`Error removing copy: ${err}`);
      });
  },
  addNote: (req, res) => {
    let { copyId, note } = req.body;
    copyId = copyId.slice(1);

    let updateQuery = `
      UPDATE games.copies
      SET notes = array_append(notes, '${note}')
      WHERE copy_id = '${copyId}';
    `;

    db
      .query(updateQuery)
      .then(() => {
        res.status(201).send('Note added');
      })
      .catch(err => {
        console.log(err);
        res.status(500).send(`Error adding note to copy: ${err}`);
      });
  },
  checkoutCopy: (req, res) => {
    let { copyId, attendeeId } = req.body;
    copyId = copyId.slice(1);
    attendeeId = attendeeId.slice(1);

    let checkAvailabilityQuery = `
      SELECT available
      FROM games.copies
      WHERE copy_id = ${copyId};
    `;

    db
      .query(checkAvailabilityQuery)
      .then(data => {
        if (!data.rows[0].available) {
          res.status(500).send('Copy already checkout out');
          return;
        };
        
        let checkoutQuery = `
          INSERT INTO games.checkouts
          (copy_id, attendee_id, checkout_time)
          VALUES
          (${copyId}, ${attendeeId}, NOW());
    
          UPDATE games.copies
          SET available = false
          WHERE copy_id = ${copyId};
        `;
    
        db
          .query(checkoutQuery)
          .then(() => {
            res.status(201).send('Checkout successful');
          })
          .catch(err => {
            console.log(err);
            res.status(500).send(`Error checking out game: ${err}`)
          });
      })
      .catch(err => {
        console.log(err);
        res.status(500).send(`Error checking availability: ${err}`);
      });
  },
  returnCopy: (req, res) => {
    let { copyId, attendeeId } = req.body;
    copyId = copyId.slice(1);
    attendeeId = attendeeId.slice(1);

    // TODO (maybe): disallow checkout if attendee has an unreturned game

    let returnQuery = `
      UPDATE games.checkouts
      SET return_time = NOW()
      WHERE attendee_id = ${attendeeId}
      AND copy_id = ${copyId}
      AND return_time IS NULL;

      UPDATE games.copies
      SET available = true
      WHERE copy_id = ${copyId};
    `;

    db
      .query(returnQuery)
      .then(() => {
        res.status(201).send('Copy returned successfully')
      })
      .catch(err => {
        console.log(err);
        res.status(500).send(`Error returning game: ${err}`);
      });
  },
  getCheckoutsByTitle: (req, res) => {
    let { titleId } = req.query;
    titleId = titleId.slice(1);

    let selectQuery = `
      SELECT 'C' || ch.copy_id as copy_id, a.name, ch.checkout_time, ch.return_time
      FROM games.checkouts ch
      INNER JOIN attendees a
      ON ch.attendee_id = a.attendee_id
      INNER JOIN games.copies c
      ON ch.copy_id = c.copy_id
      INNER JOIN games.titles t
      ON t.title_id = c.title_id
      WHERE t.title_id = ${titleId};
    `;

    db
      .query(selectQuery)
      .then(data => {
        res.status(200).send(data.rows);
      })
      .catch(err => {
        console.log(err);
        res.status(500).send(`Error getting checkout data: ${err}`);
      });
  },
  increaseUnavailabilityCount: (req, res) => {

  }
  // TODO: checkout functions
};
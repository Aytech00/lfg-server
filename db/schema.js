const db = require('./index.js');

// TODO: add nickname to attendees
// TODO: change age to DOB
// TODO: add badge type column (A(ttendee), V(endor), G(uest)), (M)anager, (S)ecurity
// TODO: add city & state cols. Not optional.
// TODO: add password
// TODO: add uuid registration col

// TODO: add tier to event table to indicate prizing level

db
.query(`
    DROP TABLE IF EXISTS attendees, events, event_attendees;
    DROP SCHEMA IF EXISTS games CASCADE;

    DO $$ BEGIN
      CREATE TYPE badges as ENUM ('A', 'V', 'G', 'M', 'S');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  
    CREATE TABLE IF NOT EXISTS attendees (
      attendee_id SERIAL PRIMARY KEY,
      registration_id UUID,
      name TEXT,
      nickname TEXT,
      DOB DATE,
      address TEXT,
      city TEXT,
      state TEXT,
      phone_number TEXT,
      email TEXT,
      VIP BOOLEAN,
      badge_type BADGES,
      notes TEXT [] DEFAULT array[]::varchar[],
      password TEXT,
      badge_dates DATE [] DEFAULT array[]::date[]
    );

    ALTER SEQUENCE attendees_attendee_id_seq RESTART WITH 1;

    CREATE TABLE IF NOT EXISTS events (
      event_id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price NUMERIC(5, 2) DEFAULT 0,
      date DATE NOT NULL,
      start_time TIME,
      category TEXT,
      details TEXT,
      player_cap SMALLINT DEFAULT 0,
      link TEXT,
      waitlist BOOLEAN DEFAULT FALSE
    );

    ALTER SEQUENCE events_event_id_seq RESTART WITH 1;

    CREATE TABLE IF NOT EXISTS event_attendees (
      attendee_id INTEGER,
      event_id INTEGER,
      waitlisted BOOLEAN DEFAULT FALSE
    );

    CREATE SCHEMA games
      CREATE TABLE IF NOT EXISTS titles (
        title_id SERIAL NOT NULL PRIMARY KEY,
        name TEXT NOT NULL,
        genre TEXT,
        details TEXT,
        num_players SMALLINT,
        play_time text,
        unavailability_count SMALLINT DEFAULT 0
      )

      CREATE TABLE IF NOT EXISTS copies (
        copy_id SERIAL PRIMARY KEY,
        title_id INTEGER,
        available BOOLEAN DEFAULT TRUE,
        notes text [] DEFAULT array[]::varchar[]
      )

      CREATE TABLE IF NOT EXISTS checkouts (
        copy_id INTEGER,
        attendee_id INTEGER,
        checkout_time TIMESTAMP,
        return_time TIMESTAMP
      );

      ALTER SEQUENCE games.titles_title_id_seq RESTART WITH 1;
      ALTER SEQUENCE games.copies_copy_id_seq RESTART WITH 1;
  `)
  .then(() => {
    console.log('ATTENDEE, EVENT, and EVENT_ATTENDEES TABLES CREATED. GAME schema created with TITLES, COPIES, and CHECKOUTS tables.');
    db.end();
  })
  .catch(err => {
    console.log(err);
    db.end();
  });

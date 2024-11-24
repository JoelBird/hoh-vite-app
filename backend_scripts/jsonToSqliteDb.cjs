const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const jsonData = require('./updatedMemberDict.json'); // Adjust the path if necessary

const db = new sqlite3.Database('members.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS members (
    discordId TEXT PRIMARY KEY,
    discordName TEXT,
    stargazeWallets TEXT,
    stakedPrettyvenomNfts TEXT,
    stakedDynamiteNfts TEXT,
    stakedSteamlandNfts TEXT,
    unclaimed$BPOP TEXT,
    claimed$BPOP TEXT,
    unclaimed$STEAM TEXT,
    claimed$STEAM TEXT
  )`);

  const stmt = db.prepare(
    `INSERT OR REPLACE INTO members (
      discordId, discordName, stargazeWallets, stakedPrettyvenomNfts, stakedDynamiteNfts, stakedSteamlandNfts,
      unclaimed$BPOP, claimed$BPOP, unclaimed$STEAM, claimed$STEAM
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  for (const memberId in jsonData) {
    const member = jsonData[memberId];
    stmt.run(
      member.discordId,
      member.discordName,
      JSON.stringify(member.stargazeWallets),
      JSON.stringify(member.stakedPrettyvenomNfts),
      JSON.stringify(member.stakedDynamiteNfts),
      JSON.stringify(member.stakedSteamlandNfts),
      member.unclaimed$BPOP,
      member.claimed$BPOP,
      member.unclaimed$STEAM,
      member.claimed$STEAM,
      (err) => {
        if (err) {
          console.error("Error inserting member data:", err);
        } else {
          console.log(`Member data for ${member.discordId} inserted successfully`);
        }
      }
    );
  }

  stmt.finalize();
});

db.close((err) => {
  if (err) {
    console.error('Failed to close the database connection:', err);
  } else {
    console.log('Database connection closed.');
  }
});

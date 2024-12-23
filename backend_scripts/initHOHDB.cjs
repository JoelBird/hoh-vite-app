const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('HOH.db');


const propertyValuesData = {
  housingDuration: 86400,
  housingGold: 1000,
  housingNumberLastUsed: 0,
  retailDuration: 0,
  retailGold: 1000 ,
  retailNumberLastUsed: 0,
  retailAvailableSpells: {
    "lightningBolt": {
      spellName: "lightningBolt",
      spellChance: "25",
      spellDamage: "30",
      spellRarity: "epic"
    },
    "fireBall": {
      spellName: "fireBall",
      spellChance: "50",
      spellDamage: "20",
      spellRarity: "rare"
    },
    "acidRain": {
      spellName: "acidRain",
      spellChance: "75",
      spellDamage: "10",
      spellRarity: "common"
    },
  },
  militaryDuration: 259200,
  militaryGold: 1000,
  militaryNumberLastUsed: 0,
  hospitalityGold: 200,
  hospitalityNumberLastUsed: 0,
  stakingGoldReward: 10,
  agricultureDuration: 64800,
  agricultureGold: 50,
  agricultureNumberLastUsed: 0,
  productionDuration: 64800,
  productionGold: 50,
  productionNumberLastUsed: 0,
  governmentGold: 500,
  governmentNumberLastUsed: 0,
};

// Initialize all database tables if they don't exist
db.serialize(() => {
  // Create 'heroes' table
  db.run(`CREATE TABLE IF NOT EXISTS heroes (
    tokenId TEXT PRIMARY KEY,
    contractAddress TEXT,
    heroName TEXT,
    heroClass TEXT,
    heroAttack TEXT,
    heroDefence TEXT,
    stakedStatus TEXT,
    hasClaimedStake TEXT,
    aliveStatus TEXT,
    interactionStatus TEXT,
    interactionId TEXT,
    currentHolderWallet TEXT,
    currentHolderDiscordName TEXT,
    currentHolderDiscordId TEXT,
    imageLink TEXT,
    totalGoldEarned TEXT,
    holderTotalGoldEarned TEXT,
    totalWins TEXT,
    holderWins TEXT,
    totalLosses TEXT,
    holderLosses TEXT
  )`);

  // Create 'members' table and insert data
  db.run(`CREATE TABLE IF NOT EXISTS members (
    discordId TEXT PRIMARY KEY,
    discordName TEXT,
    wins TEXT,
    losses TEXT,
    wallets TEXT,
    heroOptionsPosition TEXT,
    goldSentToGovernment TEXT,
    availableSpells TEXT
  )`);
  
  
  // Create 'properties' table
  db.run(`CREATE TABLE IF NOT EXISTS properties (
    tokenId TEXT PRIMARY KEY,
    contractAddress TEXT,
    currentHolderWallet TEXT,
    currentHolderDiscordName TEXT,
    currentHolderDiscordId TEXT,
    propertyNumber TEXT,
    propertyName TEXT,
    propertyType TEXT,
    propertyRentalValue TEXT,
    propertyLevel TEXT,
    imageLink TEXT,
    totalGoldEarned TEXT,
    holderTotalGoldEarned TEXT,
    totalTransactions TEXT,
    holderTotalTransactions TEXT,
    hasClaimedRent TEXT
  )`);

  // Create 'propertyInteractions' table
  db.run(`CREATE TABLE IF NOT EXISTS propertyInteractions (
    interactionId TEXT PRIMARY KEY,
    propertyName TEXT,
    propertyTokenId TEXT,
    propertyType TEXT,
    propertyGoldEarned TEXT,
    interactionDuration TEXT,
    interactionConcluded TEXT,
    propertyHolderWalletAddress TEXT,
    propertyHolderDiscordName TEXT,
    heroName TEXT,
    heroTokenId TEXT,
    heroWillReceive TEXT,
    interactionStartTime TEXT,
    heroHolderWalletAddress TEXT,
    heroHolderDiscordName TEXT
  )`);

  // Create 'propertyValues' table and insert data
  db.run(`CREATE TABLE IF NOT EXISTS propertyValues (
    housingDuration INTEGER,
    housingGold INTEGER,
    housingNumberLastUsed INTEGER,
    retailDuration INTEGER,
    retailGold INTEGER,
    retailNumberLastUsed INTEGER,
    retailAvailableSpells TEXT,
    militaryDuration INTEGER,
    militaryGold INTEGER,
    militaryNumberLastUsed INTEGER,
    hospitalityGold INTEGER,
    hospitalityNumberLastUsed INTEGER,
    stakingGoldReward TEXT,
    agricultureDuration INTEGER,
    agricultureGold INTEGER,
    agricultureNumberLastUsed INTEGER,
    productionDuration INTEGER,
    productionGold INTEGER,
    productionNumberLastUsed INTEGER,
    governmentGold INTEGER,
    governmentNumberLastUsed INTEGER
  )`, () => {
    const stmt = db.prepare(
      `INSERT OR REPLACE INTO propertyValues (
        housingDuration, housingGold,
        housingNumberLastUsed, retailDuration, retailGold, retailNumberLastUsed, retailAvailableSpells, militaryDuration, militaryGold, militaryNumberLastUsed,
        hospitalityGold, hospitalityNumberLastUsed, stakingGoldReward, agricultureDuration, agricultureGold, agricultureNumberLastUsed, productionDuration, productionGold, productionNumberLastUsed, governmentGold, governmentNumberLastUsed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    stmt.run(
      propertyValuesData.housingDuration,
      propertyValuesData.housingGold,
      propertyValuesData.housingNumberLastUsed,
      propertyValuesData.retailDuration,
      propertyValuesData.retailGold,
      propertyValuesData.retailNumberLastUsed,
      JSON.stringify(propertyValuesData.retailAvailableSpells),
      propertyValuesData.militaryDuration,
      propertyValuesData.militaryGold,
      propertyValuesData.militaryNumberLastUsed,
      propertyValuesData.hospitalityGold,
      propertyValuesData.hospitalityNumberLastUsed,
      propertyValuesData.stakingGoldReward,
      propertyValuesData.agricultureDuration,
      propertyValuesData.agricultureGold,
      propertyValuesData.agricultureNumberLastUsed,
      propertyValuesData.productionDuration,
      propertyValuesData.productionGold,
      propertyValuesData.productionNumberLastUsed,
      propertyValuesData.governmentGold,
      propertyValuesData.governmentNumberLastUsed,
      (err) => {
        if (err) {
          console.error("Error inserting propertyValues data:", err);
        } else {
          console.log("propertyValues inserted successfully");
        }

        // Now, close the database connection after all operations
        db.close((err) => {
          if (err) {
            console.error("Error closing the database:", err);
          } else {
            console.log("Database closed successfully");
          }
        });
      }
    );
    stmt.finalize();
  });
});

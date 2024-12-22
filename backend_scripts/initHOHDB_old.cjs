const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('HOH.db');


const propertyValuesData = {
  heroGoldEarnedPerInteraction: 100,
  PropertyGoldEarnedPerInteraction: 100,
  propertyInteractionDuration: 21600,
  housingDuration: 21600,
  housingGold: 100,
  housingNumberLastUsed: 0,
  retailDuration: 0,
  retailGold: 100,
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
  militaryDuration: 21600,
  militaryGold: 100,
  militaryNumberLastUsed: 0,
  hospitalityGold: 100,
  hospitalityNumberLastUsed: 0,
  agricultureDuration: 21600,
  agricultureGold: 100,
  agricultureNumberLastUsed: 0,
  productionDuration: 21600,
  productionGold: 100,
  productionNumberLastUsed: 0,
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
    imageLink TEXT,
    totalGoldEarned TEXT,
    holderTotalGoldEarned TEXT,
    totalTransactions TEXT,
    holderTotalTransactions TEXT
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
    heroGoldEarnedPerInteraction INTEGER PRIMARY KEY,
    PropertyGoldEarnedPerInteraction INTEGER,
    propertyInteractionDuration INTEGER,
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
    agricultureDuration INTEGER,
    agricultureGold INTEGER,
    agricultureNumberLastUsed INTEGER,
    productionDuration INTEGER,
    productionGold INTEGER,
    productionNumberLastUsed INTEGER,
    governmentNumberLastUsed INTEGER
  )`, () => {
    const stmt = db.prepare(
      `INSERT OR REPLACE INTO propertyValues (
        heroGoldEarnedPerInteraction, PropertyGoldEarnedPerInteraction, propertyInteractionDuration, housingDuration, housingGold,
        housingNumberLastUsed, retailDuration, retailGold, retailNumberLastUsed, retailAvailableSpells, militaryDuration, militaryGold, militaryNumberLastUsed,
        hospitalityGold, hospitalityNumberLastUsed, agricultureDuration, agricultureGold, agricultureNumberLastUsed, productionDuration, productionGold, productionNumberLastUsed, governmentNumberLastUsed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    stmt.run(
      propertyValuesData.heroGoldEarnedPerInteraction,
      propertyValuesData.PropertyGoldEarnedPerInteraction,
      propertyValuesData.propertyInteractionDuration,
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
      propertyValuesData.agricultureDuration,
      propertyValuesData.agricultureGold,
      propertyValuesData.agricultureNumberLastUsed,
      propertyValuesData.productionDuration,
      propertyValuesData.productionGold,
      propertyValuesData.productionNumberLastUsed,
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

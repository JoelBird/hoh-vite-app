import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import https from 'https';
import cron from 'node-cron';
import ethers from "ethers";

// Load environment variables
dotenv.config(); 

const ENVIRONMENT = process.env.ENVIRONMENT || 'development';
const envFilePath = `.env.${ENVIRONMENT}`;
dotenv.config({ path: envFilePath });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

if (!process.env.REACT_APP_CLIENT_URL) {
  console.error("REACT_APP_CLIENT_URL is not defined in the environment variables.");
  process.exit(1);
}

console.log(`ENVIRONMENT: ${ENVIRONMENT}`);
console.log(`Client URL: ${process.env.REACT_APP_CLIENT_URL}`);
console.log(`API URL: ${process.env.REACT_APP_API_URL}`);
console.log(`Discord Client ID: ${process.env.DISCORD_CLIENT_ID}`);
console.log(`Discord Client Secret: ${process.env.DISCORD_CLIENT_SECRET}`);
console.log(`Discord Redirect URI: ${process.env.DISCORD_REDIRECT_URI}`);
console.log(`Path to HOHDB: ${process.env.PATH_TO_HOHDB}`);

app.use(cors());
app.use(express.json());

const sqlite3 = await import('sqlite3').then(mod => mod.default).catch(err => {
  console.error('Failed to import sqlite3:', err);
  process.exit(1);
});

const dbPath = process.env.PATH_TO_HOHDB;
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Run the cron job every 5 minutes
cron.schedule('*/5 * * * *', () => {
  const currentTime = Math.floor(Date.now() / 1000); // current time in Unix seconds
  let updateSuccesful = true;

  // First, select heroTokenId from propertyInteractions where interaction has expired and interactionConcluded is false
  const selectQuery = `
    SELECT heroTokenId, heroWillReceive, heroName, heroHolderWalletAddress, propertyHolderWalletAddress, interactionId
    FROM propertyInteractions
    WHERE (interactionStartTime + interactionDuration) <= ? AND interactionConcluded = 'false'
  `;

  db.all(selectQuery, [currentTime], async (err, rows) => {
    if (err) {
      console.error('Error selecting interactions:', err.message);
      return;
    }

    for (const row of rows) {
      const { heroTokenId, heroWillReceive, heroName, heroHolderWalletAddress, propertyHolderWalletAddress, interactionId } = row;

      // Check heroWillReceive for specific actions
      if (heroWillReceive === 'Attack' || heroWillReceive === 'Defence') {
        if (!heroName || !heroWillReceive) {
          return res.status(400).json({ success: false, message: "Missing parameters" });
        }

        try {
          // Call the updateHeroTrait function
          const result = await updateHeroTrait(heroName, heroWillReceive);
        
          if (result.success) {
            // Log success message
            console.log({
              success: true,
              message: `Hero trait updated successfully: ${result.message}`,
            });
          } else {
            // Log failure message from the function result
            console.log({
              success: false,
              message: `Hero trait update failed: ${result.message}`,
            });
        
            // Handle failure case by marking the process unsuccessful
            updateSuccesful = false;
          }
        } catch (error) {
          // Catch unexpected errors and log them
          console.error("Unexpected error updating hero trait:", error);
        
          // Log failure and mark update as unsuccessful
          console.log({
            success: false,
            message: "Unexpected error occurred during hero trait update",
            error: error.message,
          });
          updateSuccesful = false;
        }
        
        // After updating, set interactionStatus and interactionId to NULL in heroes
        const updateHeroStatusQuery = `
          UPDATE heroes
          SET interactionStatus = 'false', interactionId = NULL
          WHERE tokenId = ? AND interactionStatus = 'true'
        `;
        db.run(updateHeroStatusQuery, [heroTokenId], function (updateErr) {
          if (updateErr) {
            console.error('Error updating heroes interaction status:', updateErr.message);
          }
        });
      } else if (heroWillReceive === '100 HGLD') {
          const addresses = [heroHolderWalletAddress, propertyHolderWalletAddress];
          for (const recipientAddress of addresses) {
            try {
              if (!recipientAddress || !ethers.utils.isAddress(recipientAddress)) {
                console.error(`Invalid recipient address: ${recipientAddress}`);
                throw new Error(`Invalid address: ${recipientAddress}`);
              }
              const amount = heroWillReceive.replace(/\D/g, '');
              const transactionHash = await sendHGLD(recipientAddress, amount);
          
              // Log success message
              console.log({
                success: true,
                message: `Transaction ${transactionHash} completed successfully`,
                transactionHash,
              });
            } catch (error) {
              console.error('Error sending HGLD tokens:', error);
          
              // Log failure and set updateSuccesful to false
              console.log({
                success: false,
                message: 'Transaction failed',
                error: error.message,
              });
              updateSuccesful = false; // Mark as false if any transaction fails

              // Kill the server
              process.exit(1);
            }
          }

        // Reset interaction status for HGLD transfer
        const updateHeroStatusQuery = `
          UPDATE heroes
          SET interactionStatus = 'false', interactionId = NULL
          WHERE tokenId = ? AND interactionStatus = 'true'
        `;
        db.run(updateHeroStatusQuery, [heroTokenId], function (updateErr) {
          if (updateErr) {
            console.error('Error updating heroes interaction status:', updateErr.message);
          }
        });
      } else if (heroWillReceive === 'Revive') {
        // If heroWillReceive is "revive", set aliveStatus to "true", and reset interactionStatus and interactionId
        const updateHeroAliveStatusQuery = `
          UPDATE heroes
          SET aliveStatus = 'alive', interactionStatus = 'false', interactionId = NULL
          WHERE tokenId = ? AND interactionStatus = 'true'
        `;
        db.run(updateHeroAliveStatusQuery, [heroTokenId], function (reviveErr) {
          if (reviveErr) {
            console.error('Error reviving hero:', reviveErr.message);
            updateSuccesful = false;
          } else {
            console.log(`Hero ${heroTokenId} has been revived.`);
          }
        });
      }

      if (updateSuccesful) {
        // Update propertyInteractions to set interactionConcluded to 'true'
        const updateInteractionQuery = `
          UPDATE propertyInteractions
          SET interactionConcluded = 'true'
          WHERE interactionId = ?
        `;
        db.run(updateInteractionQuery, [interactionId], function (concludeErr) {
          if (concludeErr) {
            console.error('Error concluding interaction:', concludeErr.message);
          } else {
            console.log(`Concluded interaction ${interactionId}.`);
          }
        })
    }else {
        console.log("Updating Interaction failed. Interaction has not been concluded");
        // Handle the case where at least one transaction failed
      }
    }
  });
});



// Endpoint to add a spell to a member's availableSpells
app.post("/api/addSpell", (req, res) => {
  const { spellName, walletAddress } = req.body;

  console.log('---inside endpoint---');
  console.log(spellName);
  console.log(walletAddress);

  if (!spellName || !walletAddress) {
    return res.status(400).json({ error: "spellName and walletAddress are required" });
  }

  // Query to find the member with the specified walletAddress
  db.get(
    `SELECT discordId, availableSpells, wallets FROM members WHERE wallets LIKE ?`,
    [`%${walletAddress}%`],
    (err, row) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (!row) {
        return res.status(404).json({ error: "Member with given walletAddress not found" });
      }

      // Parse availableSpells if it's a JSON array or create an empty array if null
      let availableSpells = row.availableSpells ? JSON.parse(row.availableSpells) : [];

      // Append only the spell name as a string
      availableSpells.push(spellName);

      // Update the availableSpells field in the database
      db.run(
        `UPDATE members SET availableSpells = ? WHERE discordId = ?`,
        [JSON.stringify(availableSpells), row.discordId],
        (updateErr) => {
          if (updateErr) {
            console.error("Error updating availableSpells:", updateErr);
            return res.status(500).json({ error: "Failed to update availableSpells" });
          }

          res.json({ message: "Spell added successfully", availableSpells });
        }
      );
    }
  );
});


// Endpoint to remove a spell from a member's availableSpells
app.post("/api/removeSpell", (req, res) => {
  const { memberId, spellName } = req.body;

  if (!memberId || !spellName) {
    return res.status(400).json({ error: "memberId and spellName are required" });
  }

  // Fetch the current availableSpells for the member
  db.get(
    `SELECT availableSpells FROM members WHERE discordId = ?`,
    [memberId],
    (err, row) => {
      if (err) {
        console.error("Error fetching member data:", err);
        return res.status(500).json({ error: "Failed to fetch member data" });
      }

      if (!row) {
        return res.status(404).json({ error: "Member not found" });
      }

      // Parse the availableSpells into a JavaScript array
      let availableSpells = JSON.parse(row.availableSpells || "[]");

      // Remove the spellName from the array
      const updatedSpells = availableSpells.filter(spell => spell !== spellName);

      // Update the database with the new availableSpells array
      db.run(
        `UPDATE members SET availableSpells = ? WHERE discordId = ?`,
        [JSON.stringify(updatedSpells), memberId],
        function (updateErr) {
          if (updateErr) {
            console.error("Error updating member data:", updateErr);
            return res.status(500).json({ error: "Failed to update member data" });
          }

          res.json({
            success: true,
            message: "Spell removed successfully",
            affectedRows: this.changes,
          });
        }
      );
    }
  );
});



async function sendHGLD(toAddress, amount) {

  const jsonFile = "./abi.json";
  const abi = JSON.parse(fs.readFileSync(jsonFile));
  const tokenContract = "0x539025fc166d49e63E4C30De1205164D06157d2a";
  const infuraProjectId = "a31017990a434050ab5b5dad42ba299a";
  const signerPrivateKey = "0d246f5e20df3147e9fa17040148fa3c65c025bf457692ac7db8844ed5e189fa";
  const network = "matic";

  // Configuring the connection to the Polygon network via Infura
  const provider = new ethers.providers.InfuraProvider(
    network,
    infuraProjectId
  );

  const contract = new ethers.Contract(tokenContract, abi, provider);
  const signer = new ethers.Wallet(signerPrivateKey, provider);

  try {
    // Define the transaction data
    const data = contract.interface.encodeFunctionData("transfer", [toAddress, ethers.utils.parseUnits(amount.toString(), 18)]);

    // Estimate the gas limit for the transaction
    const gasLimit = await provider.estimateGas({
      from: signer.address,
      to: tokenContract,
      data: data,
    });

    // console.log("Estimated Gas Limit:", gasLimit.toString());

    // Send the transaction
    const tx = await signer.sendTransaction({
      to: tokenContract,
      data: data,
      gasLimit: gasLimit,
      maxPriorityFeePerGas: ethers.utils.parseUnits("100", "gwei"), // Fixed priority fee
      maxFeePerGas: ethers.utils.parseUnits("100", "gwei"), // Fixed max fee
      nonce: await signer.getTransactionCount(),
      chainId: 137, // Polygon mainnet
    });

    console.log("Mining transaction...");
    console.log(`https://polygonscan.com/tx/${tx.hash}`);

    // Waiting for the transaction to be mined
    const receipt = await tx.wait();
    console.log(`Mined in block ${receipt.blockNumber}`);
    return(receipt.transactionHash)
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw new Error(error.message || "Transaction failed");
  }
}




// Endpoint to send HGLD tokens
app.post('/api/send-hgld', async (req, res) => {
  const { recipientAddress, amount } = req.body;
  const apiKey = req.headers['x-api-key'];

  // Validate the API key inline within the endpoint
  if (apiKey !== process.env.SERVER_API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid API key' });
  }

  // Validate request parameters
  if (!recipientAddress || !amount) {
    return res.status(400).json({ error: 'Missing recipient address or amount' });
  }

  try {
    // Call the sendHGLDTokens function
    const transactionHash = await sendHGLD(recipientAddress, amount);

    // Respond with the transaction hash
    res.json({
      success: true,
      message: `Transaction ${transactionHash} completed successfully`,
      transactionHash,
    });
  } catch (error) {
    console.error('Error sending HGLD tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Transaction failed',
      error: error.message,
    });
  }
});

async function updateHeroTrait(heroName, selectedTrainingTrait) {
  console.log(heroName);
  console.log(selectedTrainingTrait);

  const druidsFilePath = path.join(__dirname, "niftykitDruids.json");
  const knightsFilePath = path.join(__dirname, "niftykitKnights.json");

  const findHeroInFile = (filePath) => {
    try {
      const data = fs.readFileSync(filePath, "utf8");
      const jsonData = JSON.parse(data);

      const hero = jsonData.data.find((item) => item.metadata.name === heroName);
      return hero ? { heroId: hero.id, collectionId: hero.collectionId } : null;
    } catch (error) {
      console.error(`Error reading or parsing file ${filePath}:`, error);
      return null;
    }
  };

  let heroData = findHeroInFile(druidsFilePath) || findHeroInFile(knightsFilePath);

  if (!heroData) {
    console.error("Hero not found");
    return { success: false, message: "Hero not found" };
  }

  const { heroId, collectionId } = heroData;
  const apiKey =
    collectionId === "cllh7qn0h0003l90f9kbvwu1x"
      ? process.env.NIFTYKIT_DRUIDS_API
      : collectionId === "clf9105en0001mt0fb9ag6udc"
      ? process.env.NIFTYKIT_KNIGHTS_API
      : null;

  if (!apiKey) {
    console.error("Invalid collection ID");
    return { success: false, message: "Invalid collection ID" };
  }

  try {
    // Fetch the hero data
    const response = await axios.get(`https://api.niftykit.com/v3/collections/tokens/${heroId}`, {
      headers: { accept: "application/json", "x-api-key": apiKey },
    });

    const heroMetadata = response.data.metadata;

    const traitToUpdate = heroMetadata.attributes.find(
      (attr) => attr.trait_type === "Defence"
    );

    if (!traitToUpdate) {
      console.error("Trait not found in hero attributes");
      return { success: false, message: "Trait not found" };
    }

    // Increment the trait's value
    const currentValue = parseInt(traitToUpdate.value.match(/\d+/)[0]);
    traitToUpdate.value = `${traitToUpdate.value.replace(/\d+/, "").trim()} ${currentValue + 1}`;

    // Construct only the necessary payload
    const payload = {
      id: heroId,
      tokenId: response.data.tokenId,
      collectionId: response.data.collectionId,
      metadata: heroMetadata, // Use the modified metadata
    };

    // Send the update request
    await axios.put(
      `https://api.niftykit.com/v3/collections/tokens/${heroId}`,
      payload,
      {
        headers: {
          accept: "application/json",
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Hero trait updated successfully");
    return { success: true, message: "Hero trait updated successfully" };
  } catch (error) {
    console.error("Error updating hero trait:", error);
    return { success: false, message: "Error updating hero trait" };
  }
}



app.post("/api/update-hero-trait", async (req, res) => {
  const { heroName, selectedTrainingTrait } = req.body;

  if (!heroName || !selectedTrainingTrait) {
    return res.status(400).json({ success: false, message: "Missing parameters" });
  }

  const result = await updateHeroTrait(heroName, selectedTrainingTrait);
  res.status(result.success ? 200 : 500).json(result);
});





app.get("/api/getRow", (req, res) => {
  const { id, table } = req.query;
  let sql;
  let params = [id];

  // Define SQL queries based on the table and provided id parameter
  switch (table) {
    case "heroes":
      // Check if id appears to be a heroName (string) or tokenId
      if (isNaN(id)) {
        sql = "SELECT * FROM heroes WHERE heroName = ?";
      } else {
        sql = "SELECT * FROM heroes WHERE tokenId = ?";
      }
      break;
    case "members":
      sql = "SELECT * FROM members WHERE discordId = ?";
      break;
    case "properties":
      sql = "SELECT * FROM properties WHERE tokenId = ?";
      break;
    case "propertyInteractions":
      sql = "SELECT * FROM propertyInteractions WHERE interactionId = ?";
      break;
    case "propertyValues":
      // Since propertyValues has only one row, no id is needed.
      sql = "SELECT * FROM propertyValues";
      params = [];
      break;
    default:
      return res.status(400).json({ error: "Invalid table specified." });
  }

  // Execute the query based on whether an id is required
  db.get(sql, params, (err, row) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).json({ error: "Database query error." });
    } else if (!row) {
      res.status(404).json({ error: "Row not found." });
    } else {
      res.json(row);
    }
  });
});

app.get("/api/getPropertyByNumber", (req, res) => {
  const { propertyNumber, propertyType } = req.query;

  // Validate that required query parameters are present
  if (!propertyNumber || !propertyType) {
    console.error("Missing query parameters:", { propertyNumber, propertyType });
    return res.status(400).json({ error: "Missing required query parameters: propertyNumber and propertyType" });
  }

  // SQL query to select rows in 'properties' matching propertyNumber and propertyType
  const sql = `
    SELECT * FROM properties 
    WHERE propertyNumber = ? AND propertyType = ?`;

  // Execute the query
  db.get(sql, [propertyNumber, propertyType], (err, row) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Database query error." });
    } 

    if (!row) {
      console.warn(`No property found for propertyNumber: ${propertyNumber} and propertyType: ${propertyType}`);
      return res.status(404).json({ error: `Property with propertyNumber ${propertyNumber} and propertyType ${propertyType} not found.` });
    }

    // Respond with the found row
    res.json(row);
  });
});

// Endpoint to add a row to the propertyInteractions table
app.post('/addPropertyInteraction', (req, res) => {
  const {
    propertyName,
    propertyTokenId,
    propertyType,
    propertyGold,
    interactionDuration,
    interactionConcluded,
    propertyHolderWalletAddress,
    propertyHolderDiscordName,
    heroName,
    heroTokenId,
    heroWillReceive,
    heroHolderWalletAddress,
    heroHolderDiscordName,
  } = req.body;

  // Calculate interactionId and interactionStartTime
  const interactionStartTime = Math.floor(Date.now() / 1000);

  db.get('SELECT MAX(interactionId) AS maxId FROM propertyInteractions', (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    const interactionId = row.maxId ? parseInt(row.maxId) + 1 : 1;

    // Insert new row into propertyInteractions table
    db.run(
      `INSERT INTO propertyInteractions (
        interactionId,
        propertyName,
        propertyTokenId,
        propertyType,
        propertyGoldEarned,
        interactionDuration,
        interactionConcluded,
        propertyHolderWalletAddress,
        propertyHolderDiscordName,
        heroName,
        heroTokenId,
        heroWillReceive,
        interactionStartTime,
        heroHolderWalletAddress,
        heroHolderDiscordName
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        interactionId,
        propertyName,
        propertyTokenId,
        propertyType,
        propertyGold,
        interactionDuration,
        interactionConcluded,
        propertyHolderWalletAddress,
        propertyHolderDiscordName,
        heroName,
        heroTokenId,
        heroWillReceive,
        interactionStartTime,
        heroHolderWalletAddress,
        heroHolderDiscordName,
      ],
      function (insertErr) {
        if (insertErr) {
          return res.status(500).json({ error: 'Failed to insert data' });
        }

        // Update the hero's interactionStatus and interactionId in the heroes table
        db.run(
          `UPDATE heroes 
           SET interactionStatus = 'true', 
               interactionId = ? 
           WHERE tokenId = ?`,
          [interactionId, heroTokenId],
          function (updateErr) {
            if (updateErr) {
              return res.status(500).json({ error: 'Failed to update hero interaction status' });
            }

            // Update the properties table
            db.run(
              `UPDATE properties
               SET totalTransactions = totalTransactions + 1,
                   holderTotalTransactions = holderTotalTransactions + 1,
                   totalGoldEarned = totalGoldEarned + ?,
                   holderTotalGoldEarned = holderTotalGoldEarned + ?
               WHERE tokenId = ?`,
              [propertyGold, propertyGold, propertyTokenId],
              function (propertiesUpdateErr) {
                if (propertiesUpdateErr) {
                  return res.status(500).json({ error: 'Failed to update properties table' });
                }

                // Respond with success and return interaction data
                res.status(200).json({
                  message: 'Property interaction added successfully and hero interaction updated',
                  heroId: heroTokenId,
                  interactionId,
                  interactionStatus: 'true',
                });
              }
            );
          }
        );
      }
    );
  });
});


app.get("/api/getHeroTokenId", (req, res) => {
  const { heroName } = req.query;

  // SQL query to select the tokenId from the heroes table where heroName matches
  const sql = `
    SELECT tokenId FROM heroes 
    WHERE heroName = ?`;

  // Execute the query
  db.get(sql, [heroName], (err, row) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).json({ error: "Database query error." });
    } else if (!row) {
      res.status(404).json({ error: "Hero not found." });
    } else {
      res.json({ tokenId: row.tokenId });
    }
  });
});

// Endpoint to update the aliveStatus of defeated heroes
app.post('/api/update-defeated-heroes', (req, res) => {
  const { defeatedHeroes } = req.body;

  if (!defeatedHeroes || !Array.isArray(defeatedHeroes)) {
    return res.status(400).json({ error: 'Invalid or missing defeatedHeroes list' });
  }

  // SQL query to update aliveStatus to "dead"
  const placeholders = defeatedHeroes.map(() => '?').join(', ');
  const query = `UPDATE heroes SET aliveStatus = 'dead' WHERE heroName IN (${placeholders})`;

  db.run(query, defeatedHeroes, function (err) {
    if (err) {
      console.error('Error updating heroes:', err.message);
      return res.status(500).json({ error: 'Failed to update heroes' });
    }

    res.json({
      success: true,
      message: `${this.changes} hero(es) updated successfully`,
    });
  });
});


app.post('/api/add-member', (req, res) => {
  const { id, username, address } = req.body;

  if (!id || !username || !address) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Query to find if the member already exists
  db.get(`SELECT * FROM members WHERE discordId = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!row) {
      // If the member doesn't exist, create a new one
      const wallets = JSON.stringify([address]);

      db.run(
        `INSERT INTO members (discordId, discordName, wins, losses, wallets, heroOptionsPosition, goldSentToGovernment, availableSpells) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, username, "0", "0", wallets, "0", "0", JSON.stringify([])],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error creating member' });
          }
          return res.status(200).json({ message: 'Member created successfully' });
        }
      );
    } else {
      // If the member exists, check if the wallet is already in the wallets array
      const wallets = JSON.parse(row.wallets);

      if (!wallets.includes(address)) {
        // Append the new wallet to the list if it's not already there
        wallets.push(address);

        db.run(
          `UPDATE members SET wallets = ? WHERE discordId = ?`,
          [JSON.stringify(wallets), id],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Error updating member' });
            }
            return res.status(200).json({ message: 'Member updated successfully' });
          }
        );
      } else {
        return res.status(200).json({ message: 'Wallet already exists for this member' });
      }
    }
  });
});

// Endpoint to get hero names where currentHolderWallet = walletAddress and aliveStatus = "dead"
app.get('/api/dead-heroes/:walletAddress', (req, res) => {
  const walletAddress = req.params.walletAddress;

  // SQL query to get only heroName with currentHolderWallet = walletAssddress and aliveStatus = "dead"
  const sql = `SELECT heroName FROM heroes WHERE currentHolderWallet = ? AND aliveStatus = "dead"`;

  db.all(sql, [walletAddress], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Extract just the heroName values from the rows
    const heroNames = rows.map(row => row.heroName);

    // Send the result as JSON
    res.json({
      walletAddress: walletAddress,
      deadHeroes: heroNames
    });
  });
});

// Endpoint to get hero names where currentHolderWallet = walletAddress and aliveStatus = "alive"
app.get('/api/alive-heroes/:walletAddress', (req, res) => {
  const walletAddress = req.params.walletAddress;

  // SQL query to get only heroName with currentHolderWallet = walletAddress and aliveStatus = "alive"
  const sql = `SELECT heroName FROM heroes WHERE currentHolderWallet = ? AND aliveStatus = "alive"`;

  db.all(sql, [walletAddress], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Extract just the heroName values from the rows
    const heroNames = rows.map(row => row.heroName);

    // Send the result as JSON
    res.json({
      walletAddress: walletAddress,
      aliveHeroes: heroNames
    });
  });
});





// Get Member
app.get('/api/member/:id', (req, res) => {
  const discordId = req.params.id;
  db.get("SELECT * FROM members WHERE discordId = ?", [discordId], (err, row) => {
    if (err) {
      console.error('Error reading member:', err);
      res.status(500).send('Server error');
    } else {
      if (row) {
        const member = {
          discordName: row.discordName,
          discordId: row.discordId,
          wins: row.wins,
          losses: row.losses,
          wallets: JSON.parse(row.wallets),
          heroOptionsPosition: JSON.parse(row.heroOptionsPosition),
          goldSentToGovernment: row.goldSentToGovernment,
          availableSpells: JSON.parse(row.availableSpells)
        };
        res.json(member);
      } else {
        res.status(404).send('Member not found');
      }
    }
  });
});


//getMembersTableValue
app.get('/api/member/:id/:key', (req, res) => {
  const discordId = req.params.id;
  const key = req.params.key;

  db.get("SELECT * FROM members WHERE discordId = ?", [discordId], (err, row) => {
    if (err) {
      console.error('Error reading member:', err);
      res.status(500).send('Server error');
    } else {
      if (row) {
        // Check if the requested key exists in the row
        if (row.hasOwnProperty(key)) {
          // If the value is a JSON string, parse it; otherwise, send it as is
          let value = row[key];
          try {
            value = JSON.parse(value);
          } catch (e) {
            // Value was not JSON, so just return as-is
          }
          res.json({ [key]: value });
        } else {
          res.status(400).send('Invalid key');
        }
      } else {
        res.status(404).send('Member not found');
      }
    }
  });
});

// Update a specific key's value for a member
app.put('/api/member/update', async (req, res) => {
  const {discordId, key, newValue } = req.body; 

  // First, check if the key exists in the table schema
  db.all("PRAGMA table_info(members)", [], (err, columns) => {
    if (err) {
      console.error('Error reading table schema:', err);
      return res.status(500).send('Server error');
    }

    // columns is now an array, so we can use map
    const columnNames = columns.map(col => col.name);
    if (!columnNames.includes(key)) {
      return res.status(400).send('Invalid key');
    }

    // Prepare to update the specific key with the new value
    const query = `UPDATE members SET ${key} = ? WHERE discordId = ?`;

    db.run(query, [newValue, discordId], function(err) {
      if (err) {
        console.error('Error updating member:', err);
        return res.status(500).send('Server error');
      }

      // Check if any rows were affected
      if (this.changes === 0) {
        return res.status(404).send('Member not found');
      }

      res.send('Member updated successfully');
    });
  });
});


//Get random member
app.get('/api/member/random', (req, res) => {
  // Query to select a random row from the members table
  db.get("SELECT * FROM members ORDER BY RANDOM() LIMIT 1", [], (err, row) => {
    if (err) {
      console.error('Error reading member:', err);
      res.status(500).send('Server error');
    } else {
      if (row) {
        // Return the random member data
        res.json(row);
      } else {
        res.status(404).send('No members found');
      }
    }
  });
});


// Get All members
app.get('/api/members', (req, res) => {
  // Query to select all rows from the members table
  db.all("SELECT * FROM members", [], (err, rows) => {
    if (err) {
      console.error('Error reading members:', err);
      res.status(500).send('Server error');
    } else {
      // Return all members as JSON
      res.json(rows);
    }
  });
});



app.post('/api/member', (req, res) => {
  const member = req.body;
  const stmt = db.prepare(
    `INSERT OR REPLACE INTO members (
      discordId, discordName, wins, losses, wallets, heroOptionsPosition, goldSentToGovernment, availableSpells
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  stmt.run(
    member.discordId,
    member.discordName,
    member.wins,
    member.losses,
    JSON.stringify(member.wallets),
    JSON.stringify(member.heroOptionsPosition),
    member.goldSentToGovernment,
    JSON.stringify(member.availableSpells),
    (err) => {
      if (err) {
        console.error('Error writing member:', err);
        res.status(500).send('Server error');
      } else {
        res.send('Member updated successfully');
      }
    }
  );
  stmt.finalize();
});

//Get all member Ids
app.get('/api/members/ids', (req, res) => {
  db.all("SELECT discordId FROM members", (err, rows) => {
    if (err) {
      console.error('Error retrieving discord IDs:', err);
      res.status(500).send('Server error');
    } else {
      const discordIds = rows.map(row => row.discordId);
      res.json(discordIds);
    }
  });
});

const axiosWithRetry = async (options, maxAttempts = 5, delay = 2000) => {
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      return await axios(options);
    } catch (error) {
      attempts++;
      console.error(`Attempt ${attempts} failed:`, error.message);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      }
      if (attempts < maxAttempts) {
        console.log(`Retrying in ${attempts * delay} milliseconds...`);
        await new Promise((resolve) => setTimeout(resolve, attempts * delay));
      } else {
        throw new Error('Max retry attempts reached. Unable to complete the request.');
      }
    }
  }
};

app.get('/auth/discord', (req, res) => {
  const redirectUri = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${process.env.DISCORD_REDIRECT_URI}&response_type=code&scope=identify`;
  res.redirect(redirectUri);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  const data = {
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
  };

  try {
    const tokenResponse = await axiosWithRetry({
      method: 'post',
      url: 'https://discord.com/api/oauth2/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: new URLSearchParams(data).toString(),
    });

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axiosWithRetry({
      method: 'get',
      url: 'https://discord.com/api/users/@me',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const user = userResponse.data;
    res.redirect(`${process.env.REACT_APP_CLIENT_URL}?user=${encodeURIComponent(JSON.stringify(user))}`);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send('Error during authentication');
  }
});





// API to fetch NFTs from Moralis and store them in the database
app.post('/api/fetchNfts', async (req, res) => {
  let { walletAddress, collectionChain, collectionAddress, collection, user } = req.body;
  // if (collection == "property"){ //////duds = 0x478FFba8eA4945fB9327812231dfB1c6cAFD2C49 0x4d1CB1C6Cd01b93735619fC1340E413659Da1C44 0x54819dE751495DCC0450763f728ca9B2E85105a4 0x89B824ab6DC29dB6366e590e08a1f224CC3F4b15
  //   walletAddress = "0x8AC65B1D807EB2C8BbB04B90c3Aee2E49aaCD6A7" //0xABA4414Cc3bc819268dFdd14a8e5DA2300443aa1 = 19 no military 0x8AC65B1D807EB2C8BbB04B90c3Aee2E49aaCD6A7 = military
  // }

  const resolveIPFSLinkHero = (imageLink) => {
    if (imageLink && imageLink.startsWith("ipfs://")) {
      const ipfsHash = imageLink.split("ipfs://")[1];
      return `https://${ipfsHash}.ipfs.nftstorage.link/`; // IPFS gateway URL transformation
    }
    return imageLink;
  };

  const resolveIPFSLinkProperty = (imageLink) => {
    if (imageLink && imageLink.startsWith("ipfs://")) {
        // Extract the IPFS hash and the file path
        const [ipfsHash, filePath] = imageLink.split("ipfs://")[1].split("/");
        return `https://${ipfsHash}.ipfs.nftstorage.link/${filePath}`; // IPFS gateway URL transformation
    }
    return imageLink;
};


// NOTE: This function is asynchronous and uses 'await' to ensure sequential execution.
// We added 'await' to database operations (db.get, db.run) to avoid race conditions
// when accessing and updating the 'properties' table. This ensures that propertyNumber 
// and other values are calculated correctly before proceeding to the next property.
const storeProperty = async (tokenId, metadata, walletAddress, user) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM properties WHERE tokenId = ?`, [tokenId], async (err, row) => {
      if (err) {
        console.error("Error checking property in database:", err);
        return reject(err);
      }
      const propertyType = metadata['attributes']?.find(attr => attr.trait_type === 'Property Type')?.value || 'Unknown';

      if (!row) {
        // Count how many properties of the same type already exist
        const result = await new Promise((resolveCount, rejectCount) => {
          db.get(`SELECT COUNT(*) as total FROM properties WHERE propertyType = ?`, [propertyType], (err, result) => {
            if (err) {
              console.error("Error counting properties of this type:", err);
              return rejectCount(err);
            }
            resolveCount(result);
          });
        });
        
        const propertyNumber = result.total + 1;

        // Insert the new property
        db.run(
          `INSERT INTO properties (tokenId, contractAddress, currentHolderWallet, currentHolderDiscordName, currentHolderDiscordId, propertyNumber, propertyName, propertyType, imageLink, totalGoldEarned, holderTotalGoldEarned, totalTransactions, holderTotalTransactions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            tokenId,
            collectionAddress,
            walletAddress,
            user.username,
            user.id,
            propertyNumber,
            metadata.name,
            propertyType,
            resolveIPFSLinkProperty(metadata.image),
            0,
            0,
            0,
            0,
          ],
          (err) => {
            if (err) {
              console.error("Error inserting property:", err);
              return reject(err);
            }
            console.log(`Property ${metadata.name} added to the database.`);
            
            // Fetch the newly inserted row
            db.get(`SELECT * FROM properties WHERE tokenId = ?`, [tokenId], (err, newRow) => {
              if (err) {
                console.error("Error fetching new property:", err);
                return reject(err);
              } else {
                return resolve(newRow); // Resolve with the new row data
              }
            });
          }
        );
      } else {
        // If the property exists, check if the holder has changed
        if (row.currentHolderWallet !== walletAddress) {
          db.run(
            `UPDATE properties 
             SET currentHolderWallet = ?, 
                 currentHolderDiscordName = ?, 
                 currentHolderDiscordId = ?,
                 holderTotalGoldEarned = ?,
                 holderTotalTransactions = ?
             WHERE tokenId = ?`,
            [walletAddress, user.username, user.id, "0", "0", tokenId],
            (err) => {
              if (err) {
                console.error("Error updating property holder:", err);
                return reject(err);
              }
              console.log(`Updated property ${tokenId} holder to ${walletAddress}.`);
              return resolve(row); // Return updated property data
            }
          );
        } else {
          return resolve(row); // Return existing property data if nothing changed
        }
      }
    });
  });
};



  // Function to store hero in the database
const storeHero = async (tokenId, metadata, heroClass, walletAddress, user) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM heroes WHERE tokenId = ?`, [tokenId], async (err, row) => {
      if (err) {
        console.error("Error checking hero in database:", err);
        return reject(err);
      }

      if (!row) {
        // Insert the new hero
        db.run(
          `INSERT INTO heroes (tokenId, contractAddress, heroName, heroClass, stakedStatus, aliveStatus, interactionStatus, interactionId, currentHolderWallet, currentHolderDiscordName, currentHolderDiscordId, imageLink, totalGoldEarned, holderTotalGoldEarned, totalWins, holderWins, totalLosses, holderLosses) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [tokenId, collectionAddress, metadata.name, heroClass, "unstaked", "alive", "false", "none", walletAddress, user.username, user.id, resolveIPFSLinkHero(metadata.image), "0", "0", "0", "0", "0", "0"],
          (err) => {
            if (err) {
              console.error("Error inserting hero:", err);
              return reject(err);
            } else {
              console.log(`Hero ${metadata.name} added to the database.`);
              // Fetch the newly inserted row
              db.get(`SELECT * FROM heroes WHERE tokenId = ?`, [tokenId], (err, newRow) => {
                if (err) {
                  console.error("Error fetching new hero:", err);
                  return reject(err);
                } else {
                  return resolve(newRow); // Resolve with the new row data
                }
              });
            }
          }
        );
      } else {
        // If the hero already exists, check if the holder has changed
        if (row.currentHolderWallet !== walletAddress) {
          // Update the current holder if it's different
          db.run(
            `UPDATE heroes 
            SET currentHolderWallet = ?, 
                currentHolderDiscordName = ?, 
                currentHolderDiscordId = ? 
            WHERE tokenId = ?`, 
            [walletAddress, user.username, user.id, tokenId],
            (err) => {
              if (err) {
                console.error("Error updating hero holder:", err);
                return reject(err);
              } else {
                return resolve(row); // Return existing hero data after update
              }
            }
          );
        } else {
          return resolve(row); // Return existing hero data if nothing changed
        }
      }
    });
  });
};


  
    let cursor = null;
    let page = 0;
    const maxPages = 10; // Limit to avoid endless loops
    let nfts = [];

    // Fetch NFTs for the single wallet address
    while (page < maxPages) {
      const response = await axios.get(
        `https://deep-index.moralis.io/api/v2/${walletAddress}/nft`,
        {
          headers: {
            accept: "application/json",
            "X-API-Key": process.env.MORALIS_API_KEY,
          },
          params: {
            chain: collectionChain,
            format: "decimal",
            cursor: cursor || undefined,
            media_items: false,
          },
        }
      );
      const { result, cursor: nextCursor } = response.data;

      //Iterate through each nft and push to list for response
      for (const nft of result.filter(nft => nft.token_address.toLowerCase() === collectionAddress.toLowerCase())) {

        let metadata
        metadata = JSON.parse(nft.metadata); //json string to javascript object - THIS IS REQUIRED

        
    
        if (collection === "property") {
          // console.log(' --- nft below ---')
          // console.log(nft)

          const propertyData = await storeProperty(nft.token_id, metadata, walletAddress, user);
          // console.log('----- propertyData -----')
          // console.log(propertyData)
          nfts.push({
            tokenId: propertyData.tokenId,
            name: propertyData.propertyName,
            image: resolveIPFSLinkProperty(propertyData.imageLink),
            propertyName: propertyData.name,
            propertyType: propertyData.propertyType,
            holderTotalGoldEarned: propertyData.holderTotalGoldEarned,
            holderTotalTransactions: propertyData.holderTotalTransactions,
          });
        } else if (collection === "druid" || collection === "knight") {
          
          const heroClass = collection === "druid" ? "druid" : "knight";
          // Store hero or check if already exists
         
          const heroData = await storeHero(nft.token_id, metadata, heroClass, walletAddress, user);
          // console.log('---- heroData -----')
          // console.log(heroData)
          nfts.push({
            tokenId: heroData.tokenId,
            name: heroData.heroName,
            image: resolveIPFSLinkHero(heroData.imageLink),
            stakedStatus: heroData.stakedStatus,
            aliveStatus: heroData.aliveStatus,
            interactionStatus: heroData.interactionStatus,
            interactionId: heroData.interactionId
          });
        }
      }
      
      
      if (!nextCursor) break;
      cursor = nextCursor;
      page++;
    }

    res.json(nfts);
  
});

// Endpoint to get all rows from the propertyInteractions table
app.get('/api/fetchPropertyInteractions', (req, res) => {
  const query = 'SELECT * FROM propertyInteractions';

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching data:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(rows);
    }
  });
});



if (ENVIRONMENT === 'production') {
  const httpsOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/www.heroesnft.app/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/www.heroesnft.app/fullchain.pem'),
  };

  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`HTTPS server is running on port ${PORT}`);
  });
} else {
  http.createServer(app).listen(PORT, () => {
    console.log(`HTTP server is running on port ${PORT}`);
  });
};

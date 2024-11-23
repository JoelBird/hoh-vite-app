const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('members.db');

// Function to remove a wallet from a member's entry
function removeWalletFromMember(discordId, walletToRemove) {
  db.serialize(() => {
    db.get("SELECT * FROM members WHERE discordId = ?", [discordId], (err, row) => {
      if (err) {
        console.error('Error reading member:', err);
        return;
      }
      if (row) {
        const stargazeWallets = JSON.parse(row.stargazeWallets);
        const updatedWallets = stargazeWallets.filter(wallet => wallet !== walletToRemove);

        const stmt = db.prepare(
          `UPDATE members SET stargazeWallets = ? WHERE discordId = ?`
        );
        stmt.run(
          JSON.stringify(updatedWallets),
          discordId,
          (err) => {
            if (err) {
              console.error('Error updating member:', err);
            } else {
              console.log(`Wallet ${walletToRemove} removed from member with discordId: ${discordId}`);
            }
            stmt.finalize(() => {
              db.close((err) => {
                if (err) {
                  console.error('Error closing the database:', err);
                } else {
                  console.log('Database connection closed.');
                }
              });
            });
          }
        );
      } else {
        console.log(`Member with discordId ${discordId} not found`);
        db.close((err) => {
          if (err) {
            console.error('Error closing the database:', err);
          } else {
            console.log('Database connection closed.');
          }
        });
      }
    });
  });
}

// Replace these values with the actual discordId and wallet to remove
const discordId = '960601733556482108';
const walletToRemove = 'stars1gwnuppa66zyagv32jwlvdqdqes96vn2sjdfrne';

removeWalletFromMember(discordId, walletToRemove);

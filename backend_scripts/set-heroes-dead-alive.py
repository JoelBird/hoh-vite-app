import sqlite3

# Path to your HOH.db SQLite database file
db_path = "../HOH.db"

def alternate_heroes_alive_status():
    try:
        # Connect to the SQLite database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # SQL query to set every other hero's aliveStatus to 'alive' and the rest to 'dead'
        update_alive_query = "UPDATE heroes SET aliveStatus = 'alive' WHERE ROWID % 2 = 1"
        update_dead_query = "UPDATE heroes SET aliveStatus = 'dead' WHERE ROWID % 2 = 0"

        # Execute the update queries
        cursor.execute(update_alive_query)
        cursor.execute(update_dead_query)

        # Commit the changes to the database
        conn.commit()

        # Check how many rows were updated for each status
        alive_rows = cursor.rowcount
        print(f"Successfully updated {alive_rows} rows to 'alive' status alternately.")
        
        cursor.execute(update_dead_query)
        dead_rows = cursor.rowcount
        print(f"Successfully updated {dead_rows} rows to 'dead' status alternately.")

    except sqlite3.Error as error:
        print(f"Error while updating aliveStatus in heroes table: {error}")
    finally:
        if conn:
            # Close the database connection
            conn.close()

if __name__ == "__main__":
    alternate_heroes_alive_status()

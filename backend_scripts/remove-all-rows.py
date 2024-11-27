import sqlite3

# Connect to the SQLite database
db_path = '../HOH.db'  # Ensure the database path is correct
conn = sqlite3.connect(db_path)

try:
    # Create a cursor object
    cursor = conn.cursor()

    # Execute the DELETE query to remove all rows from propertyInteractions
    cursor.execute("DELETE FROM propertyInteractions")

    # Commit the changes to the database
    conn.commit()

    print("All rows from the 'propertyInteractions' table have been removed.")

except sqlite3.Error as e:
    print(f"An error occurred: {e}")

finally:
    # Close the connection
    conn.close()

import sqlite3

def check_database(db_file):
    # Connect to the SQLite database
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    # List of table names to check and print
    tables = ['heroes', 'members', 'properties', 'propertyInteractions', 'propertyValues']

    for table in tables:
        print(f"\n--- Checking Table: {table} ---")
        
        # Check if the table exists
        cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}';")
        table_exists = cursor.fetchone()
        if not table_exists:
            print(f"Table '{table}' does not exist.")
            continue
        
        # Fetch column names
        cursor.execute(f"PRAGMA table_info({table});")
        columns = cursor.fetchall()
        column_names = [column[1] for column in columns]
        
        # Fetch all rows from the table
        cursor.execute(f"SELECT * FROM {table}")
        rows = cursor.fetchall()

        # Check if there are any rows in the table
        if not rows:
            print(f"Table '{table}' is empty.")
            continue
        
        # Print the fetched rows in a readable format
        for row in rows:
            print('--------------------------------')
            for col_name, value in zip(column_names, row):
                print(f"{col_name}: {value}")
            print('--------------------------------')

    # Close the connection
    conn.close()

# File path
db_file = '../HOH.db'

# Run the check
check_database(db_file)

#!/usr/bin/env python3

import os
import sys
from sqlalchemy import create_engine, text

# Set up database connection
DATABASE_URL = 'postgresql://postgres:postgres@localhost:54322/postgres'
engine = create_engine(DATABASE_URL)

def check_table_schema(table_name):
    """Check the schema of a specific table"""
    print(f'\n=== {table_name.upper()} TABLE SCHEMA ===')
    
    with engine.connect() as conn:
        result = conn.execute(text(f'''
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = '{table_name}' 
            ORDER BY ordinal_position
        '''))
        
        for row in result:
            nullable = "YES" if row[2] == "YES" else "NO"
            default = row[3] or "None"
            print(f'{row[0]:<25} {row[1]:<20} nullable={nullable:<3} default={default}')

def main():
    tables = ['policies', 'agreements', 'instalments', 'clients']
    
    print("Checking database schema for all tables...")
    
    for table in tables:
        try:
            check_table_schema(table)
        except Exception as e:
            print(f"Error checking {table}: {e}")
    
    print("\n=== CHECKING CONSTRAINTS ===")
    
    with engine.connect() as conn:
        # Check constraints for instalments table
        result = conn.execute(text('''
            SELECT constraint_name, constraint_type, column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.constraint_column_usage ccu 
                ON tc.constraint_name = ccu.constraint_name
            WHERE tc.table_name = 'instalments'
            ORDER BY tc.constraint_name
        '''))
        
        print("\nInstalments table constraints:")
        for row in result:
            print(f'{row[0]:<30} {row[1]:<15} column={row[2]}')

if __name__ == "__main__":
    main()

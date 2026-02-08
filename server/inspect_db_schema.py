#!/usr/bin/env python3
"""
Script to inspect the live database schema and compare with models.py and seed.py
"""
import os
from sqlalchemy import create_engine, text, inspect
from database import engine
from models import Base

def get_table_columns(table_name):
    """Get all columns for a table from the database"""
    with engine.connect() as conn:
        result = conn.execute(text(f"""
            SELECT 
                column_name, 
                data_type, 
                is_nullable,
                column_default,
                character_maximum_length
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = '{table_name}'
            ORDER BY ordinal_position
        """))
        return list(result)

def get_table_names():
    """Get all table names from the database"""
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """))
        return [row[0] for row in result]

def get_enum_types():
    """Get all enum types from the database"""
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT typname, array_agg(enumlabel ORDER BY enumsortorder) as labels
            FROM pg_type t 
            JOIN pg_enum e ON t.oid = e.enumtypid  
            WHERE typname LIKE '%_enum'
            GROUP BY typname
            ORDER BY typname
        """))
        return {row[0]: row[1] for row in result}

def main():
    print("=" * 80)
    print("LIVE DATABASE SCHEMA INSPECTION")
    print("=" * 80)
    
    try:
        # Test connection
        with engine.connect() as conn:
            db_info = conn.execute(text("SELECT current_database(), version()")).first()
            print(f"\n✅ Connected to database: {db_info[0]}")
            print(f"PostgreSQL version: {db_info[1].split(',')[0]}\n")
        
        # Get all tables
        tables = get_table_names()
        print(f"Found {len(tables)} tables: {', '.join(tables)}\n")
        
        # Get enum types
        enums = get_enum_types()
        if enums:
            print("Enum types:")
            for enum_name, labels in enums.items():
                print(f"  - {enum_name}: {labels}")
            print()
        
        # Check key tables
        key_tables = ['organisations', 'users', 'memberships', 'membership_invitations',
                     'clients', 'policies', 'agreements', 'instalments',
                     'agreement_access_tokens', 'audit_logs']
        
        print("=" * 80)
        print("DETAILED TABLE SCHEMAS")
        print("=" * 80)
        
        for table_name in key_tables:
            if table_name in tables:
                print(f"\n📋 Table: {table_name}")
                print("-" * 80)
                columns = get_table_columns(table_name)
                for col in columns:
                    col_name, data_type, nullable, default, max_length = col
                    nullable_str = "NULL" if nullable == "YES" else "NOT NULL"
                    default_str = f" DEFAULT {default}" if default else ""
                    length_str = f"({max_length})" if max_length else ""
                    print(f"  {col_name:<30} {data_type}{length_str:<20} {nullable_str}{default_str}")
            else:
                print(f"\n❌ Table '{table_name}' does NOT exist in database")
        
        # Check Instalment table specifically for field name mismatch
        if 'instalments' in tables:
            print("\n" + "=" * 80)
            print("INSTALMENT TABLE FIELD ANALYSIS")
            print("=" * 80)
            columns = get_table_columns('instalments')
            column_names = [col[0] for col in columns]
            print(f"\nActual columns in database: {column_names}")
            print("\nseed.py uses:")
            print("  - sequence")
            print("  - amount_due")
            print("  - amount_paid")
            print("\nmodels.py defines:")
            print("  - sequence_number")
            print("  - amount_pennies")
            print("\nMatch analysis:")
            if 'sequence_number' in column_names:
                print("  ✅ sequence_number exists (matches models.py)")
            if 'sequence' in column_names:
                print("  ✅ sequence exists (matches seed.py)")
            if 'amount_pennies' in column_names:
                print("  ✅ amount_pennies exists (matches models.py)")
            if 'amount_due' in column_names:
                print("  ✅ amount_due exists (matches seed.py)")
            if 'amount_paid' in column_names:
                print("  ✅ amount_paid exists (matches seed.py)")
        
    except Exception as e:
        print(f"\n❌ Error connecting to database: {e}")
        print("\nMake sure DATABASE_URL is set in your .env file")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()


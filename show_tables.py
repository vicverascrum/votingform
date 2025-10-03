#!/usr/bin/env python3
import mysql.connector

config = {
    'host': 'votingform-results.czi2i0iyyp0m.us-east-1.rds.amazonaws.com',
    'user': 'admin',
    'password': 'VotingForm2025!',
    'database': 'sprint_voting',
    'port': 3306
}

def show_table_structure():
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        
        print("📊 ESTRUCTURA DE LAS TABLAS:")
        print("=" * 60)
        
        # Tabla voting_results
        print("\n🗳️  TABLA: voting_results")
        print("-" * 40)
        cursor.execute("DESCRIBE voting_results")
        for field in cursor.fetchall():
            print(f"   {field[0]:<20} | {field[1]:<15} | {field[2]:<5} | {field[3]}")
        
        # Tabla question_selections  
        print("\n📝 TABLA: question_selections")
        print("-" * 40)
        cursor.execute("DESCRIBE question_selections")
        for field in cursor.fetchall():
            print(f"   {field[0]:<20} | {field[1]:<15} | {field[2]:<5} | {field[3]}")
            
        # Mostrar datos actuales
        print("\n📈 DATOS ACTUALES:")
        print("-" * 40)
        cursor.execute("SELECT email, total_hours, capacity_percentage, submission_date FROM voting_results")
        results = cursor.fetchall()
        
        for result in results:
            print(f"   📧 {result[0]}")
            print(f"   ⏰ {result[3]}")
            print(f"   📊 {result[1]}h ({result[2]:.1f}%)")
            print()
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    show_table_structure()

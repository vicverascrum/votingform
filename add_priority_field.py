#!/usr/bin/env python3
import mysql.connector

config = {
    'host': 'votingform-results.czi2i0iyyp0m.us-east-1.rds.amazonaws.com',
    'user': 'admin',
    'password': 'VotingForm2025!',
    'database': 'sprint_voting',
    'port': 3306
}

def add_priority_field():
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        
        print("🔧 Agregando campo de prioridad...")
        
        # Agregar campo priority a question_selections
        cursor.execute("""
            ALTER TABLE question_selections 
            ADD COLUMN priority_order INT DEFAULT NULL
        """)
        
        print("✅ Campo 'priority_order' agregado a question_selections")
        
        # Mostrar estructura actualizada
        print("\n📊 ESTRUCTURA ACTUALIZADA:")
        print("-" * 50)
        cursor.execute("DESCRIBE question_selections")
        for field in cursor.fetchall():
            print(f"   {field[0]:<20} | {field[1]:<15}")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("\n✅ Base de datos actualizada correctamente!")
        
    except mysql.connector.Error as err:
        if "Duplicate column name" in str(err):
            print("ℹ️  El campo 'priority_order' ya existe")
        else:
            print(f"❌ Error: {err}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    add_priority_field()

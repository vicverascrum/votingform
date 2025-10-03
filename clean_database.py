#!/usr/bin/env python3
import mysql.connector

config = {
    'host': 'votingform-results.czi2i0iyyp0m.us-east-1.rds.amazonaws.com',
    'user': 'admin',
    'password': 'VotingForm2025!',
    'database': 'sprint_voting',
    'port': 3306
}

def clean_database():
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        
        print("🧹 Limpiando base de datos...")
        
        # Mostrar tablas actuales
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print(f"\n📋 Tablas actuales: {[table[0] for table in tables]}")
        
        # Eliminar tablas innecesarias
        tables_to_drop = [
            'voting_results',
            'question_selections', 
            'individual_votes',
            'voting_summary'
        ]
        
        for table in tables_to_drop:
            try:
                cursor.execute(f"DROP TABLE IF EXISTS {table}")
                print(f"   ❌ Eliminada: {table}")
            except Exception as e:
                print(f"   ⚠️  No se pudo eliminar {table}: {e}")
        
        # Verificar que solo quede votes_simple
        cursor.execute("SHOW TABLES")
        remaining_tables = cursor.fetchall()
        
        print(f"\n✅ Tablas restantes: {[table[0] for table in remaining_tables]}")
        
        # Mostrar estructura de votes_simple
        print(f"\n📊 ESTRUCTURA FINAL - votes_simple:")
        print("-" * 50)
        cursor.execute("DESCRIBE votes_simple")
        for field in cursor.fetchall():
            print(f"   {field[0]:<25} | {field[1]:<15}")
        
        # Mostrar datos actuales
        cursor.execute("SELECT COUNT(*) FROM votes_simple")
        count = cursor.fetchone()[0]
        print(f"\n📈 Registros en votes_simple: {count}")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("\n✅ Base de datos limpia!")
        print("📊 Solo queda la tabla 'votes_simple' - ¡Perfecta!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    clean_database()

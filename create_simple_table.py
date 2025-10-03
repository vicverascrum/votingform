#!/usr/bin/env python3
import mysql.connector

config = {
    'host': 'votingform-results.czi2i0iyyp0m.us-east-1.rds.amazonaws.com',
    'user': 'admin',
    'password': 'VotingForm2025!',
    'database': 'sprint_voting',
    'port': 3306
}

def create_simple_table():
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        
        print("🔧 Creando tabla simple como solicitaste...")
        
        # Crear tabla simple
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS votes_simple (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_horas INT NOT NULL,
                preguntas_seleccionadas TEXT NOT NULL,
                INDEX idx_email (email),
                INDEX idx_fecha (fecha_envio)
            )
        """)
        
        print("✅ Tabla 'votes_simple' creada")
        
        # Mostrar estructura
        print("\n📊 ESTRUCTURA DE LA TABLA:")
        print("-" * 50)
        cursor.execute("DESCRIBE votes_simple")
        for field in cursor.fetchall():
            print(f"   {field[0]:<25} | {field[1]:<15}")
        
        # Insertar ejemplo
        print("\n📝 Insertando ejemplo...")
        cursor.execute("""
            INSERT INTO votes_simple (email, total_horas, preguntas_seleccionadas)
            VALUES (%s, %s, %s)
        """, (
            'ejemplo@foundever.com',
            202,
            'question1 (Low), question9 (Medium), question12 (Very High)'
        ))
        
        conn.commit()
        
        # Mostrar datos
        print("\n📊 DATOS DE EJEMPLO:")
        cursor.execute("SELECT * FROM votes_simple")
        for row in cursor.fetchall():
            print(f"   ID: {row[0]}")
            print(f"   Email: {row[1]}")
            print(f"   Fecha: {row[2]}")
            print(f"   Total horas: {row[3]}")
            print(f"   Preguntas: {row[4]}")
        
        cursor.close()
        conn.close()
        
        print("\n✅ Tabla simple creada correctamente!")
        print("\n📋 CAMPOS:")
        print("   • email - Email del usuario")
        print("   • fecha_envio - Fecha y hora automática")
        print("   • total_horas - Total de horas seleccionadas")
        print("   • preguntas_seleccionadas - Texto libre con preguntas y prioridad")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    create_simple_table()

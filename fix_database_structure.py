#!/usr/bin/env python3
import mysql.connector

config = {
    'host': 'votingform-results.czi2i0iyyp0m.us-east-1.rds.amazonaws.com',
    'user': 'admin',
    'password': 'VotingForm2025!',
    'database': 'sprint_voting',
    'port': 3306
}

def fix_database_structure():
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        
        print("🔧 Reestructurando base de datos para votos individuales...")
        
        # Crear nueva tabla para votos individuales por persona
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS individual_votes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                question_id VARCHAR(50) NOT NULL,
                question_title VARCHAR(500) NOT NULL,
                estimated_hours INT,
                complexity VARCHAR(50),
                category VARCHAR(100),
                priority_order INT,
                vote_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                sprint_number INT NOT NULL DEFAULT 24,
                ip_address VARCHAR(45),
                INDEX idx_email (email),
                INDEX idx_question (question_id),
                INDEX idx_sprint (sprint_number),
                INDEX idx_date (vote_date),
                UNIQUE KEY unique_vote (email, question_id, sprint_number)
            )
        """)
        
        print("✅ Tabla 'individual_votes' creada")
        
        # Crear tabla de resumen por persona
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS voting_summary (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                total_questions_selected INT NOT NULL,
                total_hours INT NOT NULL,
                capacity_percentage DECIMAL(5,2) NOT NULL,
                sprint_number INT NOT NULL DEFAULT 24,
                submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ip_address VARCHAR(45),
                INDEX idx_email (email),
                INDEX idx_sprint (sprint_number),
                INDEX idx_date (submission_date),
                UNIQUE KEY unique_submission (email, sprint_number)
            )
        """)
        
        print("✅ Tabla 'voting_summary' creada")
        
        # Mostrar estructura
        print("\n📊 NUEVA ESTRUCTURA:")
        print("-" * 50)
        
        print("\n🗳️  TABLA: individual_votes (votos por persona)")
        cursor.execute("DESCRIBE individual_votes")
        for field in cursor.fetchall():
            print(f"   {field[0]:<20} | {field[1]:<15}")
            
        print("\n📊 TABLA: voting_summary (resumen por persona)")
        cursor.execute("DESCRIBE voting_summary")
        for field in cursor.fetchall():
            print(f"   {field[0]:<20} | {field[1]:<15}")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("\n✅ Base de datos reestructurada correctamente!")
        print("\n📋 NUEVA LÓGICA:")
        print("   • individual_votes: Un registro por cada pregunta votada")
        print("   • voting_summary: Un resumen por persona")
        print("   • Permite ver votos individuales y totales")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    fix_database_structure()

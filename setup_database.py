#!/usr/bin/env python3
import mysql.connector
import json
from datetime import datetime

# Database connection details
config = {
    'host': 'votingform-results.czi2i0iyyp0m.us-east-1.rds.amazonaws.com',
    'user': 'admin',
    'password': 'VotingForm2025!',
    'database': 'sprint_voting',
    'port': 3306
}

def setup_database():
    try:
        print("🔗 Conectando a la base de datos...")
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        
        print("📋 Creando tabla voting_results...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS voting_results (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                selected_items JSON NOT NULL,
                total_hours INT NOT NULL,
                capacity_percentage DECIMAL(5,2) NOT NULL,
                sprint_number INT NOT NULL DEFAULT 24,
                submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ip_address VARCHAR(45),
                INDEX idx_email (email),
                INDEX idx_sprint (sprint_number),
                INDEX idx_date (submission_date)
            )
        """)
        
        print("📋 Creando tabla question_selections...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS question_selections (
                id INT AUTO_INCREMENT PRIMARY KEY,
                voting_result_id INT NOT NULL,
                question_id VARCHAR(50) NOT NULL,
                question_title VARCHAR(500) NOT NULL,
                estimated_hours INT,
                complexity VARCHAR(50),
                category VARCHAR(100),
                FOREIGN KEY (voting_result_id) REFERENCES voting_results(id) ON DELETE CASCADE,
                INDEX idx_question (question_id),
                INDEX idx_category (category)
            )
        """)
        
        print("📊 Insertando datos de prueba...")
        test_data = {
            'email': 'test@foundever.com',
            'selected_items': ['question1', 'question3'],
            'total_hours': 50,
            'capacity_percentage': 19.23,
            'sprint_number': 24
        }
        
        cursor.execute("""
            INSERT INTO voting_results 
            (email, selected_items, total_hours, capacity_percentage, sprint_number) 
            VALUES (%s, %s, %s, %s, %s)
        """, (
            test_data['email'],
            json.dumps(test_data['selected_items']),
            test_data['total_hours'],
            test_data['capacity_percentage'],
            test_data['sprint_number']
        ))
        
        # Verificar que todo funciona
        cursor.execute("SELECT COUNT(*) FROM voting_results")
        count = cursor.fetchone()[0]
        
        conn.commit()
        print(f"✅ Base de datos configurada correctamente!")
        print(f"📊 Registros en voting_results: {count}")
        print(f"🔗 Endpoint: {config['host']}")
        print(f"📝 Base de datos: {config['database']}")
        
        cursor.close()
        conn.close()
        
        return True
        
    except mysql.connector.Error as err:
        print(f"❌ Error: {err}")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False

if __name__ == "__main__":
    setup_database()

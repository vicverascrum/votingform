#!/usr/bin/env python3
import mysql.connector

config = {
    'host': 'votingform-results.czi2i0iyyp0m.us-east-1.rds.amazonaws.com',
    'user': 'admin',
    'password': 'VotingForm2025!',
    'database': 'sprint_voting',
    'port': 3306
}

def test_new_structure():
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        
        print("🧪 Probando nueva estructura con datos de ejemplo...")
        
        # Simular votación de una persona
        email = "maria.garcia@foundever.com"
        sprint = 24
        
        # Votos individuales
        votes = [
            {
                'question_id': 'question1',
                'title': 'Reporting column alignment',
                'hours': 2,
                'complexity': 'Low',
                'category': 'Reporting',
                'priority': 1
            },
            {
                'question_id': 'question9', 
                'title': 'Associate Evaluation Form grace period',
                'hours': None,
                'complexity': 'Medium',
                'category': 'Evaluation',
                'priority': 2
            },
            {
                'question_id': 'question12',
                'title': 'OJT Workspace- Action Plans and Contact Logs', 
                'hours': 200,
                'complexity': 'Very High',
                'category': 'OJT',
                'priority': 3
            }
        ]
        
        # Insertar votos individuales
        print(f"📝 Insertando votos de: {email}")
        for vote in votes:
            cursor.execute("""
                INSERT INTO individual_votes 
                (email, question_id, question_title, estimated_hours, complexity, category, priority_order, sprint_number)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                priority_order = VALUES(priority_order),
                estimated_hours = VALUES(estimated_hours)
            """, (
                email,
                vote['question_id'],
                vote['title'],
                vote['hours'],
                vote['complexity'],
                vote['category'],
                vote['priority'],
                sprint
            ))
            print(f"   ✅ {vote['question_id']} - Prioridad {vote['priority']}")
        
        # Calcular totales
        total_hours = sum(v['hours'] for v in votes if v['hours'])
        capacity_percentage = (total_hours / 260) * 100
        
        # Insertar resumen
        cursor.execute("""
            INSERT INTO voting_summary
            (email, total_questions_selected, total_hours, capacity_percentage, sprint_number)
            VALUES (%s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
            total_questions_selected = VALUES(total_questions_selected),
            total_hours = VALUES(total_hours),
            capacity_percentage = VALUES(capacity_percentage),
            submission_date = CURRENT_TIMESTAMP
        """, (
            email,
            len(votes),
            total_hours,
            capacity_percentage,
            sprint
        ))
        
        conn.commit()
        
        # Mostrar resultados
        print(f"\n📊 RESUMEN: {total_hours}h ({capacity_percentage:.1f}%)")
        
        # Consultar votos por persona
        print(f"\n🗳️  VOTOS INDIVIDUALES DE {email}:")
        cursor.execute("""
            SELECT question_id, question_title, estimated_hours, priority_order, complexity
            FROM individual_votes 
            WHERE email = %s AND sprint_number = %s
            ORDER BY priority_order ASC
        """, (email, sprint))
        
        for vote in cursor.fetchall():
            hours = f"{vote[2]}h" if vote[2] else "TBD"
            print(f"   {vote[3]}. {vote[0]} - {hours} ({vote[4]})")
            print(f"      '{vote[1][:60]}...'")
        
        # Mostrar todos los resúmenes
        print(f"\n📈 TODOS LOS RESÚMENES:")
        cursor.execute("""
            SELECT email, total_questions_selected, total_hours, capacity_percentage, submission_date
            FROM voting_summary
            ORDER BY submission_date DESC
        """)
        
        for summary in cursor.fetchall():
            print(f"   👤 {summary[0]}")
            print(f"      📊 {summary[2]}h ({summary[3]:.1f}%) - {summary[1]} preguntas")
            print(f"      📅 {summary[4]}")
        
        cursor.close()
        conn.close()
        
        print("\n✅ Nueva estructura funcionando perfectamente!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_new_structure()

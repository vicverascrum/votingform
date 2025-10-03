#!/usr/bin/env python3
import mysql.connector
import json
from datetime import datetime

# Database connection
config = {
    'host': 'votingform-results.czi2i0iyyp0m.us-east-1.rds.amazonaws.com',
    'user': 'admin',
    'password': 'VotingForm2025!',
    'database': 'sprint_voting',
    'port': 3306
}

def test_insert():
    """Simula una votación real"""
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        
        # Datos de prueba como si fuera una votación real
        voting_data = {
            'email': 'victor.vera@foundever.com',
            'selected_items': [
                {'id': 'question1', 'title': 'Reporting column alignment', 'estimatedHours': 2},
                {'id': 'question9', 'title': 'Associate Evaluation Form grace period', 'estimatedHours': None},
                {'id': 'question12', 'title': 'OJT Workspace- Action Plans and Contact Logs', 'estimatedHours': 200}
            ],
            'total_hours': 202,
            'sprint_number': 24
        }
        
        capacity_percentage = (voting_data['total_hours'] / 260) * 100
        
        print(f"📝 Insertando votación de: {voting_data['email']}")
        print(f"📊 Total horas: {voting_data['total_hours']}h ({capacity_percentage:.1f}%)")
        
        # Insertar resultado principal
        cursor.execute("""
            INSERT INTO voting_results 
            (email, selected_items, total_hours, capacity_percentage, sprint_number) 
            VALUES (%s, %s, %s, %s, %s)
        """, (
            voting_data['email'],
            json.dumps(voting_data['selected_items']),
            voting_data['total_hours'],
            capacity_percentage,
            voting_data['sprint_number']
        ))
        
        voting_id = cursor.lastrowid
        
        # Insertar selecciones individuales
        for item in voting_data['selected_items']:
            cursor.execute("""
                INSERT INTO question_selections 
                (voting_result_id, question_id, question_title, estimated_hours) 
                VALUES (%s, %s, %s, %s)
            """, (
                voting_id,
                item['id'],
                item['title'],
                item['estimatedHours']
            ))
        
        conn.commit()
        print(f"✅ Votación guardada con ID: {voting_id}")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error al insertar: {e}")
        return False

def test_read():
    """Lee todos los resultados"""
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor(dictionary=True)
        
        print("\n📊 RESULTADOS DE TODAS LAS VOTACIONES:")
        print("-" * 60)
        
        cursor.execute("""
            SELECT 
                vr.email,
                vr.total_hours,
                vr.capacity_percentage,
                vr.submission_date,
                COUNT(qs.id) as items_selected
            FROM voting_results vr
            LEFT JOIN question_selections qs ON vr.id = qs.voting_result_id
            GROUP BY vr.id
            ORDER BY vr.submission_date DESC
        """)
        
        results = cursor.fetchall()
        
        for result in results:
            print(f"👤 {result['email']}")
            print(f"   ⏰ {result['submission_date']}")
            print(f"   📊 {result['total_hours']}h ({result['capacity_percentage']:.1f}%)")
            print(f"   📝 {result['items_selected']} items seleccionados")
            print()
        
        print(f"📈 Total votaciones: {len(results)}")
        
        cursor.close()
        conn.close()
        return results
        
    except Exception as e:
        print(f"❌ Error al leer: {e}")
        return []

if __name__ == "__main__":
    print("🧪 PROBANDO BASE DE DATOS...")
    
    # Probar inserción
    if test_insert():
        print("\n" + "="*60)
        # Probar lectura
        test_read()
        print("\n✅ ¡Base de datos funcionando perfectamente!")
        print("🎯 Ya puedes conectar tu formulario a esta BD")
    else:
        print("❌ Hay problemas con la base de datos")

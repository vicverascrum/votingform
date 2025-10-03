#!/usr/bin/env python3
import mysql.connector
import json

config = {
    'host': 'votingform-results.czi2i0iyyp0m.us-east-1.rds.amazonaws.com',
    'user': 'admin',
    'password': 'VotingForm2025!',
    'database': 'sprint_voting',
    'port': 3306
}

def show_questions_storage():
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor(dictionary=True)
        
        print("📊 CÓMO SE GUARDAN LAS PREGUNTAS SELECCIONADAS:")
        print("=" * 60)
        
        # Mostrar datos de voting_results
        cursor.execute("SELECT * FROM voting_results")
        results = cursor.fetchall()
        
        for result in results:
            print(f"\n👤 VOTACIÓN DE: {result['email']}")
            print(f"   📅 Fecha: {result['submission_date']}")
            print(f"   📊 Total: {result['total_hours']}h ({result['capacity_percentage']:.1f}%)")
            
            # Mostrar items en JSON
            selected_items = json.loads(result['selected_items'])
            print(f"   📝 Items en JSON: {selected_items}")
            
            # Mostrar detalles individuales
            cursor.execute("""
                SELECT question_id, question_title, estimated_hours, priority_order 
                FROM question_selections 
                WHERE voting_result_id = %s
                ORDER BY priority_order ASC
            """, (result['id'],))
            
            selections = cursor.fetchall()
            if selections:
                print("   📋 Detalles por pregunta:")
                for i, sel in enumerate(selections, 1):
                    priority = sel['priority_order'] if sel['priority_order'] else "Sin prioridad"
                    hours = sel['estimated_hours'] if sel['estimated_hours'] else "TBD"
                    print(f"      {i}. {sel['question_id']} - {hours}h - Prioridad: {priority}")
                    print(f"         '{sel['question_title'][:50]}...'")
            else:
                print("   ⚠️  No hay detalles individuales guardados")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    show_questions_storage()

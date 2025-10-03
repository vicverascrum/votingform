#!/usr/bin/env python3
import mysql.connector
import sys

config = {
    'host': 'votingform-results.czi2i0iyyp0m.us-east-1.rds.amazonaws.com',
    'user': 'admin',
    'password': 'VotingForm2025!',
    'database': 'sprint_voting',
    'port': 3306
}

def insert_vote(email, total_horas, preguntas_texto):
    """Inserta un voto en la base de datos"""
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO votes_simple (email, total_horas, preguntas_seleccionadas)
            VALUES (%s, %s, %s)
        """, (email, total_horas, preguntas_texto))
        
        conn.commit()
        vote_id = cursor.lastrowid
        
        print(f"✅ Voto guardado con ID: {vote_id}")
        print(f"   📧 Email: {email}")
        print(f"   📊 Horas: {total_horas}")
        print(f"   📝 Preguntas: {preguntas_texto}")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def show_all_votes():
    """Muestra todos los votos"""
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM votes_simple ORDER BY fecha_envio DESC")
        votes = cursor.fetchall()
        
        print(f"\n📊 TODOS LOS VOTOS ({len(votes)} total):")
        print("=" * 80)
        
        for vote in votes:
            print(f"\n👤 {vote[1]}")
            print(f"   📅 {vote[2]}")
            print(f"   📊 {vote[3]} horas")
            print(f"   📝 {vote[4]}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) == 4:
        # Insertar voto desde línea de comandos
        email = sys.argv[1]
        horas = int(sys.argv[2])
        preguntas = sys.argv[3]
        insert_vote(email, horas, preguntas)
    else:
        # Mostrar todos los votos
        show_all_votes()
        
        # Ejemplo de uso
        print("\n💡 EJEMPLO DE USO:")
        print("python3 insert_vote.py 'user@foundever.com' 150 'question1 (Low), question5 (High)'")
        print("python3 insert_vote.py  # Para ver todos los votos")

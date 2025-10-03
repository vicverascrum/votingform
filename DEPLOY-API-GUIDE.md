# 🚀 Guía para Conectar GitHub Pages con Base de Datos

## 📋 Pasos para Conectar tu Formulario

### 1. **Subir API a un Servidor** (5 minutos)

Necesitas subir `api-simple.php` a cualquier servidor con PHP:

#### **Opción A: AWS EC2 (Recomendado)**
```bash
# Crear instancia EC2 t2.micro (gratis)
# Instalar Apache + PHP
# Subir api-simple.php
```

#### **Opción B: Hosting Compartido**
- Cualquier hosting con PHP (GoDaddy, Hostinger, etc.)
- Sube `api-simple.php` a la carpeta public_html

#### **Opción C: Heroku (Gratis)**
- Crear app en Heroku
- Subir como aplicación PHP

### 2. **Actualizar tu Formulario** (2 minutos)

En tu archivo `src/scripts/aws-integration.js`:

```javascript
// CAMBIAR ESTA URL
const API_URL = 'https://tu-servidor.com/api-simple.php';

// REEMPLAZAR la función de envío actual con:
async function submitFormData(formData) {
    return await submitToDatabase(formData);
}
```

### 3. **Copiar el Código de Integración**

Copia todo el código de `update-form-integration.js` y pégalo en tu `aws-integration.js`

### 4. **Probar la Conexión**

1. Abre tu formulario en GitHub Pages
2. Llena el formulario
3. Envía
4. Verifica que aparezca en la base de datos

---

## 🔧 **Opciones de Servidor Rápidas**

### **Opción Más Rápida: 000webhost (Gratis)**
1. Ve a https://www.000webhost.com
2. Crea cuenta gratis
3. Sube `api-simple.php`
4. Tu URL será: `https://tu-sitio.000webhostapp.com/api-simple.php`

### **Opción AWS: EC2 t2.micro**
```bash
# Crear EC2
aws ec2 run-instances --image-id ami-0c02fb55956c7d316 --instance-type t2.micro

# Instalar LAMP
sudo yum update -y
sudo yum install -y httpd php php-mysqlnd
sudo systemctl start httpd

# Subir archivo
scp api-simple.php ec2-user@tu-ip:/var/www/html/
```

---

## 📊 **Resultado Final**

```
GitHub Pages → API PHP → RDS MySQL
     ↓
  votes_simple table
```

### **Datos que se guardarán:**
- Email del usuario
- Fecha/hora automática
- Total de horas
- Preguntas seleccionadas con prioridad

---

## 🧪 **Probar la API**

```bash
# Probar envío
curl -X POST "https://tu-servidor.com/api-simple.php?action=submit" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@foundever.com","totalHours":100,"selectedQuestions":"question1 (Low), question2 (High)"}'

# Probar resultados  
curl "https://tu-servidor.com/api-simple.php?action=results"
```

---

## ⚠️ **Importante**

1. **Cambia la URL** en `API_URL`
2. **Prueba primero** con datos de test
3. **Verifica CORS** si hay problemas
4. **Backup** de tu código actual antes de cambiar

**¿Necesitas ayuda con algún paso específico?**

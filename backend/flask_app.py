from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flasgger import Swagger

# Importar la configuración y las rutas
from config import Config
from routes import register_routes
from models import db

# Crear la aplicación Flask
app = Flask(__name__)

# Aplicar la configuración de la base de datos
app.config.from_object(Config)

# Inicializar extensiones
db.init_app(app)  # SQLAlchemy

with app.app_context():
    db.create_all()

Swagger(app)

# Registrar las rutas de la API
register_routes(app)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')  # Origen correcto
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')  # Incluye Authorization
    response.headers.add('Access-Control-Allow-Methods', 'GET,PATCH,POST,DELETE,OPTIONS')
    
    # Si es una solicitud OPTIONS, devolver una respuesta vacía
    if request.method == 'OPTIONS':
        response.status_code = 200
        return response
    
    return response

# Iniciar la aplicación
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5015)


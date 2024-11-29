from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flasgger import Swagger
from flask_migrate import Migrate
from config import Config
from routes import register_routes
from models import db

# Crear la aplicación Flask
app = Flask(__name__)

# Aplicar la configuración de la base de datos
app.config.from_object(Config)

# Inicializar extensiones
db.init_app(app)  # SQLAlchemy
migrate = Migrate(app, db)

with app.app_context():
    db.create_all()

Swagger(app)

# Manejo manual de CORS dinámico
@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')  # Captura el origen dinámico de la solicitud
    if origin:
        response.headers.add('Access-Control-Allow-Origin', origin)  # Responder con el origen de la solicitud
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS, PATCH')
    return response

# Registrar las rutas de la API
register_routes(app)

# Iniciar la aplicación
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5015)

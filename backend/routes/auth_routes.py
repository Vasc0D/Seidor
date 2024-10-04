from flask import Blueprint, request, jsonify, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from models import User, db, Session
import jwt
from config import Config

auth_bp = Blueprint('auth', __name__)

# Ruta de login
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Verificar si el usuario existe
    user = User.query.filter_by(username=username).first()

    # Verificar la contraseña
    if not user or not check_password_hash(user.password, password):
        return jsonify({'message': 'Login failed! Invalid username or password'}), 401
    
    # Chequear si el usuario ya tiene una sesión activa
    existing_session = Session.query.filter_by(user=user.id).first()
    if existing_session:
        db.session.delete(existing_session)

    # Crear sesión
    sesion = Session(user=user.id)
    db.session.add(sesion)
    db.session.commit()

    # Crear el token JWT
    token = jwt.encode({'session_id': sesion.id, 'role': user.role}, Config.JWT_SECRET_KEY, algorithm='HS256')

    # Crear una respuesta HTTP con la cookie
    response = make_response(jsonify({'message': 'Login successful', 'role': user.role}))
    
    # Configurar la cookie del token JWT
    response.set_cookie(
        'authToken',  # Nombre de la cookie
        token,  # El valor del token JWT
        httponly=True,  # Para que la cookie no sea accesible mediante JavaScript
        samesite='Lax',  # Protección CSRF (o 'Strict' para mayor seguridad)
        max_age=60 * 60  # La cookie expirará en 1 hora
    )

    return response

# Ruta de logout (opcional)
@auth_bp.route('/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({'message': 'Logged out successfully'}))
    
    # Eliminar la cookie del token JWT
    response.set_cookie('authToken', '', expires=0)

    return response

# Ruta de registro para crear un nuevo usuario
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')

    # Verificar si todos los campos necesarios están presentes
    if not username or not password or not role:
        return jsonify({'message': 'Faltan datos obligatorios'}), 400

    # Verificar si el usuario ya existe
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({'message': 'El nombre de usuario ya está registrado'}), 400

    # Encriptar la contraseña
    hashed_password = generate_password_hash(password)

    # Crear nuevo usuario
    new_user = User(username=username, password=hashed_password, role=role)

    # Guardar en la base de datos
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'Usuario creado exitosamente'}), 201
    except Exception as e:
        db.session.rollback()  # Revertir cambios si ocurre un error
        return jsonify({'error': 'Error al crear el usuario', 'details': str(e)}), 500
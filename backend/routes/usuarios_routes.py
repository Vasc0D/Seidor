from flask import Blueprint, jsonify, request
from models import User, db
from werkzeug.security import generate_password_hash, check_password_hash
from auth import token_required

usuarios_bp = Blueprint('usuarios', __name__)

# Ruta para obtener usuarios por rol
@usuarios_bp.route('/', methods=['GET'])
def get_users():
    try:
        # Obtener todos los usuarios desde la base de datos
        usuarios = User.query.all()

        # Agrupar usuarios por rol
        usuarios_por_rol = {
            "Administradores": [u.serialize() for u in usuarios if u.role == 'Administrador'],
            "Gerentes Comerciales": [u.serialize() for u in usuarios if u.role == 'Gerente Comercial'],
            "Gerentes de Operaciones": [u.serialize() for u in usuarios if u.role == 'Gerente de Operaciones'],
            "Gerentes Ejecutivos": [u.serialize() for u in usuarios if u.role == 'Gerente Ejecutivo'],
        }

        return jsonify(usuarios_por_rol), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener usuarios"}), 500
    
# Ruta para crear usuarios
@usuarios_bp.route('/', methods=['POST'])
def create_user():
    data = request.json

    username = data.get('username')
    name = data.get('name')
    password = data.get('password')
    role = data.get('role')
    correo = data.get('correo')

    # Verificar si todos los campos necesarios están presentes
    if not username :
        return jsonify({'message': 'Faltan el username'}), 400
    
    if not name:
        return jsonify({'message': 'Falta el nombre'}), 400
    
    if not password:
        return jsonify({'message': 'Falta la contraseña'}), 400
    
    if not role:
        return jsonify({'message': 'Falta el rol'}), 400
    
    if not correo:
        return jsonify({'message': 'Falta el correo'}), 400

    # Verificar si el usuario ya existe
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({'message': 'El nombre de usuario ya está registrado'}), 400

    # Encriptar la contraseña
    hashed_password = generate_password_hash(password)

    # Crear nuevo usuario
    new_user = User(username=username, name=name, password=hashed_password, role=role, correo=correo)

    # Guardar en la base de datos
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'Usuario creado exitosamente'}), 201
    except Exception as e:
        db.session.rollback()  # Revertir cambios si ocurre un error
        return jsonify({'error': 'Error al crear el usuario', 'details': str(e)}), 500
    
# Ruta para actualizar un usuario
@usuarios_bp.route('/<string:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json

    print("DATA", data)

    # Obtener el usuario existente
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'Usuario no encontrado'}), 404

    # Actualizar los campos necesarios
    username = data.get('username')
    name = data.get('name')
    role = data.get('role')
    correo = data.get('correo')

    if username:
        user.username = username

    if name:
        user.name = name
    
    if role:
        user.role = role

    if correo:
        user.correo = correo

    # Actualizar la contraseña solo si se proporciona
    if 'password' in data:
        password = data.get('password')
        if password:
            user.password = generate_password_hash(password)

    # Guardar cambios en la base de datos
    try:
        db.session.commit()
        return jsonify({'message': 'Usuario actualizado exitosamente'}), 200
    except Exception as e:
        db.session.rollback()  # Revertir cambios si ocurre un error
        return jsonify({'error': 'Error al actualizar el usuario', 'details': str(e)}), 500
    
# get gerentes de operaciones de usuarios
@usuarios_bp.route('/gerentes_operaciones', methods=['GET'])
@token_required
def get_gerentes_operaciones(current_user):
    try:
        # Obtener todos los usuarios desde la base de datos
        gerentes_operaciones = User.query.filter_by(role='Gerente de Operaciones').all()
        
        result = [{'id': g.id, 'username': g.username} for g in gerentes_operaciones]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener gerentes de operaciones"}), 500

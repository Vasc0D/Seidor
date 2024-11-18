from flask import Blueprint, jsonify, request
from auth import token_required
from models import User, Session

user_bp = Blueprint('user', __name__)

# Ruta para obtener la información del usuario autenticado
@user_bp.route('/', methods=['GET'])
@token_required
def get_user_info(current_user):
    try:
        user = User.query.get(current_user.id)
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        return jsonify({
            'username': user.username,
            'name': user.name,
            'role': user.role,
            'correo': user.correo
        }), 200
    except Exception as e:
        print(f"Error al obtener la información del usuario: {str(e)}")
        return jsonify({"error": "Error al obtener la información del usuario"}), 500

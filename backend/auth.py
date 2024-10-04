import jwt
import datetime
from flask import request, jsonify
from functools import wraps
from models import User, Session
from config import Config

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get('authToken')  # Leer el token desde la cookie

        if not token:
            return jsonify({'message': 'Token is missing!'}), 403

        try:
            # Decodificar el token para obtener el session_id
            decoded = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
            session_id = decoded.get('session_id')

            # Buscar la sesión en la base de datos
            session = Session.query.filter_by(id=session_id).first()

            if not session or session.expiry < datetime.datetime.utcnow():
                return jsonify({'message': 'Session has expired or does not exist'}), 403

            # Obtener el usuario a partir de la sesión
            current_user = User.query.filter_by(id=session.user).first()

            if not current_user:
                return jsonify({'message': 'User not found'}), 403

        except Exception as e:
            return jsonify({'message': 'Token is invalid or expired!', 'error': str(e)}), 403

        return f(current_user, *args, **kwargs)

    return decorated

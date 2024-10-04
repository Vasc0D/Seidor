from flask import Blueprint, jsonify, request
from models import Cliente, db
from auth import token_required


clientes_bp = Blueprint('clientes', __name__)

@clientes_bp.route('/', methods=['GET'])
@token_required
def get_clientes(current_user):
    try:
        if current_user.role == 'admin':
            # Si el usuario es administrador, obtener todos los clientes
            clientes = Cliente.query.all()
        else:
            clientes = Cliente.query.filter_by(owner=current_user.id).all()

        return jsonify([{
            'id': c.id,
            'nombre': c.nombre,
            'ruc': c.ruc,
            'sociedades': c.sociedades,
            'empleados': c.empleados
        } for c in clientes]), 200
    except Exception as e:
        print("Error al obtener clientes:", str(e))
        return jsonify({"error": "Error al obtener clientes"}), 500
    
@clientes_bp.route('/', methods=['POST'])
@token_required
def create_cliente(current_user):
    data = request.json

    nombre = data.get('nombre')
    ruc = data.get('ruc')
    sociedades = data.get('sociedades')
    empleados = data.get('empleados')

    try:
        nuevo_cliente = Cliente(
            nombre=nombre,
            ruc=ruc,
            sociedades=sociedades,
            empleados=empleados,
            owner=current_user.id  # Asegurarte de asignar el usuario autenticado como owner
        )

        db.session.add(nuevo_cliente)
        db.session.commit()

        return jsonify({
            'id': nuevo_cliente.id,
            'nombre': nuevo_cliente.nombre,
            'ruc': nuevo_cliente.ruc,
            'sociedades': nuevo_cliente.sociedades,
            'empleados': nuevo_cliente.empleados
        }), 201
    except Exception as e:
        print("Error al crear cliente:", str(e))
        return jsonify({"error": "Error al crear cliente"}), 500

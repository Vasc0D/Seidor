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
    
@clientes_bp.route('/<string:cliente_id>', methods=['PUT'])
@token_required
def update_cliente(current_user, cliente_id):
    try:
        # Buscar el cliente por su ID
        cliente = Cliente.query.get(cliente_id)

        if not cliente:
            return jsonify({"error": "Cliente no encontrado"}), 404

        # Verificar permisos (si no es administrador, solo puede editar clientes que él creó)
        if current_user.role != 'admin' and cliente.owner != current_user.id:
            return jsonify({"error": "No tienes permiso para editar este cliente"}), 403

        # Obtener datos del cuerpo de la solicitud
        data = request.json
        nombre = data.get('nombre')
        ruc = data.get('ruc')
        sociedades = data.get('sociedades')
        empleados = data.get('empleados')

        # Validar campos requeridos
        if not nombre or not ruc or not sociedades or not empleados:
            return jsonify({"error": "Todos los campos son obligatorios"}), 400

        # Actualizar los datos del cliente
        cliente.nombre = nombre
        cliente.ruc = ruc
        cliente.sociedades = sociedades
        cliente.empleados = empleados

        # Guardar los cambios
        db.session.commit()

        return jsonify({
            'id': cliente.id,
            'nombre': cliente.nombre,
            'ruc': cliente.ruc,
            'sociedades': cliente.sociedades,
            'empleados': cliente.empleados
        }), 200
    except Exception as e:
        print("Error al actualizar cliente:", str(e))
        db.session.rollback()
        return jsonify({"error": "Error al actualizar cliente"}), 500

@clientes_bp.route('/<string:cliente_id>', methods=['DELETE'])
@token_required
def delete_cliente(current_user, cliente_id):
    try:
        # Buscar el cliente por su ID
        cliente = Cliente.query.get(cliente_id)

        if not cliente:
            return jsonify({"error": "Cliente no encontrado"}), 404

        # Eliminar el cliente
        db.session.delete(cliente)
        db.session.commit()

        return jsonify({"message": "Cliente eliminado correctamente"}), 200
    except Exception as e:
        print("Error al eliminar cliente:", str(e))
        db.session.rollback()
        return jsonify({"error": "Error al eliminar cliente"}), 500
    


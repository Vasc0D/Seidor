from flask import Blueprint, jsonify, request
from models import Cliente, db, User
from auth import token_required
from sqlalchemy.exc import IntegrityError
import pandas as pd

clientes_bp = Blueprint('clientes', __name__)

@clientes_bp.route('/', methods=['GET'])
@token_required
def get_clientes(current_user):
    try:
        if current_user.role == 'Administrador':
            # Si el usuario es administrador, obtener todos los clientes
            clientes = Cliente.query.all()
        else:
            clientes = Cliente.query.filter_by(owner=current_user.id).all()

        return jsonify([{
            'id': c.id,
            'razon_social': c.razon_social,
            'nombre': c.nombre,
            'ruc': c.ruc,
            'sociedades': c.sociedades,
            'empleados': c.empleados,
            'vip': c.vip,
            'activo': c.activo,
            'owner': c.owner_relacion.username
        } for c in clientes]), 200
    except Exception as e:
        print("Error al obtener clientes:", str(e))
        return jsonify({"error": "Error al obtener clientes"}), 500

@clientes_bp.route('/', methods=['POST'])
@token_required
def create_cliente(current_user):
    data = request.json

    razon_social = data.get('razon_social')
    nombre = data.get('nombre')
    ruc = data.get('ruc')
    sociedades = data.get('sociedades')
    empleados = data.get('empleados')
    vip = data.get('vip', False)  # Valor por defecto: False
    activo = data.get('activo', True)  # Valor por defecto: True

    if not razon_social or not nombre or not ruc or not sociedades or not empleados:
        return jsonify({"error": "Todos los campos son obligatorios"}), 400

    try:
        nuevo_cliente = Cliente(
            razon_social=razon_social,
            nombre=nombre,
            ruc=ruc,
            sociedades=sociedades,
            empleados=empleados,
            vip=vip,
            activo=activo,
            owner=current_user.id  # Asignar el usuario autenticado como owner
        )

        db.session.add(nuevo_cliente)
        db.session.commit()

        return jsonify({
            'id': nuevo_cliente.id,
            'razon_social': nuevo_cliente.razon_social,
            'nombre': nuevo_cliente.nombre,
            'ruc': nuevo_cliente.ruc,
            'sociedades': nuevo_cliente.sociedades,
            'empleados': nuevo_cliente.empleados,
            'vip': nuevo_cliente.vip,
            'activo': nuevo_cliente.activo,
            'owner': current_user.name
        }), 201
    except Exception as e:
        print("Error al crear cliente:", str(e))
        return jsonify({"error": "Error al crear cliente"}), 500

@clientes_bp.route('/<string:cliente_id>', methods=['PUT'])
@token_required
def update_cliente(current_user, cliente_id):
    try:
        cliente = Cliente.query.get(cliente_id)

        if not cliente:
            return jsonify({"error": "Cliente no encontrado"}), 404

        if current_user.role != 'admin' and cliente.owner != current_user.id:
            return jsonify({"error": "No tienes permiso para editar este cliente"}), 403

        data = request.json
        razon_social = data.get('razon_social')
        nombre = data.get('nombre')
        ruc = data.get('ruc')
        sociedades = data.get('sociedades')
        empleados = data.get('empleados')
        vip = data.get('vip', cliente.vip)
        activo = data.get('activo', cliente.activo)

        if not razon_social or not nombre or not ruc or not sociedades or not empleados:
            return jsonify({"error": "Todos los campos son obligatorios"}), 400

        cliente.razon_social = razon_social
        cliente.nombre = nombre
        cliente.ruc = ruc
        cliente.sociedades = sociedades
        cliente.empleados = empleados
        cliente.vip = vip
        cliente.activo = activo

        db.session.commit()

        return jsonify({
            'id': cliente.id,
            'razon_social': cliente.razon_social,
            'nombre': cliente.nombre,
            'ruc': cliente.ruc,
            'sociedades': cliente.sociedades,
            'empleados': cliente.empleados,
            'vip': cliente.vip,
            'activo': cliente.activo,
            'owner': cliente.owner_relacion.name
        }), 200
    except Exception as e:
        print("Error al actualizar cliente:", str(e))
        db.session.rollback()
        return jsonify({"error": "Error al actualizar cliente"}), 500

@clientes_bp.route('/<string:cliente_id>', methods=['DELETE'])
@token_required
def delete_cliente(current_user, cliente_id):
    try:
        cliente = Cliente.query.get(cliente_id)

        if not cliente:
            return jsonify({"error": "Cliente no encontrado"}), 404

        if current_user.role != 'admin' and cliente.owner != current_user.id:
            return jsonify({"error": "No tienes permiso para eliminar este cliente"}), 403

        db.session.delete(cliente)
        db.session.commit()

        return jsonify({"message": "Cliente eliminado correctamente"}), 200
    except Exception as e:
        print("Error al eliminar cliente:", str(e))
        db.session.rollback()
        return jsonify({"error": "Error al eliminar cliente"}), 500

@clientes_bp.route('/upload', methods=['POST'])
@token_required
def process_excel(current_user):
    try:
        # Verificar que el archivo está en la solicitud
        if 'file' not in request.files:
            return {"error": "No file uploaded."}, 400

        file = request.files['file']

        if file.filename == '':
            return {"error": "No file selected."}, 400

        if not file.filename.endswith('.xlsx'):
            return {"error": "Invalid file type. Please upload an Excel file."}, 400

        # Leer el archivo Excel como un DataFrame
        df = pd.read_excel(file)

        # Normalizar los nombres de las columnas
        df.columns = df.columns.str.strip().str.lower()

        # Reemplazar valores vacíos o 'nan' con None
        df = df.replace({pd.NA: None, 'nan': None, '': None}, regex=True)

        # Convertir columnas específicas
        if 'vip' in df.columns:
            df['vip'] = df['vip'].apply(lambda x: str(x).strip().upper() == "SI")

        if 'activo' in df.columns:
            df['activo'] = df['activo'].apply(lambda x: str(x).strip().upper() == "SI")

        # Mapear 'owner' a IDs
        user_map = {user.username: user.id for user in User.query.all()}
        df['owner'] = df['owner'].apply(lambda username: user_map.get(username))

        # Verificar si hay usernames no mapeados
        unmapped_owners = df[df['owner'].isnull() & df['owner'].notnull()]
        if not unmapped_owners.empty:
            return {
                "error": "Some usernames in 'owner' could not be mapped.",
                "unmapped_usernames": unmapped_owners['owner'].tolist()
            }, 400

        # Convertir columnas numéricas
        numeric_columns = ['sociedades', 'empleados']
        for column in numeric_columns:
            if column in df.columns:
                df[column] = pd.to_numeric(df[column], errors='coerce').fillna(None)

        # Insertar o actualizar clientes
        for _, row in df.iterrows():
            # Buscar cliente por RUC
            existing_cliente = Cliente.query.filter_by(ruc=row.get('ruc')).first()

            if existing_cliente:
                # Actualizar el cliente existente
                existing_cliente.razon_social = row.get('razon_social') or existing_cliente.razon_social
                existing_cliente.nombre = row.get('nombre') or existing_cliente.nombre
                existing_cliente.sociedades = row.get('sociedades') if row.get('sociedades') is not None else existing_cliente.sociedades
                existing_cliente.empleados = row.get('empleados') if row.get('empleados') is not None else existing_cliente.empleados
                existing_cliente.vip = row.get('vip') if row.get('vip') is not None else existing_cliente.vip
                existing_cliente.activo = row.get('activo') if row.get('activo') is not None else existing_cliente.activo
                existing_cliente.owner = row.get('owner') if row.get('owner') is not None else existing_cliente.owner
            else:
                # Crear un nuevo cliente si no existe
                cliente = Cliente(
                    razon_social=row.get('razon_social'),
                    nombre=row.get('nombre'),
                    ruc=row.get('ruc'),
                    sociedades=row.get('sociedades'),
                    empleados=row.get('empleados'),
                    vip=row.get('vip'),
                    activo=row.get('activo'),
                    owner=row.get('owner')
                )
                db.session.add(cliente)

        # Confirmar los cambios en la base de datos
        db.session.commit()
        return {"message": "File processed and data inserted/updated successfully."}

    except IntegrityError as e:
        db.session.rollback()
        return {"error": f"Database integrity error: {e.orig}"}, 500

    except Exception as e:
        db.session.rollback()
        return {"error": f"Error processing the file: {str(e)}"}, 500

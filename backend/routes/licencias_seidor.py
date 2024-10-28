from flask import Blueprint, request, jsonify
from models import LicenciasSeidor, LicenciasSeidorTipo, db
from auth import token_required

licencias_seidor_bp = Blueprint('licencias_seidor', __name__)

# Ruta para obtener las licencias Seidor con precios por tipo (On-Premise / On-Cloud)
@licencias_seidor_bp.route('/', methods=['GET'])
@token_required
def get_licencias_seidor(current_user):
    try:
        # Obtener todas las licencias Seidor
        licencias_seidor = LicenciasSeidor.query.all()

        # Crear la respuesta para cada licencia Seidor
        response = []
        for licencia in licencias_seidor:
            # Obtener los precios asociados a esta licencia
            tipo_precios = LicenciasSeidorTipo.query.filter_by(licencia_id=licencia.id).all()

            # Formatear los rangos de precios en una lista
            price_type = [{
                'type': precio.type,  # On-Premise o On-Cloud
                'price': str(precio.price)  # Convertir el precio a string para asegurar precisión
            } for precio in tipo_precios]

            # Añadir la licencia y los rangos de precios a la respuesta
            response.append({
                'id': licencia.id,
                'name': licencia.name,
                'user_type': licencia.user_type,
                'fee_type': licencia.fee_type,
                'price_type': price_type  # Añadir los precios separados por tipo
            })

        return jsonify(response), 200
    except Exception as e:
        print("Error al obtener licencias Seidor:", str(e))
        return jsonify({"error": "Error al obtener licencias Seidor"}), 500

# Obtener una licencia Seidor por ID
@licencias_seidor_bp.route('/<string:id>', methods=['GET'])
@token_required
def get_licencia_seidor(current_user, id):
    try:
        # Verificar si la licencia Seidor existe
        licencia = LicenciasSeidor.query.get(id)
        if not licencia:
            return jsonify({"error": "Licencia Seidor no encontrada"}), 404

        # Obtener los precios asociados a esta licencia
        tipo_precios = LicenciasSeidorTipo.query.filter_by(licencia_id=licencia.id).all()

        # Formatear los rangos de precios en una lista
        price_type = [{
            'type': precio.type,  # On-Premise o On-Cloud
            'price': str(precio.price)  # Convertir el precio a string para asegurar precisión
        } for precio in tipo_precios]

        # Crear la respuesta con la licencia y los precios
        response = {
            'id': licencia.id,
            'name': licencia.name,
            'user_type': licencia.user_type,
            'fee_type': licencia.fee_type,
            'price_type': price_type  # Añadir los precios separados por tipo
        }

        return jsonify(response), 200
    except Exception as e:
        print("Error al obtener licencia Seidor:", str(e))
        return jsonify({"error": "Error al obtener licencia Seidor"}), 500

# Ruta para crear una nueva licencia Seidor
@licencias_seidor_bp.route('/', methods=['POST'])
@token_required
def create_licencia_seidor(current_user):
    try:
        # Obtener los datos de la nueva licencia Seidor
        data = request.get_json()

        # Validar los campos requeridos
        id = data.get('id')
        name = data.get('name')
        user_type = data.get('user_type')
        fee_type = data.get('fee_type')
        price_op = data.get('price_op')  # Precio On-Premise
        price_oc = data.get('price_oc')  # Precio On-Cloud

        # Verificar que los campos obligatorios estén presentes
        if not id or not name or not user_type or not fee_type or (price_op is None and price_oc is None):
            return jsonify({"error": "Faltan campos requeridos"}), 400

        # Verificar si ya existe una licencia con el mismo ID
        licencia_existente = LicenciasSeidor.query.get(id)
        if licencia_existente:
            return jsonify({"error": "Ya existe una licencia con ese ID"}), 400

        # Crear la nueva licencia Seidor
        new_licencia = LicenciasSeidor(id=id, name=name, user_type=user_type, fee_type=fee_type)
        db.session.add(new_licencia)
        db.session.commit()

        # Crear los precios por tipo asociados a la nueva licencia
        if price_op is not None:
            new_price_op = LicenciasSeidorTipo(
                licencia_id=new_licencia.id,
                type='On-Premise',
                price=price_op
            )
            db.session.add(new_price_op)

        if price_oc is not None:
            new_price_oc = LicenciasSeidorTipo(
                licencia_id=new_licencia.id,
                type='On-Cloud',
                price=price_oc
            )
            db.session.add(new_price_oc)

        db.session.commit()

        # Obtener la licencia con sus precios para devolverla
        tipo_precios = LicenciasSeidorTipo.query.filter_by(licencia_id=new_licencia.id).all()
        price_type = [{'type': p.type, 'price': str(p.price)} for p in tipo_precios]

        # Preparar la respuesta con la licencia y sus precios
        response = {
            'id': new_licencia.id,
            'name': new_licencia.name,
            'user_type': new_licencia.user_type,
            'fee_type': new_licencia.fee_type,
            'price_type': price_type
        }

        return jsonify(response), 201

    except Exception as e:
        print("Error al crear licencia Seidor:", str(e))
        db.session.rollback()  # Hacer rollback en caso de error
        return jsonify({"error": "Error al crear licencia Seidor"}), 500

# Ruta para actualizar una licencia Seidor
@licencias_seidor_bp.route('/<string:id>', methods=['PUT'])
@token_required
def update_licencia_seidor(current_user, id):
    try:
        # Verificar si la licencia Seidor existe
        licencia = LicenciasSeidor.query.get(id)
        if not licencia:
            return jsonify({"error": "Licencia Seidor no encontrada"}), 404

        # Obtener los datos de la licencia Seidor a actualizar
        data = request.get_json()

        # Actualizar los campos de la licencia Seidor
        licencia.name = data.get('name', licencia.name)
        licencia.user_type = data.get('user_type', licencia.user_type)
        licencia.fee_type = data.get('fee_type', licencia.fee_type)

        # Actualizar los precios por tipo de la licencia Seidor
        price_op = data.get('price_op')
        price_oc = data.get('price_oc')

        # Función para actualizar o crear precios (On-Premise y On-Cloud)
        def actualizar_precio(tipo, precio):
            price_obj = LicenciasSeidorTipo.query.filter_by(licencia_id=id, type=tipo).first()
            if price_obj:
                price_obj.price = precio
            else:
                new_price = LicenciasSeidorTipo(licencia_id=id, type=tipo, price=precio)
                db.session.add(new_price)

        # Actualizar el precio On-Premise
        if price_op is not None:
            actualizar_precio('On-Premise', price_op)

        # Actualizar el precio On-Cloud
        if price_oc is not None:
            actualizar_precio('On-Cloud', price_oc)

        db.session.commit()

        return jsonify({"message": "Licencia Seidor actualizada exitosamente"}), 200

    except Exception as e:
        print("Error al actualizar licencia Seidor:", str(e))
        db.session.rollback()  # Hacer rollback en caso de error
        return jsonify({"error": "Error al actualizar licencia Seidor"}), 500
    
# Delete
@licencias_seidor_bp.route('/<string:id>', methods=['DELETE'])
@token_required
def delete_licencia_seidor(current_user, id):
    try:
        # Verificar si la licencia existe
        licencia = LicenciasSeidor.query.get(id)
        if not licencia:
            return jsonify({"error": "Licencia Seidor no encontrada"}), 404

        # Eliminar los tipos de precios asociados a esta licencia
        LicenciasSeidorTipo.query.filter_by(licencia_id=id).delete()

        # Eliminar la licencia Seidor
        db.session.delete(licencia)
        db.session.commit()

        return jsonify({"message": "Licencia Seidor eliminada exitosamente"}), 200
    
    except Exception as e:
        print("Error al eliminar licencia Seidor:", str(e))
        db.session.rollback()  # Hacer rollback en caso de error
        return jsonify({"error": "Error al eliminar licencia Seidor"}), 500

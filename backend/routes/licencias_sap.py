from flask import Blueprint, request, jsonify
from models import LicenciaSAP, LicenciasSAPPriceRange, db
from auth import token_required

licencias_sap_bp = Blueprint('licencias_sap', __name__)

# Ruta para obtener las licencias SAP con rangos de precios
@licencias_sap_bp.route('/', methods=['GET'])
@token_required
def get_licencias_sap(current_user):
    try:
        licencias_sap = LicenciaSAP.query.all()
        response = []

        for licencia in licencias_sap:
            # Obtener rangos de precios asociados a esta licencia
            rangos_precios = LicenciasSAPPriceRange.query.filter_by(licencia_id=licencia.id).all()

            rangos_precios_formateados = [{
                'from_range': rango.from_range,
                'to_range': rango.to_range,
                'price': str(rango.price)
            } for rango in rangos_precios] if rangos_precios else [{
                'from_range': 1,
                'to_range': None,
                'price': str(licencia.price)
            }]

            # Formatear la respuesta con la licencia y sus rangos de precios
            response.append({
                'id': licencia.id,
                'name': licencia.name,
                'type': licencia.type,
                'user_type': licencia.user_type,
                'sales_unit': licencia.sales_unit,
                'metric': licencia.metric,
                'fee_type': licencia.fee_type,
                'db_engine': licencia.db_engine,
                'price_ranges': rangos_precios_formateados
            })

        return jsonify(response), 200

    except Exception as e:
        print("Error al obtener licencias SAP:", str(e))
        return jsonify({"error": "Error al obtener licencias SAP"}), 500


# Ruta para crear una nueva licencia SAP
@licencias_sap_bp.route('/', methods=['POST'])
@token_required
def create_licencia_sap(current_user):
    try:
        data = request.get_json()

        # Validar campos requeridos
        required_fields = ['name', 'type', 'user_type', 'sales_unit', 'fee_type']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"El campo '{field}' es requerido"}), 400

        # Crear nueva licencia SAP
        new_licencia = LicenciaSAP(
            id=data.get('id'),
            name=data['name'],
            type=data['type'],
            user_type=data['user_type'],
            sales_unit=data['sales_unit'],
            metric=data.get('metric'),  # Campo opcional
            fee_type=data['fee_type'],
            db_engine=data.get('db_engine')  # Campo opcional
        )
        db.session.add(new_licencia)
        db.session.flush()  # Obtener el ID de la licencia antes de commitear

        # Agregar rangos de precios
        for price in data['price_ranges']:
            if 'from_range' not in price or 'price' not in price:
                return jsonify({"error": "Los campos 'from_range' y 'price' son requeridos en price_ranges"}), 400

            new_price = LicenciasSAPPriceRange(
                licencia_id=new_licencia.id,
                from_range=price['from_range'],
                to_range=price.get('to_range'),  # Campo opcional
                price=price['price']
            )
            db.session.add(new_price)

        # Commit de todo al final
        db.session.commit()

        return jsonify({
            'id': new_licencia.id,
            'name': new_licencia.name,
            'type': new_licencia.type,
            'user_type': new_licencia.user_type,
            'sales_unit': new_licencia.sales_unit,
            'metric': new_licencia.metric,
            'fee_type': new_licencia.fee_type,
            'db_engine': new_licencia.db_engine,
            'price_ranges': data['price_ranges']
        }), 201

    except Exception as e:
        db.session.rollback()
        print("Error al crear licencia SAP:", str(e))
        return jsonify({"error": "Error al crear licencia SAP"}), 500
    
@licencias_sap_bp.route('/<licencia_id>', methods=['GET'])
@token_required
def get_licencia_sap(current_user, licencia_id):
    try:
        licencia = LicenciaSAP.query.get(licencia_id)
        if not licencia:
            return jsonify({"error": "Licencia SAP no encontrada"}), 404

        # Obtener rangos de precios asociados a esta licencia
        rangos_precios = LicenciasSAPPriceRange.query.filter_by(licencia_id=licencia.id).all()

        rangos_precios_formateados = [{
            'from_range': rango.from_range,
            'to_range': rango.to_range,
            'price': str(rango.price)
        } for rango in rangos_precios] if rangos_precios else [{
            'from_range': 1,
            'to_range': None,
            'price': str(licencia.price)
        }]

        # Formatear la respuesta con la licencia y sus rangos de precios
        response = {
            'id': licencia.id,
            'name': licencia.name,
            'type': licencia.type,
            'user_type': licencia.user_type,
            'sales_unit': licencia.sales_unit,
            'metric': licencia.metric,
            'fee_type': licencia.fee_type,
            'db_engine': licencia.db_engine,
            'price_ranges': rangos_precios_formateados
        }

        return jsonify(response), 200

    except Exception as e:
        print("Error al obtener licencia SAP:", str(e))
        return jsonify({"error": "Error al obtener licencia SAP"}), 500

# put para actualizar licencia
@licencias_sap_bp.route('/<licencia_id>', methods=['PUT'])
@token_required
def update_licencia_sap(current_user, licencia_id):
    try:
        data = request.get_json()

        # Validar campos requeridos
        required_fields = ['name', 'type', 'user_type', 'sales_unit', 'fee_type', 'price_ranges']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"El campo '{field}' es requerido"}), 400

        # Actualizar licencia SAP
        licencia = LicenciaSAP.query.get(licencia_id)
        if not licencia:
            return jsonify({"error": "Licencia SAP no encontrada"}), 404

        licencia.name = data['name']
        licencia.type = data['type']
        licencia.user_type = data['user_type']
        licencia.sales_unit = data['sales_unit']
        licencia.metric = data.get('metric')
        licencia.fee_type = data['fee_type']
        licencia.db_engine = data.get('db_engine')

        # Eliminar rangos de precios anteriores
        LicenciasSAPPriceRange.query.filter_by(licencia_id=licencia.id).delete()

        # Agregar nuevos rangos de precios
        for price in data['price_ranges']:
            if 'from_range' not in price or 'price' not in price:
                return jsonify({"error": "Los campos 'from_range' y 'price' son requeridos en price_ranges"}), 400

            new_price = LicenciasSAPPriceRange(
                licencia_id=licencia.id,
                from_range=price['from_range'],
                to_range=price.get('to_range'),
                price=price['price']
            )
            db.session.add(new_price)

        db.session.commit()

        return jsonify({
            'id': licencia.id,
            'name': licencia.name,
            'type': licencia.type,
            'user_type': licencia.user_type,
            'sales_unit': licencia.sales_unit,
            'metric': licencia.metric,
            'fee_type': licencia.fee_type,
            'db_engine': licencia.db_engine,
            'price_ranges': data['price_ranges']
        }), 200

    except Exception as e:
        db.session.rollback()
        print("Error al actualizar licencia SAP:", str(e))
        return jsonify({"error": "Error al actualizar licencia SAP"}), 500
    
@licencias_sap_bp.route('/<licencia_id>', methods=['DELETE'])
@token_required
def delete_licencia_sap(current_user, licencia_id):
    try:
        licencia = LicenciaSAP.query.get(licencia_id)
        if not licencia:
            return jsonify({"error": "Licencia SAP no encontrada"}), 404

        # Eliminar rangos de precios asociados a esta licencia
        LicenciasSAPPriceRange.query.filter_by(licencia_id=licencia.id).delete()

        db.session.delete(licencia) # Eliminar licencia
        db.session.commit()

        return jsonify({"message": "Licencia SAP eliminada correctamente"}), 200

    except Exception as e:
        db.session.rollback()
        print("Error al eliminar licencia SAP:", str(e))
        return jsonify({"error": "Error al eliminar licencia SAP"}), 500

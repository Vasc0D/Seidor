from flask import Blueprint, request, jsonify
from models import LicenciaSAP, LicenciasSAPPriceRange
from auth import token_required

licencias_sap_bp = Blueprint('licencias_sap', __name__)

# Nueva ruta para obtener las licencias SAP con rangos de precios
@licencias_sap_bp.route('/', methods=['GET'])
@token_required
def get_licencias_sap(current_user):
    try:
        # Obtener todas las licencias SAP
        licencias_sap = LicenciaSAP.query.all()

        # Crear la respuesta para cada licencia SAP
        response = []
        for licencia in licencias_sap:
            # Obtener los rangos de precios asociados con esta licencia
            rangos_precios = LicenciasSAPPriceRange.query.filter_by(licencia_id=licencia.id).all()

            # Si no hay rangos de precios, usa el precio de la licencia base
            if not rangos_precios:
                rangos_precios = [{
                    'from_range': 1,
                    'to_range': None,  # Indicando que no tiene límite superior
                    'price': str(licencia.price)  # Usa el precio base si no hay rangos definidos
                }]
            else:
                # Formatear los rangos de precios en una lista si existen
                rangos_precios = [{
                    'from_range': rango.from_range,
                    'to_range': rango.to_range,
                    'price': str(rango.price)  # Convertir el precio a string
                } for rango in rangos_precios]

            # Añadir la licencia y los rangos de precios a la respuesta
            response.append({
                'id': licencia.id,
                'name': licencia.name,
                'type': licencia.type,
                'user_type': licencia.user_type,
                'sales_unit': licencia.sales_unit,
                'metric': licencia.metric,
                'fee_type': licencia.fee_type,
                'db_engine': licencia.db_engine,
                'price_ranges': rangos_precios  # Añadir los rangos de precios
            })

        return jsonify(response), 200
    except Exception as e:
        print("Error al obtener licencias SAP:", str(e))
        return jsonify({"error": "Error al obtener licencias SAP"}), 500

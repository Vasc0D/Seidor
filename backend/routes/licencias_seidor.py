from flask import Blueprint, request, jsonify
from models import LicenciasSeidor, LicenciasSeidorTipo
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

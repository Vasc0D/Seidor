# cotizaciones_servicios.py

from flask import Blueprint, request, jsonify
from models import CotizacionSolicitada, ConceptoServicio, RecursoCotizacion, db
from auth import token_required

cotizaciones_servicios_bp = Blueprint('cotizaciones_servicios', __name__)

@cotizaciones_servicios_bp.route('/pendientes', methods=['GET'])
@token_required
def obtener_cotizaciones_pendientes(current_user):
    try:
        # Filtrar los conceptos en proceso del gerente actual
        conceptos_en_proceso = ConceptoServicio.query.filter_by(
            gerente_id=current_user.id, estado='En proceso'
        ).all()

        # Crear un diccionario agrupando los conceptos por cotización
        cotizaciones_dict = {}
        for concepto in conceptos_en_proceso:
            cotizacion = concepto.cotizacion  # Accedemos a la relación de la cotización

            if cotizacion.id not in cotizaciones_dict:
                cotizaciones_dict[cotizacion.id] = {
                    'id': cotizacion.id,
                    'nombre_proyecto': cotizacion.nombre_proyecto,
                    'estado': cotizacion.estado,
                    'owner': cotizacion.owner_relacion.username,
                    'cliente': cotizacion.oportunidad.cliente.nombre,
                    'conceptos': []
                }

            # Agregamos el concepto a la lista de conceptos de la cotización
            cotizaciones_dict[cotizacion.id]['conceptos'].append({
                'id': concepto.id,
                'nombre_concepto': concepto.nombre_concepto,
                'estado': concepto.estado,
                'total_venta': float(concepto.total_venta),
                'costo_venta': float(concepto.costo_venta),
                'margen_venta': float(concepto.margen_venta),
                'porcentaje_margen': float(concepto.porcentaje_margen),
            })

        # Convertir el diccionario en una lista para devolver como JSON
        cotizaciones_pendientes = list(cotizaciones_dict.values())

        return jsonify(cotizaciones_pendientes), 200

    except Exception as e:
        print(f"Error al obtener cotizaciones pendientes: {str(e)}")
        return jsonify({"error": "Error al obtener cotizaciones pendientes"}), 500
    
@cotizaciones_servicios_bp.route('/recursos/<concepto_id>', methods=['POST'])
@token_required
def agregar_recurso_cotizacion(current_user, concepto_id):
    try:

        data = request.get_json()
        print(data)
        concepto = ConceptoServicio.query.get(concepto_id)

        if concepto.gerente_id != current_user.id:
            return jsonify({"error": "No tienes permisos para agregar recursos a este concepto"}), 403

        RecursoCotizacion.query.filter_by(concepto_id=concepto_id).delete()

        for recurso_data in data['recursos']:
            nuevo_recurso = RecursoCotizacion(
                concepto_id=concepto_id,
                recurso=recurso_data['recurso'],
                tarifa_lista=recurso_data['tarifa_lista'],
                tarifa_venta=recurso_data['tarifa_venta'],
                preparacion=recurso_data['preparacion'],
                bbp=recurso_data['bbp'],
                r_dev=recurso_data['r_dev'],
                r_pya=recurso_data['r_pya'],
                pi_pya=recurso_data['pi_pya'],
                pi_deply=recurso_data['pi_deply'],
                acompanamiento=recurso_data['acompanamiento'],
                total_dias=recurso_data['total_dias'],
                total_venta=recurso_data['total_venta'],
                costo_venta=recurso_data['costo_venta'],
                margen_venta=recurso_data['margen_venta'],
                porcentaje_margen=recurso_data['porcentaje_margen'],
            )
            db.session.add(nuevo_recurso)

        db.session.commit()

        return jsonify({"message": "Recurso agregado correctamente"}), 200

    except Exception as e:
        print(f"Error al agregar recurso a la cotización: {str(e)}")
        return jsonify({"error": "Error al agregar recurso a la cotización"}), 500
    
@cotizaciones_servicios_bp.route('/recursos/<concepto_id>', methods=['GET'])
@token_required
def obtener_recursos_concepto(current_user, concepto_id):
    try:
        concepto = ConceptoServicio.query.get(concepto_id)

        if concepto.gerente_id != current_user.id:
            return jsonify({"error": "No tienes permisos para ver los recursos de este concepto"}), 403

        recursos = RecursoCotizacion.query.filter_by(concepto_id=concepto_id).all()

        result = []
        for recurso in recursos:
            result.append({
                'id': recurso.id,
                'recurso': recurso.recurso,
                'tarifa_lista': recurso.tarifa_lista,
                'tarifa_venta': recurso.tarifa_venta,
                'preparacion': recurso.preparacion,
                'bbp': recurso.bbp,
                'r_dev': recurso.r_dev,
                'r_pya': recurso.r_pya,
                'pi_pya': recurso.pi_pya,
                'pi_deply': recurso.pi_deply,
                'acompanamiento': recurso.acompanamiento,
                'total_dias': recurso.total_dias,
                'total_venta': recurso.total_venta,
                'costo_venta': recurso.costo_venta,
                'margen_venta': recurso.margen_venta,
                'porcentaje_margen': recurso.porcentaje_margen
            })

        return jsonify(result), 200

    except Exception as e:
        print(f"Error al obtener recursos del concepto: {str(e)}")
        return jsonify({"error": "Error al obtener recursos del concepto"}), 500

@cotizaciones_servicios_bp.route('/conceptos/<concepto_id>/estado', methods=['PATCH'])
@token_required
def actualizar_estado_concepto(current_user, concepto_id):
    try:
        data = request.get_json()
        nuevo_estado = data.get('estado')

        concepto = ConceptoServicio.query.get(concepto_id)

        if concepto.gerente_id != current_user.id:
            return jsonify({"error": "No tienes permisos para cambiar el estado de este concepto"}), 403

        concepto.estado = nuevo_estado
        db.session.commit()

        return jsonify({"message": "Estado del concepto actualizado correctamente"}), 200

    except Exception as e:
        print(f"Error al cambiar estado del concepto: {str(e)}")
        return jsonify({"error": "Error al cambiar estado del concepto"}), 500

@cotizaciones_servicios_bp.route('/enviar/<string:cotizacion_id>', methods=['PATCH'])
@token_required
def enviar_cotizacion(current_user, cotizacion_id):
    try:
        # Filtrar los conceptos completados por el gerente actual
        conceptos_asignados = ConceptoServicio.query.filter_by(
            cotizacion_id=cotizacion_id, gerente_id=current_user.id, estado='Completado'
        ).all()

        if not conceptos_asignados:
            return jsonify({"message": "No tienes conceptos Completados para esta cotización."}), 400

        total_venta_conceptos = 0
        costo_venta_conceptos = 0

        # Recorrer los conceptos asignados para sumar los recursos
        for concepto in conceptos_asignados:
            # Obtener los recursos asociados al concepto
            recursos = concepto.recursos

            # Calcular los totales del concepto en base a sus recursos
            total_venta_recurso = sum(r.total_venta for r in recursos)
            costo_venta_recurso = sum(r.costo_venta for r in recursos)
            margen_venta_recurso = total_venta_recurso - costo_venta_recurso

            # Evitar división por cero en porcentaje de margen
            porcentaje_margen_recurso = (
                (margen_venta_recurso / total_venta_recurso) * 100 if total_venta_recurso != 0 else 0
            )

            # Actualizar el concepto con los nuevos totales
            concepto.total_venta = total_venta_recurso
            concepto.costo_venta = costo_venta_recurso
            concepto.margen_venta = margen_venta_recurso
            concepto.porcentaje_margen = porcentaje_margen_recurso

            # Acumular los totales en las variables globales
            total_venta_conceptos += total_venta_recurso
            costo_venta_conceptos += costo_venta_recurso

            # Cambiar el estado del concepto a "Terminado"
            concepto.estado = 'Terminado'

        # Calcular el margen total de la cotización
        margen_venta_conceptos = total_venta_conceptos - costo_venta_conceptos

        # Obtener la cotización solicitada para actualizar sus totales
        cotizacion = CotizacionSolicitada.query.get(cotizacion_id)
        if not cotizacion:
            return jsonify({"message": "Cotización no encontrada."}), 404

        # Acumular los nuevos totales a los ya existentes
        cotizacion.total_venta += total_venta_conceptos
        cotizacion.costo_venta += costo_venta_conceptos
        cotizacion.margen_venta += margen_venta_conceptos

        # Evitar división por cero en porcentaje de margen
        cotizacion.porcentaje_margen = (
            (cotizacion.margen_venta / cotizacion.total_venta) * 100 if cotizacion.total_venta != 0 else 0
        )

        # Verificar si todos los conceptos de la cotización están "Terminados"
        conceptos_cotizacion = ConceptoServicio.query.filter_by(
            cotizacion_id=cotizacion_id
        ).all()

        if all(concepto.estado == 'Terminado' for concepto in conceptos_cotizacion):
            cotizacion.estado = 'Terminada'

        db.session.commit()

        return jsonify({
            "message": "Conceptos enviados y totales actualizados.",
            "total_venta": cotizacion.total_venta,
            "costo_venta": cotizacion.costo_venta,
            "margen_venta": cotizacion.margen_venta,
            "estado": cotizacion.estado
        }), 200

    except Exception as e:
        print(f"Error al enviar cotización: {str(e)}")
        db.session.rollback()
        return jsonify({"error": "Error al enviar la cotización."}), 500
    
@cotizaciones_servicios_bp.route('/historial', methods=['GET'])
@token_required
def obtener_historial_cotizaciones(current_user):
    try:
        # Filtrar cotizaciones cuyo estado sea 'Terminada'
        cotizaciones = CotizacionSolicitada.query.filter_by(estado='Terminada').all()

        # Construir la respuesta con los datos relevantes
        resultado = []
        for cotizacion in cotizaciones:
            conceptos = ConceptoServicio.query.filter_by(cotizacion_id=cotizacion.id).all()
            conceptos_data = [
                {
                    "id": concepto.id,
                    "nombre_concepto": concepto.nombre_concepto,
                    "estado": concepto.estado,
                    "total_venta": concepto.total_venta,
                    "costo_venta": concepto.costo_venta,
                    "margen_venta": concepto.margen_venta,
                    "porcentaje_margen": concepto.porcentaje_margen,
                }
                for concepto in conceptos
            ]

            resultado.append({
                "id": cotizacion.id,
                "nombre_proyecto": cotizacion.nombre_proyecto,
                "cliente": cotizacion.oportunidad.cliente.nombre,
                "estado": cotizacion.estado,
                "owner": cotizacion.owner_relacion.username,
                "total_venta": cotizacion.total_venta,
                "costo_venta": cotizacion.costo_venta,
                "margen_venta": cotizacion.margen_venta,
                "conceptos": conceptos_data,
            })

        return jsonify(resultado), 200

    except Exception as e:
        print(f"Error al obtener el historial de cotizaciones: {str(e)}")
        return jsonify({"error": "Error al obtener el historial de cotizaciones."}), 500

@cotizaciones_servicios_bp.route('/pendientes_general', methods=['GET'])
@token_required
def obtener_cotizaciones_pendientes_general(current_user):
    try:
        # Obtener cotizaciones en estado "En proceso"
        cotizaciones = CotizacionSolicitada.query.filter_by(estado='En proceso').all()

        result = []
        for cotizacion in cotizaciones:
            conceptos = [{
                'id': concepto.id,
                'nombre_concepto': concepto.nombre_concepto,
                'gerente': concepto.gerente.username,
                'estado': concepto.estado
            } for concepto in cotizacion.conceptos]

            result.append({
                'id': cotizacion.id,
                'nombre_proyecto': cotizacion.nombre_proyecto,
                'cliente': cotizacion.oportunidad.cliente.nombre,
                'owner': cotizacion.owner_relacion.username,
                'estado': cotizacion.estado,
                'conceptos': conceptos
            })

        return jsonify(result), 200

    except Exception as e:
        print(f"Error al obtener cotizaciones pendientes: {str(e)}")
        return jsonify({"error": "Error al obtener cotizaciones pendientes"}), 500
    
@cotizaciones_servicios_bp.route('/historial_general', methods=['GET'])
@token_required
def obtener_historial_cotizaciones_general(current_user):
    try:
        # Obtener cotizaciones en estado "Terminada"
        cotizaciones = CotizacionSolicitada.query.filter_by(estado='Terminada').all()

        result = []
        for cotizacion in cotizaciones:
            conceptos = [{
                'id': concepto.id,
                'nombre_concepto': concepto.nombre_concepto,
                'gerente': concepto.gerente.username,
                'estado': concepto.estado
            } for concepto in cotizacion.conceptos]

            result.append({
                'id': cotizacion.id,
                'nombre_proyecto': cotizacion.nombre_proyecto,
                'cliente': cotizacion.oportunidad.cliente.nombre,
                'owner': cotizacion.owner_relacion.username,
                'estado': cotizacion.estado,
                'conceptos': conceptos
            })

        return jsonify(result), 200

    except Exception as e:
        print(f"Error al obtener historial de cotizaciones: {str(e)}")
        return jsonify({"error": "Error al obtener historial de cotizaciones"}), 500

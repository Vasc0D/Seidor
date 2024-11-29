from flask import Blueprint, request, jsonify
from models import db, Plantilla, ConceptoPlantilla, RecursoPlantilla
from auth import token_required
import uuid

plantillas_bp = Blueprint('plantillas', __name__)

@plantillas_bp.route("/", methods=["POST"])
def create_plantilla():
    try:
        data = request.get_json()

        # Validar datos de la plantilla
        if not data.get("nombre"):
            return jsonify({"error": "El nombre de la plantilla es obligatorio"}), 400

        # Crear la plantilla
        nueva_plantilla = Plantilla(
            id=str(uuid.uuid4()),
            nombre=data["nombre"]
        )
        db.session.add(nueva_plantilla)
        db.session.commit()

        # Crear conceptos asociados a la plantilla
        for concepto_data in data.get("conceptos", []):
            nuevo_concepto = ConceptoPlantilla(
                id=str(uuid.uuid4()),
                plantilla_id=nueva_plantilla.id,
                nombre_concepto=concepto_data["nombre_concepto"]
            )
            db.session.add(nuevo_concepto)
            db.session.commit()

            # Crear recursos asociados al concepto
            for recurso_data in concepto_data.get("recursos", []):
                nuevo_recurso = RecursoPlantilla(
                    id=str(uuid.uuid4()),
                    concepto_id=nuevo_concepto.id,
                    recurso=recurso_data["recurso"],
                    tarifa_lista=recurso_data.get("tarifa_lista", 0),
                    tarifa_venta=recurso_data.get("tarifa_venta", 0),
                    preparacion=recurso_data.get("preparacion", 0),
                    bbp=recurso_data.get("bbp", 0),
                    r_dev=recurso_data.get("r_dev", 0),
                    r_pya=recurso_data.get("r_pya", 0),
                    pi_pya=recurso_data.get("pi_pya", 0),
                    pi_deply=recurso_data.get("pi_deply", 0),
                    acompanamiento=recurso_data.get("acompanamiento", 0),
                    total_dias=recurso_data.get("total_dias", 0),
                    total_venta=recurso_data.get("total_venta", 0),
                    costo_venta=recurso_data.get("costo_venta", 0),
                    margen_venta=recurso_data.get("margen_venta", 0),
                    porcentaje_margen=recurso_data.get("porcentaje_margen", 0),
                )
                db.session.add(nuevo_recurso)

        db.session.commit()

        return jsonify({"message": "Plantilla creada exitosamente"}), 201
    except Exception as e:
        print(f"Error al crear la plantilla: {e}")
        db.session.rollback()
        return jsonify({"error": "Error al crear la plantilla"}), 500
    
@plantillas_bp.route("/<plantilla_id>", methods=["PUT"])
def update_plantilla(plantilla_id):
    try:
        data = request.get_json()

        # Validar datos principales
        if not data.get("nombre"):
            return jsonify({"error": "El nombre de la plantilla es obligatorio"}), 400

        # Buscar la plantilla
        plantilla = Plantilla.query.get(plantilla_id)
        if not plantilla:
            print(f"No se encontró la plantilla con ID: {plantilla_id}")
            return jsonify({"error": "Plantilla no encontrada"}), 404

        # Actualizar nombre de la plantilla
        plantilla.nombre = data["nombre"]

        # Obtener los IDs de conceptos enviados
        nuevos_conceptos_ids = {concepto_data["id"] for concepto_data in data["conceptos"]}

        # Eliminar conceptos que no están en los datos enviados
        for concepto in plantilla.conceptos:
            if concepto.id not in nuevos_conceptos_ids:
                print(f"Eliminando recursos asociados al concepto con ID: {concepto.id}")
                for recurso in concepto.recursos:
                    db.session.delete(recurso)  # Elimina recursos asociados
                print(f"Eliminando concepto con ID: {concepto.id}")
                db.session.delete(concepto)  # Luego elimina el concepto

        # Manejar conceptos enviados
        for concepto_data in data["conceptos"]:
            concepto = ConceptoPlantilla.query.get(concepto_data["id"])
            if concepto is None:
                print(f"No se encontró el concepto con ID: {concepto_data['id']}, se creará uno nuevo.")
                concepto = ConceptoPlantilla(
                    id=concepto_data["id"],
                    plantilla_id=plantilla.id,
                    nombre_concepto=concepto_data["nombre_concepto"],
                )
                db.session.add(concepto)
            else:
                print(f"Actualizando concepto con ID: {concepto_data['id']}")
                concepto.nombre_concepto = concepto_data["nombre_concepto"]

            # Obtener los IDs de recursos enviados para este concepto
            nuevos_recursos_ids = {recurso_data["id"] for recurso_data in concepto_data.get("recursos", [])}

            # Eliminar recursos que no están en los datos enviados
            for recurso in concepto.recursos:
                if recurso.id not in nuevos_recursos_ids:
                    print(f"Eliminando recurso con ID: {recurso.id}")
                    db.session.delete(recurso)

            # Manejar recursos enviados
            for recurso_data in concepto_data.get("recursos", []):
                recurso = RecursoPlantilla.query.get(recurso_data["id"])
                if recurso is None:
                    print(f"No se encontró el recurso con ID: {recurso_data['id']}, se creará uno nuevo.")
                    recurso = RecursoPlantilla(
                        id=recurso_data["id"],
                        concepto_id=concepto.id,
                        recurso=recurso_data["recurso"],
                        tarifa_lista=recurso_data.get("tarifa_lista", 0),
                        tarifa_venta=recurso_data.get("tarifa_venta", 0),
                        preparacion=recurso_data.get("preparacion", 0),
                        bbp=recurso_data.get("bbp", 0),
                        r_dev=recurso_data.get("r_dev", 0),
                        r_pya=recurso_data.get("r_pya", 0),
                        pi_pya=recurso_data.get("pi_pya", 0),
                        pi_deply=recurso_data.get("pi_deply", 0),
                        acompanamiento=recurso_data.get("acompanamiento", 0),
                        total_dias=recurso_data.get("total_dias", 0),
                        total_venta=recurso_data.get("total_venta", 0),
                        costo_venta=recurso_data.get("costo_venta", 0),
                        margen_venta=recurso_data.get("margen_venta", 0),
                        porcentaje_margen=recurso_data.get("porcentaje_margen", 0),
                    )
                    db.session.add(recurso)
                else:
                    print(f"Actualizando recurso con ID: {recurso_data['id']}")
                    recurso.recurso = recurso_data["recurso"]
                    recurso.tarifa_lista = recurso_data.get("tarifa_lista", 0)
                    recurso.tarifa_venta = recurso_data.get("tarifa_venta", 0)
                    recurso.preparacion = recurso_data.get("preparacion", 0)
                    recurso.bbp = recurso_data.get("bbp", 0)
                    recurso.r_dev = recurso_data.get("r_dev", 0)
                    recurso.r_pya = recurso_data.get("r_pya", 0)
                    recurso.pi_pya = recurso_data.get("pi_pya", 0)
                    recurso.pi_deply = recurso_data.get("pi_deply", 0)
                    recurso.acompanamiento = recurso_data.get("acompanamiento", 0)
                    recurso.total_dias = recurso_data.get("total_dias", 0)
                    recurso.total_venta = recurso_data.get("total_venta", 0)
                    recurso.costo_venta = recurso_data.get("costo_venta", 0)
                    recurso.margen_venta = recurso_data.get("margen_venta", 0)
                    recurso.porcentaje_margen = recurso_data.get("porcentaje_margen", 0)

        db.session.commit()
        return jsonify({"message": "Plantilla actualizada exitosamente"}), 200

    except Exception as e:
        print(f"Error al actualizar la plantilla: {e}")
        db.session.rollback()
        return jsonify({"error": "Error al actualizar la plantilla"}), 500

@plantillas_bp.route("/", methods=["GET"])
def get_plantillas():
    try:
        # Obtener todas las plantillas
        plantillas = Plantilla.query.all()

        # Formatear la respuesta
        response = []
        for plantilla in plantillas:
            conceptos = []
            for concepto in plantilla.conceptos:
                recursos = []
                for recurso in concepto.recursos:
                    recursos.append({
                        "id": recurso.id,
                        "recurso": recurso.recurso,
                        "tarifa_lista": float(recurso.tarifa_lista),
                        "tarifa_venta": float(recurso.tarifa_venta),
                        "preparacion": float(recurso.preparacion),
                        "bbp": float(recurso.bbp),
                        "r_dev": float(recurso.r_dev),
                        "r_pya": float(recurso.r_pya),
                        "pi_pya": float(recurso.pi_pya),
                        "pi_deply": float(recurso.pi_deply),
                        "acompanamiento": float(recurso.acompanamiento),
                        "total_dias": float(recurso.total_dias),
                        "total_venta": float(recurso.total_venta),
                        "costo_venta": float(recurso.costo_venta),
                        "margen_venta": float(recurso.margen_venta),
                        "porcentaje_margen": float(recurso.porcentaje_margen)
                    })
                conceptos.append({
                    "id": concepto.id,
                    "nombre_concepto": concepto.nombre_concepto,
                    "recursos": recursos
                })
            response.append({
                "id": plantilla.id,
                "nombre": plantilla.nombre,
                "conceptos": conceptos
            })

        return jsonify(response), 200
    except Exception as e:
        print(f"Error al obtener plantillas: {e}")
        return jsonify({"error": "Error al obtener plantillas"}), 500
    
@plantillas_bp.route("/<plantilla_id>", methods=["DELETE"])
def delete_plantilla(plantilla_id):
    try:
        # Buscar la plantilla por ID
        plantilla = Plantilla.query.get(plantilla_id)
        if not plantilla:
            return jsonify({"error": "Plantilla no encontrada"}), 404

        # Eliminar recursos asociados
        for concepto in plantilla.conceptos:
            for recurso in concepto.recursos:
                db.session.delete(recurso)
            # Eliminar el concepto después de sus recursos
            db.session.delete(concepto)

        # Eliminar la plantilla después de todos sus conceptos y recursos
        db.session.delete(plantilla)

        # Confirmar los cambios en la base de datos
        db.session.commit()

        return jsonify({"message": "Plantilla eliminada correctamente"}), 200

    except Exception as e:
        db.session.rollback()  # Revertir en caso de error
        return jsonify({"error": "Error al eliminar la plantilla", "details": str(e)}), 500
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

        # Validar datos de la plantilla
        if not data.get("nombre"):
            return jsonify({"error": "El nombre de la plantilla es obligatorio"}), 400

        # Obtener la plantilla
        plantilla = Plantilla.query.get(plantilla_id)
        if not plantilla:
            return jsonify({"error": "Plantilla no encontrada"}), 404

        # Actualizar la plantilla
        plantilla.nombre = data["nombre"]
        db.session.commit()

        # Actualizar conceptos asociados a la plantilla
        for concepto_data in data.get("conceptos", []):
            concepto = ConceptoPlantilla.query.get(concepto_data["id"])
            if not concepto:
                nuevo_concepto = ConceptoPlantilla(
                    id=str(uuid.uuid4()),
                    plantilla_id=plantilla.id,
                    nombre_concepto=concepto_data["nombre_concepto"]
                )
                db.session.add(nuevo_concepto)
                db.session.commit()
            else:
                concepto.nombre_concepto = concepto_data["nombre_concepto"]
                db.session.commit()

            # Actualizar recursos asociados al concepto
            for recurso_data in concepto_data.get("recursos", []):
                recurso = RecursoPlantilla.query.get(recurso_data["id"])
                if not recurso:
                    nuevo_recurso = RecursoPlantilla(
                        id=str(uuid.uuid4()),
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
                        total_dias=recurso_data.get("total_dias", 0
                        ),
                        total_venta=recurso_data.get("total_venta", 0),
                        costo_venta=recurso_data.get("costo_venta", 0),
                        margen_venta=recurso_data.get("margen_venta", 0),
                        porcentaje_margen=recurso_data.get("porcentaje_margen", 0),
                    )
                    db.session.add(nuevo_recurso)
                    db.session.commit()
                else:
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
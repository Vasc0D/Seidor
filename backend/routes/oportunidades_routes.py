from flask import Blueprint, request, jsonify
from models import Oportunidad, db, Cliente, Concepto, DetalleConcepto
from auth import token_required

oportunidades_bp = Blueprint('oportunidades', __name__)

# Obtener todas las oportunidades
@oportunidades_bp.route('/', methods=['GET'])
@token_required
def get_oportunidades(current_user):
    try:
        oportunidades = []
        if current_user.role == 'admin':
            # Si el usuario es administrador, obtener todas las oportunidades
            oportunidades = Oportunidad.query.all()
        else:
            # Si es un usuario normal, filtrar por las oportunidades del cotizador
            oportunidades = Oportunidad.query.filter_by(owner=current_user.id).all()
        
        return jsonify([{
            'id': o.id,
            'nombre_op': o.nombre_op,
            'cliente': o.cliente.nombre,  # Asume que siempre hay un cliente asociado
            'total_venta': o.total_venta,  # Incluir total_venta
            'costo_venta': o.costo_venta,  # Incluir costo_venta
            'margen_venta': o.margen_venta,  # Incluir margen_venta
            'estado': o.estado  # Incluir estado
        } for o in oportunidades]), 200
    except Exception as e:
        print("Error al obtener oportunidades:", str(e))
        return jsonify({"error": "Error al obtener oportunidades"}), 500

# Obtener oportunidad por ID (ruta con el ID en la URL)
@oportunidades_bp.route('/<string:id>', methods=['GET'])  
@token_required
def get_oportunidad_by_id(current_user, id):
    try:
        # Obtener la oportunidad
        oportunidad = Oportunidad.query.get(id)
        if not oportunidad:
            return jsonify({"error": "Oportunidad no encontrada"}), 404

        # Asegurar que el usuario actual es el propietario (cotizador) o es admin
        if oportunidad.owner != current_user.id and current_user.role != 'admin':
            return jsonify({"error": "No tienes permiso para ver esta oportunidad"}), 403

        # Obtener los conceptos asociados con la oportunidad
        conceptos = []
        for concepto in oportunidad.conceptos:
          conceptos.append({
            'id': concepto.id,
            'tipoCotizacion': concepto.nombre_concepto,
            'baseDeDatos': concepto.base_datos,
            'totalVenta': concepto.total_venta,
            'costoVenta': concepto.costo_venta,
            'margenVenta': concepto.margen_venta,
            'licenciasSeleccionadas': [{
                'tipo': detalle.nombre_item,
                'cantidad': detalle.cantidad,
                'costo': detalle.costo,
                'total': detalle.total
            } for detalle in concepto.detalles]  # Asegura que estás incluyendo los detalles en el formato correcto
        })

        # Devolver los datos de la oportunidad junto con el cliente y los conceptos
        return jsonify({
            'id': oportunidad.id,
            'nombre_op': oportunidad.nombre_op,
            'cliente': {
                'id': oportunidad.cliente.id,
                'nombre': oportunidad.cliente.nombre,
                'ruc': oportunidad.cliente.ruc,
                'sociedades': oportunidad.cliente.sociedades,
                'empleados': oportunidad.cliente.empleados
            },
            'total_venta': oportunidad.total_venta,
            'costo_venta': oportunidad.costo_venta,
            'margen_venta': oportunidad.margen_venta,
            'estado': oportunidad.estado,
            'itemsCotizacion': conceptos
        }), 200

    except Exception as e:
        print("Error al obtener oportunidad por ID:", str(e))
        return jsonify({"error": "Error al obtener oportunidad"}), 500

# Actualizar oportunidad por ID (ruta con el ID en la URL)
@oportunidades_bp.route('/<string:id>', methods=['PATCH'])  # Cambiado a string ya que el ID es un UUID
@token_required
def update_oportunidad_by_id(current_user, id):
    data = request.json

    try:
        oportunidad = Oportunidad.query.get(id)

        if not oportunidad:
            return jsonify({"error": "Oportunidad no encontrada"}), 404

        # Asegurar que el usuario actual es el propietario (cotizador) o es admin
        if oportunidad.owner != current_user.id and current_user.role != 'admin':
            return jsonify({"error": "No tienes permiso para actualizar esta oportunidad"}), 403

        estado = data.get('estado')

        # Actualizar los campos
        oportunidad.estado = estado
        db.session.commit()

        return jsonify({
            'id': oportunidad.id,
            'nombre_op': oportunidad.nombre_op,
            'cliente': oportunidad.cliente.nombre,
            'estado': oportunidad.estado
        }), 200
    except Exception as e:
        print("Error al actualizar oportunidad:", str(e))
        return jsonify({"error": "Error al actualizar oportunidad"}), 500

@oportunidades_bp.route('/', methods=['POST'])
@token_required
def create_oportunidad(current_user):
    data = request.json

    cliente_id = data.get('cliente_id')
    nombre_op = data.get('nombre_op')
    total_venta = data.get('total_venta')
    costo_venta = data.get('costo_venta')
    margen_venta = data.get('margen_venta')
    itemsCotizacion = data.get('itemsCotizacion')  # Asegurarse de recibir los conceptos e ítems

    try:
        # Verificar que el cliente exista
        cliente = Cliente.query.get(cliente_id)
        if not cliente:
            return jsonify({"error": "Cliente no encontrado"}), 404

        # Crear una nueva oportunidad
        nueva_oportunidad = Oportunidad(
            nombre_op=nombre_op,
            cliente_id=cliente_id,
            total_venta=total_venta,
            costo_venta=costo_venta,
            margen_venta=margen_venta,
            estado='Pendiente',
            owner=current_user.id  # Asignar el usuario autenticado como cotizador
        )

        # Agregar la nueva oportunidad a la base de datos
        db.session.add(nueva_oportunidad)
        db.session.commit()  # Hacemos commit para que la oportunidad obtenga su ID

        # Insertar los conceptos relacionados con la oportunidad
        for item in itemsCotizacion:
            nuevo_concepto = Concepto(
                oportunidad_id=nueva_oportunidad.id,
                nombre_concepto=item.get('tipoCotizacion'),
                base_datos=item.get('baseDeDatos', ''),
                total_venta=item.get('totalVenta'),
                costo_venta=item.get('costoVenta'),
                margen_venta=item.get('margenVenta')
            )

            # Agregar el concepto a la base de datos
            db.session.add(nuevo_concepto)
            db.session.commit()  # Commit para que el concepto obtenga su ID

            # Insertar los detalles relacionados al concepto
            for licencia in item.get('licenciasSeleccionadas', []):
                nuevo_detalle = DetalleConcepto(
                    concepto_id=nuevo_concepto.id,
                    nombre_item=licencia.get('tipo'),
                    cantidad=licencia.get('cantidad'),
                    costo=licencia.get('costo'),
                    total=licencia.get('total')
                )

                # Agregar el detalle del concepto
                db.session.add(nuevo_detalle)

        # Hacer commit para guardar los detalles
        db.session.commit()

        return jsonify({
            'message': 'Oportunidad creada',
            'oportunidad': {
                'id': nueva_oportunidad.id,
                'nombre_op': nueva_oportunidad.nombre_op,
                'cliente': nueva_oportunidad.cliente.nombre,
                'total_venta': nueva_oportunidad.total_venta,
                'costo_venta': nueva_oportunidad.costo_venta,
                'margen_venta': nueva_oportunidad.margen_venta
            }
        }), 201

    except Exception as e:
        db.session.rollback()  # Revertir los cambios si ocurre un error
        print("Error al crear oportunidad:", str(e))
        return jsonify({"error": "Error al crear la oportunidad"}), 500

from flask import Blueprint, request, jsonify
from models import Oportunidad, db, Cliente, Concepto, DetalleConcepto, RecursoCotizacion, CotizacionSolicitada, ConceptoServicio, User
from auth import token_required
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

def send_email(to_email, subject, body):
    # Configuración del servidor SMTP de Gmail
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    from_email = "xasco2004@gmail.com"  # Cambia esto por tu correo de Gmail
    password = "vgsy srqw zqkz lyyw"  # Usa tu contraseña de Gmail o contraseña de aplicación

    # Configurar el mensaje de correo
    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        # Conectar al servidor SMTP de Gmail y enviar el correo
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Iniciar conexión segura
        server.login(from_email, password)
        server.sendmail(from_email, to_email, msg.as_string())
        server.quit()
        print("Correo enviado exitosamente.")
    except Exception as e:
        print(f"Error al enviar el correo: {e}")

#####################################################################

oportunidades_bp = Blueprint('oportunidades', __name__)

@oportunidades_bp.route('/', methods=['POST'])
@token_required
def create_oportunidad(current_user):
    data = request.json

    # Datos principales de la oportunidad
    cliente_id = data.get('cliente_id')
    nombre_op = data.get('nombre_op')
    total_venta = data.get('total_venta', 0)
    costo_venta = data.get('costo_venta', 0)
    margen_venta = data.get('margen_venta', 0)
    itemsCotizacion = data.get('itemsCotizacion', [])  # Licencias/Conceptos
    servicios = data.get('servicios', [])  # Servicios con conceptos y recursos

    try:
        # Verificar que el cliente exista
        cliente = Cliente.query.get(cliente_id)
        if not cliente:
            return jsonify({"error": "Cliente no encontrado"}), 404

        # Crear la nueva oportunidad
        nueva_oportunidad = Oportunidad(
            nombre_op=nombre_op,
            cliente_id=cliente_id,
            total_venta=total_venta,
            costo_venta=costo_venta,
            margen_venta=margen_venta,
            estado='Pendiente',
            owner=current_user.id  # Asignar el usuario autenticado como cotizador
        )

        # Agregar la oportunidad a la base de datos
        db.session.add(nueva_oportunidad)
        db.session.commit()  # Commit para obtener el ID

        ### 1. Insertar Conceptos/Licencias relacionados con la oportunidad ###
        for item in itemsCotizacion:
            nuevo_concepto = Concepto(
                oportunidad_id=nueva_oportunidad.id,
                nombre_concepto=item.get('tipoCotizacion'),
                base_datos=item.get('baseDeDatos', ''),
                solution=item.get('solution', ''),
                total_venta=item.get('totalVenta', 0),
                costo_venta=item.get('costoVenta', 0),
                margen_venta=item.get('margenVenta', 0)
            )

            db.session.add(nuevo_concepto)
            db.session.commit()  # Commit para obtener el ID del concepto

            # Insertar los detalles de las licencias asociadas al concepto
            for licencia in item.get('licenciasSeleccionadas', []):
                nuevo_detalle = DetalleConcepto(
                    concepto_id=nuevo_concepto.id,
                    licencia_id=licencia.get('tipo'),
                    nombre_item=licencia.get('name'),
                    cantidad=licencia.get('cantidad', 0),
                    costo=licencia.get('costo', 0),
                    total=licencia.get('total', 0)
                )
                db.session.add(nuevo_detalle)

        ### 2. Insertar Servicios con Conceptos y Recursos ###
        for servicio in servicios:
            nueva_cotizacion_servicio = CotizacionSolicitada(
                nombre_proyecto=servicio.get('nombre_proyecto'),
                oportunidad_id=nueva_oportunidad.id,
                owner=current_user.id,  # Usuario que solicita la cotización
                estado='En proceso',  # Estado inicial
                total_venta=servicio.get('total_venta', 0),
                costo_venta=servicio.get('costo_venta', 0),
                margen_venta=servicio.get('margen_venta', 0)
            )

            db.session.add(nueva_cotizacion_servicio)
            db.session.commit()  # Commit para obtener el ID de la cotización

            # Insertar los Conceptos dentro del Servicio
            for concepto in servicio.get('conceptos', []):
                nuevo_concepto_servicio = ConceptoServicio(
                    cotizacion_id=nueva_cotizacion_servicio.id,
                    nombre_concepto=concepto.get('nombre_concepto', ''),
                    gerente_id=concepto.get('gerente_id'),  # Gerente asignado
                    total_venta=concepto.get('total_venta', 0),
                    costo_venta=concepto.get('costo_venta', 0),
                    margen_venta=concepto.get('margen_venta', 0),
                    porcentaje_margen=concepto.get('porcentaje_margen', 0)
                )

                db.session.add(nuevo_concepto_servicio)
                db.session.commit()  # Commit para obtener el ID del concepto

                # Insertar los Recursos asociados al concepto de servicio
                for recurso in concepto.get('recursos', []):
                    nuevo_recurso = RecursoCotizacion(
                        concepto_id=nuevo_concepto_servicio.id,
                        recurso=recurso.get('recurso', ''),
                        tarifa_lista=recurso.get('tarifa_lista', 0),
                        tarifa_venta=recurso.get('tarifa_venta', 0),
                        preparacion=recurso.get('preparacion', 0),
                        bbp=recurso.get('bbp', 0),
                        r_dev=recurso.get('r_dev', 0),
                        r_pya=recurso.get('r_pya', 0),
                        pi_pya=recurso.get('pi_pya', 0),
                        pi_deply=recurso.get('pi_deply', 0),
                        acompanamiento=recurso.get('acompanamiento', 0),
                        total_dias=recurso.get('total_dias', 0),
                        total_venta=recurso.get('total_venta', 0),
                        costo_venta=recurso.get('costo_venta', 0),
                        margen_venta=recurso.get('margen_venta', 0),
                        porcentaje_margen=recurso.get('porcentaje_margen', 0)
                    )
                    db.session.add(nuevo_recurso)

        # Commit final para guardar todo en la base de datos
        db.session.commit()

        # **Enviar correo solo a los gerentes asignados a conceptos de los servicios**
        if servicios:
            gerentes_a_notificar = set()  # Usamos un set para evitar duplicados

            for servicio in servicios:
                for concepto in servicio.get('conceptos', []):
                    gerente_id = concepto.get('gerente_id')
                    if gerente_id:
                        gerente = User.query.get(gerente_id)
                        if gerente and gerente.correo:
                            gerentes_a_notificar.add(gerente)  # Agregar solo si tiene correo

            # Enviar correo a cada gerente único
            for gerente in gerentes_a_notificar:
                subject = "Nueva cotización de servicio pendiente"
                message = f"Estimado {gerente.username},\n\nTienes una nueva cotización pendiente para el cliente {cliente.nombre}."
                send_email(gerente.correo, subject, message)

        return jsonify({
            'message': 'Oportunidad creada exitosamente',
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
        db.session.rollback()  # Revertir los cambios en caso de error
        print(f"Error al crear la oportunidad: {str(e)}")
        return jsonify({"error": "Error al crear la oportunidad"}), 500

# Obtener todas las oportunidades
@oportunidades_bp.route('/', methods=['GET'])
@token_required
def get_oportunidades(current_user):
    try:
        oportunidades = []
        if current_user.role == 'Administrador':
            # Si el usuario es Administrador, obtener todas las oportunidades
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

        # Asegurar que el usuario actual es el propietario (cotizador) o es Administrador
        if oportunidad.owner != current_user.id and current_user.role != 'Administrador':
            return jsonify({"error": "No tienes permiso para ver esta oportunidad"}), 403

        # Obtener los conceptos/licencias asociados con la oportunidad
        conceptos = [
            {
                'id': concepto.id,
                'tipoCotizacion': concepto.nombre_concepto,
                'baseDeDatos': concepto.base_datos,
                'solution': concepto.solution,
                'totalVenta': concepto.total_venta,
                'costoVenta': concepto.costo_venta,
                'margenVenta': concepto.margen_venta,
                'licenciasSeleccionadas': [
                    {
                        'tipo': detalle.licencia_id,
                        'name': detalle.nombre_item,
                        'cantidad': detalle.cantidad,
                        'costo': detalle.costo,
                        'total': detalle.total,
                    } for detalle in concepto.detalles
                ]
            } for concepto in oportunidad.conceptos
        ]

        # Obtener los servicios y sus conceptos asociados
        servicios = [
            {
                'id': servicio.id,
                'nombre_proyecto': servicio.nombre_proyecto,
                'total_venta': servicio.total_venta,
                'costo_venta': servicio.costo_venta,
                'margen_venta': servicio.margen_venta,
                'estado': servicio.estado,
                'conceptos': [
                    {
                        'id': concepto.id,
                        'nombre_concepto': concepto.nombre_concepto,
                        'gerente_id': concepto.gerente_id,
                        'total_venta': concepto.total_venta,
                        'costo_venta': concepto.costo_venta,
                        'margen_venta': concepto.margen_venta,
                        'porcentaje_margen': concepto.porcentaje_margen,
                        'recursos': [
                            {
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
                                'porcentaje_margen': recurso.porcentaje_margen,
                            } for recurso in concepto.recursos
                        ]
                    } for concepto in servicio.conceptos
                ]
            } for servicio in oportunidad.cotizaciones_solicitadas
        ]

        # Devolver la respuesta con todos los datos
        return jsonify({
            'id': oportunidad.id,
            'nombre_op': oportunidad.nombre_op,
            'cliente': {
                'id': oportunidad.cliente.id,
                'nombre': oportunidad.cliente.nombre,
                'ruc': oportunidad.cliente.ruc,
                'sociedades': oportunidad.cliente.sociedades,
                'empleados': oportunidad.cliente.empleados,
            },
            'total_venta': oportunidad.total_venta,
            'costo_venta': oportunidad.costo_venta,
            'margen_venta': oportunidad.margen_venta,
            'estado': oportunidad.estado,
            'itemsCotizacion': conceptos,
            'servicios': servicios,
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

        # Asegurar que el usuario actual es el propietario (cotizador) o es Administrador
        if oportunidad.owner != current_user.id and current_user.role != 'Administrador':
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

# Actualizar oportunidad completa por ID (ruta con el ID en la URL)
@oportunidades_bp.route('/<string:id>', methods=['PUT'])  # Cambiado a PUT para actualización completa
@token_required
def update_oportunidad_completa_by_id(current_user, id):
    data = request.json

    cliente_id = data.get('cliente_id')
    nombre_op = data.get('nombre_op')
    total_venta = data.get('total_venta')
    costo_venta = data.get('costo_venta')
    margen_venta = data.get('margen_venta')
    itemsCotizacion = data.get('itemsCotizacion', [])
    servicios = data.get('servicios', [])

    try:
        oportunidad = Oportunidad.query.get(id)

        if not oportunidad:
            return jsonify({"error": "Oportunidad no encontrada"}), 404

        # Asegurar que el usuario actual es el propietario o Administrador
        if oportunidad.owner != current_user.id and current_user.role != 'Administrador':
            return jsonify({"error": "No tienes permiso para actualizar esta oportunidad"}), 403

        # Verificar que el cliente exista
        cliente = Cliente.query.get(cliente_id)
        if not cliente:
            return jsonify({"error": "Cliente no encontrado"}), 404

        # Actualizar los campos principales de la oportunidad
        oportunidad.nombre_op = nombre_op
        oportunidad.cliente_id = cliente_id
        oportunidad.total_venta = total_venta
        oportunidad.costo_venta = costo_venta
        oportunidad.margen_venta = margen_venta

        # Eliminar los conceptos/licencias y servicios existentes
        for concepto in oportunidad.conceptos:
            for detalle in concepto.detalles:
                db.session.delete(detalle)
            db.session.delete(concepto)

        for servicio in oportunidad.cotizaciones_solicitadas:
            for concepto_servicio in servicio.conceptos:
                for recurso in concepto_servicio.recursos:
                    db.session.delete(recurso)
                db.session.delete(concepto_servicio)
            db.session.delete(servicio)

        # Insertar los nuevos conceptos/licencias
        for item in itemsCotizacion:
            nuevo_concepto = Concepto(
                oportunidad_id=oportunidad.id,
                nombre_concepto=item.get('tipoCotizacion'),
                base_datos=item.get('baseDeDatos', ''),
                solution=item.get('solution', ''),
                total_venta=item.get('totalVenta', 0),
                costo_venta=item.get('costoVenta', 0),
                margen_venta=item.get('margenVenta', 0)
            )
            db.session.add(nuevo_concepto)
            db.session.commit()

            for licencia in item.get('licenciasSeleccionadas', []):
                nuevo_detalle = DetalleConcepto(
                    concepto_id=nuevo_concepto.id,
                    licencia_id=licencia.get('tipo'),
                    nombre_item=licencia.get('name'),
                    cantidad=licencia.get('cantidad', 0),
                    costo=licencia.get('costo', 0),
                    total=licencia.get('total', 0)
                )
                db.session.add(nuevo_detalle)

        # Insertar los servicios con sus conceptos y recursos
        for servicio in servicios:
            nueva_cotizacion_servicio = CotizacionSolicitada(
                nombre_proyecto=servicio.get('nombre_proyecto'),
                oportunidad_id=oportunidad.id,
                owner=current_user.id,
                estado='En proceso',
                total_venta=servicio.get('total_venta', 0),
                costo_venta=servicio.get('costo_venta', 0),
                margen_venta=servicio.get('margen_venta', 0)
            )
            db.session.add(nueva_cotizacion_servicio)
            db.session.commit()

            for concepto in servicio.get('conceptos', []):
                nuevo_concepto_servicio = ConceptoServicio(
                    cotizacion_id=nueva_cotizacion_servicio.id,
                    nombre_concepto=concepto.get('nombre_concepto', ''),
                    gerente_id=concepto.get('gerente_id'),
                    total_venta=concepto.get('total_venta', 0),
                    costo_venta=concepto.get('costo_venta', 0),
                    margen_venta=concepto.get('margen_venta', 0),
                    porcentaje_margen=concepto.get('porcentaje_margen', 0)
                )
                db.session.add(nuevo_concepto_servicio)
                db.session.commit()

                for recurso in concepto.get('recursos', []):
                    nuevo_recurso = RecursoCotizacion(
                        concepto_id=nuevo_concepto_servicio.id,
                        recurso=recurso['recurso'],
                        tarifa_lista=recurso['tarifa_lista'],
                        tarifa_venta=recurso['tarifa_venta'],
                        preparacion=recurso['preparacion'],
                        bbp=recurso['bbp'],
                        r_dev=recurso['r_dev'],
                        r_pya=recurso['r_pya'],
                        pi_pya=recurso['pi_pya'],
                        pi_deply=recurso['pi_deply'],
                        acompanamiento=recurso['acompanamiento'],
                        total_dias=recurso['total_dias'],
                        total_venta=recurso['total_venta'],
                        costo_venta=recurso['costo_venta'],
                        margen_venta=recurso['margen_venta'],
                        porcentaje_margen=recurso['porcentaje_margen']
                    )
                    db.session.add(nuevo_recurso)

        # Hacer commit final
        db.session.commit()

        # **Enviar correo solo a los gerentes asignados a conceptos de los servicios**
        if servicios:
            gerentes_a_notificar = set()  # Usamos un set para evitar duplicados
            
            for servicio in servicios:
                for concepto in servicio.get('conceptos', []):
                    gerente_id = concepto.get('gerente_id')
                    if gerente_id:
                        gerente = User.query.get(gerente_id)
                        if gerente and gerente.correo:
                            gerentes_a_notificar.add(gerente)  # Agregar solo si tiene correo

            # Enviar correo a cada gerente único
            for gerente in gerentes_a_notificar:
                subject = "Nueva cotización de servicio pendiente"
                message = f"Estimado {gerente.username},\n\nTienes una nueva cotización pendiente para el cliente {cliente.nombre}."
                send_email(gerente.correo, subject, message)

        return jsonify({
            'id': oportunidad.id,
            'nombre_op': oportunidad.nombre_op,
            'cliente': oportunidad.cliente.nombre,
            'total_venta': oportunidad.total_venta,
            'costo_venta': oportunidad.costo_venta,
            'margen_venta': oportunidad.margen_venta
        }), 200

    except Exception as e:
        db.session.rollback()
        print("Error al actualizar oportunidad completa:", str(e))
        return jsonify({"error": "Error al actualizar la oportunidad"}), 500

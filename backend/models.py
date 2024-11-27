from flask_sqlalchemy import SQLAlchemy
import uuid

db = SQLAlchemy()

class Session(db.Model):
    __tablename__ = "Sesiones"
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True)
    user = db.Column(db.String(36), db.ForeignKey('Users.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    expiry = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp() + 1 )

class Cliente(db.Model):
    __tablename__ = 'Clientes'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True)  # UUID
    razon_social = db.Column(db.String(255), nullable=True)
    nombre = db.Column(db.String(255), nullable=True)
    ruc = db.Column(db.String(20), nullable=True)
    sociedades = db.Column(db.Integer, nullable=True)
    empleados = db.Column(db.Integer, nullable=True)
    vip = db.Column(db.Boolean, nullable=True, default=False)
    activo = db.Column(db.Boolean, nullable=True, default=True)
    owner = db.Column(db.String(36), db.ForeignKey('Users.id'), nullable=False)  # UUID FK

    owner_relacion = db.relationship('User', backref='clientes')

class User(db.Model):
    __tablename__ = 'Users'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True)  # UUID
    username = db.Column(db.String(50), nullable=False, unique=True)
    name = db.Column(db.String(100), nullable=True)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    correo = db.Column(db.String(100), nullable=True)

    def serialize(self):
        return {
            'id': self.id,
            'username': self.username,
            'name': self.name,
            'role': self.role,
            'correo': self.correo
        }

class Oportunidad(db.Model):
    __tablename__ = 'Oportunidades'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True)  # UUID
    cliente_id = db.Column(db.String(36), db.ForeignKey('Clientes.id'), nullable=False)  # UUID FK
    nombre_op = db.Column(db.String(255), nullable=False)
    estado = db.Column(db.String(20), default='pendiente', nullable=False)
    total_venta = db.Column(db.Numeric(10, 2), default=0)
    costo_venta = db.Column(db.Numeric(10, 2), default=0)
    margen_venta = db.Column(db.Numeric(10, 2), default=0)
    owner = db.Column(db.String(36), db.ForeignKey('Users.id'), nullable=False)  # UUID FK

    cliente = db.relationship('Cliente', backref='oportunidades')
    owner_relacion = db.relationship('User', backref='oportunidades_cotizadas')

class Concepto(db.Model):
    __tablename__ = 'Conceptos'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True)  # UUID
    oportunidad_id = db.Column(db.String(36), db.ForeignKey('Oportunidades.id'), nullable=False)  # UUID FK
    nombre_concepto = db.Column(db.String(255), nullable=False)
    base_datos = db.Column(db.String(50), nullable=True)
    solution = db.Column(db.String(50), nullable=True)
    total_venta = db.Column(db.Numeric(10, 2), default=0)
    costo_venta = db.Column(db.Numeric(10, 2), default=0)
    margen_venta = db.Column(db.Numeric(10, 2), default=0)

    oportunidad = db.relationship('Oportunidad', backref='conceptos')

class DetalleConcepto(db.Model):
    __tablename__ = 'Detalle_Conceptos'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True)  # UUID
    concepto_id = db.Column(db.String(36), db.ForeignKey('Conceptos.id'), nullable=False)  # UUID FK
    licencia_id = db.Column(db.String(255), nullable=True)
    nombre_item = db.Column(db.String(255), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    costo = db.Column(db.Numeric(10, 2), nullable=False)
    total = db.Column(db.Numeric(10, 2), nullable=False)

    concepto = db.relationship('Concepto', backref='detalles')

class LicenciaSAP(db.Model):
    __tablename__ = 'LicenciasSAP'
    id = db.Column(db.String(255), primary_key=True, nullable=False)  # Código de la licencia
    name = db.Column(db.String(255), nullable=False)  # Nombre de la licencia (Ej. SAP Business One Professional User)
    type = db.Column(db.String(50), nullable=False)  # Tipo de licencia (On-Premise, On-Cloud)
    user_type = db.Column(db.String(100), nullable=False)  # Tipo de usuario o licencia (Named User, Database, etc.)
    sales_unit = db.Column(db.String(100), nullable=False)  # Unidad de venta (Ej. User, Core, etc
    metric = db.Column(db.String(100), nullable=True)  # Métrica (Ej. Users, Cores, etc.)
    fee_type = db.Column(db.String(50), nullable=False)  # Tipo de tarifa (One-time, Monthly)
    db_engine = db.Column(db.String(50), nullable=True)  # Motor de base de datos (Ej. HANA, SQL) - solo para On-Premise

    price_ranges = db.relationship('LicenciasSAPPriceRange', backref='licencia', lazy=True)

    def __repr__(self):
        return f'<LicenciaSAP {self.name}>'
    
class LicenciasSAPPriceRange(db.Model):
    __tablename__ = 'LicenciasSAPPriceRange'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True)  # UUID
    licencia_id = db.Column(db.String(255), db.ForeignKey('LicenciasSAP.id'), nullable=False)  # Código de la licencia
    from_range = db.Column(db.Numeric(10, 2), nullable=False)  # Rango de precios desde
    to_range = db.Column(db.Numeric(10, 2), nullable=True)  # Rango de precios hasta
    price = db.Column(db.Numeric(10, 2), nullable=False, default='USD')  # Precio

    def __repr__(self):
        return f'<LicenciasSAPPriceRange {self.licencia_id}>'
    
class LicenciasSeidor(db.Model):
    __tablename__ = 'LicenciasSeidor'
    id = db.Column(db.String(255), primary_key=True, nullable=False)  # Código de la licencia
    name = db.Column(db.String(255), nullable=False)  # Nombre de la licencia
    user_type = db.Column(db.String(100), nullable=False)  # Tipo de licencia (Horizontal, Vertical)
    fee_type = db.Column(db.String(50), nullable=False)  # Tipo de tarifa (One-time, x cada N usuarios)
    
    def __repr__(self):
        return f'<LicenciaSeidor {self.name}>'

class LicenciasSeidorTipo(db.Model):
    __tablename__ = 'LicenciasSeidorTipo'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True)
    licencia_id = db.Column(db.String(255), db.ForeignKey('LicenciasSeidor.id'), nullable=False)  # Relación con la tabla LicenciasSeidor
    type = db.Column(db.String(50), nullable=False)  # On-Premise o On-Cloud
    price = db.Column(db.Numeric(10, 2), nullable=False)  # Precio de la licencia
    
    def __repr__(self):
        return f'<LicenciaSeidorTipo {self.licencia_id} - {self.type}>'

class CotizacionSolicitada(db.Model):
    __tablename__ = 'CotizacionesSolicitadas'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True)
    nombre_proyecto = db.Column(db.String(100), nullable=False)  # Nombre del proyecto o servicio
    oportunidad_id = db.Column(db.String(36), db.ForeignKey('Oportunidades.id'), nullable=False)
    total_venta = db.Column(db.Numeric(10, 2), default=0)
    costo_venta = db.Column(db.Numeric(10, 2), default=0)
    margen_venta = db.Column(db.Numeric(10, 2), default=0)
    owner = db.Column(db.String(36), db.ForeignKey('Users.id'), nullable=False)
    estado = db.Column(db.String(20), nullable=False, default='En proceso')
    fecha_creacion = db.Column(db.DateTime, default=db.func.current_timestamp())
    fecha_terminacion = db.Column(db.DateTime, nullable=True)

    owner_relacion = db.relationship('User', foreign_keys=[owner], backref='cotizaciones_solicitadas')
    oportunidad = db.relationship('Oportunidad', backref='cotizaciones_solicitadas')
    conceptos = db.relationship('ConceptoServicio', backref='cotizacion')

    def __repr__(self):
        return f'<CotizacionSolicitada {self.nombre_proyecto} - Estado: {self.estado}>'

class ConceptoServicio(db.Model):
    __tablename__ = 'ConceptosServicio'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True)
    cotizacion_id = db.Column(db.String(36), db.ForeignKey('CotizacionesSolicitadas.id'), nullable=False)
    nombre_concepto = db.Column(db.String(100), nullable=False)
    gerente_id = db.Column(db.String(36), db.ForeignKey('Users.id'), nullable=False)
    estado = db.Column(db.String(20), nullable=False, default='En proceso')
    total_venta = db.Column(db.Numeric(10, 2), default=0)
    costo_venta = db.Column(db.Numeric(10, 2), default=0)
    margen_venta = db.Column(db.Numeric(10, 2), default=0)
    porcentaje_margen = db.Column(db.Numeric(5, 2), default=0)

    gerente = db.relationship('User', backref='conceptos_servicio')
    recursos = db.relationship('RecursoCotizacion', backref='concepto')

class RecursoCotizacion(db.Model):
    __tablename__ = 'RecursosCotizacion'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True)
    concepto_id = db.Column(db.String(36), db.ForeignKey('ConceptosServicio.id'), nullable=False)
    recurso = db.Column(db.String(100), nullable=False)  # Ej. "Gerente de Proyecto"
    tarifa_lista = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    tarifa_venta = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    preparacion = db.Column(db.Float, nullable=False, default=0)
    bbp = db.Column(db.Float, nullable=False, default=0)
    r_dev = db.Column(db.Float, nullable=False, default=0)
    r_pya = db.Column(db.Float, nullable=False, default=0)
    pi_pya = db.Column(db.Float, nullable=False, default=0)
    pi_deply = db.Column(db.Float, nullable=False, default=0)
    acompanamiento = db.Column(db.Float, nullable=False, default=0)
    total_dias = db.Column(db.Float, nullable=False, default=0)
    total_venta = db.Column(db.Numeric(10, 2), default=0)
    costo_venta = db.Column(db.Numeric(10, 2), default=0)
    margen_venta = db.Column(db.Numeric(10, 2), default=0)
    porcentaje_margen = db.Column(db.Numeric(5, 2), default=0)

class Plantilla(db.Model):
    __tablename__ = 'Plantillas'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True)
    nombre = db.Column(db.String(100), nullable=False, unique=True)  # Nombre de la plantilla
    fecha_creacion = db.Column(db.DateTime, default=db.func.current_timestamp())

    conceptos = db.relationship('ConceptoPlantilla', backref='plantilla')

class ConceptoPlantilla(db.Model):
    __tablename__ = 'ConceptosPlantilla'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True)
    plantilla_id = db.Column(db.String(36), db.ForeignKey('Plantillas.id'), nullable=False)
    nombre_concepto = db.Column(db.String(100), nullable=False)

    recursos = db.relationship('RecursoPlantilla', backref='concepto')

class RecursoPlantilla(db.Model):
    __tablename__ = 'RecursosPlantilla'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True)
    concepto_id = db.Column(db.String(36), db.ForeignKey('ConceptosPlantilla.id'), nullable=False)
    recurso = db.Column(db.String(100), nullable=False)  # Ej. "Gerente de Proyecto"
    tarifa_lista = db.Column(db.Numeric(10, 2), nullable=True, default=0)
    tarifa_venta = db.Column(db.Numeric(10, 2), nullable=True, default=0)
    preparacion = db.Column(db.Float, nullable=True, default=0)
    bbp = db.Column(db.Float, nullable=True, default=0)
    r_dev = db.Column(db.Float, nullable=True, default=0)
    r_pya = db.Column(db.Float, nullable=True, default=0)
    pi_pya = db.Column(db.Float, nullable=True, default=0)
    pi_deply = db.Column(db.Float, nullable=True, default=0)
    acompanamiento = db.Column(db.Float, nullable=True, default=0)
    total_dias = db.Column(db.Float, nullable=True, default=0)
    total_venta = db.Column(db.Numeric(10, 2), default=0)
    costo_venta = db.Column(db.Numeric(10, 2), default=0)
    margen_venta = db.Column(db.Numeric(10, 2), default=0)
    porcentaje_margen = db.Column(db.Numeric(5, 2), default=0)


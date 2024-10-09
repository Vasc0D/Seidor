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
    nombre = db.Column(db.String(255), nullable=False)
    ruc = db.Column(db.String(20), nullable=False)
    sociedades = db.Column(db.Integer, nullable=False)
    empleados = db.Column(db.Integer, nullable=False)
    owner = db.Column(db.String(36), db.ForeignKey('Users.id'), nullable=False)  # UUID FK

    owner_relacion = db.relationship('User', backref='clientes')

class User(db.Model):
    __tablename__ = 'Users'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True)  # UUID
    username = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False)

    def serialize(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role
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

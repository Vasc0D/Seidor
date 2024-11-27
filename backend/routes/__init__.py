from .auth_routes import auth_bp
from .oportunidades_routes import oportunidades_bp
from .clientes_routes import clientes_bp
from .usuarios_routes import usuarios_bp
from .user_routes import user_bp
from .licencias_sap import licencias_sap_bp
from .licencias_seidor import licencias_seidor_bp
from .cotizaciones_servicios import cotizaciones_servicios_bp
from .plantillas_routes import plantillas_bp

def register_routes(app):
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(oportunidades_bp, url_prefix='/api/oportunidades')
    app.register_blueprint(clientes_bp, url_prefix='/api/clientes')
    app.register_blueprint(usuarios_bp, url_prefix='/api/usuarios')
    app.register_blueprint(user_bp, url_prefix='/api/user')
    app.register_blueprint(licencias_sap_bp, url_prefix='/api/licencias_sap')
    app.register_blueprint(licencias_seidor_bp, url_prefix='/api/licencias_seidor')
    app.register_blueprint(cotizaciones_servicios_bp, url_prefix='/api/cotizaciones_servicios')
    app.register_blueprint(plantillas_bp, url_prefix='/api/plantillas')

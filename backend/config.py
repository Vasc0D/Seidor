import os
# For env reading

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DB_CONN","mssql+pyodbc://vdiaz:+15nOrO23!JX@172.16.0.95/prueba-001?driver=ODBC+Driver+17+for+SQL+Server" )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEBUG = True
    SECRET_KEY = os.getenv("SECRET_KEY", "my_super_secret_key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your_jwt_secret_key")

import os
# For env reading

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DB_CONN")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEBUG = True
    SECRET_KEY = os.getenv("SECRET_KEY", "my_super_secret_key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your_jwt_secret_key")

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    with app.app_context():
        from . import routes
        db.create_all()

        from .routes import bp as main_bp
        app.register_blueprint(main_bp)

    return app

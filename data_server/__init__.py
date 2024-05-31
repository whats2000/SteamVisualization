import sqlalchemy
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config

db = SQLAlchemy()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)

    db.init_app(app)

    with app.app_context():
        from . import routes
        try:
            db.create_all()
        except sqlalchemy.exc.DatabaseError:
            print("Database not available, please make sure you have start the mariadb server (xampp) and try again.")
            # TODO Implement database creation logic
            # exit(1)

        from .routes import bp as main_bp
        app.register_blueprint(main_bp)

    return app

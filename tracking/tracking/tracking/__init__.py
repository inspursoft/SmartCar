import os

from flask import Flask
import threading

def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.logger.debug("Instance path: %s" % (app.instance_path))

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    from tracking import move
    try:
        t = threading.Thread(target=move.car_move, args=[app])
        t.setDaemon(True)
        t.start()
    except Exception as e:
        app.logger.error(e)

    from tracking import service
    app.register_blueprint(service.bp)

    return app

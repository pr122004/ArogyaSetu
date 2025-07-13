from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv
from routes_predict import register_predict_routes
from routes_chatbot import register_chatbot_routes

load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

register_predict_routes(app)
register_chatbot_routes(app)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)

import os
import uuid
import logging
from flask import request, jsonify
from inference_sdk import InferenceHTTPClient
from werkzeug.utils import secure_filename

# Load API keys from env
BRAIN_API_KEY = os.getenv("BRAIN_API_KEY")
LUNG_API_KEY = os.getenv("LUNG_API_KEY")
FRACTURE_API_KEY = os.getenv("FRACTURE_API_KEY")

# Model IDs
BRAIN_MODEL_ID = "medical-imaging-for-brain-tumor-y8b1a/1"
LUNG_MODEL_ID = "lung-cancer-pzkbq-m1ocw/1"
FRACTURE_MODEL_ID = "break-bone/1"

# Clients
BRAIN_CLIENT = InferenceHTTPClient(api_url="https://detect.roboflow.com", api_key=BRAIN_API_KEY)
LUNG_CLIENT = InferenceHTTPClient(api_url="https://detect.roboflow.com", api_key=LUNG_API_KEY)
FRACTURE_CLIENT = InferenceHTTPClient(api_url="https://detect.roboflow.com", api_key=FRACTURE_API_KEY)

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process_image(file, client, model_id, upload_folder):
    if not file or file.filename == '':
        return {"error": "No file provided"}, 400
    if not allowed_file(file.filename):
        return {"error": "Unsupported file type."}, 400

    temp_path = os.path.join(upload_folder, f"temp_{uuid.uuid4().hex}.png")
    try:
        file.save(temp_path)
        logger.debug(f"Saved to {temp_path}")
        result = client.infer(temp_path, model_id=model_id)
    except Exception as e:
        logger.error(str(e))
        return {"error": f"Processing failed: {str(e)}"}, 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
            logger.debug("Temp file deleted")
    return result, 200

def register_predict_routes(app):
    @app.route('/predict/mri', methods=['POST'])
    def predict_brain():
        file = request.files.get('file')
        return jsonify(*process_image(file, BRAIN_CLIENT, BRAIN_MODEL_ID, app.config['UPLOAD_FOLDER']))

    @app.route('/predict/ct', methods=['POST'])
    def predict_lung():
        file = request.files.get('file')
        return jsonify(*process_image(file, LUNG_CLIENT, LUNG_MODEL_ID, app.config['UPLOAD_FOLDER']))

    @app.route('/predict/xray', methods=['POST'])
    def predict_fracture():
        file = request.files.get('file')
        return jsonify(*process_image(file, FRACTURE_CLIENT, FRACTURE_MODEL_ID, app.config['UPLOAD_FOLDER']))

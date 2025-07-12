import os
import logging
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS  # Add CORS support
from werkzeug.utils import secure_filename
from inference_sdk import InferenceHTTPClient
from dotenv import load_dotenv  # For environment variables

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG, 
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16 MB

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Initialize Roboflow clients for different models
BRAIN_CLIENT = InferenceHTTPClient(
    api_url="https://detect.roboflow.com",
    api_key="IKCahz86wPEyAXxfQMio"
)

LUNG_CLIENT = InferenceHTTPClient(
    api_url="https://detect.roboflow.com",
    api_key="8ABBLykGEdzxD8hn7wX3"
)

FRACTURE_CLIENT = InferenceHTTPClient(
    api_url="https://detect.roboflow.com",
    api_key="n43WCM60r4febpPX44Kj"
)

# Model IDs
BRAIN_MODEL_ID = "medical-imaging-for-brain-tumor-y8b1a/1"
LUNG_MODEL_ID = "lung-cancer-pzkbq-m1ocw/1"
FRACTURE_MODEL_ID = "break-bone/1"

# File handling

def allowed_file(filename):
    """Check if the file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process_image(file, client, model_id):
    """Process an uploaded image with the specified model."""
    if not file or file.filename == '':
        return {"error": "No file provided"}, 400

    if not allowed_file(file.filename):
        return {"error": "File type not allowed. Please upload an image (PNG, JPG, JPEG, GIF)."}, 400

    temp_path = os.path.join(app.config['UPLOAD_FOLDER'], f"temp_{uuid.uuid4().hex}.png")

    try:
        file.save(temp_path)
        logger.debug(f"File saved to {temp_path}")
        result = client.infer(temp_path, model_id=model_id)
        logger.debug(f"Raw result from Roboflow: {result}")
    except Exception as e:
        logger.error(f"Error during processing: {str(e)}")
        return {"error": f"Processing failed: {str(e)}"}, 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
            logger.debug(f"Deleted temp file: {temp_path}")

    return result, 200

# Endpoints
@app.route('/predict/mri', methods=['POST'])
def predict_brain():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files['file']
    result, status_code = process_image(file, BRAIN_CLIENT, BRAIN_MODEL_ID)
    return jsonify(result), status_code

@app.route('/predict/ct', methods=['POST'])
def predict_lung():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files['file']
    result, status_code = process_image(file, LUNG_CLIENT, LUNG_MODEL_ID)
    return jsonify(result), status_code

@app.route('/predict/xray', methods=['POST'])
def predict_fracture():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files['file']
    result, status_code = process_image(file, FRACTURE_CLIENT, FRACTURE_MODEL_ID)
    return jsonify(result), status_code

if __name__ == '__main__':
    logger.info("Starting Medical Imaging API server")
    app.run(debug=True, host='0.0.0.0', port=5002)

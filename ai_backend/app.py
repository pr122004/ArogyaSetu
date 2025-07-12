from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
from rag_chat import generate_answer  # Assuming this is your answer generation function

app = Flask(__name__)

# Allow all origins (Temporary solution)
CORS(app)

# Or allow only frontend origin (Better security)
# CORS(app, resources={r"/api": {"origins": "http://localhost:3000"}})

@app.route('/api', methods=['POST'])
def api():
    print("Received request:", request.data)  # Print raw data
    data = request.get_json()
    print("Parsed JSON:", data)  # Debug JSON parsing

    if not data:
        return jsonify({"error": "Invalid JSON"}), 400
    
    # Extract question and userDetails from the request
    question = data.get("question", "")
    user_details = data.get("userDetails", None)  # userDetails is optional

    # Generate answer using both question and userDetails
    answer = generate_answer(question, user_details)  # Pass userDetails to generate_answer
    
    return jsonify({"question": question, "answer": answer})

if __name__ == '__main__':
    app.run(debug=True)
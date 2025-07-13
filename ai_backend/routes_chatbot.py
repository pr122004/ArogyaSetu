from flask import request, jsonify
import google.generativeai as genai
import os
import re

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_PROMPT = (
    "You are a concise and friendly AI medical assistant chatbot. "
    "Answer in clear bullet points when applicable. "
    "Avoid markdown formatting like asterisks or bold symbols. "
    "Keep responses short and readable for web chat."
)

chat_session = genai.GenerativeModel("gemini-1.5-flash").start_chat(history=[
    {"role": "model", "parts": [SYSTEM_PROMPT]}
])

def clean_response(text):
    # Remove asterisks and extra spaces
    text = re.sub(r"\*+", "", text)
    text = re.sub(r"\n\s*\n", "\n", text)  # Remove multiple empty lines
    text = re.sub(r"\n{2,}", "\n", text)  # Remove double newlines
    text = text.strip()
    
    # Optional: limit to first 1000 characters or 10 bullet points
    lines = text.splitlines()
    if len(lines) > 12:
        lines = lines[:12] + ["...and more. Please ask for specific guidance."]
    
    return "\n".join(lines)

def register_chatbot_routes(app):
    @app.route('/chat', methods=['POST'])
    def chat():
        data = request.get_json()
        user_input = data.get("message", "")
        if not user_input:
            return jsonify({"reply": "Please enter a message."}), 400
        try:
            response = chat_session.send_message(user_input)
            cleaned = clean_response(response.text)
            return jsonify({"reply": cleaned})
        except Exception as e:
            return jsonify({"reply": f"Error: {str(e)}"}), 500

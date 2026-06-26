from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return "AITOL Python Engine Running 🚀"

@app.route("/mrl", methods=["POST"])
def mrl():
    data = request.json
    text = data.get("text", "")

    mrl_output = text.upper().replace(" ", "_")

    return jsonify({
        "original": text,
        "mrl": mrl_output
    })

if __name__ == "__main__":
    app.run(port=5000)
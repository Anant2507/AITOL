import hashlib

import redis
from flask import Flask, request, jsonify

app = Flask(__name__)
r = redis.Redis(host="localhost", port=6379, decode_responses=True)


def estimate_tokens(text: str) -> int:
    return max(1, round(len(text) / 4)) if text else 0


def prompt_hash(text: str) -> str:
    normalized = " ".join(text.lower().split())
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


@app.errorhandler(redis.exceptions.ConnectionError)
def redis_down(_):
    return jsonify({"error": "Redis unavailable. Run: docker start aitol-redis-stack"}), 503


@app.route("/")
def home():
    return "AITOL Python Engine Running"


@app.route("/mrl", methods=["POST"])
def mrl():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "")
    return jsonify({"original": text, "mrl": text.upper().replace(" ", "_")})


@app.route("/track", methods=["POST"])
def track():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "text is required"}), 400

    model = data.get("model", "unknown")
    tokens = estimate_tokens(text)
    seen = r.hincrby("aitol:prompts", prompt_hash(text), 1)
    repeated = seen > 1

    pipe = r.pipeline()
    pipe.incr("aitol:stats:requests")
    pipe.incrby("aitol:stats:tokens", tokens)
    pipe.hincrby("aitol:stats:tokens_by_model", model, tokens)
    if repeated:
        pipe.incr("aitol:stats:repeated_requests")
        pipe.incrby("aitol:stats:tokens_wasted", tokens)
    pipe.execute()

    return jsonify({
        "model": model,
        "tokens": tokens,
        "repeated": repeated,
        "times_seen": seen,
    })


@app.route("/stats")
def stats():
    total = int(r.get("aitol:stats:tokens") or 0)
    wasted = int(r.get("aitol:stats:tokens_wasted") or 0)
    return jsonify({
        "requests": int(r.get("aitol:stats:requests") or 0),
        "repeated_requests": int(r.get("aitol:stats:repeated_requests") or 0),
        "total_tokens": total,
        "tokens_wasted_on_repeats": wasted,
        "waste_percent": round(wasted / total * 100, 1) if total else 0,
        "tokens_by_model": r.hgetall("aitol:stats:tokens_by_model"),
    })


if __name__ == "__main__":
    app.run(port=5000)
import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

API_KEY = os.environ.get("SUPPORTASSIST_API_KEY", "").strip()
API_KEY_ENABLED = bool(API_KEY)

FEEDBACK_FILE = "feedback.jsonl"
INDEX_FILE = "kb_index.json"


def api_key_ok(req):
    if not API_KEY_ENABLED:
        return True
    return req.headers.get("X-API-Key", "") == API_KEY


def load_kb():
    with open(INDEX_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("articles", [])


KB = load_kb()


def confidence_from(best_score: float, gap: float) -> str:
    if best_score >= 0.70 and gap >= 0.20:
        return "HIGH"
    if best_score >= 0.45:
        return "MEDIUM"
    return "LOW"


@app.after_request
def add_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, X-API-Key"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Private-Network"] = "true"
    return response


@app.route("/health", methods=["GET", "OPTIONS"])
def health():
    if request.method == "OPTIONS":
        return jsonify({"ok": True}), 200
    return jsonify({"status": "ok", "articles": len(KB)}), 200


@app.route("/suggest", methods=["POST", "OPTIONS"])
def suggest():
    if request.method == "OPTIONS":
        return jsonify({"ok": True}), 200

    if not api_key_ok(request):
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip().lower()
    top_k = int(data.get("top_k") or 3)

    if not text:
        return jsonify({
            "confidence": "LOW",
            "best_score": 0,
            "gap": 0,
            "results": []
        }), 200

    scored = []

    for art in KB:
        score = 0.0

        for tag in art.get("tags", []):
            t = (tag or "").lower()
            if t and t in text:
                score += 0.50

        title_words = set((art.get("norm_title") or "").split())
        text_words = set(text.split())

        for word in title_words:
            if word and word in text_words:
                score += 0.18

        if score > 0.95:
            score = 0.95

        scored.append({
            "id": art.get("id"),
            "title": art.get("title"),
            "url": art.get("url"),
            "score": round(score, 3)
        })

    scored.sort(key=lambda x: x["score"], reverse=True)
    results = scored[:max(1, top_k)]

    best_score = results[0]["score"] if results else 0
    second_score = results[1]["score"] if len(results) > 1 else 0
    gap = round(best_score - second_score, 3) if results else 0
    conf = confidence_from(best_score, gap)

    return jsonify({
        "confidence": conf,
        "best_score": best_score,
        "gap": gap,
        "results": results
    }), 200


@app.route("/feedback", methods=["POST", "OPTIONS"])
def feedback():
    if request.method == "OPTIONS":
        return jsonify({"ok": True}), 200

    data = request.get_json(silent=True) or {}

    record = {
        "email": data.get("email"),
        "article": data.get("article"),
    }

    with open(FEEDBACK_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")

    return jsonify({"status": "logged"}), 200


if __name__ == "__main__":
    print("KB Suggest Server running on http://127.0.0.1:8787")
    print("GET  /health")
    print("POST /suggest")
    print("POST /feedback")
    print(f"API key: {'ENABLED' if API_KEY_ENABLED else 'DISABLED'}")
    print(f"KB articles loaded: {len(KB)}")

    app.run(host="127.0.0.1", port=8787, debug=False)
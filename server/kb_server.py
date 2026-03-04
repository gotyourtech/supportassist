# kb_server.py - Local MVP server (127.0.0.1 only)
# Keyword scoring + DEBUG printing
# Requires env var SUPPORTASSIST_API_KEY for X-API-Key enforcement

import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

API_KEY = os.environ.get("SUPPORTASSIST_API_KEY", "").strip()
API_KEY_ENABLED = bool(API_KEY)

def api_key_ok(req):
    if not API_KEY_ENABLED:
        return True
    return req.headers.get("X-API-Key", "") == API_KEY

KB = [
    {
        "id": "login_invalid_credentials",
        "title": "Invalid Username or Password (Quick Checks)",
        "url": "https://begoodiptvvpnservices.zohodesk.com/portal/en/kb/articles/invalid-username-or-password-quick-checks",
        "keywords": [
            "invalid","username","password","login","credentials","sign in",
            "wrong password","cant login","can't login"
        ],
    },
    {
        "id": "buffering_speed_basics",
        "title": "Buffering or Freezing (Speed + Quick Fixes)",
        "url": "https://begoodiptvvpnservices.zohodesk.com/portal/en/kb/articles/buffering-or-freezing-speed-quick-fixes",
        "keywords": [
            "buffer","buffering","freeze","freezing","stutter","lag","slow",
            "speed","internet","wifi","ethernet","netflix works"
        ],
    },
    {
        "id": "firestick_install_basics",
        "title": "Firestick Install Basics (Downloader + Steps)",
        "url": "https://begoodiptvvpnservices.zohodesk.com/portal/en/kb/articles/firestick-install-basics-downloader-steps",
        "keywords": [
            "firestick","fire stick","downloader","install","sideload",
            "unknown sources","apk","android"
        ],
    },
    {
        "id": "splash_blank_screen_fix",
        "title": "Splash Player: Blank Screen Fix",
        "url": "https://begoodiptvvpnservices.zohodesk.com/portal/en/kb/articles/splash-player-blank-screen-fix",
        "keywords": [
            "blank screen","black screen","white screen","nothing shows",
            "splash","splash player","loading forever","stuck loading"
        ],
    },
]

def normalize(text: str) -> str:
    t = (text or "").lower().strip()
    t = t.replace("\r", " ")
    t = re.sub(r"\s+", " ", t)
    return t

def score_article(text_norm: str, article) -> float:
    score = 0.0

    # phrase matches (multi-word) - HEAVY
    for kw in article["keywords"]:
        kw_norm = normalize(kw)
        if " " in kw_norm and kw_norm in text_norm:
            score += 0.50

    # token matches - light
    tokens = set(re.findall(r"[a-z0-9]+", text_norm))
    for kw in article["keywords"]:
        kw_norm = normalize(kw)
        if " " not in kw_norm and kw_norm in tokens:
            score += 0.10

    if score > 0.95:
        score = 0.95
    return round(score, 3)

def confidence_from(best_score: float, gap: float) -> str:
    if best_score >= 0.70 and gap >= 0.20:
        return "HIGH"
    if best_score >= 0.45:
        return "MEDIUM"
    return "LOW"

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200

@app.route("/suggest", methods=["POST"])
def suggest():
    if not api_key_ok(request):
        return jsonify({"error": "Unauthorized (missing/invalid X-API-Key)"}), 401

    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    top_k = int(data.get("top_k") or 3)

    text_norm = normalize(text)

    # ===== DEBUG PRINTS =====
    print("\n=== /suggest ===")
    print("RAW TEXT:", repr(text[:400]))
    print("NORM TEXT:", repr(text_norm[:400]))

    if not text_norm:
        return jsonify({"confidence": "LOW", "best_score": 0, "gap": 0, "results": []}), 200

    scored = []
    for art in KB:
        sc = score_article(text_norm, art)
        scored.append({
            "id": art["id"],
            "title": art["title"],
            "url": art["url"],
            "score": sc
        })

    scored.sort(key=lambda x: x["score"], reverse=True)
    results = scored[:max(1, top_k)]

    # DEBUG: print full scoring order
    print("SCORES:")
    for item in scored:
        print(f"  {item['score']:>5}  {item['id']}")

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

if __name__ == "__main__":
    print("KB Suggest Server running on http://127.0.0.1:8787")
    print("GET  /health")
    print("POST /suggest  { text: '...', top_k: 3 }")
    print(f"API key: {'ENABLED (X-API-Key required)' if API_KEY_ENABLED else 'DISABLED'}")
    app.run(host="127.0.0.1", port=8787, debug=False)
from flask import Flask, session, redirect, url_for
from routes.users import users_bp
from routes.posts import posts_bp
from routes.products import products_bp
from routes.admin import admin_bp

app = Flask(__name__)
app.secret_key = "wholesplit_secret"

app.register_blueprint(users_bp)
app.register_blueprint(posts_bp)
app.register_blueprint(products_bp)
app.register_blueprint(admin_bp)

@app.route("/")
def index():
    return redirect(url_for("users.login"))

if __name__ == "__main__":
    app.run(debug=True)
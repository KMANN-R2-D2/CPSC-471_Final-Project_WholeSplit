from flask import Blueprint, render_template, request, redirect, url_for, session
from db import get_connection

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "POST":
        username = request.form["username"]
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Administrators WHERE Username = %s", (username,))
        admin = cursor.fetchone()
        conn.close()
        if admin:
            session["admin"] = True
            session["admin_name"] = admin["FName"]
            return redirect(url_for("admin.dashboard"))
        return render_template("admin_login.html", error="Admin not found")
    return render_template("admin_login.html")
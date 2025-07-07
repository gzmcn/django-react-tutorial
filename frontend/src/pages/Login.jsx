import React from "react";
import Form from "../components/Form";
import "../styles/Login.css"; // CSS dosyasını ekliyoruz

function Login() {
  return (
    <div className="login-page">
      <div className="login-box">
        <h2 className="login-logo">🐦 Twitter</h2>
        <Form route="/api/token/" method="login" />
        <p className="login-footer">
          Don't have an account? <a href="/register">Sign up</a>
        </p>
      </div>
    </div>
  );
}

export default Login;

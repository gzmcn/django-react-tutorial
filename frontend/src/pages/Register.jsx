import React from "react";
import Form from "../components/Form";
import "../styles/Register.css"; // Optional: separate CSS or reuse Form.css

function Register() {
  return (
    <div className="register-page">
      <div className="register-box">
        <h2 className="register-logo">🐦 Twitter</h2>
        <Form route="/api/user/register/" method="register" />
        <p className="register-footer">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </div>
  );
}

export default Register;

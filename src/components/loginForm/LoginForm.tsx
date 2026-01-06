import "./loginForm.css";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const navigate = useNavigate();

  const isPasswordValid = (password: string): boolean => {
    const minLength = /.{8,}/;
    const hasUpperCase = /[A-Z]/;
    const hasNumber = /[0-9]/;
    return (
      minLength.test(password) &&
      hasUpperCase.test(password) &&
      hasNumber.test(password)
    );
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setAuthError(null);

    if (!isPasswordValid(formData.password)) {
      setPasswordError(
        "Password must be at least 8 characters long, contain a capital letter and a number"
      );
      return;
    }

    setPasswordError(null);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password);
      }
      navigate("/");
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Authentication failed"
      );
    }
  };

  const handleToggleMode = () => setIsLogin(!isLogin);

  return (
    <div className="loginWrapper">
      <div className="login-form">
        <form onSubmit={handleSubmit}>
          {!isLogin ? (
            <>
              <p className="title">Create your account</p>
              <label>
                Name
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  placeholder="Your name.."
                />
              </label>
            </>
          ) : (
            <>
              <p className="title">Login</p>
              <p className="sub-title">Login to platform to continue</p>
            </>
          )}

          <label>
            Email
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
              placeholder="Your email.."
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
              placeholder="Your password.."
            />
          </label>
          {(passwordError || authError) && (
            <p className="error">{passwordError || authError}</p>
          )}
          <button type="submit" className="login-btn">
            {isLogin ? "Login" : "Create account"}
          </button>

          <div className="create-acc-wrapper">
            {isLogin ? (
              <>
                <p className="create-acc">Don't have an account?</p>
                <button type="button" onClick={handleToggleMode}>
                  Create a free account
                </button>
              </>
            ) : (
              <>
                <p className="create-acc">Already have an account?</p>
                <button type="button" onClick={handleToggleMode}>
                  Log in
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;

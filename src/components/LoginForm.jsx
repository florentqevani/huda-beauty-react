import { useState } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../context/AuthContext";
import { loginAPI, registerAPI } from "../api/client";

export default function LoginForm({ active, onClose }) {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            let data;
            if (isRegister) {
                data = await registerAPI(name, email, password);
            } else {
                data = await loginAPI(email, password);
            }

            if (data.error) {
                setError(data.error);
            } else {
                login(data.user, data.accessToken, data.refreshToken);
                setName("");
                setEmail("");
                setPassword("");
                onClose();
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setIsRegister(!isRegister);
        setError("");
    };

    return (
        <div className={`login-form-container${active ? " active" : ""}`}>
            <button
                id="close-login-btn"
                className="fas fa-times"
                aria-label="Close login"
                onClick={onClose}
            ></button>

            <form onSubmit={handleSubmit}>
                <h3>{isRegister ? "Sign-Up" : "Sign-In"}</h3>
                {error && <p className="form-error">{error}</p>}
                {isRegister && (
                    <>
                        <span>Name</span>
                        <input
                            type="text"
                            className="box"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </>
                )}
                <span>Email</span>
                <input
                    type="email"
                    className="box"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <span>Password</span>
                <input
                    type="password"
                    className="box"
                    placeholder="Enter your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                />
                {!isRegister && (
                    <div className="checkbox">
                        <input type="checkbox" id="Remember-me" />
                        <label htmlFor="Remember-me"> Remember me</label>
                    </div>
                )}
                <input
                    type="submit"
                    value={loading ? "Please wait..." : isRegister ? "Sign-Up" : "Sign-In"}
                    className="btn"
                    disabled={loading}
                />
                {!isRegister && (
                    <p>
                        Forget password? <a href="#" onClick={(e) => e.preventDefault()}>click here</a>
                    </p>
                )}
                <p>
                    {isRegister ? "Already have an account? " : "Don\u0027t have an Account? "}
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            switchMode();
                        }}
                    >
                        {isRegister ? "Sign In" : "Create One"}
                    </a>
                </p>
            </form>
        </div>
    );
}

LoginForm.propTypes = {
    active: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

import React, { useState } from 'react';
import { auth } from '../firebase/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../../style/Login.css'; // Make sure this path is correct

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleForgotPassword = async () => {
        if (!email) {
            alert('Please enter your email to reset your password.');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            alert('Password reset email sent. Please check your inbox.');
            navigate('/');
        } catch (error) {
            alert('Error sending password reset email: ' + error.message);
        }
    };

    return (
        <div className="login-container"> {/* Use login-container for consistent styling */}
            <form className="login-form" onSubmit={e => e.preventDefault()}> {/* Prevent default form submit behavior */}
                <h2>Forgot Password</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button onClick={handleForgotPassword}>Reset Password</button>
            </form>
        </div>
    );
}

export default ForgotPassword;

import React, { useState } from 'react';
import { auth } from '../firebase/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
function ForgotPassword() {
    const [email, setEmail] = useState('');
    const navigate=useNavigate();
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
        <div className="forgot-password-container">
            <h2>Forgot Password</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleForgotPassword}>Reset Password</button>
        </div>
    );
}

export default ForgotPassword;

import { useState } from "react"
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../auth/useAuth.ts'


export default function LoginPage() {
    const { loginWithGoogle, devSignInAdmin } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    return (
        <div className="page">
            <div className="card form">
                <h1>Sign in to MealWeek</h1>

                <GoogleLogin
                    onSuccess={async (res) => {
                        if (!res.credential) return;
                        setError('');
                        try {
                            await loginWithGoogle(res.credential);
                            navigate('/recipes');
                        } catch (err) {
                            setError(err instanceof Error ? err.message : 'Google sign-in failed');
                        }
                    }}
                    onError={() => setError('Google sign-in popup closed or failed')}
                />

                {error && <p role="alert" className="error">{error}</p>}

                <div className="actions">
                    <button
                        type="button"
                        className="btn"
                        onClick={() => {
                            devSignInAdmin();
                            navigate('/admin');
                        }}
                    >
                        Dev: sign in as admin
                    </button>
                </div>
            </div>
        </div>
    );
}
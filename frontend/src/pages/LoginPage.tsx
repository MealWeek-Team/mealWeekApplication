import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.ts'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="page">
      <h1>Sign in to MealWeek</h1>
      <button onClick={() => { signIn('anna'); navigate('/recipes') }}>
        Sign in with Google
      </button>
      {/* chỉ dùng khi dev: thử quyền admin */}
      <button onClick={() => { signIn('tomas'); navigate('/admin') }}>
        Dev: sign in as admin
      </button>
    </div>
  )
}
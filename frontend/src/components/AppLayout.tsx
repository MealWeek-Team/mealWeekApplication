import { NavLink, Outlet, useNavigate} from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const links = [
  { to: '/recipes', label: 'Recipes' },
  { to: '/planner', label: 'Planner' },
  { to: '/shopping-list', label: 'Shopping list' },
  { to: '/admin', label: 'Admin' },
]

export default function AppLayout() {

  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  function handleSignOut() {
    signOut()
    navigate('/login')
  }

  return (
    <>
      <header className="topbar">
        <span className="logo">MealWeek</span>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        
          {user && (
          <div className="user-box">
            <span className="avatar">{user.name[0]}</span>
            <button className="link-button" onClick={handleSignOut}>Sign out</button>
          </div>
        )}
        
      </header>
      <main className="page">
        <Outlet />
      </main>
    </>
  )
}
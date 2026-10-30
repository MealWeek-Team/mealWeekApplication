import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/recipes', label: 'Recipes' },
  { to: '/planner', label: 'Planner' },
  { to: '/shopping-list', label: 'Shopping list' },
  { to: '/admin', label: 'Admin' },
]

export default function AppLayout() {
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
        <span className="avatar">A</span>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </>
  )
}
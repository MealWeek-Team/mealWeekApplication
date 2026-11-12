import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './auth/ProtectedRoute'
import RecipesPage from './pages/RecipesPage'
import PlannerPage from './pages/PlannerPage'
import ShoppingListPage from './pages/ShoppingListPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage' 
import RecipeFormPage from './pages/RecipeFormPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/recipes" replace />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/shopping-list" element={<ShoppingListPage />} />
          <Route path="/recipes/new" element={<RecipeFormPage />} />
          <Route path="/recipes/:id/edit" element={<RecipeFormPage />} />

          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/recipes" replace />} />
    </Routes>
  )
}

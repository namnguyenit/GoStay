import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./modules/auth/presentation/context/AuthContext";
import { MainLayout } from "./layouts/MainLayout";
import { HomePage } from "./pages/HomePage";
import { CarListPage } from "./pages/CarListPage";
import { OperatorRegisterPage } from "./pages/OperatorRegisterPage";
import { OperatorAdminPage } from "./pages/OperatorAdminPage";
import { AddCarPage } from "./pages/AddCarPage";
import { LoginPage } from "./modules/auth/presentation/pages/LoginPage";
import { RegisterPage } from "./modules/auth/presentation/pages/RegisterPage";
import { ProfilePage } from "./modules/user/presentation/pages/ProfilePage";
import { OperatorGuard } from "./modules/operator/presentation/components/OperatorGuard";
import { OperatorLayout } from "./modules/operator/presentation/layouts/OperatorLayout";
import { OperatorDashboardPage } from "./modules/operator/presentation/pages/OperatorDashboardPage";
import { AdminGuard } from "./modules/admin/presentation/components/AdminGuard";
import { AdminLayout } from "./modules/admin/presentation/layouts/AdminLayout";
import { AdminOperatorListPage } from "./modules/admin/presentation/pages/AdminOperatorListPage";

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Protected Admin Portal Routes */}
          <Route element={<AdminGuard />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminOperatorListPage />} />
              <Route
                path="/admin/operators"
                element={<AdminOperatorListPage />}
              />
            </Route>
          </Route>

          {/* Protected Operator Portal Routes */}
          <Route element={<OperatorGuard />}>
            <Route element={<OperatorLayout />}>
              <Route path="/operator" element={<OperatorDashboardPage />} />
              <Route
                path="/operator/dashboard"
                element={<OperatorDashboardPage />}
              />
            </Route>
          </Route>

          {/* Main User Facing Routes */}
          <Route
            path="*"
            element={
              <MainLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/cars" element={<CarListPage />} />
                  <Route
                    path="/operator/register"
                    element={<OperatorRegisterPage />}
                  />
                  <Route
                    path="/operator/admin"
                    element={<OperatorAdminPage />}
                  />
                  <Route path="/add-car" element={<AddCarPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Routes>
              </MainLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

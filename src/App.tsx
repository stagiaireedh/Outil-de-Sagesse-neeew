import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { SecteurOverviewPage } from './pages/SecteurOverviewPage';
import { ModuleAPage } from './pages/ModuleAPage';
import { ModuleFormPage } from './pages/ModuleFormPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { GuidePage } from './pages/GuidePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminSoumissionDetailPage } from './pages/AdminSoumissionDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Header />
        <main className="flex-1">
          <Routes>
            {/* Accueil */}
            <Route path="/" element={<HomePage />} />
            <Route path="/guide" element={<GuidePage />} />

            {/* Secteur routes */}
            <Route path="/secteur/:slug" element={<SecteurOverviewPage />} />
            <Route path="/secteur/:slug/module-a" element={<ModuleAPage />} />
            <Route path="/secteur/:slug/module-b1" element={<ModuleFormPage moduleCodeOverride="B1" />} />
            <Route path="/secteur/:slug/module-b2" element={<ModuleFormPage moduleCodeOverride="B2" />} />
            <Route path="/secteur/:slug/module-b3" element={<ModuleFormPage moduleCodeOverride="B3" />} />
            <Route path="/secteur/:slug/module-c" element={<ModuleFormPage moduleCodeOverride="C" />} />
            <Route path="/secteur/:slug/:moduleCode/confirmation" element={<ConfirmationPage />} />

            {/* Admin routes */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/login" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/soumissions" element={<AdminDashboardPage />} />
            <Route path="/admin/soumissions/:id" element={<AdminSoumissionDetailPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

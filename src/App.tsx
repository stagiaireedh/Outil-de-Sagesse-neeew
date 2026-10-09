import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { StandaloneFormPage } from './pages/StandaloneFormPage';
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
            {/* Portail d'accueil & Guide */}
            <Route path="/" element={<HomePage />} />
            <Route path="/guide" element={<GuidePage />} />

            {/* Routes d'accès individuels sécurisés par token unique */}
            <Route path="/f/:token" element={<StandaloneFormPage />} />
            <Route path="/f/:token/confirmation" element={<ConfirmationPage />} />

            {/* Redirection des anciennes routes ouvertes vers le portail d'accueil sécurisé */}
            <Route path="/secteur/:slug" element={<Navigate to="/" replace />} />
            <Route path="/secteur/:slug/module-a" element={<Navigate to="/" replace />} />
            <Route path="/secteur/:slug/module-b1" element={<Navigate to="/" replace />} />
            <Route path="/secteur/:slug/module-b2" element={<Navigate to="/" replace />} />
            <Route path="/secteur/:slug/module-b3" element={<Navigate to="/" replace />} />
            <Route path="/secteur/:slug/module-c" element={<Navigate to="/" replace />} />
            <Route path="/secteur/:slug/:moduleCode/confirmation" element={<ConfirmationPage />} />

            {/* Espace Administrateur */}
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

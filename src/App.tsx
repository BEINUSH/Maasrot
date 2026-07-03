import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CadetsPage } from './pages/CadetsPage';
import { CadetProfilePage } from './pages/CadetProfilePage';
import { AttendancePage } from './pages/AttendancePage';
import { FitnessTestsPage } from './pages/FitnessTestsPage';
import { TrainingPlanPage } from './pages/TrainingPlanPage';
import { WeekendMissionsPage } from './pages/WeekendMissionsPage';
import { ScoreboardPage } from './pages/ScoreboardPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/cadets" element={<CadetsPage />} />
          <Route path="/cadets/:id" element={<CadetProfilePage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/tests" element={<FitnessTestsPage />} />
          <Route path="/plan" element={<TrainingPlanPage />} />
          <Route path="/missions" element={<WeekendMissionsPage />} />
          <Route path="/scoreboard" element={<ScoreboardPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

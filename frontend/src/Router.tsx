import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@pages/LoginPage';
import DashboardPage from '@pages/DashboardPage';
import ProjectsPage from '@pages/ProjectsPage';
import ProjectDetailPage from '@pages/ProjectDetailPage';
import TasksPage from '@pages/TasksPage';
import InterventionsPage from '@pages/InterventionsPage';
import UsersPage from '@pages/UsersPage';
import WarRoomPage from '@pages/WarRoomPage';
import SettingsPage from '@pages/SettingsPage';
import MessagesPage from '@pages/MessagesPage';
import CalendarPage from '@pages/CalendarPage';

const Router = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:id" element={<ProjectDetailPage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/interventions" element={<InterventionsPage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/war-room" element={<WarRoomPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default Router;

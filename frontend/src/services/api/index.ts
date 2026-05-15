import { authApi } from './auth';
import { usersApi } from './users';
import { projectsApi } from './projects';
import { tasksApi } from './tasks';
import { modulesApi } from './modules';
import { chatApi } from './chat';
import { notificationsApi } from './notifications';
import { interventionsApi } from './interventions';
import { versionsApi } from './versions';

const apiService = {
  ...authApi,
  ...usersApi,
  ...projectsApi,
  ...tasksApi,
  ...modulesApi,
  ...chatApi,
  ...notificationsApi,
  ...interventionsApi,
  ...versionsApi,
};

export default apiService;

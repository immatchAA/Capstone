import UserLogin from './Authentication/UserLogin';
import UserRegister from './Authentication/UserRegister';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from './WelcomeScreen';
import Dashboard from './Dashboard/Dashboard';
import Progress from './StudentProgressMonitoring/Progress';
import InsightPanel from './StudentProgressMonitoring/InsightPanel';
import FacultyDashboard from './StudentProgressMonitoring/FacultyDashboard';
import DesignPlan from './UploadDesign/DesignPlan';
import MaterialsTab from './UploadDesign/MaterialsTab';
import MainLandingPage from './Dashboard/mainLanding';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='WelcomeScreen'>
        <Stack.Screen name='WelcomeScreen' component={WelcomeScreen}/>
        <Stack.Screen name='UserLogin' component={UserLogin}/>
        <Stack.Screen name='UserRegister' component={UserRegister}/>
        <Stack.Screen name='Dashboard' component={Dashboard} /> 
        <Stack.Screen name='Progress' component={Progress} />
        <Stack.Screen name='InsightPanel' component={InsightPanel} />
        <Stack.Screen name='FacultyDashboard' component={FacultyDashboard} />
        <Stack.Screen name='DesignPlan' component={DesignPlan} />
        <Stack.Screen name="MaterialsTab" component={MaterialsTab} />
        <Stack.Screen name="MainLandingPage" component={MainLandingPage} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}


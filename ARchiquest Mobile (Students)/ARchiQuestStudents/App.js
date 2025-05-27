import UserLogin from './Authentication/UserLogin';
import UserRegister from './Authentication/UserRegister';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from './WelcomeScreen';
import MainLanding from './Dashboard/mainLanding';
import ReadingMaterials from './ReadingMaterials/ReadingMaterials';
import ReadingMaterialDetails from './ReadingMaterials/ReadingMaterialDetails';
import Profile from './Profile/Profile';
import DesignPlanDetails from './DesignPlan/DesignPlanDetails'; 
import DesignProgressScreen from './DesignPlan/DesignProgressScreen';
import DesignPlanViewer from './DesignPlan/DesignPlanViewer';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='MainLanding'>
        <Stack.Screen name='WelcomeScreen' component={WelcomeScreen}/>
        <Stack.Screen name='UserLogin' component={UserLogin}/>
        <Stack.Screen name='UserRegister' component={UserRegister}/>
        <Stack.Screen name="MainLanding" component={MainLanding} />

        <Stack.Screen name="DesignPlanViewer" component={DesignPlanViewer} />
        <Stack.Screen name="DesignProgressScreen" component={DesignProgressScreen} />
        <Stack.Screen name="DesignPlanDetails" component={DesignPlanDetails} />

        <Stack.Screen name='ReadingMaterials' component={ReadingMaterials} />
        <Stack.Screen name='ReadingMaterialDetails' component={ReadingMaterialDetails} />
        <Stack.Screen name='Profile' component={Profile} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}


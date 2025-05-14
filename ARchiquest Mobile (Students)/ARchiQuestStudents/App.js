import UserLogin from './Authentication/UserLogin';
import UserRegister from './Authentication/UserRegister';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from './WelcomeScreen';
import Dashboard from './Dashboard/Dashboard';
import Progress from './StudentProgressMonitoring/Progress';
import InsightPanel from './StudentProgressMonitoring/InsightPanel';
import StudentProgress from './StudentProgressMonitoring/StudentProgress';
import DesignPlan from './UploadDesign/DesignPlan';
import MaterialsTab from './UploadDesign/MaterialsTab';
import MainLanding from './Dashboard/mainLanding';
import ReadingMaterials from './ReadingMaterials/ReadingMaterials';
import ModernArchPrinciples from './ReadingMaterials/ModernArchPrinciples'
import SustainableBuildingDesign from './ReadingMaterials/SustainableBuildingDesign'
import BuildingMaterials from './ReadingMaterials/BuildingMaterials'
import BuildingInfoModeling from './ReadingMaterials/BuildingInfoModeling'
import SmartBuildingTechs from './ReadingMaterials/SmartBuildingTechs'
import EnergyEfficientBuilding from './ReadingMaterials/EnergyEfficientBuilding'
import GreenBuildingCert from './ReadingMaterials/GreenBuildingCert'
import RenewableEnergySystems from './ReadingMaterials/RenewableEnergySystems'
import FireSafety from './ReadingMaterials/FireSafety'
import UrbanPlanningFundamentals from './ReadingMaterials/UrbanPlanningFundamentals'
import Profile from './Profile/Profile';

import DesignPlanDetails from './DesignPlan/DesignPlanDetails'; 
import DesignProgressScreen from './DesignPlan/DesignProgressScreen';
import DesignPlanViewer from './DesignPlan/DesignPlanViewer';

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
        <Stack.Screen name='StudentProgress' component={StudentProgress} />
        <Stack.Screen name='DesignPlan' component={DesignPlan} />
        <Stack.Screen name="MaterialsTab" component={MaterialsTab} />
        <Stack.Screen name="MainLanding" component={MainLanding} />


        <Stack.Screen name="DesignPlanViewer" component={DesignPlanViewer} />
        <Stack.Screen name="DesignProgressScreen" component={DesignProgressScreen} />
        <Stack.Screen name="DesignPlanDetails" component={DesignPlanDetails} />

        <Stack.Screen name='ReadingMaterials' component={ReadingMaterials} />
        <Stack.Screen name='Profile' component={Profile} />

        {/*READING MATERIALS*/}
        <Stack.Screen name='ModernArchPrinciples' component={ModernArchPrinciples} />
        <Stack.Screen name='SustainableBuildingDesign' component={SustainableBuildingDesign} />
        <Stack.Screen name='BuildingMaterials' component={BuildingMaterials} />
        <Stack.Screen name='BuildingInfoModeling' component={BuildingInfoModeling} />
        <Stack.Screen name='SmartBuildingTechs' component={SmartBuildingTechs} />
        <Stack.Screen name='EnergyEfficientBuilding' component={EnergyEfficientBuilding} />
        <Stack.Screen name='GreenBuildingCert' component={GreenBuildingCert} />
        <Stack.Screen name='RenewableEnergySystems' component={RenewableEnergySystems} />
        <Stack.Screen name='FireSafety' component={FireSafety} />
        <Stack.Screen name='UrbanPlanningFundamentals' component={UrbanPlanningFundamentals} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


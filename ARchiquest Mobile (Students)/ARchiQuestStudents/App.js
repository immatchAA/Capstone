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
import Modules from './Modules/Modules';
import ModernArchPrinciples from './Modules/ModernArchPrinciples'
import SustainableBuildingDesign from './Modules/SustainableBuildingDesign'
import BuildingMaterials from './Modules/BuildingMaterials'
import BuildingInfoModeling from './Modules/BuildingInfoModeling'
import SmartBuildingTechs from './Modules/SmartBuildingTechs'
import EnergyEfficientBuilding from './Modules/EnergyEfficientBuilding'
import GreenBuildingCert from './Modules/GreenBuildingCert'
import RenewableEnergySystems from './Modules/RenewableEnergySystems'
import FireSafety from './Modules/FireSafety'
import UrbanPlanningFundamentals from './Modules/UrbanPlanningFundamentals'
import Profile from './Profile/Profile';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='MainLanding'>
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
        <Stack.Screen name='Modules' component={Modules} />
        <Stack.Screen name='Profile' component={Profile} />

        {/*MODULES*/}
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


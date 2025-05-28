// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import UserLogin from './Authentication/UserLogin';
import UserRegister from './Authentication/UserRegister';
import WelcomeScreen from './WelcomeScreen';

import BottomTabsNavigator from './BottomTabsNavigator'; // NEW: Your tabs

// Screens that don't need bottom nav
import DesignPlanDetails from './DesignPlan/DesignPlanDetails'; 
import DesignProgressScreen from './DesignPlan/DesignProgressScreen';
import DesignPlanViewer from './DesignPlan/DesignPlanViewer';
import ReadingMaterialDetails from './ReadingMaterials/ReadingMaterialDetails';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainTabs">
        {/* Auth & Welcome Screens */}
        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
        <Stack.Screen name="UserLogin" component={UserLogin} />
        <Stack.Screen name="UserRegister" component={UserRegister} />

        {/* Bottom Tab Screens grouped here */}
        <Stack.Screen name="MainTabs" component={BottomTabsNavigator} />

        {/* Other screens not part of tab layout */}
        <Stack.Screen name="DesignPlanViewer" component={DesignPlanViewer} />
        <Stack.Screen name="DesignProgressScreen" component={DesignProgressScreen} />
        <Stack.Screen name="DesignPlanDetails" component={DesignPlanDetails} />
        <Stack.Screen name="ReadingMaterialDetails" component={ReadingMaterialDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

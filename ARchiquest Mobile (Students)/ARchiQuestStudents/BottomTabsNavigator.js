import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Modal, Text, StyleSheet, TextInput, Dimensions, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './supabaseClient';

import MainLanding from './Dashboard/mainLanding';
import Profile from './Profile/Profile';
import ReadingMaterials from './ReadingMaterials/ReadingMaterials';
import Settings from './Settings/Settings';

const Tab = createBottomTabNavigator();
const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 768;

const CustomTabBar = ({ state, descriptors, navigation }) => {
const screenWidth = Dimensions.get('window').width;
const slideAnim = useRef(new Animated.Value(screenWidth)).current;
const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
const [classKey, setClassKey] = useState('');
const [studentName, setStudentName] = useState('');
const [activeClasses, setActiveClasses] = useState([]);
const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    fetchStudentName();
    fetchActiveClasses();
  }, []);

  const fetchStudentName = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("Unable to fetch user");
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('first_name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Error fetching student name:", error);
        return;
      }

      if (data && data.first_name) {
        setStudentName(data.first_name);
      }
    } catch (err) {
      console.error("Error in fetchStudentName:", err);
    }
  };

  const fetchActiveClasses = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("Unable to fetch user");
        return;
      }

      const { data, error } = await supabase
        .from('class_students')
        .select(`
          class_id,
          classes:class_id (
            id,
            class_key,
            teacher_id,
            created_at
          )
        `)
        .eq('student_id', user.id);

      if (error) {
        console.error("Error fetching classes:", error);
        return;
      }

      if (data) {
        const classes = data.map(item => item.classes);
        setActiveClasses(classes);
      }
    } catch (err) {
      console.error("Error in fetchActiveClasses:", err);
    }
  };

  const openHelpModalWithMessage = (message) => {
    setModalMessage(message);
    setIsModalVisible(true);
  };

  const closeHelpModal = () => setIsModalVisible(false);

  const handleJoinClass = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        alert("Unable to fetch user. Please log in.");
        return;
      }

      const studentId = user.id;

      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id')
        .eq('class_key', classKey)
        .single();

      if (classError || !classData) {
        alert("Class key not found.");
        return;
      }

      const classId = classData.id;

      const { error: insertError } = await supabase.from('class_students').insert([
        {
          class_id: classId,
          student_id: studentId,
          joined_at: new Date().toISOString(),
        }
      ]);

      if (insertError) {
        alert("Failed to join class: " + insertError.message);
        return;
      }

      alert("✅ Successfully joined the class!");
      setIsJoinModalVisible(false);
      setClassKey('');
      fetchActiveClasses();
    } catch (err) {
      alert("An error occurred: " + err.message);
    }
  };


  return (
    <>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          if (route.name === 'AddButton') {
            return (
              <TouchableOpacity
                key={route.key}
                style={styles.addButton}
                onPress={() => setIsJoinModalVisible(true)}
              >
                <Ionicons name="add" size={30} color="#fff" />
              </TouchableOpacity>
            );
          }

          const iconMap = {
            MainLanding: 'home-outline',
            Profile: 'person-outline',
            ReadingMaterials: 'book-outline',
            Settings: 'settings-outline',
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tabItem}
            >
              <Ionicons
                name={iconMap[route.name]}
                size={24}
                color={isFocused ? '#176BB7' : 'gray'}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Join Class Modal */}
      <Modal
        transparent={true}
        visible={isJoinModalVisible}
        animationType="fade"
        onRequestClose={() => setIsJoinModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Join Class</Text>
              <Text style={styles.modalText}>Enter the class key provided by your teacher</Text>
      
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter class key"
                value={classKey}
                onChangeText={setClassKey}
                placeholderTextColor="#999"
              />
            </View>
      
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleJoinClass}
                >
                  <Text style={styles.modalButtonText}>Join Class</Text>
              </TouchableOpacity>
      
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setIsJoinModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
    </Modal>
    </>
  );
};

export default function BottomTabsNavigator() {
  return (
    <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />}>
      <Tab.Screen name="MainLanding" component={MainLanding} options={{ headerShown: false }}/>
      <Tab.Screen name="ReadingMaterials" component={ReadingMaterials} options={{ headerShown: false }}/>
      <Tab.Screen name="AddButton" component={() => null} options={{ tabBarLabel: '' }} />
      <Tab.Screen name="Profile" component={Profile} options={{ headerShown: false }}/>
      <Tab.Screen name="Settings" component={Settings} options={{ headerShown: false }}/>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
  flexDirection: 'row',
  backgroundColor: '#fff',
  height: 60,
  borderTopWidth: 1,
  borderTopColor: '#ccc',
},

tabItem: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
  addButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 10,
    width: 40,
    height: 50,
    backgroundColor: '#176BB7',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: isSmallScreen ? '90%' : '60%',
    maxWidth: 500,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#176BB7',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
    marginBottom: 20,
    lineHeight: 22,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#176BB7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: '45%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalCancelButton: {
    backgroundColor: '#f0f0f0',
  },
  modalCancelText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
});

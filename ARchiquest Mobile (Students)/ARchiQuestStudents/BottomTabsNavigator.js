import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Modal, Text, StyleSheet, TextInput, Dimensions, Animated, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './supabaseClient';

import MainLanding from './Dashboard/mainLanding';
import StudentProfile from './Profile/StudentProfile';
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
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalMessage, setModalMessage] = useState("")

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
          class_keys:class_id (
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
      if (!classKey.trim()) {
        Alert.alert("Error", "Please enter a class key")
        return
      }
  
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError || !user) {
          Alert.alert("Error", "Unable to fetch user. Please log in.")
          return
        }
  
        const studentId = user.id
  
        const { data: classData, error: classError } = await supabase
          .from("class_keys")
          .select("id")
          .eq("class_key", classKey.trim())
          .single()
  
        if (classError || !classData) {
          Alert.alert("Error", "Class key not found.")
          return
        }
  
        const classId = classData.id
  
        const { error: insertError } = await supabase.from("class_students").insert([
          {
            class_id: classId,
            student_id: studentId,
            joined_at: new Date().toISOString(),
          },
        ])
  
        if (insertError) {
          Alert.alert("Error", "Failed to join class: " + insertError.message)
          return
        }
  
        Alert.alert("Success", "✅ Successfully joined the class!")
        setIsJoinModalVisible(false)
        setClassKey("")
        fetchActiveClasses()
      } catch (err) {
        Alert.alert("Error", "An error occurred: " + err.message)
      }
    }


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
              MainLanding: isFocused => isFocused ? 'home' : 'home-outline',
              StudentProfile: isFocused => isFocused ? 'person' : 'person-outline',
              ReadingMaterials: isFocused => isFocused ? 'book' : 'book-outline',
              Settings: isFocused => isFocused ? 'settings' : 'settings-outline',
            };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tabItem}
            >
              <Ionicons
                name={iconMap[route.name](isFocused)}
                size={24}
                color="#176BB7"
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
              <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Join Class</Text>
              </LinearGradient>

              <View style={styles.modalBody}>
                <Text style={styles.modalText}>Enter the class key provided by your teacher</Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter class key"
                    value={classKey}
                    onChangeText={setClassKey}
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setIsJoinModalVisible(false)}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.joinButton} onPress={handleJoinClass}>
                    <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.joinButtonGradient}>
                      <Text style={styles.joinButtonText}>Join Class</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        <Modal animationType="fade" transparent={true} visible={isModalVisible} onRequestClose={closeHelpModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Help</Text>
              </LinearGradient>

              <View style={styles.modalBody}>
                <Text style={styles.modalText}>{modalMessage}</Text>
                <TouchableOpacity style={styles.helpCloseButton} onPress={closeHelpModal}>
                  <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.helpCloseButtonGradient}>
                    <Text style={styles.helpCloseButtonText}>Close</Text>
                  </LinearGradient>
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
      <Tab.Screen name="StudentProfile" component={StudentProfile} options={{ headerShown: false }}/>
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
    width: 50,
    height: 50,
    backgroundColor: '#4F46E5',
    borderRadius: 25,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: isSmallScreen ? '90%' : '70%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#4F46E5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalBody: {
    padding: 25,
  },
  modalText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 25,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 16,
  },
  joinButton: {
    flex: 1,
    borderRadius: 12,
    marginLeft: 10,
  },
  joinButtonGradient: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});


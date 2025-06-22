import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChallengeDetails from './ChallengeDetails';
import { supabase } from '../../supabaseClient';

 // Make sure this path is correct

const CostEstimateSimulator = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('Materials');
  const [showChallengeDetails, setShowChallengeDetails] = useState(false);
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [classKey, setClassKey] = useState('');
  
  // Sample data based on the image
  const challengeData = {
    title: 'Build a Modern House',
    description: 'Design and build a modern single-family home within budget constraints.',
    instructor: 'Prof. Laviste',
    dueDate: 'Feb 22, 2025',
    difficulty: 'Medium',
    status: 'In Progress',
    budget: {
      assigned: '₱300,000',
      spent: '₱85,750',
      remaining: '₱214,250',
      percentSpent: 28.58, // (85,750 / 300,000) * 100
    },
    materials: [
      { name: 'Concrete', price: '₱100' },
      { name: 'Lumber', price: '₱100' },
      // Add more materials as needed
    ]
  };

  const handleJoinClass = async () => {
    if (!classKey.trim()) {
      Alert.alert("Error", "Please enter a class key");
      return;
    }

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert("Error", "Unable to fetch user. Please log in again.");
        return;
      }

      const studentId = user.id;

      // Find the class with the provided key
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id')
        .eq('class_key', classKey)
        .single();

      if (classError || !classData) {
        Alert.alert("Error", "Class key not found. Please check and try again.");
        return;
      }

      const classId = classData.id;

      // Check if student is already in the class
      const { data: existingEnrollment, error: checkError } = await supabase
        .from('class_students')
        .select('id')
        .eq('class_id', classId)
        .eq('student_id', studentId)
        .single();

      if (existingEnrollment) {
        Alert.alert("Info", "You are already enrolled in this class.");
        setIsJoinModalVisible(false);
        setClassKey('');
        return;
      }

      // Add student to the class
      const { error: insertError } = await supabase.from('class_students').insert([
        {
          class_id: classId,
          student_id: studentId,
          joined_at: new Date().toISOString(),
        }
      ]);

      if (insertError) {
        Alert.alert("Error", "Failed to join class: " + insertError.message);
        return;
      }

      Alert.alert("Success", "✅ Successfully joined the class!");
      setIsJoinModalVisible(false);
      setClassKey('');
    } catch (err) {
      Alert.alert("Error", "An error occurred: " + err.message);
    }
  };

  if (showChallengeDetails) {
    return (
      <ChallengeDetails 
        challengeData={challengeData} 
        onBack={() => setShowChallengeDetails(false)} 
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.appTitle}>ArchiQuest</Text>
        </View>
        <TouchableOpacity style={styles.joinClassButton} onPress={() => setIsJoinModalVisible(true)}>
          <Ionicons name="people-outline" size={24} color="white" />
        </TouchableOpacity>
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
            <Text style={styles.modalText}>Enter the class key provided by your instructor</Text>

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
                style={[styles.modalButton, { backgroundColor: '#EEF5FF' }]}
                onPress={() => setIsJoinModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: '#333' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.content}>
        {/* Current Challenge Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Current Challenge</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{challengeData.status}</Text>
            </View>
          </View>
          
          <Text style={styles.challengeTitle}>{challengeData.title}</Text>
          <Text style={styles.challengeDescription}>{challengeData.description}</Text>
          
          <View style={styles.challengeDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Instructor:</Text>
              <Text style={styles.detailValue}>{challengeData.instructor}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Due Date:</Text>
              <Text style={styles.detailValue}>{challengeData.dueDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Difficulty:</Text>
              <Text style={styles.detailValue}>{challengeData.difficulty}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => setShowChallengeDetails(true)}
          >
            <Text style={styles.continueButtonText}>Continue Challenge</Text>
            <Ionicons name="arrow-forward" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Budget Status Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Budget Status</Text>
            <View style={[styles.statusBadge, styles.budgetBadge]}>
              <Text style={styles.statusText}>{challengeData.budget.assigned}</Text>
            </View>
          </View>
          
          <Text style={styles.budgetLabel}>Assigned budget from instructor</Text>
          
          <View style={styles.budgetDetails}>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetDetailLabel}>Spent:</Text>
              <Text style={styles.budgetSpent}>{challengeData.budget.spent}</Text>
            </View>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetDetailLabel}>Remaining:</Text>
              <Text style={styles.budgetRemaining}>{challengeData.budget.remaining}</Text>
            </View>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${challengeData.budget.percentSpent}%` }
              ]} 
            />
          </View>
          
          <TouchableOpacity style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>View Budget Details</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs Section */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsHeader}>
            {['Materials', 'Inventory', 'Progress'].map(tab => (
              <TouchableOpacity 
                key={tab}
                style={[
                  styles.tab, 
                  activeTab === tab && styles.activeTab
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text 
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.tabContent}>
            {activeTab === 'Materials' && (
              <View style={styles.materialsContainer}>
                {challengeData.materials.map((material, index) => (
                  <View key={index} style={styles.materialItem}>
                    <View style={styles.materialImagePlaceholder} />
                    <Text style={styles.materialName}>{material.name}</Text>
                    <View style={styles.materialPrice}>
                      <Text style={styles.priceText}>{material.price}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
            
            {activeTab === 'Inventory' && (
              <View style={styles.inventoryContainer}>
                <Text style={styles.emptyStateText}>Your inventory items will appear here</Text>
              </View>
            )}
            
            {activeTab === 'Progress' && (
              <View style={styles.progressContainer}>
                <Text style={styles.emptyStateText}>Your progress will be tracked here</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#176B87',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  joinClassButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#006064',
  },
  statusBadge: {
    backgroundColor: '#bbdefb',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 15,
  },
  budgetBadge: {
    backgroundColor: '#bbdefb',
  },
  statusText: {
    color: '#0d47a1',
    fontSize: 12,
    fontWeight: 'bold',
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  challengeDetails: {
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: '#555',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#006064',
  },
  continueButton: {
    backgroundColor: '#176B87',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  continueButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginRight: 5,
  },
  budgetLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  budgetDetails: {
    marginVertical: 10,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  budgetDetailLabel: {
    fontSize: 14,
    color: '#555',
  },
  budgetSpent: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f44336',
  },
  budgetRemaining: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4caf50',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#bbdefb',
    borderRadius: 4,
  },
  viewDetailsButton: {
    borderWidth: 1,
    borderColor: '#006064',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  viewDetailsText: {
    color: '#176B87',
    fontWeight: 'bold',
  },
  tabsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  tabsHeader: {
    flexDirection: 'row',
    backgroundColor: '#bbdefb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#bbdefb',
    borderBottomWidth: 3,
    borderBottomColor: '#006064',
  },
  tabText: {
    color: '#555',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#006064',
    fontWeight: 'bold',
  },
  tabContent: {
    padding: 15,
    minHeight: 150,
  },
  materialsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  materialItem: {
    alignItems: 'center',
    marginBottom: 15,
    width: '30%',
  },
  materialImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 5,
  },
  materialName: {
    fontSize: 14,
    marginBottom: 5,
  },
  materialPrice: {
    backgroundColor: '#bbdefb',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 15,
  },
  priceText: {
    color: '#0d47a1',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inventoryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  emptyStateText: {
    color: '#757575',
    fontSize: 14,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#006064',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#006064',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CostEstimateSimulator;
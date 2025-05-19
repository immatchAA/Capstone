import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ChallengeDetails = ({ onBack, challengeData }) => {
  // Progress steps data
  const progressSteps = [
    { id: 1, title: 'Review Challenge Requirements', status: 'completed' },
    { id: 2, title: 'Create Initial Design', status: 'completed' },
    { id: 3, title: 'Select Materials', status: 'in-progress' },
    { id: 4, title: 'Finalize Construction', status: 'not-started' },
    { id: 5, title: 'Submit for Evaluation', status: 'not-started' },
  ];

  // Budget data
  const budgetData = {
    total: '$200,000',
    spent: '$85,750',
    remaining: '$114,250',
    usagePercentage: 43
  };

  // Helper function to render status icon
  const renderStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <Ionicons name="checkmark-circle" size={20} color="#4caf50" />;
      case 'in-progress':
        return <Ionicons name="time" size={20} color="#2196f3" />;
      case 'not-started':
      default:
        return null;
    }
  };

  // Helper function to get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'not-started':
      default:
        return 'Not Started';
    }
  };

  // Helper function to get status text color
  const getStatusTextColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'in-progress':
        return '#2196f3';
      case 'not-started':
      default:
        return '#757575';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#006064" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="trophy-outline" size={20} color="white" style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Challenge Details</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.challengeTitle}>{challengeData.title}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{challengeData.status}</Text>
          </View>
        </View>

        {/* Building Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="business-outline" size={80} color="#006064" />
        </View>

        {/* Challenge Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challenge Description</Text>
          <Text style={styles.descriptionText}>
            Design and build a modern single-family home that meets all building codes and stays within the assigned budget. 
            Your design should include at least 3 bedrooms, 2 bathrooms, a kitchen, living room, and a garage.
          </Text>
        </View>

        {/* Learning Objectives */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Objectives</Text>
          <View style={styles.objectiveItem}>
            <View style={styles.bulletPoint}>
              <Text style={styles.bulletText}>•</Text>
            </View>
            <Text style={styles.objectiveText}>Understand real-world construction costs and constraints</Text>
          </View>
          <View style={styles.objectiveItem}>
            <View style={styles.bulletPoint}>
              <Text style={styles.bulletText}>•</Text>
            </View>
            <Text style={styles.objectiveText}>Learn to prioritize essential elements within budget constraints</Text>
          </View>
          <View style={styles.objectiveItem}>
            <View style={styles.bulletPoint}>
              <Text style={styles.bulletText}>•</Text>
            </View>
            <Text style={styles.objectiveText}>Apply architecture principles to create functional spaces</Text>
          </View>
          <View style={styles.objectiveItem}>
            <View style={styles.bulletPoint}>
              <Text style={styles.bulletText}>•</Text>
            </View>
            <Text style={styles.objectiveText}>Practice material selection and material selection</Text>
          </View>
        </View>

        {/* Challenge Progress Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challenge Progress</Text>
          
          {/* Progress Steps */}
          <View style={styles.progressStepsContainer}>
            {progressSteps.map((step) => (
              <View key={step.id} style={styles.progressStep}>
                <View style={styles.stepNumberContainer}>
                  <Text style={styles.stepNumber}>{step.id}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text 
                    style={[
                      styles.stepStatus, 
                      { color: getStatusTextColor(step.status) }
                    ]}
                  >
                    {getStatusText(step.status)}
                  </Text>
                </View>
                <View style={styles.stepIcon}>
                  {renderStatusIcon(step.status)}
                </View>
              </View>
            ))}
          </View>
          
          {/* Overall Progress */}
          <View style={styles.overallProgressContainer}>
            <Text style={styles.overallProgressLabel}>Overall Progress</Text>
            <Text style={styles.overallProgressValue}>45%</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: '45%' }]} />
          </View>
        </View>

        {/* Budget Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget Status</Text>
          
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Total Budget</Text>
            <Text style={styles.budgetTotal}>{budgetData.total}</Text>
          </View>
          
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Spent</Text>
            <Text style={styles.budgetSpent}>{budgetData.spent}</Text>
          </View>
          
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Remaining</Text>
            <Text style={styles.budgetRemaining}>{budgetData.remaining}</Text>
          </View>
          
          <View style={styles.budgetUsageContainer}>
            <Text style={styles.budgetUsageLabel}>Budget Usage</Text>
            <Text style={styles.budgetUsageValue}>{budgetData.usagePercentage}%</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${budgetData.usagePercentage}%`, backgroundColor: '#bbdefb' }
              ]} 
            />
          </View>
          
          <TouchableOpacity style={styles.viewDetailsButton}>
            <Ionicons name="cash-outline" size={16} color="#006064" style={{ marginRight: 5 }} />
            <Text style={styles.viewDetailsText}>View Budget Details</Text>
          </TouchableOpacity>
        </View>

        {/* Budget */}
        <View style={styles.infoSection}>
          <View style={styles.infoIcon}>
            <Ionicons name="cash-outline" size={24} color="#006064" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Budget</Text>
            <Text style={styles.infoValue}>₱200,000</Text>
            <Text style={styles.infoSubtext}>Assigned by instructor</Text>
          </View>
        </View>

        {/* Due Date */}
        <View style={styles.infoSection}>
          <View style={styles.infoIcon}>
            <Ionicons name="calendar-outline" size={24} color="#006064" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Due Date</Text>
            <Text style={styles.infoValue}>May 15, 2023</Text>
            <Text style={styles.infoSubtext}>11:59 PM</Text>
          </View>
        </View>

        {/* Team */}
        <View style={styles.infoSection}>
          <View style={styles.infoIcon}>
            <Ionicons name="people-outline" size={24} color="#006064" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Team</Text>
            <Text style={styles.infoValue}>Individual</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.arModeButton}>
            <Text style={styles.arModeButtonText}>Enter AR Mode</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.visitStoreButton}>
            <Ionicons name="cart-outline" size={20} color="#006064" style={{ marginRight: 5 }} />
            <Text style={styles.visitStoreButtonText}>Visit Store</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#006064',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#bbdefb',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 15,
  },
  statusText: {
    color: '#0d47a1',
    fontSize: 12,
    fontWeight: 'bold',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  section: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#006064',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  objectiveItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 15,
    alignItems: 'center',
  },
  bulletText: {
    fontSize: 16,
    color: '#006064',
    fontWeight: 'bold',
  },
  objectiveText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    color: '#333',
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e1f5fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#555',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 2,
  },
  infoSubtext: {
    fontSize: 12,
    color: '#777',
  },
  progressStepsContainer: {
    marginBottom: 15,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e1f5fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#006064',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  stepStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  stepIcon: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallProgressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  overallProgressLabel: {
    fontSize: 14,
    color: '#555',
  },
  overallProgressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#006064',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 15,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 4,
  },
  budgetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  budgetLabel: {
    fontSize: 14,
    color: '#555',
  },
  budgetTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#006064',
  },
  budgetSpent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f44336',
  },
  budgetRemaining: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  budgetUsageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  budgetUsageLabel: {
    fontSize: 14,
    color: '#555',
  },
  budgetUsageValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#006064',
  },
  viewDetailsButton: {
    borderWidth: 1,
    borderColor: '#006064',
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailsText: {
    color: '#006064',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  arModeButton: {
    flex: 1,
    backgroundColor: '#006064',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  arModeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  visitStoreButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  visitStoreButtonText: {
    color: '#006064',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default ChallengeDetails;
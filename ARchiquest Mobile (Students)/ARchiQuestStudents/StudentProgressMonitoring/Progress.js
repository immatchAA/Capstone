import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; 

const Progress = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentContent, setCurrentContent] = useState('');

  const progressData = [
    { label: 'Modern Architectural Principles', progress: 1 },
    { label: 'Sustainable Building Design', progress: 0.75 },
    { label: 'Urban Planning Fundamentals', progress: 0.45 },
    { label: 'Structural Engineering Basics', progress: 0.2 },
  ];

  const handleGridPress = (content) => {
    setCurrentContent(content);
    setModalVisible(true);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Learning Progress</Text>
        <Text style={styles.subtitle}>Your overall learning journey</Text>
        <Text style={styles.metricLabel}>Overall Completion</Text>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: '68%' }]} />
        </View>
        <Text style={styles.metricValue}>68%</Text>

        <View style={styles.statGrid}>
          {[
            ['12/20 Modules', 'book', 'Modules'],
            ['8 Buildings Completed', 'building', 'Buildings Completed'],
            ['24 Hours Spent', 'clock-o', 'Hours Spent'],
            ['5 Badges Earned', 'trophy', 'Badges Earned'],
          ].map(([text, icon, content], index) => (
            <TouchableOpacity
              key={index}
              style={styles.statBox}
              onPress={() => handleGridPress(content)}
            >
              <Icon name={icon} size={30} color="#176B87" style={styles.statIcon} /> 
              <Text style={styles.statText}>{text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Modules</Text>
        <Text style={styles.subtitle}>Your latest learning activities</Text>

        {progressData.map((item, idx) => (
          <View key={idx} style={styles.moduleItem}>
            <Icon name="book" size={22} color="#176B87" style={styles.moduleIcon} /> 
            <View style={styles.moduleContent}>
              <Text style={styles.moduleTitle}>{item.label}</Text> 
              <View style={styles.progressBarBackgroundSmall}>
                <View style={[styles.progressBarFillSmall, { width: `${item.progress * 100}%` }]} />
              </View>
            </View>
            <Text style={styles.modulePercent}>{Math.round(item.progress * 100)}%</Text> 
          </View>
        ))}
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Details of {currentContent}</Text> 
            <Text style={styles.modalText}>Here will be details for {currentContent}.</Text> 
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text> 
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f4f7',
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#176B87',
  },
  subtitle: {
    fontSize: 13,
    color: '#7a7a7a',
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 10,
  },
  metricValue: {
    fontSize: 14,
    color: '#176B87',
    textAlign: 'right',
    marginBottom: 10,
  },
  progressBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginVertical: 5,
  },
  progressBarFill: {
    height: 10,
    backgroundColor: '#176B87',
    borderRadius: 5,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    backgroundColor: '#e8f0fc',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  statIcon: {
    marginBottom: 6,
  },
  statText: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
  },
  moduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  moduleIcon: {
    marginRight: 10,
  },
  moduleContent: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
  progressBarBackgroundSmall: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    width: '100%',
  },
  progressBarFillSmall: {
    height: 6,
    backgroundColor: '#176B87',
    borderRadius: 3,
  },
  modulePercent: {
    marginLeft: 10,
    fontSize: 12,
    color: '#176B87',
    width: 40,
    textAlign: 'right',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#176B87',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#176B87',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Progress;

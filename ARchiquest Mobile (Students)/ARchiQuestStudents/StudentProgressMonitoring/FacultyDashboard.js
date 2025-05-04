import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const FacultyDashboard = ({ navigation }) => {
  const [dash, setDash] = useState('Progress');
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Faculty Dashboard</Text>
      </View>

      <View style={styles.dashSwitch}>
        <TouchableOpacity
          style={[styles.dashButton, dash === 'Progress' && styles.activeDash]}
          onPress={() => setDash('Progress')}
        >
          <FontAwesome5 size={20} color={dash === 'Progress' ? '#fff' : '#333'} />
          <Text style={[styles.dashText, dash === 'Progress' && styles.activeDashText]}>Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dashButton, dash === 'Insights' && styles.activeDash]}
          onPress={() => setDash('Insights')}
        >
          <FontAwesome5  size={20} color={dash === 'Insights' ? '#fff' : '#333'} />
          <Text style={[styles.dashText, dash === 'Insights' && styles.activeDashText]}>Insights</Text>
        </TouchableOpacity>
      </View>
    </View>

    
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    flex: '10%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#176B87',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7a7a7a',
    marginBottom: 30,
  },

  dashSwitch: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#b4d4ff',
    borderRadius: 8,
    paddingHorizontal: '10%',
    paddingVertical: '1.5%',
    marginBottom: 20,
  },
  dashButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '2.5%',
    paddingHorizontal: '20%',
    borderRadius: 6,
  },
  activeDash: {
    backgroundColor: '#86b6f6',
  },
  dashText: {
    marginLeft: 5,
    color: '#000',
  },
  activeDashText: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#176B87',
    paddingVertical: 12,
    width: '80%',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FacultyDashboard;

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Progress from './Progress';
import InsightPanel from './InsightPanel';

const StudentProgress = () => {
  const [dash, setDash] = useState('Progress');

  return (
    <View style={styles.container}>
      
      <View style={styles.dashSwitch}>
        <TouchableOpacity
          style={[styles.dashButton, dash === 'Progress' && styles.activeDash]}
          onPress={() => setDash('Progress')}
        >
          <Text style={[styles.dashText, dash === 'Progress' && styles.activeDashText]}>
            Progress
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dashButton, dash === 'Insights' && styles.activeDash]}
          onPress={() => setDash('Insights')}
        >
          <Text style={[styles.dashText, dash === 'Insights' && styles.activeDashText]}>
            Insights
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {dash === 'Progress' ? <Progress embedded /> : <InsightPanel embedded />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  dashSwitch: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#b4d4ff',
    borderRadius: 8,
    paddingHorizontal: '10%',
    paddingVertical: '1.5%',
    margin: '2%',
    marginTop: '5%',
    marginBottom: '0.5%',
  },
  dashButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '2.5%',
    paddingHorizontal: '20%',
    borderRadius: 6,
    margin: '.5%',
  },
  activeDash: {
    backgroundColor: '#86b6f6',
  },
  dashText: {
    marginLeft: 5,
    fontSize: 15,
    color: '#176B87',
  },
  activeDashText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
});

export default StudentProgress;

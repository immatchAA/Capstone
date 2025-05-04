import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const getAIInsights = () => {
  return [
    { label: 'Design Thinking', value: 0.82, icon: 'bar-chart' },
    { label: 'Technical Skills', value: 0.75, icon: 'bolt' },
    { label: 'Project Management', value: 0.6, icon: 'tasks' },
  ];
};

const InsightPanel = () => {
  const insights = getAIInsights();
  const recommendations = [
    {
      title: 'Sustainable Materials Workshop',
      desc: 'Improve your knowledge of eco-friendly building materials.',
      onPress: () => alert('Navigating to Sustainable Materials Workshop'),
    },
    {
      title: 'Urban Planning Challenge',
      desc: 'Apply your skills in a real-world city planning scenario.',
      onPress: () => alert('Navigating to Urban Planning Challenge'),
    },
    {
      title: 'AR Visualization Techniques',
      desc: 'Learn advanced methods for presenting architectural concepts.',
      onPress: () => alert('Navigating to AR Visualization Techniques'),
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContentContainer}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled={true}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>AI Performance Insights</Text>
          <View style={styles.updatedBadge}>
            <Text style={styles.updatedText}>Updated Today</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Personalized analysis of your learning</Text>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>🧠 AI Learning Assessment</Text>
          <Text style={styles.summaryText}>
            Based on your recent activities, you excel at structural design concepts but may benefit from
            additional practice with sustainable materials.
          </Text>
        </View>

        {insights.map((item, index) => (
          <View key={index} style={styles.insightRow}>
            <View style={styles.insightIcon}>
              <Icon name={item.icon} size={20} color="#176B87" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightLabel}>{item.label}</Text>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${item.value * 100}%` }]} />
              </View>
              <Text style={styles.insightPercent}>{Math.round(item.value * 100)}%</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Personalized Recommendations</Text>
        <Text style={styles.subtitle}>AI-suggested learning paths</Text>

        {recommendations.map((rec, index) => (
          <TouchableOpacity key={index} onPress={rec.onPress}>
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationIcon}>💡</Text>
              <View style={styles.recommendationTextContainer}>
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
                <Text style={styles.recommendationDesc}>{rec.desc}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f4f7',
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  updatedBadge: {
    backgroundColor: '#e0f0ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  updatedText: {
    fontSize: 10,
    color: '#176B87',
    fontWeight: '500',
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
  summaryBox: {
    backgroundColor: '#e8f0fc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontWeight: '600',
    color: '#176B87',
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 13,
    color: '#333',
    textAlign: 'justify',
  },
  insightRow: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  insightIcon: {
    marginRight: 10,
  },
  insightContent: {
    flex: 1,
  },
  insightLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#176B87',
    borderRadius: 4,
  },
  insightPercent: {
    textAlign: 'right',
    fontSize: 12,
    color: '#176B87',
    marginTop: 2,
  },
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: '#f7faff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  recommendationIcon: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 3,
  },
  recommendationTextContainer: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#176B87',
    marginBottom: 4,
  },
  recommendationDesc: {
    fontSize: 12,
    color: '#444',
  },
});

export default InsightPanel;

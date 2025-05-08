import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';

const UrbanPlanningFundamentals = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Urban Planning Fundamentals</Text>

      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Urban planning is the art and science of shaping the future of cities and towns. It involves a wide range of disciplines—architecture, engineering, economics, sociology, public health, finance, and more—all aimed at creating sustainable, equitable, and thriving communities.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Key Urban Planning Concepts</Text>
      <View style={styles.card}>
        {urbanPlanningConcepts.map((concept, index) => (
          <Text key={index} style={styles.listItem}>
            <Text style={styles.boldText}>{concept.title}</Text>: {concept.description}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Further Reading</Text>
      <View style={styles.linkBox}>
        <Text style={styles.linkText}>• Urban Planning: A Guide to 7 Key Concepts – ClearPoint Strategy</Text>
        <Text style={styles.linkText}>• Urban Planning Concepts Explained – Rethinking The Future</Text>
      </View>
    </ScrollView>
  );
};

const urbanPlanningConcepts = [
  { title: 'Strategic Urban Planning', description: 'Focuses on setting high-level goals and determining desired areas of growth for a city or metropolitan area.' },
  { title: 'Land-Use Planning', description: 'Concerns legislation and policy, adopting planning instruments like governmental statutes, regulations, rules, codes, and policies to influence land use.' },
  { title: 'Master Planning', description: 'Typically used for greenfield development projects, or building on undeveloped land, considering zoning and infrastructure.' },
  { title: 'Urban Revitalization', description: 'Focuses on improving areas that are in a state of decline through repairs, infrastructure development, and public space enhancements.' },
  { title: 'Economic Development', description: 'Identifying areas of growth to foster greater financial prosperity within the city by attracting businesses and investments.' },
  { title: 'Environmental Planning', description: 'Emphasizes sustainability, addressing issues like pollution, habitat conservation, and climate change resilience.' },
  { title: 'Infrastructure Planning', description: 'Deals with the fundamental facilities and systems that serve a city and its people, including transportation, utilities, and public services.' },
];

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#EEF5FF',
    padding: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#176B87',
    textAlign: 'center',
    marginBottom: 0,
    paddingVertical: 12,
    backgroundColor: '#EEF5FF',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#176B87',
    marginVertical: 16,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#EEF5FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    fontSize: 16,
    color: '#176B87',
    lineHeight: 24,
    marginBottom: 12,
    textAlign: 'justify',
  },
  listItem: {
    fontSize: 16,
    color: '#176B87',
    marginBottom: 6,
    textAlign: 'justify',
  },
  boldText: {
    fontWeight: 'bold',
  },
  linkBox: {
    backgroundColor: '#EEF5FF',
    padding: 12,
    borderRadius: 10,
  },
  linkText: {
    fontSize: 16,
    color: '#176B87',
    marginBottom: 6,
  },
});

export default UrbanPlanningFundamentals;

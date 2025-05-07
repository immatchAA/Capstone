import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const SustainableBuildingDesigns = () => {
  const [quizAnswer, setQuizAnswer] = useState(null);

  const handleQuiz = (answer) => {
    setQuizAnswer(answer);
    const correct = answer === 'passive';
    Alert.alert(
      correct ? "✅ Correct!" : "❌ Try Again",
      correct
        ? "Passive design minimizes energy use by working with natural elements."
        : "Not quite. Hint: it uses sunlight, airflow, and shading."
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sustainable Building Design Principles</Text>
      <Text style={styles.intro}>
        Sustainable architecture focuses on minimizing the environmental impact of buildings through conscious design, construction, and operation practices. These principles promote energy efficiency, resource conservation, and harmony with nature.
      </Text>

      {principles.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardContent}>{item.description}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Quick Quiz</Text>
      <Text style={styles.cardContent}>Which design principle involves harnessing natural energy like sunlight and wind?</Text>
      <View style={styles.quizOptions}>
        <TouchableOpacity style={styles.optionBtn} onPress={() => handleQuiz('modular')}>
          <Text style={styles.optionText}>Modular Construction</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionBtn} onPress={() => handleQuiz('passive')}>
          <Text style={styles.optionText}>Passive Design</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionBtn} onPress={() => handleQuiz('insulation')}>
          <Text style={styles.optionText}>Thermal Insulation</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Further Reading</Text>
      <View style={styles.linkBox}>
        <Text style={styles.linkText}>• Pablo Luna Studio: What is Sustainable Design?</Text>
        <Text style={styles.linkText}>• Breathe Architecture: Principles of Sustainable Architecture</Text>
      </View>
    </ScrollView>
  );
};

const principles = [
  {
    title: '1. Passive Design',
    description: 'Maximizes natural light and ventilation to reduce energy consumption for heating, cooling, and lighting.',
  },
  {
    title: '2. Energy Efficiency',
    description: 'Uses efficient systems and appliances to reduce the building’s energy needs and carbon footprint.',
  },
  {
    title: '3. Sustainable Materials',
    description: 'Incorporates renewable, recycled, or low-impact materials that reduce environmental harm.',
  },
  {
    title: '4. Water Conservation',
    description: 'Integrates rainwater harvesting, low-flow fixtures, and efficient irrigation to conserve water.',
  },
  {
    title: '5. Indoor Environmental Quality',
    description: 'Focuses on air quality, natural lighting, and non-toxic finishes to improve occupant health.',
  },
  {
    title: '6. Site Responsiveness',
    description: 'Designs respect local climate, topography, and ecology to minimize disruption and maximize harmony.',
  },
  {
    title: '7. Lifecycle Thinking',
    description: 'Considers the long-term environmental impacts from construction to demolition.',
  },
];

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F5FCF8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2A7D46',
    textAlign: 'center',
    marginBottom: 12,
  },
  intro: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#DFF3E4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2A7D46',
    marginBottom: 6,
  },
  cardContent: {
    fontSize: 14,
    color: '#444',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A7D46',
    marginVertical: 16,
  },
  linkBox: {
    backgroundColor: '#CDEED9',
    padding: 14,
    borderRadius: 10,
  },
  linkText: {
    fontSize: 14,
    color: '#2A7D46',
    marginBottom: 6,
  },
  quizOptions: {
    marginTop: 10,
    gap: 10,
  },
  optionBtn: {
    backgroundColor: '#BCE4CE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  optionText: {
    fontSize: 14,
    color: '#2A7D46',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SustainableBuildingDesigns;
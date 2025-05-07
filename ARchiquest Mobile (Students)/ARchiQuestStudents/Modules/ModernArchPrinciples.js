import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const ModernArchPrinciples = () => {
  const [quizAnswer, setQuizAnswer] = useState(null);

  const handleQuiz = (answer) => {
    setQuizAnswer(answer);
    const correct = answer === 'form';
    Alert.alert(
      correct ? "✅ Correct!" : "❌ Try Again",
      correct
        ? "Modern architecture prioritizes function in form."
        : "That's not quite right. Hint: it's about purpose-driven design."
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Modern Architectural Principles</Text>
      <Text style={styles.intro}>
        Modern architecture emerged in the early 20th century as a rejection of excessive ornamentation and historical styles. These principles guide the functional, clean, and innovative designs we see in many buildings today.
      </Text>

      {principles.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardContent}>{item.description}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Notable Examples</Text>
      {examples.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardContent}>{item.description}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Quick Quiz</Text>
      <Text style={styles.cardContent}>Which principle says "Design should be based on purpose"?</Text>
      <View style={styles.quizOptions}>
        <TouchableOpacity style={styles.optionBtn} onPress={() => handleQuiz('ornament')}>
          <Text style={styles.optionText}>Ornamentation Matters</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionBtn} onPress={() => handleQuiz('form')}>
          <Text style={styles.optionText}>Form Follows Function</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionBtn} onPress={() => handleQuiz('volume')}>
          <Text style={styles.optionText}>Volume Over Mass</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Further Reading</Text>
      <View style={styles.linkBox}>
        <Text style={styles.linkText}>• Archisoup: Modern Architecture Guide</Text>
        <Text style={styles.linkText}>• Neuroject: Principles of Modern Architecture</Text>
      </View>
    </ScrollView>
  );
};

const principles = [
  {
    title: '1. Form Follows Function',
    description: 'A design should reflect its purpose. Instead of decorative excess, buildings emphasize usability and clarity of function.',
  },
  {
    title: '2. Emphasis on Volume Over Mass',
    description: 'Modern architecture uses lightweight materials and open spaces to create a sense of flow and spaciousness.',
  },
  {
    title: '3. Minimal Ornamentation',
    description: 'Designs avoid unnecessary decorations, focusing on clean lines and structural expression.',
  },
  {
    title: '4. Honesty of Materials',
    description: 'Materials like concrete, steel, and glass are celebrated in their raw, natural state, showcasing authenticity.',
  },
  {
    title: '5. Open Floor Plans',
    description: 'Walls are minimized to promote flexibility and interaction between spaces.',
  },
  {
    title: '6. Integration with Nature',
    description: 'Natural surroundings are embraced with large windows, green courtyards, and visual continuity with the landscape.',
  },
  {
    title: '7. Use of New Technologies',
    description: 'Innovative materials and construction techniques enable daring forms and efficient buildings.',
  },
  {
    title: '8. Expression of Structure',
    description: 'Exposed beams, columns, and load-bearing elements are intentionally left visible to reveal the building’s structure.',
  },
];

const examples = [
  {
    title: 'Villa Savoye by Le Corbusier',
    description: 'A manifesto of modern design with pilotis (columns), open floor plan, and ribbon windows.',
  },
  {
    title: 'Seagram Building by Mies van der Rohe',
    description: 'A glass-and-steel skyscraper that exemplifies minimalism and the International Style.',
  },
];

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F7F9FB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E4F91',
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
    backgroundColor: '#EAF1FB',
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
    color: '#176BB7',
    marginBottom: 6,
  },
  cardContent: {
    fontSize: 14,
    color: '#444',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E4F91',
    marginVertical: 16,
  },
  linkBox: {
    backgroundColor: '#D9EAFB',
    padding: 14,
    borderRadius: 10,
  },
  linkText: {
    fontSize: 14,
    color: '#176BB7',
    marginBottom: 6,
  },
  quizOptions: {
    marginTop: 10,
    gap: 10,
  },
  optionBtn: {
    backgroundColor: '#B4D4FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  optionText: {
    fontSize: 14,
    color: '#1E4F91',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ModernArchPrinciples;

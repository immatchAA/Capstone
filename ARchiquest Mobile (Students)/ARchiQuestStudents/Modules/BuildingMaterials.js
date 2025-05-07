import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const BuildingMaterials = () => {
  const [quizAnswer, setQuizAnswer] = useState(null);

  const handleQuiz = (answer) => {
    setQuizAnswer(answer);
    const correct = answer === 'concrete';
    Alert.alert(
      correct ? "✅ Correct!" : "❌ Try Again",
      correct
        ? "Concrete is a composite material that plays a central role in construction due to its strength and durability."
        : "Not quite. Hint: it's made with cement, sand, and gravel and poured on site."
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Building Materials & Technologies</Text>
      <Text style={styles.intro}>
        This module introduces essential construction materials and technologies used in modern and traditional building practices. Each material has unique properties that affect its strength, cost, sustainability, and application.
      </Text>

      {materials.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardContent}>{item.description}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Quick Quiz</Text>
      <Text style={styles.cardContent}>
        Which material is formed by mixing cement, water, sand, and aggregates, and is poured into molds to harden into structural components?
      </Text>
      <View style={styles.quizOptions}>
        <TouchableOpacity style={styles.optionBtn} onPress={() => handleQuiz('timber')}>
          <Text style={styles.optionText}>Timber</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionBtn} onPress={() => handleQuiz('concrete')}>
          <Text style={styles.optionText}>Concrete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionBtn} onPress={() => handleQuiz('brick')}>
          <Text style={styles.optionText}>Brick</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Further Reading</Text>
      <View style={styles.linkBox}>
        <Text style={styles.linkText}>• ArchDaily: Alternative Building Materials for Sustainable Construction</Text>
        <Text style={styles.linkText}>• Green Building Council: Green Building Basics</Text>
        <Text style={styles.linkText}>• MaterialDistrict: Innovations in Building Materials</Text>
        <Text style={styles.linkText}>• Rethinking The Future: Vernacular Construction Techniques</Text>
      </View>
    </ScrollView>
  );
};

const materials = [
  { title: '1. Cement', description: 'A binder used in concrete and mortar. It reacts with water to harden and gain strength over time. Portland cement is the most common type in use.' },
  { title: '2. Concrete', description: 'A composite material made from cement, water, sand, and gravel. Used for foundations, slabs, beams, and more due to its compressive strength and durability.' },
  { title: '3. Bricks', description: 'Small rectangular blocks made from clay or concrete, used in wall construction. Burnt clay bricks are durable and common in both rural and urban structures.' },
  { title: '4. Timber', description: 'Wood processed for construction use. It is renewable, easy to shape, and used for framing, furniture, flooring, and roofing.' },
  { title: '5. Steel', description: 'An alloy of iron known for high tensile strength. Used for reinforcements, beams, columns, and structural frames in high-rise and large-span buildings.' },
  { title: '6. Glass', description: 'A transparent material used in windows, facades, skylights, and partitions. Types include float glass, laminated, and tempered for safety.' },
  { title: '7. Stones', description: 'Natural rock pieces such as granite, limestone, and marble. Used in foundations, flooring, walls, and as decorative cladding.' },
  { title: '8. Aluminum', description: 'Lightweight, corrosion-resistant metal used in doors, windows, roofing sheets, and cladding. Often used in modern architectural designs.' },
  { title: '9. Asphalt', description: 'A petroleum-based binder used in road surfacing, waterproofing, and roofing. It is flexible and adheres well to surfaces.' },
  { title: '10. Clay Products', description: 'Include tiles, bricks, and pottery. Clay is molded and fired in kilns for strength and water resistance.' },
  { title: '11. Plastics', description: 'Synthetic materials like PVC and HDPE are used in piping, insulation, and paneling. Lightweight, flexible, and resistant to decay.' },
  { title: '12. Gypsum Board', description: 'Also known as drywall or plasterboard, it is used for interior wall partitions and ceilings. It is fire-resistant and easy to install.' },
  { title: '13. Fly Ash Bricks', description: 'Eco-friendly bricks made using fly ash from coal plants. They are lightweight, durable, and reduce carbon emissions.' },
  { title: '14. Bamboo', description: 'A fast-growing sustainable material used in walls, scaffolding, flooring, and roofing, especially in tropical regions.' },
  { title: '15. Fiber Reinforced Polymer (FRP)', description: 'Advanced material combining plastic and fibers like glass or carbon. Used in bridges, facades, and retrofitting for high strength and low weight.' },
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

export default BuildingMaterials;

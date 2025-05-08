import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';

const ModernArchPrinciples = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Modern Architectural Principles</Text>

      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Modern architecture emerged in the early 20th century as a response to the ornate styles of the 19th century. It emphasizes functionality, simplicity, and the honest use of materials. The movement sought to create buildings that were not only aesthetically pleasing but also practical and reflective of their time. Modern architecture rejected excessive ornamentation and instead embraced clean lines, open spaces, and the use of industrial materials like steel, glass, and concrete. It also aimed to improve the quality of life by designing spaces that were functional, flexible, and connected to nature.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Key Principles</Text>
      {principles.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.listItem}>
            <Text style={styles.boldText}>{item.title}</Text>: {item.description}
          </Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Influential Figures</Text>
      {figures.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.content}>
            <Text style={styles.boldText}>{item.name}</Text>: {item.description}
          </Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Further Reading</Text>
      <View style={styles.linkBox}>
        <Text style={styles.linkText}>• Modern Architecture Guide – Archisoup</Text>
        <Text style={styles.linkText}>• Principles of Modern Architecture – Neuroject</Text>
      </View>
    </ScrollView>
  );
};

const principles = [
  {
    title: 'Form Follows Function',
    description: 'The shape of a building or object should be based on its intended purpose. This principle argues that the design of a structure should prioritize its function over aesthetic considerations. A building\'s appearance should emerge from its functionality, with minimal ornamentation and a focus on the materials used.',
  },
  {
    title: 'Minimal Ornamentation',
    description: 'Modern architecture rejects excessive decoration and ornamental features. Instead, it favors simplicity and clean lines. The focus is on functional elements that contribute to the building’s overall efficiency, rather than decorative flourishes. The goal is to let the design speak for itself through its form and materials.',
  },
  {
    title: 'Honesty of Materials',
    description: 'This principle emphasizes the use of materials in their raw, unrefined state. Concrete, steel, glass, and wood are used as they are, without hiding their natural properties or covering them with artificial finishes. This approach celebrates the inherent qualities of each material, allowing their textures and forms to become integral parts of the design.',
  },
  {
    title: 'Open Floor Plans',
    description: 'Modern architecture favors open, flexible spaces that encourage movement and interaction. The traditional concept of enclosed rooms is replaced by open floor plans that create a sense of freedom and flow. Walls are minimized, allowing spaces to serve multiple functions and be easily adapted to changing needs.',
  },
  {
    title: 'Integration with Nature',
    description: 'Modern buildings aim to harmonize with their natural surroundings. Large windows, courtyards, and open areas create a seamless transition between the indoor and outdoor environments. The design often takes advantage of natural light and ventilation, enhancing the connection with nature and improving the overall well-being of the inhabitants.',
  },
  {
    title: 'Use of New Technologies and Materials',
    description: 'The use of new materials and construction techniques is a defining feature of modern architecture. Steel, glass, and reinforced concrete allowed for the creation of buildings with large open spaces, minimal structural supports, and innovative forms. These materials also enabled architects to push the boundaries of design and create more efficient, sustainable buildings.',
  },
  {
    title: 'Expression of Structure',
    description: 'In modern architecture, the structure of the building is often exposed and celebrated. Beams, columns, and supports are left visible, showcasing the engineering and construction methods behind the building. This transparency in design emphasizes the integrity of the structure and allows the materials to be appreciated for their form and function.',
  }
];

const figures = [
  { name: 'Le Corbusier', description: 'Le Corbusier was a pioneer of modern architecture, known for his innovative design principles such as the "Five Points of Architecture." His work emphasized functional design, open floor plans, and the use of industrial materials. Le Corbusier’s designs sought to improve the quality of life for inhabitants by creating spaces that were both aesthetically pleasing and practical.' },
  { name: 'Ludwig Mies van der Rohe', description: 'Mies van der Rohe is famous for his minimalist approach to architecture, which focused on the clarity of structure and the expression of materials. His famous phrase, "Less is more," encapsulates his belief in simplicity and the beauty of restrained design. His work includes iconic buildings like the Barcelona Pavilion and the Seagram Building.' },
  { name: 'Walter Gropius', description: 'Walter Gropius was the founder of the Bauhaus School, which integrated art, design, and industrial production. His work emphasized the functional aspect of design, with a focus on simplicity and efficiency. Gropius was instrumental in developing the modernist movement, combining aesthetics with practicality to create buildings that were both beautiful and functional.' }
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
    marginBottom: 5,
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

export default ModernArchPrinciples;

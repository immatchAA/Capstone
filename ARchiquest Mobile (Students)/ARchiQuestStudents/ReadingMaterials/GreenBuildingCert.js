import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';

const GreenBuildingCert = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Green Building Certifications</Text>

      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Green building certifications are used to assess a project's environmental and sustainability performance. These certifications provide a framework for designing, constructing, and operating buildings that are resource-efficient and environmentally responsible. They are awarded based on a set of criteria that evaluate various aspects of a building's impact on the environment and occupant health.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Key Green Building Certification Systems</Text>
      {greenBuildingCertifications.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>
            <Text style={styles.boldText}>{item.title}</Text>
          </Text>
          <Text style={styles.content}>{item.description}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Benefits of Green Building Certifications</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Obtaining a green building certification offers several benefits, including:
        </Text>
        {certificationBenefits.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            <Text style={styles.boldText}>{item.title}</Text>: {item.description}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Considerations When Choosing a Certification</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          When selecting a green building certification, consider the following factors:
        </Text>
        {certificationConsiderations.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            <Text style={styles.boldText}>{item.title}</Text>: {item.description}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Conclusion</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Green building certifications provide a structured approach to achieving sustainability in the built environment. By adhering to recognized standards, projects can minimize their environmental impact, enhance occupant well-being, and achieve long-term operational savings. Selecting the appropriate certification system is crucial to align with the project's goals and ensure successful implementation.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Further Reading</Text>
      <View style={styles.linkBox}>
        <Text style={styles.linkText}>• WBDG: Green Building Standards and Certification Systems</Text>
        <Text style={styles.linkText}>• UCEM: Understanding Green Building Certifications</Text>
        <Text style={styles.linkText}>• LEED v4 for Building Design and Construction</Text>
        <Text style={styles.linkText}>• National Institute of Building Sciences: Green Building Facts</Text>
      </View>
    </ScrollView>
  );
};

const greenBuildingCertifications = [
  {
    title: 'LEED (Leadership in Energy and Environmental Design)',
    description: 'LEED is one of the most widely used green building certification systems globally. Developed by the U.S. Green Building Council, it provides a framework for healthy, efficient, and cost-saving green buildings. LEED certification is awarded based on performance in several categories, including energy use, lighting, water, and material use. Projects earn points for various green building strategies across these categories.'
  },
  {
    title: 'BREEAM (Building Research Establishment Environmental Assessment Method)',
    description: 'BREEAM is the world\'s first environmental assessment method for buildings, developed in the UK. It assesses the sustainability performance of buildings across various categories, including energy, water, materials, management, health and well-being, pollution, and transport. BREEAM provides ratings from Pass to Outstanding, acknowledging buildings that excel in environmental performance.'
  },
  {
    title: 'WELL Building Standard',
    description: 'The WELL Building Standard focuses on the health and well-being of building occupants. It assesses features of the built environment that impact human health, such as air, water, nourishment, light, fitness, and mind. WELL certification is awarded based on performance in these categories, promoting a holistic approach to building design that enhances occupant health and productivity.'
  },
  {
    title: 'HQE (High Environmental Quality)',
    description: 'HQE is a French certification system that evaluates buildings based on their environmental quality. It focuses on aspects such as energy efficiency, water management, indoor air quality, and the use of sustainable materials. HQE certification is awarded to buildings that meet specific criteria in these areas, promoting sustainable construction practices.'
  },
  {
    title: 'DGNB (German Sustainable Building Council)',
    description: 'DGNB is a German certification system that assesses buildings based on a comprehensive set of criteria, including ecological quality, economic quality, sociocultural and functional quality, technical quality, process quality, and site quality. It emphasizes a life-cycle approach to building design and construction, promoting sustainability throughout the building\'s life span.'
  }
];

const certificationBenefits = [
  {
    title: 'Environmental Impact Reduction',
    description: 'Minimizing energy consumption, water usage, and waste generation.'
  },
  {
    title: 'Cost Savings',
    description: 'Lower operational costs through efficient resource use and reduced energy bills.'
  },
  {
    title: 'Enhanced Marketability',
    description: 'Increased property value and appeal to environmentally conscious tenants and buyers.'
  },
  {
    title: 'Regulatory Compliance',
    description: 'Meeting or exceeding local building codes and regulations related to sustainability.'
  },
  {
    title: 'Health and Well-being',
    description: 'Improved indoor environmental quality leading to better occupant health and productivity.'
  }
];

const certificationConsiderations = [
  {
    title: 'Project Location',
    description: 'Some certifications may be more applicable or recognized in certain regions.'
  },
  {
    title: 'Building Type',
    description: 'Certain certifications may be tailored to specific building types, such as residential, commercial, or industrial.'
  },
  {
    title: 'Goals and Priorities',
    description: 'Align the certification with the project\'s sustainability goals, whether it\'s energy efficiency, occupant health, or environmental impact.'
  },
  {
    title: 'Budget and Resources',
    description: 'Consider the costs associated with obtaining certification and the resources required to meet the criteria.'
  }
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#176B87',
    marginBottom: 8,
  }
});

export default GreenBuildingCert;

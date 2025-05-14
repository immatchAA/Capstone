import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';

const BuildingInfoModeling = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Building Information Modeling (BIM)</Text>

      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Building Information Modeling (BIM) is an intelligent, 3D model-based tool that provides a digital representation of a facility's physical and functional characteristics. This approach allows for enhanced collaboration among stakeholders, improved decision-making, and more efficient project delivery throughout the building's lifecycle.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Key Components of BIM</Text>
      {keyComponents.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.content}>
            {item.description}
          </Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Benefits of BIM</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Implementing BIM offers numerous advantages, including:
        </Text>
        {bimBenefits.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            <Text style={styles.boldText}>{item.title}</Text>: {item.description}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Challenges and Considerations</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          While BIM offers significant benefits, there are challenges to consider:
        </Text>
        {bimChallenges.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            <Text style={styles.boldText}>{item.title}</Text>: {item.description}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Conclusion</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Building Information Modeling is transforming the construction industry by providing a comprehensive and collaborative approach to building design and management. By leveraging BIM, stakeholders can achieve greater efficiency, accuracy, and sustainability throughout the building's lifecycle.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Further Reading</Text>
      <View style={styles.linkBox}>
        <Text style={styles.linkText}>• What is Building Information Modeling? – Accruent</Text>
      </View>
    </ScrollView>
  );
};

const keyComponents = [
  {
    title: 'Intelligent 3D Modeling',
    description: 'BIM utilizes intelligent 3D models that integrate geometric and non-geometric data, enabling stakeholders to visualize and analyze the building\'s design before construction begins. This proactive approach helps in identifying potential issues early, reducing errors, and optimizing design solutions.'
  },
  {
    title: 'Centralized Data Repository',
    description: 'A centralized data repository ensures that all project information is stored in a single, accessible location. This facilitates seamless collaboration among architects, engineers, contractors, and owners, ensuring that everyone has access to the most up-to-date information, thereby minimizing miscommunication and discrepancies.'
  },
  {
    title: 'Lifecycle Management',
    description: 'BIM extends beyond the design and construction phases, encompassing the entire lifecycle of a building. From planning and design to construction and facility management, BIM provides valuable insights that aid in maintaining and operating the building efficiently over time.'
  }
];

const bimBenefits = [
  {
    title: 'Enhanced Collaboration',
    description: 'Facilitates better communication among project stakeholders, leading to more coordinated efforts and fewer conflicts.'
  },
  {
    title: 'Improved Accuracy',
    description: 'Reduces errors and omissions by providing a comprehensive and detailed digital model.'
  },
  {
    title: 'Cost and Time Savings',
    description: 'Identifies potential issues early, allowing for timely interventions that can save both time and money.'
  },
  {
    title: 'Sustainability',
    description: 'Supports sustainable design practices by enabling simulations and analyses that optimize energy efficiency and resource use.'
  },
  {
    title: 'Facility Management',
    description: 'Provides a valuable resource for facility managers, offering detailed information for maintenance and operations.'
  }
];

const bimChallenges = [
  {
    title: 'Initial Costs',
    description: 'The upfront investment in BIM software and training can be substantial.'
  },
  {
    title: 'Learning Curve',
    description: 'Adopting BIM requires time and effort to train staff and integrate new workflows.'
  },
  {
    title: 'Data Management',
    description: 'Ensuring the accuracy and consistency of data within the BIM model is crucial for its effectiveness.'
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
    marginBottom: 20,
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

export default BuildingInfoModeling;

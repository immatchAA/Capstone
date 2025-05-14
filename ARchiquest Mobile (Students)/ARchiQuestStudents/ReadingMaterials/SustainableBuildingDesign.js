import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';

const SustainableBuildingDesign = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Sustainable Building Design</Text>

      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Sustainable building design integrates environmental, social, and economic considerations into the planning, design, and construction of buildings. The goal is to create structures that minimize negative impacts on the environment, enhance occupant well-being, and contribute positively to the community. This approach encompasses various strategies, including energy efficiency, resource conservation, and the use of sustainable materials.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Key Principles</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Sustainable architecture is grounded in several core principles:
        </Text>
        {principles.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            <Text style={styles.boldText}>{item.title}</Text>: {item.description}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Design Strategies</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          To achieve sustainable building design, various strategies are employed:
        </Text>
        {designStrategies.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            <Text style={styles.boldText}>{item.title}</Text>: {item.description}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Case Studies</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Real-world examples demonstrate the application of sustainable building design principles:
        </Text>
        {caseStudies.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            <Text style={styles.boldText}>{item.name}</Text>: {item.description}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Further Reading</Text>
      <View style={styles.linkBox}>
        <Text style={styles.linkText}>• What is Sustainable Design in Architecture? – Pablo Luna Studio</Text>
        <Text style={styles.linkText}>• Principles of Sustainable Architecture – Breathe Architecture</Text>
      </View>
    </ScrollView>
  );
};

const principles = [
  {
    title: 'Passive Design',
    description: 'Utilizing natural resources like sunlight, wind, and shade to heat, cool, and illuminate spaces, reducing reliance on mechanical systems.'
  },
  {
    title: 'Energy Efficiency',
    description: 'Implementing design strategies and technologies that minimize energy consumption, such as high-quality insulation, efficient HVAC systems, and energy-efficient appliances.'
  },
  {
    title: 'Life Cycle Carbon Footprint',
    description: 'Assessing and reducing the total carbon emissions associated with a building\'s life cycle, from material extraction to construction, operation, and eventual demolition.'
  },
  {
    title: 'Material Impact and Waste',
    description: 'Selecting materials with low environmental impact, promoting the use of recycled and locally sourced materials, and designing for material reuse and recycling.'
  },
  {
    title: 'Local Environment',
    description: 'Considering the local climate, topography, and ecosystem in the design process to ensure the building harmonizes with its surroundings.'
  },
  {
    title: 'Health and Wellbeing',
    description: 'Creating indoor environments that promote occupant health through good air quality, natural lighting, and access to nature.'
  },
  {
    title: 'Affordability',
    description: 'Designing buildings that are cost-effective to build and maintain, ensuring long-term sustainability without compromising quality.'
  }
];

const designStrategies = [
  {
    title: 'Site Assessment',
    description: 'Evaluating the site for factors like climate, orientation, and local context to inform design decisions.'
  },
  {
    title: 'Building Orientation',
    description: 'Positioning the building to maximize natural light and passive solar heating while minimizing heat gain and loss.'
  },
  {
    title: 'Thermal Performance',
    description: 'Designing the building envelope to provide adequate insulation and minimize thermal bridging, enhancing energy efficiency.'
  },
  {
    title: 'Water Management',
    description: 'Implementing systems for rainwater harvesting, greywater recycling, and efficient water use to reduce consumption and manage stormwater.'
  },
  {
    title: 'Indoor Environmental Quality',
    description: 'Ensuring good indoor air quality through proper ventilation, use of low-emission materials, and access to natural light and views.'
  },
  {
    title: 'Renewable Energy Integration',
    description: 'Incorporating renewable energy sources like solar panels and wind turbines to reduce dependence on fossil fuels.'
  }
];

const caseStudies = [
  {
    name: 'Manta Yoga Shala',
    description: 'A bamboo structure in Bali that utilizes passive design strategies and locally sourced materials to create an eco-friendly retreat.'
  },
  {
    name: 'Shell Restaurant',
    description: 'Also in Bali, this bamboo building integrates sustainable practices with ocean-inspired design, maximizing energy efficiency and minimizing environmental impact.'
  },
  {
    name: 'Fish Tail Tea Room',
    description: 'Located on the cliffs of Nusa Penida, this structure blends with its natural surroundings, using locally sourced materials and sustainable construction methods to minimize environmental impact.'
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
});

export default SustainableBuildingDesign;

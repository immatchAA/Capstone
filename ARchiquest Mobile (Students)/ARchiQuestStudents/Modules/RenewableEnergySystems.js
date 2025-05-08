import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';

const RenewableEnergySystems = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Renewable Energy Systems in Buildings</Text>

      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Renewable energy systems play a crucial role in reducing the environmental impact of buildings. By integrating renewable energy sources, buildings can minimize their reliance on non-renewable energy sources, reduce greenhouse gas emissions, and enhance sustainability. This module explores the significance of renewable energy in buildings, the systems available, and how they can be integrated into modern building designs.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>What are Renewable Energy Systems?</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Renewable energy systems refer to technologies that harness natural resources, such as sunlight, wind, geothermal heat, and biomass, to generate electricity or provide heating and cooling for buildings. Unlike conventional energy sources that rely on fossil fuels, renewable energy systems produce clean energy, reduce carbon footprints, and promote sustainability in building operations.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Why Integrate Renewable Energy Systems in Buildings?</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Integrating renewable energy systems into buildings has several benefits:
        </Text>
        {renewableEnergyBenefits.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            <Text style={styles.boldText}>{item.title}</Text>: {item.description}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Types of Renewable Energy Systems for Buildings</Text>
      {renewableEnergyTypes.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>
            <Text style={styles.boldText}>{item.title}</Text>
          </Text>
          <Text style={styles.cardContent}>{item.description}</Text>
          <Text style={styles.cardContent}>{"\n"}<Text style={styles.boldText}>Key Benefits:</Text></Text>
          {item.benefits.map((benefit, index) => (
            <Text key={index} style={styles.cardContent}>
              {benefit}
            </Text>
          ))}
        </View>
      ))}

      <Text style={styles.sectionTitle}>Further Reading</Text>
      <View style={styles.linkBox}>
        <Text style={styles.linkText}>• ScienceDirect: Renewable Energy Systems in Buildings</Text>
        <Text style={styles.linkText}>• Distrelec: Integrating Renewable Energy Systems into Building Design</Text>
        <Text style={styles.linkText}>• Energy Education: Renewable Energy in Buildings</Text>
      </View>
    </ScrollView>
  );
};

const renewableEnergyBenefits = [
  {
    title: 'Reduced Energy Costs',
    description: 'By producing energy on-site, buildings can lower their dependence on utility companies, thus reducing energy bills.'
  },
  {
    title: 'Environmental Impact',
    description: 'Renewable energy systems help buildings reduce their carbon footprint and align with global sustainability goals by minimizing reliance on fossil fuels.'
  },
  {
    title: 'Energy Independence',
    description: 'Buildings with renewable energy systems can be more energy-independent, protecting against fluctuations in energy prices and supply disruptions.'
  },
  {
    title: 'Increased Property Value',
    description: 'Sustainable buildings often have higher market value due to their energy-efficient systems and environmental benefits.'
  },
  {
    title: 'Compliance with Regulations',
    description: 'Many countries and regions are implementing strict regulations on energy efficiency, and renewable energy systems can help buildings meet these requirements.'
  }
];

const renewableEnergyTypes = [
  {
    title: 'Solar Energy Systems',
    description: 'Solar energy is one of the most commonly used renewable energy systems for buildings. Solar panels, also known as photovoltaic (PV) systems, capture sunlight and convert it into electricity. Solar thermal systems are another common type, where solar energy is used to heat water for building use.',
    benefits: [
      'Solar energy is abundant and free.',
      'Reduces electricity costs by generating on-site energy.',
      'Low maintenance costs.',
      'Can be integrated into rooftops, facades, or even windows.'
    ]
  },
  {
    title: 'Wind Energy Systems',
    description: 'Wind turbines are used to capture wind energy and convert it into electricity. These can be small-scale turbines placed on rooftops or larger ones located on-site or nearby. Wind energy is ideal in areas with consistent winds.',
    benefits: [
      'Wind energy can supplement building power needs.',
      'Provides a renewable energy source in windy regions.',
      'Often used in hybrid systems combining solar and wind energy.'
    ]
  },
  {
    title: 'Geothermal Energy Systems',
    description: 'Geothermal energy systems utilize the stable temperature below the Earth\'s surface for heating and cooling. Ground-source heat pumps (GSHP) can be used to heat and cool buildings efficiently by transferring heat from the ground to the building in winter, and vice versa in summer.',
    benefits: [
      'Highly efficient for both heating and cooling.',
      'Can reduce heating and cooling costs by 50%-70%.',
      'Provides stable temperatures year-round, minimizing energy use.'
    ]
  },
  {
    title: 'Biomass Energy Systems',
    description: 'Biomass energy systems use organic materials, such as wood, agricultural residues, or even algae, to generate heat or electricity. These systems can be used for heating buildings or for combined heat and power (CHP) generation, where both heat and electricity are produced simultaneously.',
    benefits: [
      'Biomass is a renewable and carbon-neutral resource.',
      'Helps in waste management by using agricultural or wood residues.',
      'Suitable for larger-scale buildings or communities.'
    ]
  },
  {
    title: 'Energy Storage Systems',
    description: 'Energy storage systems, such as batteries or thermal storage, allow buildings to store excess energy generated during peak production times (e.g., during sunny days for solar) and use it when energy demand is higher or when the energy source is not available.',
    benefits: [
      'Ensures a continuous power supply even when renewable energy systems are not producing energy (e.g., at night for solar).',
      'Reduces dependency on the grid and enhances energy security.',
      'Helps buildings become more self-sufficient and reduce energy waste.'
    ]
  },
  {
    title: 'Hybrid Renewable Energy Systems',
    description: 'Hybrid renewable energy systems combine two or more renewable energy technologies to ensure a continuous and reliable energy supply. For example, combining solar and wind energy can help mitigate the intermittent nature of both sources, providing a more stable and reliable energy output.',
    benefits: [
      'Increases the reliability of renewable energy systems.',
      'Optimizes energy production by taking advantage of different renewable resources.',
      'Can help reduce the cost of energy storage and grid dependence.'
    ]
  },
  {
    title: 'Smart Grid Integration',
    description: 'Smart grid technology enables buildings to connect with the local power grid, providing real-time data on energy usage and enabling buildings to adjust their energy consumption. By integrating renewable energy systems into smart grids, buildings can manage energy flow more efficiently, reducing waste and ensuring a consistent energy supply.',
    benefits: [
      'Allows for real-time monitoring and optimization of energy use.',
      'Helps balance energy production from renewable sources with demand.',
      'Enables buildings to export excess energy back to the grid, earning credits or revenue.'
    ]
  },
  {
    title: 'Passive House Design',
    description: 'Passive house design focuses on minimizing energy consumption by improving the building\'s envelope (e.g., insulation, windows, and airtightness). This reduces the need for active heating and cooling systems and allows for easier integration of renewable energy sources like solar and geothermal.',
    benefits: [
      'Dramatically reduces energy demand for heating and cooling.',
      'Provides a comfortable indoor environment with minimal mechanical intervention.',
      'Reduces operating costs and enhances building performance.'
    ]
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#176B87',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 16,
    color: '#176B87',
    lineHeight: 24,
    marginBottom: 8,
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

export default RenewableEnergySystems;

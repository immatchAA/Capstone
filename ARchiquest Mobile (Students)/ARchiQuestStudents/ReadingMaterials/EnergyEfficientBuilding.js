import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';

const EnergyEfficientBuilding = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Energy-Efficient Building Design</Text>

      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Energy-efficient building design is the practice of designing, constructing, and maintaining buildings to maximize energy efficiency, reduce energy consumption, and minimize environmental impact. This approach involves a combination of building envelope improvements, energy-efficient systems, renewable energy integration, and sustainable construction practices. The goal is to reduce a building’s carbon footprint while improving the comfort, health, and productivity of its occupants.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Building Envelope</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          The building envelope is the physical barrier between the interior and exterior environments. It plays a key role in managing heat, moisture, and air transfer, which are critical for energy efficiency. By improving the building envelope, you can reduce the need for active heating and cooling systems. The following elements are essential to an energy-efficient building envelope:
        </Text>
        {buildingEnvelope.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            <Text style={styles.boldText}>{item.title}</Text>: {item.description}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>HVAC Systems</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          HVAC (Heating, Ventilation, and Air Conditioning) systems are responsible for regulating indoor air quality and temperature. These systems can be major energy consumers in buildings, but by optimizing their design and efficiency, substantial energy savings can be achieved. Key strategies to improve HVAC energy performance include:
        </Text>
        {hvacSystems.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            <Text style={styles.boldText}>{item.title}</Text>: {item.description}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Renewable Energy Integration</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Renewable energy systems are increasingly being integrated into energy-efficient building designs to reduce dependency on non-renewable energy sources and decrease the environmental impact of buildings. These systems provide sustainable energy solutions that reduce greenhouse gas emissions, lower energy bills, and enhance energy security. Common renewable energy systems include:
        </Text>
        {renewableEnergy.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            <Text style={styles.boldText}>{item.title}</Text>: {item.description}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Benefits of Energy-Efficient Design</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          The benefits of energy-efficient building design go beyond environmental sustainability. Here are the key advantages of adopting energy-efficient strategies:
        </Text>
        {efficiencyBenefits.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            <Text style={styles.boldText}>{item.title}</Text>: {item.description}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Challenges and Considerations</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          While the benefits of energy-efficient building design are clear, there are challenges that must be considered:
        </Text>
        {challenges.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            <Text style={styles.boldText}>{item.title}</Text>: {item.description}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Conclusion</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Energy-efficient building design is a crucial strategy in reducing the environmental impact of buildings while lowering operational costs and enhancing occupant comfort. By improving the building envelope, optimizing HVAC systems, and integrating renewable energy sources, buildings can achieve significant energy savings and contribute to global sustainability goals. As energy efficiency continues to be a top priority in the construction industry, energy-efficient buildings will play a vital role in creating a sustainable future.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Further Reading</Text>
      <View style={styles.linkBox}>
        <Text style={styles.linkText}>• HMC Architects: Energy-Efficient Building Design</Text>
        <Text style={styles.linkText}>• Energy Education: Energy-Efficient Building Design</Text>
        <Text style={styles.linkText}>• Case Engineering: Energy-Efficient Building Technologies</Text>
        <Text style={styles.linkText}>• The Green Building Council: Energy-Efficient Buildings</Text>
      </View>
    </ScrollView>
  );
};

const buildingEnvelope = [
  {
    title: 'Insulation',
    description: 'Insulation reduces heat transfer between the inside and outside of a building. High-performance insulation materials, such as spray foam, rigid foam boards, or cellulose, are used in walls, roofs, floors, and attics to maintain the desired indoor temperature.'
  },
  {
    title: 'Windows and Glazing',
    description: 'Energy-efficient windows use multiple layers of glass with low-emissivity coatings, gas fills (such as argon or krypton), and thermal spacers to prevent heat transfer.'
  },
  {
    title: 'Air Sealing',
    description: 'Air sealing is the process of closing gaps, cracks, and joints in the building’s envelope that allow air to leak in or out. These leaks can lead to significant energy loss and discomfort.'
  },
  {
    title: 'Shading Devices',
    description: 'Solar heat gain through windows can increase cooling loads in hot climates. Shading devices such as overhangs, exterior blinds, shades, and awnings can be installed to block excessive sunlight.'
  }
];

const hvacSystems = [
  {
    title: 'High-Efficiency Equipment',
    description: 'ENERGY STAR-rated heating and cooling systems use advanced technologies to operate more efficiently than conventional systems.'
  },
  {
    title: 'Smart Controls',
    description: 'Smart thermostats and controls allow users to manage the HVAC system remotely or automatically based on occupancy and schedule.'
  },
  {
    title: 'Regular Maintenance',
    description: 'HVAC systems need to be regularly inspected, cleaned, and maintained to ensure they are operating at peak efficiency.'
  }
];

const renewableEnergy = [
  {
    title: 'Solar Panels (Photovoltaic Systems)',
    description: 'Solar panels convert sunlight into electricity using photovoltaic cells. These panels can be installed on rooftops, facades, or integrated into building materials.'
  },
  {
    title: 'Solar Water Heating',
    description: 'Solar water heating systems use solar collectors to capture the sun\'s energy and heat water for residential or commercial use.'
  },
  {
    title: 'Wind Turbines',
    description: 'Small-scale wind turbines can be installed to generate electricity in areas with sufficient wind resources.'
  }
];

const efficiencyBenefits = [
  {
    title: 'Cost Savings',
    description: 'Energy-efficient buildings reduce operational costs through lower energy consumption.'
  },
  {
    title: 'Environmental Impact',
    description: 'By using less energy, energy-efficient buildings reduce their carbon footprint.'
  },
  {
    title: 'Enhanced Comfort',
    description: 'Energy-efficient buildings are often more comfortable for occupants, with consistent indoor temperatures and better air quality.'
  },
  {
    title: 'Increased Property Value',
    description: 'Energy-efficient buildings tend to have higher market value because they are less costly to operate.'
  }
];

const challenges = [
  {
    title: 'Upfront Costs',
    description: 'The initial investment for energy-efficient materials and systems can be higher than traditional options.'
  },
  {
    title: 'Retrofitting Existing Buildings',
    description: 'Upgrading existing buildings to meet energy-efficient standards can be complex and costly.'
  },
  {
    title: 'Technology Integration',
    description: 'Incorporating advanced technologies requires expertise and may face compatibility issues.'
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

export default EnergyEfficientBuilding;

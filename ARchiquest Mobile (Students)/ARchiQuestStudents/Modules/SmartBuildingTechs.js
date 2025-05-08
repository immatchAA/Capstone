import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';

const SmartBuildingTech = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Smart Building Technologies</Text>

      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Smart building technologies integrate advanced systems and devices to enhance the functionality, efficiency, and sustainability of buildings. These technologies enable buildings to monitor and respond to various conditions in real-time, optimizing energy use, improving occupant comfort, and reducing operational costs. The evolution of smart buildings is driven by advancements in the Internet of Things (IoT), artificial intelligence (AI), and data analytics.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Key Technologies in Smart Buildings</Text>
      {keyTechnologies.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.content}>
            {item.description}
          </Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Benefits of Smart Building Technologies</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Implementing smart building technologies offers numerous advantages, including:
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
          While the benefits are significant, there are challenges to consider:
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
          Smart building technologies are transforming the way buildings operate, offering improved efficiency, sustainability, and occupant satisfaction. By integrating advanced systems and leveraging data analytics, buildings can become more responsive to the needs of their occupants and the environment. As technology continues to evolve, the potential for smart buildings to enhance the built environment is vast and promising.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Further Reading</Text>
      <View style={styles.linkBox}>
        <Text style={styles.linkText}>• HMC Architects: Smart Building Architects and the Technology of Future Spaces</Text>
        <Text style={styles.linkText}>• ASHB: The Guide to Smart Building Technologies</Text>
      </View>
    </ScrollView>
  );
};

const keyTechnologies = [
  {
    title: 'Internet of Things (IoT)',
    description: 'IoT refers to the network of interconnected devices embedded with sensors, software, and other technologies that collect and exchange data. In smart buildings, IoT devices such as smart thermostats, lighting systems, and occupancy sensors enable real-time monitoring and control of building systems. This connectivity allows for improved energy management, predictive maintenance, and enhanced occupant experiences.'
  },
  {
    title: 'Artificial Intelligence (AI) and Machine Learning',
    description: 'AI and machine learning algorithms analyze data collected from various building systems to identify patterns and make informed decisions. These technologies can optimize HVAC operations, predict equipment failures, and personalize lighting and temperature settings based on occupant preferences. AI-driven systems enhance operational efficiency and contribute to energy conservation efforts.'
  },
  {
    title: 'Building Automation Systems (BAS)',
    description: 'BAS are centralized systems that control and monitor a building\'s mechanical and electrical equipment, such as HVAC, lighting, and security systems. These systems automate routine tasks, improve energy efficiency, and provide building managers with real-time data to make informed decisions. Advanced BAS can integrate with IoT devices and AI algorithms for enhanced performance.'
  },
  {
    title: 'Smart Lighting',
    description: 'Smart lighting systems use IoT-enabled fixtures and sensors to adjust lighting levels based on occupancy and natural light availability. These systems can be programmed to turn off lights in unoccupied areas, dim lights during daylight hours, and create personalized lighting scenes for different activities. Smart lighting reduces energy consumption and extends the lifespan of lighting equipment.'
  },
  {
    title: 'Energy Management Systems (EMS)',
    description: 'EMS monitor and control energy usage within a building to optimize efficiency and reduce costs. These systems track energy consumption patterns, identify inefficiencies, and provide recommendations for improvements. By integrating with IoT devices and AI algorithms, EMS can dynamically adjust building systems to minimize energy waste and support sustainability goals.'
  },
  {
    title: 'Security and Surveillance Systems',
    description: 'Advanced security systems in smart buildings utilize IoT-enabled cameras, access control devices, and motion sensors to enhance safety and security. These systems can detect unauthorized access, monitor building perimeters, and provide real-time alerts to security personnel. Integration with AI allows for facial recognition and anomaly detection, improving response times and reducing false alarms.'
  },
  {
    title: 'Environmental Sensors',
    description: 'Environmental sensors measure factors such as temperature, humidity, air quality, and CO2 levels within a building. These sensors provide data that can be used to adjust HVAC settings, improve indoor air quality, and ensure occupant comfort. Real-time monitoring of environmental conditions supports health and wellness initiatives and contributes to energy efficiency.'
  },
  {
    title: 'Smart Elevators',
    description: 'Smart elevators use IoT technology to optimize travel times and energy usage. These systems can predict traffic patterns, adjust elevator speeds, and provide personalized service based on user preferences. Integration with building automation systems allows for seamless coordination between elevators and other building systems, enhancing efficiency and user experience.'
  },
  {
    title: 'Smart Windows and Shading Systems',
    description: 'Smart windows and shading systems adjust transparency and light transmission based on external light levels and internal temperature. These systems reduce the need for artificial lighting and HVAC cooling, contributing to energy savings. Integration with environmental sensors and building automation systems allows for dynamic control of window treatments to optimize comfort and efficiency.'
  },
  {
    title: 'Smart Water Management',
    description: 'Smart water management systems use IoT sensors to monitor water usage and detect leaks in real-time. These systems can automatically shut off water supplies in the event of a leak, preventing damage and conserving resources. Data analytics provide insights into water consumption patterns, enabling building managers to implement conservation strategies and reduce costs.'
  }
];

const bimBenefits = [
  {
    title: 'Energy Efficiency',
    description: 'Optimizing building systems to reduce energy consumption and lower utility costs.'
  },
  {
    title: 'Operational Efficiency',
    description: 'Automating routine tasks and providing real-time data for informed decision-making.'
  },
  {
    title: 'Enhanced Occupant Comfort',
    description: 'Personalizing environmental conditions to meet the preferences of building occupants.'
  },
  {
    title: 'Improved Safety and Security',
    description: 'Utilizing advanced surveillance and access control systems to protect building occupants and assets.'
  },
  {
    title: 'Sustainability',
    description: 'Reducing the environmental impact of buildings through efficient resource management and waste reduction.'
  }
];

const bimChallenges = [
  {
    title: 'Data Privacy and Security',
    description: 'Protecting sensitive information collected by smart building systems.'
  },
  {
    title: 'Integration Complexity',
    description: 'Ensuring compatibility between various technologies and systems.'
  },
  {
    title: 'Initial Costs',
    description: 'The upfront investment required for implementing smart building technologies.'
  },
  {
    title: 'Maintenance and Support',
    description: 'Ongoing requirements for system updates and troubleshooting.'
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

export default SmartBuildingTech;

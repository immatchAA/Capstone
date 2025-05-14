import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';

const FireSafety = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Fire Safety and Building Codes</Text>

      <Text style={styles.sectionTitle}>Overview of Republic Act No. 9514</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Republic Act No. 9514, known as the Revised Fire Code of the Philippines of 2008, was enacted to establish a comprehensive fire safety framework aimed at ensuring public safety, promoting economic development through fire prevention and suppression, and professionalizing the fire service in the Philippines.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Key Objectives</Text>
      <View style={styles.card}>
        {keyObjectives.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            <Text style={styles.boldText}>{item.title}</Text>: {item.description}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Scope and Coverage</Text>
      <View style={styles.card}>
        {scopeCoverage.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            {item}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Fire Safety Measures</Text>
      <View style={styles.card}>
        {fireSafetyMeasures.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            {item}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Fire Safety Evaluation and Inspections</Text>
      <View style={styles.card}>
        {fireSafetyEvaluations.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            {item}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Penalties for Non-Compliance</Text>
      <View style={styles.card}>
        {penalties.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            {item}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Funding and Appropriations</Text>
      <View style={styles.card}>
        {funding.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            {item}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Implementation and Effectivity</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          RA 9514 took effect on January 3, 2009, fifteen (15) days after its publication in the Official Gazette. The Secretary of the Interior and Local Government was mandated to issue the implementing rules and regulations within sixty (60) days from the effectivity of the Act.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Repeal of Previous Laws</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          RA 9514 repealed Presidential Decree No. 1185, the previous Fire Code of the Philippines, and other laws inconsistent with its provisions.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>National Building Code of the Philippines (PD 1096)</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          The National Building Code of the Philippines (PD 1096) is the primary framework for regulating building design, construction, and occupancy in the country. It covers a wide range of aspects related to structural integrity, health and safety, fire prevention, and environmental sustainability. The code ensures that buildings are designed and constructed to meet specific safety standards and are regularly inspected to maintain compliance.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Key Provisions of the National Building Code</Text>
      <View style={styles.card}>
        {buildingCodeProvisions.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            {item}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Further Reading</Text>
      <View style={styles.linkBox}>
        <Text style={styles.linkText}>• The Revised Fire Code of the Philippines (RA 9514) – Official Gazette</Text>
        <Text style={styles.linkText}>• Bureau of Fire Protection (BFP) – Fire Safety Regulations</Text>
        <Text style={styles.linkText}>• National Building Code of the Philippines (PD 1096)</Text>
      </View>
    </ScrollView>
  );
};

const keyObjectives = [
  { title: 'Ensuring Public Safety', description: 'Effective fire prevention and suppression measures.' },
  { title: 'Promoting Economic Development', description: 'Minimizing fire-related losses and damages.' },
  { title: 'Professionalizing the Fire Service', description: 'Enhancing its capability and efficiency.' },
];

const scopeCoverage = [
  'Design and installation of mechanical, electrical, and electronic systems related to fire protection.',
  'Manufacturing, storage, handling, and transportation of explosives and hazardous materials.',
  'Fire safety planning, design, construction, repair, maintenance, rehabilitation, and demolition.',
  'Fire protective and warning equipment or systems.',
];

const fireSafetyMeasures = [
  'Installation of fire suppression systems such as sprinklers and standpipes.',
  'Provision of fire alarm systems and emergency lighting.',
  'Establishment of clear and accessible means of egress.',
  'Construction of fire-resistant walls and barriers.',
  'Regular maintenance and testing of fire safety equipment.',
];

const fireSafetyEvaluations = [
  'Reviewing and evaluating building plans and specifications for compliance with fire safety standards.',
  'Conducting inspections during construction, renovation, or alteration to ensure adherence to approved plans.',
  'Issuing Fire Safety Evaluation Clearance (FSEC) before the issuance of occupancy permits.',
  'Performing annual fire safety inspections and issuing Fire Safety Inspection Certificates (FSIC).',
];

const penalties = [
  'Administrative fines up to ₱50,000.',
  'Stoppage of operations or closure of non-compliant establishments.',
  'Criminal penalties, including imprisonment of not less than six (6) months nor more than six (6) years, or a fine of not more than ₱100,000, or both.',
  'For corporations, fines and/or imprisonment may be imposed on responsible officials.',
];

const funding = [
  'One-tenth of one percent (0.10%) of the assessed value of buildings or structures, payable upon payment of the real estate tax.',
  'Two percent (2%) of all premiums for fire, earthquake, and explosion hazard insurance.',
  'Two percent (2%) of gross sales of companies selling fire-fighting equipment.',
  'Two percent (2%) of service fees from fire, earthquake, and explosion hazard reinsurance surveys.',
  'Eighty percent (80%) of the collected funds are allocated for the modernization of the Bureau of Fire Protection, while twenty percent (20%) are retained by local governments for fire station operations.',
];

const buildingCodeProvisions = [
  'Requirements for structural integrity, including foundation, walls, and framing.',
  'Fire resistance and safety standards for building materials, walls, doors, and ceilings.',
  'Regulations for plumbing, electrical systems, and ventilation to ensure safety and comfort.',
  'Building occupancy and usage regulations to ensure public safety.',
  'Environmental impact considerations, including waste disposal, noise reduction, and energy efficiency.',
  'Regulations for emergency exits, accessibility, and evacuation procedures during fires or other emergencies.',
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
});

export default FireSafety;

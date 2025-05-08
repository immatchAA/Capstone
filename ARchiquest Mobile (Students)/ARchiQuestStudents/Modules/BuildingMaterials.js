import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';

const BuildingMaterials = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Building Materials and Technologies</Text>

      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Building materials are the essential components used in the construction of buildings and infrastructure. These materials are selected based on factors like strength, durability, availability, cost, and suitability for the intended use. The right choice of materials significantly impacts the building's structural integrity, performance, aesthetics, and sustainability.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Foundation</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          The foundation is the primary structural element that supports the weight of the building and transfers the loads to the ground. Foundations can be classified into two main types:
        </Text>
        {foundation.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            <Text style={styles.boldText}>{item.title}</Text>: {item.description}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Walls</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Walls provide structural support, define spaces within a building, and protect occupants from external elements. There are various types of walls used in building construction:
        </Text>
        {walls.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            <Text style={styles.boldText}>{item.title}</Text>: {item.description}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Roofing</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          The roof is an essential component of a building, providing protection from the elements while also contributing to the building's aesthetic appeal. There are different types of roofing systems:
        </Text>
        {roofing.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            <Text style={styles.boldText}>{item.title}</Text>: {item.description}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Flooring</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Flooring materials are selected based on durability, appearance, and functionality. The choice of flooring depends on the type of room and the expected traffic:
        </Text>
        {flooring.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            <Text style={styles.boldText}>{item.title}</Text>: {item.description}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Windows and Doors</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Windows and doors are crucial for providing natural light, ventilation, and access. Their design and materials affect energy efficiency and security:
        </Text>
        {windowsDoors.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            <Text style={styles.boldText}>{item.title}</Text>: {item.description}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Finishes and Fixtures</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Building finishes and fixtures, including paint, cladding, and fixtures such as light fittings and sanitary ware, add aesthetic value and functionality to the building. Some key materials used include:
        </Text>
        {finishesFixtures.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            <Text style={styles.boldText}>{item.title}</Text>: {item.description}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Conclusion</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          In conclusion, the choice of building materials plays a vital role in the design, construction, and sustainability of a building. By carefully selecting materials for the foundation, walls, roofing, and finishes, a building can achieve enhanced durability, energy efficiency, and environmental performance. Sustainable and energy-efficient materials contribute to the overall well-being of the building’s occupants while minimizing its environmental impact.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Further Reading</Text>
      <View style={styles.linkBox}>
        <Text style={styles.linkText}>• Building Materials and Technology 1 & 2 MODULE - I – Scribd</Text>
      </View>
    </ScrollView>
  );
};

const foundation = [
  {
    title: 'Shallow Foundations',
    description: 'Typically used for buildings with lighter loads. They are installed near the surface of the ground and include spread footings, mat foundations, and slab-on-grade foundations.'
  },
  {
    title: 'Deep Foundations',
    description: 'Used for larger, heavier structures. They extend deeper into the ground to provide greater stability and load-bearing capacity. Examples include piles, caissons, and drilled shafts.'
  }
];

const walls = [
  {
    title: 'Load-bearing Walls',
    description: 'These walls support the weight of the floors and roof above. They are typically made of heavy materials such as brick, concrete block, and stone.'
  },
  {
    title: 'Non-load-bearing Walls',
    description: 'These walls serve as partitions and do not carry any structural load. They are often made of lightweight materials such as drywall, timber, or partition blocks.'
  },
  {
    title: 'Retaining Walls',
    description: 'Used to resist lateral pressure from soil, water, or other materials. They are commonly made of concrete or stone and are crucial for building on sloped sites.'
  }
];

const roofing = [
  {
    title: 'Flat Roofs',
    description: 'Common in modern commercial and residential buildings. They are typically made from materials such as bitumen, rubber, or membrane systems, and may include insulation for energy efficiency.'
  },
  {
    title: 'Pitched Roofs',
    description: 'More common in residential construction, pitched roofs are sloped to allow rainwater and snow to drain off. They are usually covered with materials like asphalt shingles, tiles, slate, or metal.'
  },
  {
    title: 'Green Roofs',
    description: 'Roofs that are partially or fully covered with vegetation, often used for sustainability. They provide insulation, absorb rainwater, and improve air quality.'
  }
];

const flooring = [
  {
    title: 'Hardwood',
    description: 'A classic and durable choice, ideal for living rooms and bedrooms. Hardwood floors add a warm, natural aesthetic to spaces.'
  },
  {
    title: 'Tiles',
    description: 'Ceramic, porcelain, and stone tiles are popular for bathrooms, kitchens, and other high-moisture areas. Tiles are easy to clean, highly durable, and available in a variety of styles and finishes.'
  },
  {
    title: 'Carpet',
    description: 'Used for comfort in bedrooms and living areas, providing thermal insulation and noise reduction.'
  },
  {
    title: 'Concrete',
    description: 'Often used in modern industrial-style buildings, concrete floors are low-maintenance and can be stained or polished for aesthetic appeal.'
  }
];

const windowsDoors = [
  {
    title: 'Windows',
    description: 'Modern windows are typically double-glazed with an insulating gas layer between panes to improve thermal efficiency. Low-emissivity (Low-E) coatings can reduce heat loss and protect against UV rays.'
  },
  {
    title: 'Doors',
    description: 'External doors are typically made of solid wood, steel, fiberglass, or glass, depending on the desired aesthetics and insulation properties. Energy-efficient doors help reduce heat loss and improve security.'
  }
];

const finishesFixtures = [
  {
    title: 'Paints and Coatings',
    description: 'Used to protect surfaces and enhance appearance. Eco-friendly paints that are low in volatile organic compounds (VOCs) contribute to healthier indoor air quality.'
  },
  {
    title: 'Cladding',
    description: 'External cladding materials like timber, metal, and stone provide aesthetic appeal and help improve insulation.'
  },
  {
    title: 'Sanitary Fixtures',
    description: 'Energy-efficient fixtures, such as low-flow faucets and water-saving toilets, contribute to sustainable design by reducing water consumption.'
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

export default BuildingMaterials;

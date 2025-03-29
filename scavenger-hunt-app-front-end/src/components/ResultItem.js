// src/components/ResultItem.js
import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

const ResultItem = ({ item, onPress }) => (
  <Card style={styles.card} onPress={onPress}>
    {/* Display the location's image */}
    <Card.Cover source={{ uri: item.image }} />
    <Card.Title title={item.name} />
    <Card.Content>
      <Text>{item.shortDescription}</Text>
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    elevation: 3, // Adds a shadow effect
  },
});

export default ResultItem;  // ✅ Ensure this is a default export

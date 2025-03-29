// src/screens/ResultsScreen.js

import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import Loader from '../components/Loader';
import ResultItem from '../components/ResultItem';
import { fetchScavengerHunt } from '../services/api';

const ResultsScreen = ({ route, navigation }) => {
  const { city, budget } = route.params;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScavengerHunt(city, budget)
      .then((data) => {
        setResults(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching results:', error);
        setLoading(false);
      });
  }, [city, budget]);

  if (loading) {
    return <Loader />;
  }

  if (!results.length) {
    return (
      <View style={styles.noResultsContainer}>
        <Text style={styles.noResultsText}>
          No results found for “{city}” with budget “{budget}”.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ResultItem
            item={item}
            onPress={() => navigation.navigate('Detail', { item })}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

export default ResultsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginHorizontal: 20,
  },
});

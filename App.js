import React, {useEffect, useState, useCallback, useMemo} from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  TextInput,
  Text,
  View,
  Image,
  Platform,
  UIManager,
  LayoutAnimation,
} from 'react-native';
import {useDebounce} from 'use-debounce';
import {useInterval} from 'use-interval';

function randomString(length) {
  var result = [];
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    const millis = new Date().getMilliseconds();
    result.push(
      characters.charAt(
        Math.floor(((Math.random() + millis / 1000) / 2) * charactersLength),
      ),
    );
  }
  return result.join('');
}

const Item = ({data, search, isLast}) => {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    if (isLast && !isAnimated) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsAnimated(true);
    }
  }, [isLast, isAnimated]);

  useEffect(() => {
    setIsHighlighted(search && data.includes(search));
  }, [data, search]);

  const rootStyle = useMemo(() => {
    if (isLast && !isAnimated) {
      return styles.itemInitial;
    }
    if (isHighlighted) {
      return styles.itemHighlighted;
    }
    return styles.item;
  }, [isLast, isHighlighted, isAnimated]);

  return (
    <View style={rootStyle}>
      <Image
        source={{uri: `https://robohash.org/${data}`}}
        style={styles.image}
      />
      <Text>{data}</Text>
    </View>
  );
};

const App: () => Node = () => {
  const [words, setWords] = useState([]);
  const [search, setSearch] = useState('');
  const [lastElement, setLastElement] = useState(-1);

  useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    let maxLength = 3;
    const initialWords = [];
    while (maxLength) {
      initialWords.push(randomString(10) + ` ${3 - maxLength}`);
      maxLength--;
    }
    setWords(initialWords);
  }, []);

  useInterval(() => {
    const randomPosition = Math.floor(Math.random() * words.length);
    const newWords = [
      ...words.slice(0, randomPosition),
      randomString(10) + ` ${words.length}`,
      ...words.slice(randomPosition),
    ];
    setWords(newWords);
    setLastElement(randomPosition);
  }, 1000);

  const typeSearch = useCallback(setSearch, [setSearch]);

  const [debouncedSearch] = useDebounce(search, 200);

  return (
    <SafeAreaView style={styles.root}>
      <TextInput
        style={styles.input}
        placeholder={'Write something here...'}
        value={search}
        onChangeText={typeSearch}
      />
      <FlatList
        data={words}
        style={styles.list}
        keyExtractor={i => `${i}`}
        renderItem={({item, index}) => (
          <Item
            data={item}
            search={debouncedSearch}
            isLast={lastElement === index}
          />
        )}
      />
    </SafeAreaView>
  );
};

const commonItem = {
  borderRadius: 10,
  padding: 20,
  marginBottom: 12,
  flexDirection: 'row',
  alignItems: 'center',
  overflow: 'hidden',
  backgroundColor: '#13b0ff',
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
  },
  input: {
    borderColor: '#13b0ff',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    backgroundColor: '#EEE',
  },
  list: {
    flex: 1,
    paddingTop: 12,
  },
  itemInitial: {
    ...commonItem,
    height: 0,
  },
  item: {
    ...commonItem,
  },
  itemHighlighted: {
    ...commonItem,
    backgroundColor: '#ff9319',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});

export default App;

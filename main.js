import {get, set, setMany} from './idb-keyval.js';

init();

async function init() {
  const start = performance.now();
  const scrabbleWords = await getScrabbleWords();
  await initLicensePlateMap(scrabbleWords);
  console.log('init:', (performance.now() - start).toFixed(1));

  window.letters.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      findWords(scrabbleWords);
    }
  });
  window.letters.focus();

  window.go.addEventListener('click', () => findWords(scrabbleWords));
  window.go.removeAttribute('disabled');
}

async function findWords(scrabbleWords) {
  const start = performance.now();
  const key = window.letters.value.toLowerCase().replace(/[^a-z]/g, '');
  if (key.length < 3) {
    window.words.innerHTML = '';
    return;
  }
  const encodedMatches = await get(key.slice(0, 3));
  if (!encodedMatches) {
    window.words.innerHTML = 'no matches found!';
  } else {
    let matches = deltaDecode(encodedMatches).map(i => scrabbleWords[i]);
    if (key.length > 3) {
      const regex = new RegExp('.*' + key.split('').join('.*') + '.*');
      matches = matches.filter(word => regex.test(word));
    }
    window.words.innerHTML =
        matches
            .map(word => `<a target="_blank" href="https://en.wiktionary.org/wiki/${word}">${word}</a>`)
            .join(', ');
  }
  console.log('findWords:', (performance.now() - start).toFixed(1));
}

async function getScrabbleWords() {
  let scrabbleWords = await get('scrabbleWords');
  if (!scrabbleWords) {
    scrabbleWords =
        await fetch(
            'https://babelthuap.github.io/license-plate-game/scrabbleWords.json')
            .then(response => response.json());
    set('scrabbleWords', scrabbleWords);
  }
  return scrabbleWords;
}

async function initLicensePlateMap(scrabbleWords) {
  let licensePlateMapInitialized = await get('licensePlateMapInitialized');
  if (!licensePlateMapInitialized) {
    const licensePlateMap = buildMap(scrabbleWords);
    console.log('storing licensePlateMap...')
    const entries = Object.entries(licensePlateMap);
    entries.forEach(entry => entry[1] = deltaEncode(entry[1]));
    await setMany(entries);
    set('licensePlateMapInitialized', true);
  }
}

function buildMap(scrabbleWords) {
  const map = {};
  for (let i = 0; i < scrabbleWords.length; i++) {
    const word = scrabbleWords[i];
    if (word.length < 3) {
      continue;
    }
    const keys = new Set();
    for (let i = 0; i < word.length - 2; i++) {
      for (let j = i + 1; j < word.length - 1; j++) {
        for (let k = j + 1; k < word.length; k++) {
          keys.add(word[i] + word[j] + word[k]);
        }
      }
    }
    for (const key of keys) {
      const arr = map[key];
      if (arr) {
        arr.push(i);
      } else {
        map[key] = [i];
      }
    }
  }
  return map;
}

function deltaEncode(arr) {
  if (arr.length < 2) {
    return arr;
  }
  const out = new Array(arr.length);
  out[0] = arr[0];
  for (let i = 1; i < arr.length; i++) {
    out[i] = arr[i] - arr[i - 1];
  }
  return out;
}

function deltaDecode(arr) {
  if (arr.length < 2) {
    return arr;
  }
  const out = new Array(arr.length);
  out[0] = arr[0];
  for (let i = 1; i < arr.length; i++) {
    out[i] = out[i - 1] + arr[i];
  }
  return out;
}

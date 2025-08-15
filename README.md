# PinyinSyllableSplitter

A JavaScript class to split Hànyǔ Pīnyīn text into syllables, by Alfons Grabher.

Licensed under the MIT License.

# Usage and Output

## Example Text

```
Rán'ér, tā yǒudiǎn bùyóu-zìzhǔ zài fādǒu.
```

---

## Split to Syllables

```javascript
const splitter = new PinyinSyllableSplitter();
splitter.splitWords(text);
```

**Output:**
```
Rán∙ér, tā yǒu∙diǎn bù∙yóu∙zì∙zhǔ zài fā∙dǒu.
```

---

## Split to Syllables with Custom Spacing Character

```javascript
const splitter = new PinyinSyllableSplitter(" ");
splitter.splitWords(text);

const splitter = new PinyinSyllableSplitter();
splitter.setSpacingChar(" ");
splitter.splitWords(text);
```

**Output:**
```
Rán ér, tā yǒu diǎn bù yóu zì zhǔ zài fā dǒu.
```

---

### Split One Word into Syllables

```javascript
const splitter = new PinyinSyllableSplitter(" ");
splitter.splitWords("wèishénme");
```

**Output:**
```
wèi shén me
```

---

## Split and Tag

```javascript
const splitter = new PinyinSyllableSplitter();
splitter.splitAndTag(text);
```

**Output:**
```json
[
  { "segment": "Rán", "type": "X" },
  { "segment": "'", "type": "PU" },
  { "segment": "ér", "type": "X" },
  { "segment": ",", "type": "PU" },
  { "segment": " ", "type": "PU" },
  { "segment": "tā", "type": "X" },
  { "segment": " ", "type": "PU" },
  { "segment": "yǒu", "type": "X" },
  { "segment": "diǎn", "type": "X" },
  { "segment": " ", "type": "PU" },
  { "segment": "bù", "type": "X" },
  { "segment": "yóu", "type": "X" },
  { "segment": "-", "type": "PU" },
  { "segment": "zì", "type": "X" },
  { "segment": "zhǔ", "type": "X" },
  { "segment": " ", "type": "PU" },
  { "segment": "zài", "type": "X" },
  { "segment": " ", "type": "PU" },
  { "segment": "fā", "type": "X" },
  { "segment": "dǒu", "type": "X" },
  { "segment": ".", "type": "PU" }
]
```

---

## Split into a List of Syllables

```javascript
const splitter = new PinyinSyllableSplitter();
splitter.listSyllables(text);
```

**Output:**
```json
[
  "Rán",
  "ér",
  "tā",
  "yǒu",
  "diǎn",
  "bù",
  "yóu",
  "zì",
  "zhǔ",
  "zài",
  "fā",
  "dǒu"
]
```

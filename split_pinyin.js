/**
 * Splits Pinyin text into syllables, handling single words or full text,
 * preserving punctuation and line breaks.
 * @param {string} text - The Pinyin text to split.
 * @returns {string[]} List of syllables and non-word chunks.
 * by Alfons Grabher
 */
function splitPinyin(text) {
    if (!text) return [text];

    const allVowels = 'aāáǎăàeēéěĕèiīíǐĭìoōóǒŏòuūúǔŭùüǖǘǚǜü̆ǜ';
    const spacingChar = '∙';

    // Step 1: preprocess affixed apostrophes and hyphens
    text = text.replace(new RegExp(`([\\p{L}])[']([${allVowels}])`, 'gu'), `$1${spacingChar}$2`);
    text = text.replace(/([\p{L}])-([\p{L}])/gu, `$1${spacingChar}$2`);

    // Helper to split a single word into syllables
    const splitIntoSyllables = (word) => {
        if (!word) return [word];

        const separate = (p) => p
            .replace(new RegExp(`([${allVowels}])(?![${allVowels}o])([^${allVowels}nr])`, 'gi'), '$1 $2')
            .replace(new RegExp('(\w)([csz]h)', 'gi'), '$1 $2')
            .replace(new RegExp(`([${allVowels}]{2}(ng? )?)([^${allVowels}nr])`, 'gi'), '$1 $3')
            .replace(new RegExp(`([${allVowels}]{2})(n[${allVowels}])`, 'gi'), '$1 $2')
            .replace(new RegExp(`(n)([^${allVowels}g])`, 'gi'), '$1 $2')
            .replace(new RegExp(`([${allVowels}])([^${allVowels}\w\s])([${allVowels}])`, 'gi'), '$1 $2$3')
            .replace(new RegExp(`([${allVowels}])(n)(g)([${allVowels}])`, 'gi'), '$1$2 $3$4')
            .replace(new RegExp(`([gr])([^${allVowels}])`, 'gi'), '$1 $2')
            .replace(new RegExp(`([^eēéěĕè\w\s])(r)`, 'gi'), '$1 $2')
            .replace(new RegExp(`([^\w\s])([eēéěĕè]r)`, 'gi'), '$1 $2')
            .replace(/\s{2,}/g, ' ');

        const segments = word.split(spacingChar).filter(Boolean);
        const syllables = segments.flatMap(segment =>
            separate(segment).split(' ')
                .map(s => s.trim())
                .filter(Boolean)
        );

        return syllables.length > 1 ? syllables : [word];
    };

    // Step 2: run through the text
    const wordPattern = /[\p{L}]+/gu;
    let result = [];
    let lastIndex = 0;

    for (const match of text.matchAll(wordPattern)) {
        if (match.index > lastIndex) {
            result.push(text.slice(lastIndex, match.index));
        }
        result.push(...splitIntoSyllables(match[0]));
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
        result.push(text.slice(lastIndex));
    }

    return result.filter(Boolean);
}

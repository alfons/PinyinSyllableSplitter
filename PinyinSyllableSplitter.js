// PinyinSyllableSplitter.js
// (C) 2025 Alfons Grabher
// Licensed under the MIT License.
// Splits Hànyǔ Pīnyīn text (or words) into syllables and morphemes

class PinyinSyllableSplitter {
    #spacingChar = '∙';

    /**
     * @param {string} [spacingChar='∙'] - Character to use as syllable separator
     */
    constructor(spacingChar = '∙') {
        this.setSpacingChar(spacingChar);
    }

    /**
     * Sets the character used to separate syllables.
     * @param {string} char - The separator character
     * @returns {PinyinSyllableSplitter} - Returns this instance for chaining
     */
    setSpacingChar(char) {
        if (typeof char !== 'string' || char.length !== 1) {
            throw new Error('Spacing character must be a single character string');
        }
        this.#spacingChar = char;
        return this;
    }

    /**
     * Gets the current spacing character.
     * @returns {string} - The current spacing character
     */
    getSpacingChar() {
        return this.#spacingChar;
    }

    /**
     * Splits a single Pinyin word into syllables.
     * @param {string} word - The Pinyin word to split
     * @returns {string[]} - Array of syllables
     */
    splitIntoSyllables(word) {
        if (!word) return [word];

        const allVowels = 'aāáǎăàeēéěĕèiīíǐĭìoōóǒŏòuūúǔŭùüǖǘǚǜü̆ǜ';

        // Split on spacingChar first to respect pre-existing boundaries
        const segments = word.split(this.#spacingChar).filter(segment => segment);

        // Process each segment for further syllable splitting
        // original idea of a regex sequence (probably) by Mark Swofford of Banqiao Taiwan
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

        const syllables = segments.flatMap(segment => {
            const processed = separate(segment);
            return processed.split(' ').map(syllable => syllable.trim()).filter(syllable => syllable);
        });

        return syllables.length > 1 ? syllables : [word];
    }

    /**
     * Removes apostrophes between letters and vowels, replacing with spacing character.
     * @param {string} word - The word to process
     * @returns {string} - Processed word
     */
    removeAffixedApostrophes(word) {
        const allVowels = 'aāáǎăàeēéěĕèiīíǐĭìoōóǒŏòuūúǔŭùüǖǘǚǜü̆ǜ';
        return word.replace(new RegExp(`([\\p{L}])[']([${allVowels}])`, 'gu'), `$1${this.#spacingChar}$2`);
    }

    /**
     * Replaces hyphen separators with spacing character.
     * @param {string} text - The text to process
     * @returns {string} - Processed text
     */
    replaceHyphenSeparators(text) {
        return text.replace(/([\p{L}])-([\p{L}])/gu, `$1${this.#spacingChar}$2`);
    }

    /**
     * Splits provided Pinyin text into syllables, joining with the spacing character.
     * @param {string} text - The Pinyin text to split
     * @returns {string} - Text with syllables separated by spacing character
     */
    splitWords(text) {
        if (typeof text !== 'string') {
            throw new Error('Text must be a string');
        }
        let processedText = text;
        processedText = this.removeAffixedApostrophes(processedText);
        processedText = this.replaceHyphenSeparators(processedText);

        const wordPattern = /[\p{L}]+/gu;
        return processedText.replace(wordPattern, word => {
            const syllables = this.splitIntoSyllables(word);
            return syllables.join(this.#spacingChar);
        });
    }

    /**
     * Segments provided Pinyin text into syllables (syllables as "X", punctuation as "PU").
     * @param {string} text - The Pinyin text to syllable
     * @returns {Array<{syllable: string, tag: string}>} - Array of syllable objects
     */
    splitAndTag(text) {
        if (typeof text !== 'string') {
            throw new Error('Text must be a string');
        }
        let processedText = text;

        const result = [];
        const wordPattern = /[\p{L}]+|[^\p{L}]/gu; // Match words or single non-letter characters

        let match;
        while ((match = wordPattern.exec(processedText)) !== null) {
            const syllable = match[0];
            if (/[\p{L}]+/u.test(syllable)) {
                // For words, split into syllables and label each as "X"
                const syllables = this.splitIntoSyllables(syllable);
                syllables.forEach(syllable => {
                    result.push({ syllable: syllable, tag: 'X' });
                });
            } else {
                // For non-letter characters (punctuation, spaces, etc.), label as "PU"
                result.push({ syllable, tag: 'PU' });
            }
        }

        return result;
    }

    /**
     * Returns a list of Pinyin syllables from provided text, excluding punctuation.
     * @param {string} text - The Pinyin text to syllable
     * @returns {string[]} - Array of Pinyin syllables
     */
    listSyllables(text) {
        return this.splitAndTag(text)
            .filter(morpheme => morpheme.tag === 'X')
            .map(morpheme => morpheme.syllable);
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PinyinSyllableSplitter;
}

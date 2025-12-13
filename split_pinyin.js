/**
 * Splits Pinyin text into syllables, handling single words or full text,
 * preserving punctuation and line breaks.
 * @param {string} text - The Pinyin text to split.
 * @returns {string[]} List of syllables and non-word chunks.
 * by Alfons Grabher
 */
    function splitPinyin(text, resuffixnumbers = true) {
        if (!text) return [text];
        const allVowels = 'aāáǎăàeēéěĕèiīíǐĭìoōóǒŏòuūúǔŭùüǖǘǚǜü̆ǜ';
        const spacingChar = ' ';
        // Full list of bare syllables
        const syllablesStr = "a ai an ang ao ba bai ban bang bao bei ben beng bi bia bian biang biao bie bin bing bo bu ca cai can cang cao ce cen ceng cha chai chan chang chao che chen cheng chi chong chou chu chua chuai chuan chuang chui chun chuo ci cong cou cu cuan cui cun cuo da dai dan dang dao de dei den deng di dia dian diao die ding diu dong dou du duan dui dun duo e ei en eng er fa fan fang fei fen feng fiao fo fou fu ga gai gan gang gao ge gei gen geng gong gou gu gua guai guan guang gui gun guo ha hai han hang hao he hei hen heng hong hou hu hua huai huan huang hui hun huo ji jia jian jiang jiao jie jin jing jiong jiu ju juan jue jun ka kai kan kang kao ke kei ken keng kong kou ku kua kuai kuan kuang kui kun kuo la lai lan lang lao le lei leng li lia lian liang liao lie lin ling liu lo long lou lu luan lun luo lü lüe m ma mai man mang mao me mei men meng mi mian miao mie min ming miu mo mou mu na nai nan nang nao ne nei nen neng ni nian niang niao nie nin ning niu nong nou nu nuan nun nuo nü nüe o ou pa pai pan pang pao pei pen peng pi pian piao pie pin ping po pou pu qi qia qian qiang qiao qie qin qing qiong qiu qu quan que qun r ran rang rao re ren reng ri rong rou ru rua ruan rui run ruo sa sai san sang sao se sei sen seng sha shai shan shang shao she shei shen sheng shi shou shu shua shuai shuan shuang shui shun shuo si song sou su suan sui sun suo ta tai tan tang tao te tei teng ti tian tiao tie ting tong tou tu tuan tui tun tuo wa wai wan wang wei wen weng wo wu xi xia xian xiang xiao xie xin xing xiong xiu xu xuan xue xun ya yan yang yao ye yi yin ying yo yong you yu yuan yue yun za zai zan zang zao ze zei zen zeng zha zhai zhan zhang zhao zhe zhei zhen zheng zhi zhong zhou zhu zhua zhuai zhuan zhuang zhui zhun zhuo zi zong zou zu zuan zui zun zuo";
        const sylSet = new Set(syllablesStr.split(' '));
        // Remove only tone diacritics (preserve ü diaeresis)
        const removeTones = (str) => str.normalize('NFD').replace(/[\u0300\u0301\u0304\u030C]/g, '').normalize('NFC');
        // Step 1: preprocess affixed apostrophes and hyphens
        text = text.replace(new RegExp(`([\\p{L}])[']([${allVowels}])`, 'gu'), `$1${spacingChar}$2`);
        text = text.replace(/([\p{L}])-([\p{L}])/gu, `$1${spacingChar}$2`);
        // Helper to split a single word into syllables
        const splitIntoSyllables = (word) => {
            if (!word) return [word];
            const segments = word.split(spacingChar).filter(Boolean);
            const result = [];
            segments.forEach(segment => {
                const bare = removeTones(segment).toLowerCase();
                let i = 0;
                const n = bare.length;
                while (i < n) {
                    let found = false;
                    for (let len = 6; len >= 1; len--) {
                        const j = i + len;
                        if (j > n) continue;
                        const sub = bare.substring(i, j);
                        if (sylSet.has(sub)) {
                            result.push(segment.substring(i, j));
                            i = j;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        // Fallback for invalid: push remaining as is
                        result.push(segment.substring(i));
                        i = n;
                    }
                }
            });
            return result.length > 0 ? result : [word];
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
        result = result.filter(Boolean);

        // Step 3: spellcheck correction for overfetched diacritic cases 
        // "jìniàn" does overfetch to ["jìn", "iàn"], correct it to ["jì", "niàn"]
        if (!resuffixnumbers) {
            const fixed = [];
            for (let i = 0; i < result.length; i++) {
                let curr = result[i];
                const bare_curr = removeTones(curr).toLowerCase();
                if (!sylSet.has(bare_curr) && i > 0) {
                    const prevIndex = fixed.length - 1;
                    const prev = fixed[prevIndex];
                    const bare_prev = removeTones(prev).toLowerCase();
                    if (bare_prev.length > 1) {
                        const last_char = bare_prev.slice(-1);
                        const new_bare_prev = bare_prev.slice(0, -1);
                        const new_bare_curr = last_char + bare_curr;
                        if (sylSet.has(new_bare_prev) && sylSet.has(new_bare_curr)) {
                            // Apply fix
                            const prev_last_char = prev.slice(-1);
                            const new_prev = prev.slice(0, -1);
                            const new_curr = prev_last_char + curr;
                            // Update fixed
                            fixed[prevIndex] = new_prev;
                            curr = new_curr;
                        }
                    }
                }
                fixed.push(curr);
            }
            result = fixed;
        }
        // Step 4: re-suffix numbers for number marked pinyin
        if (resuffixnumbers) {
            // "yìnyi1" → ["yìn", "yi1"] instead of ["yìn", "yi", "1"]
            // aggressive whitespace trimming, and drop pure space entries
            const fixed = [];
            for (let i = 0; i < result.length; i++) {
                if (/^[1-5]\s*$/.test(result[i]) && fixed.length > 0) {
                    fixed[fixed.length - 1] += result[i].trim();
                } else if (result[i].trim() !== "") {
                    fixed.push(result[i]);
                }
            }
            result = fixed;
        }
        return result;
    }

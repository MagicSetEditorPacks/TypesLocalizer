var langObj = require('./translations.json');
var sublists = require('./sublists.json');
var jaAlternates = require('./ja_alt.json');
var fs = require('fs');
var letters = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

// alphabetizing japanese
var gojuon_hiragana_vowels = ["あ", "い", "う", "え", "お"]
var gojuon_hiragana = {
	//A:   a   ka   sa	ta	na	 ha	 ma	  ya  ra  wa
	"あ": ["あ","か","さ","た","な","は","ま","や","ら","わ"],
	//I:   i   ki   si	ti	ni	 hi	 mi	 yi  ri  wi
	"い": ["い","き","し","ち","に","ひ","み","","り","ゐ"],
	//U:   u   ku   su	tu	nu	 hu	 mu	 yu  ru  wu
	"う": ["う","く","す","つ","ぬ","ふ","む","ゆ","る",""],
	//E:   e   ke   se	te	ne	 he	 me	  ye  re  we
 	"え": ["え","け","せ","て","ね","へ","め","𛀁","れ","ゑ"],
 	//O:   o   ko   so	to	no	 ho	 mo	  yo  ro  wo
	"お": ["お","こ","そ","と","の","ほ","も","よ","ろ","を"]
	
	// G => K
	// ZJ => S
	// D => T 
	// BPF => H
	// Ch => T
	// Sh => S 
	// Ts => T
}
var nn_hiragana = "ん"
var gojuon_katakana_vowels = ["ア", "イ", "ウ", "エ", "オ"];
var gojuon_katakana = {
	//A:   a   ka   sa	ta	na	 ha	 ma	  ya  ra  wa
	"ア": ["ア","カ","サ","タ","ナ","ハ","マ","ヤ","ラ","ワ"],
	//I:   i   ki   si	ti	ni	 hi	 mi	 yi  ri  wi
	"イ": ["イ","キ","シ","チ","ニ","ヒ","ミ","","リ","ヰ"],
	//U:   u   ku   su	tu	nu	 hu	 mu	 yu  ru  wu
	"ウ": ["ウ","ク","ス","ツ","ヌ","フ","ム","ユ","ル",""],
	//E:   e   ke   se	te	ne	 he	 me	 ye  re  we
 	"エ": ["エ","ケ","セ","テ","ネ","ヘ","メ","","レ","ヱ"],
 	//O:   o   ko   so	to	no	ho	 mo	  yo  ro  wo
	"オ": ["オ","コ","ソ","ト","ノ","ホ","モ","ヨ","ロ","ヲ"]
}
var nn_katakana = "ン";
var gojuon_score = {
	"ん": 51,
	"ン": 51,
}
for(let v = 0; v < 5; v++) {
	for(let c = 0; c < 10; c++) {
		let vowel_h = gojuon_hiragana_vowels[v];
		let con_h = gojuon_hiragana[vowel_h][c];
		gojuon_score[con_h] = (10*v) + c;
		let vowel_k = gojuon_katakana_vowels[v];
		let con_k = gojuon_katakana[vowel_k][c];
		gojuon_score[con_k] = (10*v) + c;
	}
}
function jaScoreObj(arr) {					// returns object of letter scores for an array of japanese words
	let scoring = {};
	for(let w in arr) {
		let word = arr[w];
		let sort_word = jaAlternates.converted[word] || normalize(word);
		let scores = [];
		for(let i=0; i<sort_word.length; i++) {
			if(gojuon_score.hasOwnProperty(sort_word[i]))
				scores.push(gojuon_score[sort_word[i]]);
		}
		scoring[word] = scores;
	}
	return scoring;
}
function jaScoreToKana(score, kana) {		// return hiragana/katakana for a given score
	let ci = score%10;
	let vi = (score-ci)/10;
	if(kana == "katakana") {
		if(vi == 5)
			return nn_katakana;
		return gojuon_katakana[gojuon_katakana_vowels[vi]][ci];
	}
	if(vi == 5)
		return nn_hiragana;
	return gojuon_hiragana[gojuon_hiragana_vowels[vi]][ci];
}
// alphabetizing accents
function alphabetize(arr, lang) {			// sort Latin, special functions for others
	if(lang == "ja") {
		let scoring = jaScoreObj(arr);
		arr.sort(function(a, b) {
			let imax = Math.max(scoring[a].length, scoring[b].length);
			for(let i=0; i<imax; i++) {
				if(i >= scoring[a].length)
					return -1;
				if(i >= scoring[b].length)
					return 1;
				if(scoring[a][i] - scoring[b][i])
					return scoring[a][i] - scoring[b][i]
			}
			return 0;
		})
		return arr;
	}
	return arr.sort(function(a, b) {
		return a.localeCompare(b);
	});
}
function normalize(word) {
	return word.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace("Œ", "Oe");
}
function compose(word) {
	return word.normalize("NFC");
}
// get data safely
function getWord(transl, lang, nofall) {	// get word, or fallback, or english
	if(transl[lang])
		return transl[lang];
	if(lang == "zhs" && transl.zht)
		return transl.zht;
	if(lang == "zht" && transl.zhs)
		return transl.zhs;
	if(nofall)
		return "";
	return transl.en;
}
function getWords(wordsObj, lang) {
	let engv = ""
	let langInfo = langObj.languages[lang];
	for(let t in wordsObj.supertypes)
		engv += langObj.superTypes[wordsObj.supertypes[t]].en + " ";
	for(let t in wordsObj.types)
		engv += langObj.cardTypes[wordsObj.types[t]].en + " ";
	if(lang == "en")
		return engv;
	if(langObj.languages[lang].special && langObj.languages[lang].special[engv])
		return langObj.languages[lang].special[engv];
	
	if(wordsObj.types) {
		wordsObj.types.sort(function(a, b) {
			return langInfo.typeOrder.indexOf(a) - langInfo.typeOrder.indexOf(b);
		})
	}
	for(let i=0; i<wordsObj.types.length; i++) {
		let word = getWord(langObj.cardTypes[wordsObj.types[i]], lang);
		if(i > 0 && langInfo.lowerSecondTypes.includes("card"))
			word = word.toLowerCase();
		wordsObj.types[i] = word;
	}
	let tokenpluck = "";
	if(wordsObj.supertypes) {
		for(let i=0; i<wordsObj.supertypes.length; i++) {
			let word = getWord(langObj.superTypes[wordsObj.supertypes[i]], lang);
			if(i > 0 && langInfo.lowerSecondTypes.includes("super"))
				word = word.toLowerCase();
			if(langInfo.lowerSecondTypes.includes("allsuper"))
				word = word.toLowerCase();
			wordsObj.supertypes[i] = word;
			if(wordsObj.supertypes[i] == "token" && langInfo.treatTokenAsCardType)
				tokenpluck == word;
		}
	}
	if(tokenpluck) {
		wordsObj.types.splice(0, 0, tokenpluck);
		wordsObj.supertypes.splice(wordsObj.supertypes.indexOf(tokenpluck), 1)
	}
	let super_part = "";
	let card_part = "";
	if(wordsObj.supertypes)
		super_part = wordsObj.supertypes.join(langInfo.superTypeSeperator);
	
}
function trim(word) {
	return word.replace(/^ +| +$/g, "");
}
function getAltRegex(obj, targ, lang) {		// get gender or other alternate regex or else regular word
	if(langObj.otherWords[targ] && langObj.otherWords[targ][lang])
		return langObj.otherWords[targ][lang];
	return getWord(obj[targ], lang);
}
function langCondense(lang) {				// object off all words for a language
	let out = {};
	for(let ct in langObj.cardTypes) {
		if(langObj.cardTypes[ct][lang])
			out[ct] = langObj.cardTypes[ct][lang];
	}
	for(let st in langObj.superTypes) {
		if(langObj.superTypes[st][lang])
			out[st] = langObj.superTypes[st][lang];
	}
	for(let ct in langObj.subTypes) {
		for(let st in langObj.subTypes[ct]) {
			if(langObj.subTypes[ct][st][lang])
				out[st] = langObj.subTypes[ct][st][lang];
		}
	}
	return out;
}
function firstLetterOf(word) {				// get the anglicized first letter of a word
	return letterOf(word, 0);
}
function letterOf(word, x) {				// get the anglicized xth letter of a word
	if(!word || x < 0)
		return "";
	word = normalize(word);
	if(word.length <= x)
		return "";
	return normalize(word).charAt(x);
}
// langObj management
function checkMiss(translObj, lang_codes, cleanedObj, into) {	// check for missing data
	let missing = "";
	for(let lc in lang_codes) {
		let transl = translObj[into][lang_codes[lc]];
		if(transl) {
			cleanedObj[into][lang_codes[lc]] = transl;
		}else if(lang_codes[lc] != "zht") {
			missing += lang_codes[lc] + "," + into + "\n";
		}
	}
	return missing;
}
function cleanAndReport() {					// alphabetize langObj and report missing data
	let cleanedObj = {languages:{}, cardTypes:{}, superTypes:{}, subTypes:{}};
	let lang_codes = Object.keys(langObj.languages).sort();
	for(let l in lang_codes) {
		cleanedObj.languages[lang_codes[l]] = langObj.languages[lang_codes[l]];
	}
	
	let missing = "";
	
	for(let tn in langObj.cardTypes) {
		cleanedObj.cardTypes[tn] = {};
		missing += checkMiss(langObj.cardTypes, lang_codes, cleanedObj.cardTypes, tn)
	}
	
	for(let tn in langObj.superTypes) {
		cleanedObj.superTypes[tn] = {};
		missing += checkMiss(langObj.superTypes, lang_codes, cleanedObj.superTypes, tn)
	}
	
	for(let tn in langObj.subTypes) {
		cleanedObj.subTypes[tn] = {};
		for(let st in langObj.subTypes[tn]) {
			cleanedObj.subTypes[tn][st] = {};
			missing += checkMiss(langObj.subTypes[tn], lang_codes, cleanedObj.subTypes[tn], st)
		}
	}
	
	console.log(missing);
	
	fs.writeFile('./translations.json', JSON.stringify(cleanedObj, null, 1), function(){
		console.log("done");
	})
}
function jaCheck() {						// check kanji without alternates
	let obj = langCondense("ja");
	let kanji = {};
	for(let name in obj) {
		let k = firstLetterOf(obj[name]);
		if(gojuon_score.hasOwnProperty(k))
			continue;
		if(jaAlternates[obj[name]])
			continue;
		kanji[obj[name]] = "";
	}
	fs.writeFile("ja_print.json", JSON.stringify(kanji, null, 1), function() {
		console.log("done");
	})
}
function jaConversion(kana) {				// convert english tones to katakana equivalent
	let nn = nn_katakana;
	let map = gojuon_katakana;
	let vmap = gojuon_katakana_vowels;
	if(kana == "hiragana") {
		nn = nn_hiragana;
		map = gojuon_hiragana;
		vmap = gojuon_hiragana_vowels;
	}
	let vs = ["a", "i", "u", "e", "o"];
	let cs = ["x", "k", "s", "t", "n", "h", "m", "y", "r", "w"];

	for(let w in jaAlternates.tones) {
		let conv_str = "";
		for(let i=0; i<jaAlternates.tones[w].length; i+=2) {
			let c = jaAlternates.tones[w].charAt(i);
			let v = jaAlternates.tones[w].charAt(i+1);
			if(v == "n") {
				conv_str += nn;
			}else if(vs.indexOf(v) >= 0 && cs.indexOf(c) >= 0){
				conv_str += map[vmap[vs.indexOf(v)]][cs.indexOf(c)];
			}else{
				console.log("incorrect tone: " + c + v);
			}
		}
		jaAlternates.converted[w] = conv_str;
	}
	fs.writeFile('./ja_alt.json', JSON.stringify(jaAlternates, null, 1), function() {
		console.log("done");
	})
}

// write MSE files
function determineSubmenuKey(arr, lang, next, p) {
	let key = "";
	let ff = firstLetterOf(arr[0]);
	let lf = firstLetterOf(arr[arr.length-1]);
	let nf = "";
	if(next)
		nf = firstLetterOf(next);
	if(ff == lf) {
		// example, [Sable, Slug], <something>
		if(lf == nf) {
			// example, [Sable, Slug], Snail
			let fs = letterOf(arr[0], 1);
			let ls = letterOf(arr[arr.length-1], 1);
			if(lang == "ko") {
				key = `${compose(ff+fs)} - ${compose(lf+ls)}`;
			}else{
				key = `${ff}${fs}-${lf}${ls}`;
			}
		}else{
			// example, [Snail, Surrakar], Tentacle
			// if p is unrelated, S
			// if p is related Sn-Sz
			// p is related if the first or second-last character is ff
			if(firstLetterOf(p) == ff || letterOf(p, p.length-2) == ff) {
				let fs = letterOf(arr[0], 1);
				let ls = "z";
				if(lang == "ko") {
					ls = "ᄒ";
				}else if(lang == "ru") {
					ls = "я";
				}
				if(lang == "ko") {
					key = `${compose(ff+fs)} - ${compose(lf+ls)}`;
				}else{
					key = `${ff}${fs}-${lf}${ls}`;
			}
			}else{
				key = ff;
			}
		}
	}else{
		// example [Deserter, Inquisitor], <something>
		// if p is unreleated D-
		// if p is related De-
		// if lf == nf -In
		// if lf != nf, -I
		// p is related if the first or second-last character is ff
		if(firstLetterOf(p) == ff || letterOf(p, p.length-2) == ff) {
			let fs = letterOf(arr[0], 1);
			if(lang == "ko") {
				key = `${compose(ff+fs)} - ${lf}`;
			}else{
				key = `${ff}${fs}-${lf}`;
			}
		}else{
			key = `${ff}-${lf}`;
		}
		if(lf == nf) {
			let ls = letterOf(arr[arr.length-1], 1);
			key += ls;
		}
	}
	return key;
}
function breakSubmenu(arr, mode, lang, next, p) {	// break an array into submenus
	let out = {}
	if(arr.length == 0)
		return out;
	// if 18 or less, send that
	if(arr.length <= 18) {
		if(mode == "letter")
			return arr;
		let key = determineSubmenuKey(arr, lang, next, p);
		out[key] = arr;
		return out;
	}

	// if very large, split up
	// we want to restrict to 17 or less per sub array
	// (18 is workable ; 1x18 is preferable to 2x9)
	// (however 3x12 is prefereable to 2x18)
	let boxes = Math.max(arr.length / 17);
	if(arr.length % 17 == 0) {
		let val = true;
		for(let s = 16; s < arr.length; s += 17) {
			let ff = firstLetterOf(arr[s]);
			let fs = letterOf(arr[s], 1);
			let nf = firstLetterOf(arr[s+1]);
			let ns = letterOf(arr[s+1], 1);
			
			if(mode == "letter" && fs == ns) {
				// this won't break cleanly into two 17s
				val = false;
			}else if(mode != "letter" && ff == nf) {
				// this won't break cleanly into two 17s
				val = false;
			}
		}
		if(val == false)
			boxes++;
	}
	let avg = arr.length / boxes;
	let main_holder = [[]];
	let sub_holder = [];
	let x = 0;
	let curr_f = firstLetterOf(arr[0]);
	let curr_s = letterOf(arr[0], 1);
	for(let i=0; i<=arr.length; i++) {
		let this_f = firstLetterOf(arr[i]);
		let this_s = letterOf(arr[i], 1);

		let same_cluster;
		if(i == arr.length) {
			// fake last loop to add in the final sub_holder
			same_cluster = false;
		}else if(mode == "letter") {
			// here we care about the second letter
			same_cluster = (this_s == curr_s);
		}else{
			// here we care about the first letter mostly
			same_cluster = (this_f == curr_f);
		}
		if(same_cluster) {
			// same cluster, add to sub_holder
			sub_holder.push(arr[i]);
			//if(i > 0)
				//console.log(`${arr[i]} same cluster as ${arr[i-1]}.`)
		}else{
			// new cluster, check if we're full
			let method = "";
			if(main_holder[x].length + sub_holder.length > 17) {
				// too big, must split
				method = "split";
			}else if(main_holder[x].length + sub_holder.length <= avg) {
				// small enough to combine
				method = "combine";
			}else{
				let diff_keep = main_holder[x].length + sub_holder.length - avg;
				let diff_leave = avg - main_holder[x].length;
				let diff_remain = arr.length-i;
				if(main_holder[x].length + sub_holder.length + diff_remain <= 17) {
					// end of the list, keep the overflow
					method = "combine";
				}else if(diff_keep > diff_leave) {
					// too top heavy, let this go in the next bucket
					method = "split";
				}else{
					// we have most of this already, keep it
					method = "combine";
				}
			}
			//if(i > 0)
				//console.log(`${arr[i]} different cluster from ${arr[i-1]}. doing ${method}`)

			if(method == "split") {
				// full, make a new box for this
				main_holder.push([]);
				x++;
			}
			// add previous sub_holder to current box
			for(let s in sub_holder) {
				main_holder[x].push(sub_holder[s]);
			}
			// add this to new sub_holder
			sub_holder = [arr[i]];
			curr_f = this_f;
			curr_s = this_s;
		}
	}
	let key = "";
	for(let i=0; i<main_holder.length; i++) {
		let next = main_holder[i+1];
		if(next)
			next = next[0];
		key = determineSubmenuKey(main_holder[i], lang, next, key);
		out[key] = main_holder[i];
	}
	return out;
}
function collectify(arr, lang, mode) {		// convert an array into a collection of alphabetical arrays
	let collection = {};
	if(lang == "ja") {
		// use a/ka/sa/ta method
		for(let v in gojuon_hiragana) {
			for(let c in gojuon_hiragana[v]) {
				if(gojuon_hiragana[v][c])
					collection[gojuon_hiragana[v][c]] = [];
			}
		}
		collection[nn_hiragana] = [];
		let scoring = jaScoreObj(arr);
		for(let w in scoring) {
			let kana = jaScoreToKana(scoring[w][0]);
			collection[kana].push(w);
		}
		
		let fixed_collection = {};
		for(let k in gojuon_hiragana[gojuon_hiragana_vowels[0]]) {
			let col_kana = gojuon_hiragana[gojuon_hiragana_vowels[0]][k];
			col_kana += "行";
			fixed_collection[col_kana] = {};
			for(let v in gojuon_hiragana_vowels) {
				let vowel = gojuon_hiragana_vowels[v];
				let row_kana = gojuon_hiragana[vowel][k];
				if(collection[row_kana])
					fixed_collection[col_kana][row_kana] = collection[row_kana];
			}
		}
		return fixed_collection;
		/*
		let fixed_collection = {};
		for(let v in gojuon_hiragana_vowels) {
			fixed_collection[gojuon_hiragana_vowels[v]] = {};
			for(let t in gojuon_hiragana[gojuon_hiragana_vowels[v]]) {
				let kana = gojuon_hiragana[gojuon_hiragana_vowels[v]][t];
				let words = collection[kana];
				if(words && words.length)
					fixed_collection[gojuon_hiragana_vowels[v]][kana] = words;
			}
		}
		return fixed_collection;*/
	}
	
	if(lang == "zht" || lang == "zhs")
		mode = "";
	// otherwise, alphabetize and break by letters
	arr = alphabetize(arr, lang);
	
	if(mode == "letter") {
		// each letter is its own
		// ideally we don't want more than 18 in a submenu tho
		let holder = [];
		let pKey = "";
		let curr = firstLetterOf(arr[0]);
		for(let i=0; i<arr.length; i++) {
			let word = arr[i];
			let first_letter = firstLetterOf(word);
			if(first_letter != curr) {
				// process hold and add to the map
				let miniobj = breakSubmenu(holder, mode, lang, arr[i+1], pKey);
				collection[curr] = miniobj;
				holder = [];
				pKey = curr;
			}
			holder.push(word);
			if(i == arr.length-1) {
				// process the last letter hold and add to the map
				let miniobj = breakSubmenu(holder, mode, lang, "", "");
				collection[curr] = miniobj;
			}
			curr = first_letter;
		}
		return collection
	}
	
	return breakSubmenu(arr, mode, lang);
}
function ar_to_string(ar) {					// array to '["a","b","c"]' string
	if(ar.length == 0)
		return "[]";
	return `["${ar.join('","')}"]`;
}
function pullTranslList(obj, lang) {		// returns sorted array of translated strings from a type wrapper
	let words = [];
	for(let a in obj) {
		words.push(getWord(obj[a], lang));
	}
	return alphabetize(words, lang);
}
function isBuilder(lang) {					// builds localization closures for a language
	let lang_info = langObj.languages[lang];
	let ct = langObj.cardTypes;
	let sp = langObj.superTypes;
	let sb = langObj.subTypes;
	let ow = langObj.otherWords;

	return `	"${lang_info.name}": [
		code              : "${lang}"
		spellcheck_code   : "${lang_info.spellcheckCode}"
		fallback          : "${(lang_info.hasOwnProperty("fallback") ? langObj.languages[lang_info.fallback].name : "English")}"
		pt_separator      : "/"
		supertype_separator : "${lang_info.superTypeSeperator}"
		type_separator    : "${lang_info.seperator}"
		subtype_separator : "<atom-sep>${lang_info.subTypeSeperator}</atom-sep>"
		keyword_types     : ${ar_to_string(lang_info.keywordTypes)}

		is_artifact       : match@(match: "(?i)${getAltRegex(ct, "artifact", lang)}")
		is_battle         : match@(match: "(?i)${getAltRegex(ct, "battle", lang)}")
		is_creature       : match@(match: "(?i)${getAltRegex(ct, "creature", lang)}")
		is_kindred        : match@(match: "(?i)${getAltRegex(ct, "kindred", lang)}")
		is_tribal         : match@(match: "(?i)${getAltRegex(ct, "kindred", lang)}")
		is_enchantment    : match@(match: "(?i)${getAltRegex(ct, "enchantment", lang)}")
		is_land           : match@(match: "(?i)${getAltRegex(ct, "land", lang)}")
		is_planeswalker   : match@(match: "(?i)${getAltRegex(ct, "planeswalker", lang)}")
		is_spell          : match@(match: "(?i)${getAltRegex(ct, "instant", lang)}|${getAltRegex(ct, "sorcery", lang)}")
		is_instant        : match@(match: "(?i)${getAltRegex(ct, "instant", lang)}")
		is_sorcery        : match@(match: "(?i)${getAltRegex(ct, "sorcery", lang)}")

		is_nonstandard    : match@(match: "(?i)(${getAltRegex(ct, "conspiracy", lang)}|${getAltRegex(ct, "dungeon", lang)}|${getAltRegex(ct, "emblem", lang)}|${getAltRegex(ct, "hero", lang)}|${getAltRegex(ct, "phenomenon", lang)}|${getAltRegex(ct, "plane", lang)}|${getAltRegex(ct, "scheme", lang)}|${getAltRegex(sp, "token", lang)}|${getAltRegex(ct, "vanguard", lang)})")
		is_conspiracy     : match@(match: "(?i)${getAltRegex(ct, "conspiracy", lang)}")
		is_dungeon        : match@(match: "(?i)${getAltRegex(ct, "dungeon", lang)}")
		is_emblem         : match@(match: "(?i)${getAltRegex(ct, "emblem", lang)}")
		is_hero           : match@(match: "(?i)${getAltRegex(ct, "hero", lang)}")
		is_token          : match@(match: "(?i)${getAltRegex(sp, "token", lang)}")
		is_phenomenon     : match@(match: "(?i)${getAltRegex(ct, "phenomenon", lang)}")
		is_plane		  : match@(match: "(?i)${getAltRegex(ct, "plane", lang)}")
		is_scheme         : match@(match: "(?i)${getAltRegex(ct, "scheme", lang)}")
		is_vanguard       : match@(match: "(?i)${getAltRegex(ct, "vanguard", lang)}")

		is_basic          : match@(match: "(?i)${getAltRegex(sp, "basic", lang)}")
		is_elite          : match@(match: "(?i)${getAltRegex(sp, "elite", lang)}")
		is_host           : match@(match: "(?i)${getAltRegex(sp, "host", lang)}")
		is_legendary      : match@(match: "(?i)${getAltRegex(sp, "legendary", lang)}")
		is_ongoing        : match@(match: "(?i)${getAltRegex(sp, "ongoing", lang)}")
		is_snow           : match@(match: "(?i)${getAltRegex(sp, "snow", lang)}")
		is_world          : match@(match: "(?i)${getAltRegex(sp, "world", lang)}")
		get_supertypes    : filter_text@(match: "(?i)(${getAltRegex(sp, "legendary", lang)}|${getAltRegex(sp, "basic", lang)}|${getAltRegex(sp, "snow", lang)}|${getAltRegex(sp, "token", lang)}|${getAltRegex(sp, "world", lang)}|${getAltRegex(sp, "ongoing", lang)}|${getAltRegex(sp, "elite", lang)}|${getAltRegex(sp, "host", lang)}) ?")
		remove_supertypes : replace_text@(match: "(?i)(${getAltRegex(sp, "legendary", lang)}|${getAltRegex(sp, "basic", lang)}|${getAltRegex(sp, "snow", lang)}|${getAltRegex(sp, "token", lang)}|${getAltRegex(sp, "world", lang)}|${getAltRegex(sp, "ongoing", lang)}|${getAltRegex(sp, "elite", lang)}|${getAltRegex(sp, "host", lang)})[- ]?", replace:"")
		base_supertypes   : "${getAltRegex(sp, "legendary", lang)}|${getAltRegex(sp, "basic", lang)}|${getAltRegex(sp, "snow", lang)}|${getAltRegex(sp, "token", lang)}|${getAltRegex(sp, "world", lang)}|${getAltRegex(sp, "ongoing", lang)}|${getAltRegex(sp, "elite", lang)}|${getAltRegex(sp, "host", lang)}"

		is_plains         : match@(match: "(?i)${getAltRegex(sb.land, "Plains", lang)}")
		is_island         : match@(match: "(?i)${getAltRegex(sb.land, "Island", lang)}")
		is_swamp          : match@(match: "(?i)${getAltRegex(sb.land, "Swamp", lang)}")
		is_mountain       : match@(match: "(?i)${getAltRegex(sb.land, "Mountain", lang)}")
		is_forest         : match@(match: "(?i)${getAltRegex(sb.land, "Forest", lang)}")
		is_wastes         : match@(match: "(?i)${getAltRegex(ow, "Wastes", lang)}")

		is_class		  : match@(match: "(?i)${getAltRegex(sb.enchantment, "Class", lang)}")
		is_case			  : match@(match: "(?i)${getAltRegex(sb.enchantment, "Case", lang)}")
		is_nyx			  : match@(match: "(?i)${getWord(ow.Nyx, lang)}")
		is_saga			  : match@(match: "(?i)${getAltRegex(sb.enchantment, "Saga", lang)}")
		is_vehicle        : match@(match: "(?i)${getAltRegex(sb.artifact, "Vehicle", lang)}")
		is_lesson		  : match@(match: "(?i)${getAltRegex(sb.spell, "Lesson", lang)}")
		is_miracle		  : match@(match: "(?i)${getWord(ow.Miracle, lang)}")
		is_mutate		  : match@(match: "(?i)${getWord(ow.Mutate, lang)}")
		is_devoid		  : match@(match: "(?i)${getWord(ow.Devoid, lang)}")

		mana_symbol_production	: filter_text@(in_context:"${getWord(ow.AddMana, lang)}", match:"<sym[^>]*>[^<]+<\\\\/sym[^>]*>")
		gold_mana_production 	: filter_text@(in_context:"${getWord(ow.AddMana, lang)}", match:"${getWord(ow.AddGold, lang)}")
		chosen_mana_production	: filter_text@(in_context:"${getWord(ow.AddMana, lang)}", match:"${getWord(ow.AddChosen, lang)}")`
}

function buildMSEFiles() {
	fs.readFile('./language_map_base.txt', 'utf8', (err, data) => {
		let wl = "";
		for(let l in langObj.languages) {
			let transl = buildLangStrings(l);
			data = data.replace("word_lists_" + l, transl.lang);
			wl += transl.race + "\n\n" + transl.classes + "\n\n" + transl.plane + "\n\n\n\n\n";
		}
		fs.writeFile('./language_map', data, () => {
			console.log("language_map done");
		})
		fs.readFile('./word_lists_base.txt', 'utf8', (err, data) => {
			data += wl;
			fs.writeFile('./word_lists', data, () => {
				console.log("word_lists done");
			})
		})
	})
}
function buildLangStrings(lang) {
	// basics lists that don't need further split
	let artifacts = pullTranslList(langObj.subTypes.artifact, lang);
	let battles = pullTranslList(langObj.subTypes.battle, lang);
	let dungeons = pullTranslList(langObj.subTypes.dungeon, lang);
	let enchantments = pullTranslList(langObj.subTypes.enchantment, lang);
	let lands = pullTranslList(langObj.subTypes.land, lang);
	let spells = pullTranslList(langObj.subTypes.spell, lang);
	let planeswalkers = pullTranslList(langObj.subTypes.planeswalker, lang);
	
	// more complicated lists
	// move basics out to their own list
	let basics = [];
	let blist = ["Plains", "Island", "Swamp", "Mountain", "Forest"];
	for(let b in blist) {
		let gw = getWord(langObj.subTypes.land[blist[b]], lang);
		basics.push(gw);
		lands.splice(lands.indexOf(gw), 1);
	}
	// plane sublists
	let s_planes = [];	// standard set Planes
	let h_planes = [];	// non-standard Planechase Planes
	let m_planes = [];	// modern story planes without Plane cards
	let a_planes = [];	// ancient story planes without Plane cards
	let w_planes = [];	// Dr Who Plane types
	for(let p in langObj.subTypes.planar) {
		let gw = getWord(langObj.subTypes.planar[p], lang);
		if(sublists.standardPlanes.includes(p)) {
			s_planes.push(gw);
		}else if(sublists.hopPlanes.includes(p)) {
			h_planes.push(gw);
		}else if(sublists.modernPlanes.includes(p)) {
			m_planes.push(gw);
		}else if(sublists.ancientPlanes.includes(p)) {
			a_planes.push(gw);
		}else if(sublists.drwhoPlanes.includes(p)) {
			w_planes.push(gw);
		}else{
			console.log("missing planar type: " + p);
		}
	}
	let plane_collection = {
		"Standard Planes": alphabetize(s_planes),
		"Planechase Planes": alphabetize(h_planes),
		"Other Modern Planes": alphabetize(m_planes),
		"Very Old Planes": alphabetize(a_planes),
		"Dr Who Planes": alphabetize(w_planes)
	}
	//todo race/class splits
	let race_hold = [];
	let class_hold = [];
	for(let c in langObj.subTypes.creature) {
		let gw = getWord(langObj.subTypes.creature[c], lang, true);
		if(!gw)
			continue;
		let sent = false;
		if(sublists.races.includes(c)) {
			race_hold.push(gw);
			sent = true;
		}
		if(sublists.classes.includes(c)) {
			class_hold.push(gw)
			sent = true;
		}
		if(!sent)
			console.log("missing creature type: " + c);
	}
	
	let race_collection = collectify(race_hold, lang, "letter");
	let class_collection = collectify(class_hold, lang);
	
	
	let langInfo = langObj.languages[lang];
	let lang_lists = `		word_list_artifact:
			${arr_to_lang_list(artifacts)}
		word_list_battle:
			${arr_to_lang_list(battles)}
		word_list_dungeon:
			${arr_to_lang_list(dungeons)}
		word_list_land:
			${arr_to_lang_list(lands)}
		word_list_enchantment:
			${arr_to_lang_list(enchantments)}
		word_list_spell:
			${arr_to_lang_list(spells)}
		word_list_planeswalker:
			${arr_to_lang_list(planeswalkers)}
			
		word_lists_basic: ["${basics[0]}", "${basics[1]}", "${basics[2]}", "${basics[3]}", "${basics[4]}"],
		word_lists_race: ${collection_to_lang_list(race_collection)}
		word_lists_class: ${collection_to_lang_list(class_collection)}
		word_lists_plane: ${collection_to_lang_list(plane_collection)}`;
	//lang_lists = isBuilder(lang) + "\n\n" + lang_lists + "\n\t],";
	let word_lists = {
		type: typeListBuilder(lang),
		race: collection_to_word_list(race_collection, lang, "race", "All Races"),
		"classes": collection_to_word_list(class_collection, lang, "class", "All Classes"),
		plane: collection_to_word_list(plane_collection, lang, "plane"),
		lang: lang_lists
	}
	return word_lists;
}
function typeListBuilder(lang) {
	let langInfo = langObj.languages[lang];
	let supers = ["token", "basic", "legendary", "snow", "world", "elite", "hero", "host", "kindred"];
	let types = ["creature", "artifact", "artifact creature", "enchantment", "enchantment creature", "instant", "sorcery", "land", "planeswalker", "battle", "emblem", "conspiracy", "plane", "phenomenon", "scheme", "ongoing scheme"];
	let adds = {};
	for(let t in langInfo.wordListAddition) {
		let ar = langInfo.wordListAddition[t];
		adds[t] = ar[0];
	}
	
	return `word list:
	name: type-${lang}
	word:
		name: ${getWord(langObj.superTypes.token, lang)} 
		is_prefix: true
	word:
		name: ${getWord(langObj.superTypes.basic, lang)} 
		is_prefix: true
	word:
		name: ${getWord(langObj.superTypes.legendary, lang)} 
		is_prefix: true
	word:
		name: ${getWord(langObj.superTypes.snow, lang)} 
		is_prefix: true
	word:
		name: ${getWord(langObj.superTypes.world, lang)} 
		is_prefix: true
	word:
		name: ${getWord(langObj.superTypes.elite, lang)} 
		is_prefix: true
	word:
		name: ${getWord(langObj.cardTypes.hero, lang)} 
		is_prefix: true
	word:
		name: ${getWord(langObj.superTypes.host, lang)} 
		is_prefix: true
	word:
		name: ${getWord(langObj.cardTypes.kindred, lang)} 
		is_prefix: true
	word: ${getWord(langObj.cardTypes.creature, lang)}
	word: ${getWord(langObj.cardTypes.artifact, lang)}
	word: ${getWords({types:["artifact", "creature"]}, lang)}
	word: ${getWord(langObj.cardTypes.enchantment, lang)}
	word: ${getWords({types:["enchantment", "creature"]}, lang)}
	word: ${getWord(langObj.cardTypes.instant, lang)}
	word: ${getWord(langObj.cardTypes.sorcery, lang)}
	word: ${getWord(langObj.cardTypes.land, lang)}
	word: ${getWord(langObj.cardTypes.planeswalker, lang)}
	word: ${getWord(langObj.cardTypes.battle, lang)}
	word: ${getWord(langObj.cardTypes.emblem, lang)}
	word: ${getWord(langObj.cardTypes.conspiracy, lang)}
	word: ${getWord(langObj.cardTypes.plane, lang)}
	word: ${getWord(langObj.cardTypes.phenomenon, lang)}
	word: ${getWord(langObj.cardTypes.scheme, lang)}
	word: ${getWords({supertypes:["ongoing"], types:["scheme"]}, lang)}
`
//"emblem", "conspiracy", "plane", "phenomenon", "scheme", "ongoing scheme"
}
function arr_to_lang_list(ar) {
	let res = "";
	for(let a = 0; a < ar.length; a++) {
		res += `\t\t\t+ "${ar[a]},"\n`
	}
	return res.replace(/^\t\t\t\+/, " ").replace(/,"\n$/, '",')
}
function collection_to_lang_list(collection) {
	let res = "";
	//if(collection["あ行"])
	//	console.log(collection);
	for(let header in collection) {
		let words = collection[header];
		if(words.length) {
			// single menu, straight to array
			res += "\t\t\t" + arr_to_lang_list(words) + "\n\n";
		}else{
			// sub menus, multiple arrays
			for(let submenu in words) {
				if(!words[submenu].length)
					continue;
				res += "\t\t\t" + arr_to_lang_list(words[submenu]) + "\n\n";
			}
		}
	}
	return "[\n" + res.replace(/,\n+$/, "\n\t\t]");
}
var wl_scripts = {
	race: {
		script: "all_races()"
	},
	"class": {
		script: "all_classes()"
	},
	plane: {
		script: 'all_sub_types(setting:"is_plane")'
	}
}
function collection_to_word_list(collection, lang, name, superheader) {
	let res =  `word list:
	name: ${name}-${lang}
	word:
		script: ${wl_scripts[name].script}
		line below: true
`
	let line_lead = `\t`;
	if(superheader) {
		if(langObj.otherWords[superheader] && langObj.otherWords[superheader][lang]) {
			superheader = langObj.otherWords[superheader][lang];
		}
		res += `	word:
		name: ${superheader}
`
		line_lead += `\t`;
	}
	let x = 0;
	for(let header in collection) {
		let words = collection[header];
		let transl_header = header;
		if(langObj.otherWords[header] && langObj.otherWords[header][lang]) {
			transl_header = langObj.otherWords[header][lang];
		}
		if(words.length) {
			// simple array
			res += `${line_lead}word:\n`;
			res += `${line_lead}\tname: ${transl_header}\n`;
			res += `${line_lead}\tword:\n`;
			res += `${line_lead}\t\tscript: lang_setting("word_lists_${name}").${x}\n`;
			x++;
		}else{
			// sub headings
			res += `${line_lead}word:\n`;
			res += `${line_lead}\tname: ${transl_header}\n`;
			for(let subheader in words) {
				let words2 = words[subheader];
				if(!words2.length)
					continue;
				res += `${line_lead}\tword:\n`;
				res += `${line_lead}\t\tname: ${subheader}\n`;
				res += `${line_lead}\t\tword:\n`;
				res += `${line_lead}\t\t\tscript: lang_setting("word_lists_${name}").${x}\n`;
				x++;
			}
		}
	}
	return res;
}

function lenCheck() {
	let counter = {
		de: {},
		en: {},
		es: {},
		fr: {},
		it: {},
		"pt-br": {},
		ru: {},
		ko: {}
	};
	for(let c in sublists.races) {
		let transl = langObj.subTypes.creature[sublists.races[c]];
		if(!transl) {
			console.log(sublists.races[c])
		}
		for(let l in counter) {
			let word = getWord(transl, l);
			let f = firstLetterOf(word);
			if(!counter[l][f])
				counter[l][f] = 0;
			counter[l][f]++;
		}
	}
	console.log(counter);
}

function sanity() {
	let lang = "ja";
	let race_hold = [];
	let class_hold = [];
	for(let c in langObj.subTypes.creature) {
		let gw = getWord(langObj.subTypes.creature[c], lang);
		let sent = false;
		if(sublists.races.includes(c)) {
			race_hold.push(gw);
			sent = true;
		}
		if(sublists.classes.includes(c)) {
			class_hold.push(gw)
			sent = true;
		}
		if(!sent)
			console.log("missing creature type: " + c);
	}
	let race_collection = collectify(race_hold, lang, "letter");
	let class_collection = collectify(class_hold, lang);
	console.log(race_collection);
	console.log(class_collection);
}
function koCheck() {
	let ar_orig = [];
	let ar_norm = [];
	for(let t in langObj.subTypes.creature) {
		let w = langObj.subTypes.creature[t].ko;
		if(!w)
			continue;
		ar_orig.push(w);
		ar_norm.push(normalize(w));
	}
	ar_orig.sort();
	ar_norm.sort();
	let errs = 0;
	for(let i=0; i<ar_orig.length; i++) {
		let test = normalize(ar_orig[i]);
		if(test != ar_norm[i])
			errs++;
	}
	console.log(`${ar_orig.length} translations tested`);
	console.log(`${errs} inaccurate placements`);
}

buildMSEFiles();

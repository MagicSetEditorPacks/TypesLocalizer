var langObj = require('./translations.json');
var fs = require('fs');

function alphabetize(arr, lang) {
	// todo, fancier alphabetizing for non-Eng characters
	return arr.sort();
}
function getWord(transl, lang) {
	if(transl[lang])
		return transl[lang];
	let out = transl.en;
	switch(lang) {
		case "zht":
			if(transl.zhs)
				out = transl.zhs;
			break;
		case "zhs":
			if(transl.zht)
				out = transl.zht;
			break;
	}
	return out;
}
function build_word_lists(lang) {
	let file = "";
	let langInfo = langObj.languages[lang];
	
	// card.super_type
	file += "word_list:";
	file += "\n\tname: type";
	if(!langInfo.suffixSuperTypes) {
		// set up prefix super types and also tribal
		let list = [];
		for(let t in langObj.superTypes)
			list.push(getWord(langSupers[t], lang));
		let tribal = getWord(langObj.cardTypes.tribal, lang);
		list.push(tribal)
		let alphalist = alphabetize(list, lang);
		for(let l in alphalist) {
			file += "\n\tword:";
			file += "\n\t\tname: " + alphalist[l];
			if(alphalist[l] == tribal) {
				file += langInfo.cardTypeSeperator;
			}else if(langInfotreatTokenAsCardType && alphalist[l] == getWord(langObj.superTypes.token, lang)) {
				file += langInfo.cardTypeSeperator;
			}else{
				file += langInfo.superTypeSeperator;
			}
			file += "\n\t\tis prefix: true";
		}
		file += "\n\t\tline below: true";
	}else{
		// suffix super type
	}
	// fill in the rest of the card types
	
	// fill each of the subtype lists
}

function cleanAndReport() {
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

function checkMiss(translObj, lang_codes, cleanedObj, into) {
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
cleanAndReport()
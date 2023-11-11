var langObj = require('./translations.json');

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
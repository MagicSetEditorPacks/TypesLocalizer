var fs = require('fs')
var langObj = require('./translations.json');

function pullTypesFromCR(cb) {
	fs.readFile("resources/cr.txt", "utf8", function(err, data) {
		if(err)
			throw err;
		let typeStrings = {
			artifact: data.match(/The artifact types are ([^\n\r]+)/),
			enchantment: data.match(/The enchantment types are ([^\n\r]+)/),
			land: data.match(/The land types are ([^\n\r]+)(\. Of that list)/),
			planeswalker: data.match(/The planeswalker types are ([^\n\r]+)/),
			spell: data.match(/The spell types are ([^\n\r]+)/),
			creature: data.match(/The creature types are ([^\n\r]+)/),
			planar: data.match(/The planar types are ([^\n\r]+)/),
			dungeon: data.match(/Th(?:e|at) dungeon types? (?:is|are) ([^\n\r]+)/)
		}
		for(let mainType in typeStrings) {
			let cleanedString = typeStrings[mainType][1].replace(/, and /, ", ").replace(/\.$/, "").replace(/ ?\([^)]+\)/g, "");
			cleanedString = cleanedString.replace(/’/g, "'");
			let arr = cleanedString.split(", ");
			langObj.types[mainType] = {};
			for(let t in arr)
				langObj.types[mainType][arr[t]] = {en:arr[t]}
		}
		cb();
	})
}
function findMainType(subtype) {
	for(let t in langObj.types) {
		if(langObj.types[t][subtype])
			return t;
	}
}
function genResultsToJson() {
	fs.readFile("Subtype.Translations.txt", "utf8", function(err, data) {
		if(err)
			throw err;
		data = data.replace(/’/g, "'");
		let langOrder = [];
		let enIndex = -1;
		let lines = data.split("\n");
		for(let l=0; l<lines.length; l++) {
			let entries = lines[l].split(";");
			if(l == 0) {
				// set the language order
				langOrder = entries;
				enIndex = langOrder.indexOf("en");
			}else{
				let transl = {};
				let refType = entries[enIndex];
				let mainType = findMainType(refType);
				for(let e=0; e<entries.length; e++) {
					if(entries[e] == "UNKNOWN")
						continue;
					if(langObj.types[mainType][refType][langOrder[e]]) {
						let old = langObj.types[mainType][refType][langOrder[e]];
						if(!old) {
							// new translations
							console.log(`New ${langOrder[e]}:${refType} - ${entries[e]}`)
							langObj.types[mainType][refType][langOrder[e]] = entries[e];
						}else if(old != entries[e]) {
							console.log(`Overwriting ${langOrder[e]}:${refType} from ${old} to ${entries[e]}`);
							langObj.types[mainType][refType][langOrder[e]] = entries[e];
						}
					}
				}
			}
		}
		fs.writeFile('translations_new.json', JSON.stringify(langObj, null, 1), function() {
			console.log("done");
		})
	})
}
genResultsToJson()
function findEnglishOnly() {
	for(let mainType in langObj.types) {
		for(let subType in langObj.types[mainType]) {
			if(Object.keys(langObj.types[mainType][subType]).length == 1)
				console.log("English only type: " + subType);
		}
	}
}

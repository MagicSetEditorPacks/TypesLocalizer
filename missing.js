var langObj = require('./translations.json');
var fs = require('fs');

for(let l in langObj.languages) {
	let blank = {};
	let buckets = {cardTypes: langObj.cardTypes, superTypes: langObj.superTypes};
	for(let t in langObj.subTypes) {
		buckets[t] = langObj.subTypes[t];
	}
	for(let b in buckets) {
		let missObj = {};
		let save = false;
		let typeObj = buckets[b];
		for(let t in typeObj) {
			if(!typeObj[t][l]) {
				missObj[t] = "";
				save = true;
			}
		}
		if(save) {
			blank[b] = missObj;
		}
	}
	fs.writeFile('./missing/'+l+".json", JSON.stringify(blank, null, 1), () => {
		console.log(`${l} missing written`);
	})
}

var langObj = require('./translations.json');
var fs = require('fs');

for(let l in langObj.languages) {
	try {
		let missing = require(`./missing/${l}.json`);
		let save = false;
		for(let b in missing) {
			let into = langObj[b];
			if(!langObj[b])
				into = langObj.subTypes[b];
			for(let t in missing[b]) {
				if(missing[b][t]) {
					into[t][l] = missing[b][t];
					delete missing[b][t];
					save = true;
				}
			}
		}
		if(save)
			fs.writeFile(`./missing/${l}.json`, JSON.stringify(missing, null, 1), () => {});
	}catch(e) {
		console.log(e);
		console.log(`Couldn't open missing json for ${l}.`)
	}
}
fs.writeFile('./translations.json', JSON.stringify(langObj, null, 1), () => {
	console.log("done");
})
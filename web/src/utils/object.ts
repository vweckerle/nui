
// [CHAT.GPT]
type CaseObject = {
	[key: string]: any;
};
// [CHAT.GPT]
export function snakeToCamel(obj: CaseObject): CaseObject {
	if (Array.isArray(obj)) {
		return obj.map(snakeToCamel);
	} else if (obj !== null && typeof obj === 'object') {
		const newObj: CaseObject = {};
		for (let key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
				newObj[camelKey] = snakeToCamel(obj[key]);
			}
		}
		return newObj;
	} else {
		return obj;
	}
}
// [CHAT.GPT]
export function camelToSnake(obj: CaseObject): CaseObject {
	if (Array.isArray(obj)) {
		return obj.map(camelToSnake);
	} else if (obj !== null && typeof obj === 'object') {
		const newObj: CaseObject = {};
		for (let key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				const snakeKey = key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
				newObj[snakeKey] = camelToSnake(obj[key]);
			}
		}
		return newObj;
	} else {
		return obj;
	}
}

// Confronto due oggetti solo al primo livello
export function compare(objFind: any, obj: any): boolean {
	for (let key of Object.keys(objFind)) {
		if (objFind[key] !== obj[key]) {
			return false
		}
	}
	return true;
}




let timeoutIDs = {};
/**
 * attende un determinato tempo prima di eseguire una funzione
 * se la funzione è richiamata resetta il tempo e riaspetta
 */
export function debounce(name: string, callback: () => void, delay: number): void {
	if (delay == 0) {
		callback.apply(this, null);
	} else {
		let toId = timeoutIDs[name];
		if (toId != null) clearTimeout(toId);
		timeoutIDs[name] = setTimeout(() => {
			delete timeoutIDs[name];
			callback.apply(this, null);
		}, delay);
	}
}
export function debounceExist(name: string): boolean {
	return !!timeoutIDs[name]
}
/**
 * crea una pausa async
 */
export function delay(millisec: number): Promise<void> {
	return new Promise(res => setTimeout(res, millisec));
}
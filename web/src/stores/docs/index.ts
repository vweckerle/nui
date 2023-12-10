import { ANIM_TIME, DOC_ANIM, POSITION_TYPE } from "@/stores/docs/types"
import navSo from "@/stores/navigation"
import { StoreCore, createStore } from "@priolo/jon"
import { ViewStore } from "./viewBase"
import { stringToViewsState, viewsToString } from "./utils/urlTransform"
import { buildStore } from "./utils/factory"
import { aggregate, disgregate, getById } from "./utils/manage"
import { debounce, debounceExist, delay } from "@/utils/time"

/**
 * Gestisce la lista di DOCS presenti
 */
const setup = {

	state: {
		focus: <number>null,
		all: <ViewStore[]>[],
		allInShow: <ViewStore[]>[],
	},

	getters: {
		getById(id: string, store?: DocStore): ViewStore {
			return getById(store.state.all, id)
		},
		getIndexByView(view: ViewStore, store?: DocStore) {
			return store.state.all.findIndex(v => v == view)
		},
	},

	actions: {

		/** inserisco un DOC nella "root" con "index" */
		add(
			{ view, index }: { view: ViewStore, index?: number },
			store?: DocStore
		) {
			// se esiste gia' setto il fuoco e basta
			// per il momento lo levo ma dovro' cercare le finestre UNICHE
			// cioe' se un ViewStore è settato come "unico" allora non si possono aprire piu' istanze di quello
			//const find = getById(store.state.all, getID(view))
			//if (find) {	/* set focus */ return }

			// imposto la view
			view.state.parent = null
			view.state.position = POSITION_TYPE.DETACHED
			// ---
			const newViews = [...store.state.all]
			if (index == null) newViews.push(view); else newViews.splice(index, 0, view);
			store.setAll(newViews)
		},

		/** inserisco una VIEW come link di un altra VIEW */
		addLink(
			{ view, parent, anim }: { view: ViewStore, parent: ViewStore, anim?: boolean },
			store?: DocStore
		) {
			if (!parent) return

			// se c'e' gia' una view la rimuovo
			if (parent.state.linked) {
				store.remove(parent.state.linked)
			}
			if (!view) return

			// imposto la view
			parent.setLinked(view)
			store.setAll([...store.state.all])
		},

		/** inserisco una VIEW nello STACK di un altra VIEW */
		remove(view: ViewStore, store?: DocStore) {
			const views = [...store.state.all]
			let index: number

			// placed in ROOT
			if (!view.state.parent) {
				index = views.findIndex(v => v == view)
				if (index != -1) views.splice(index, 1)
				view.state.parent = null
				view.state.position = null

				// LINKED
			} else {
				view.state.parent.setLinked(null)
			}

			store.setAll(views)
		},
		async removeWithAnim(view: ViewStore, store?: DocStore) {
			if (view.state.position == POSITION_TYPE.DETACHED) store.remove(view)
			view.setDocAnim(DOC_ANIM.EXITING)
			await delay(ANIM_TIME)
			store.remove(view)
		},

		/** sposta una view in un indice preciso dello STACK */
		move({ view, index }: { view: ViewStore, index: number }, store?: DocStore) {
			if (view == null || index == null) return
			// se è direttamente in ROOT...
			if (view.state.parent == null) {
				const srcIndex = store.state.all.indexOf(view)
				if (srcIndex == index || srcIndex + 1 == index) return
				store.remove(view)
				if (srcIndex > index) {
					store.add({ view, index })
				} else {
					store.add({ view, index: index - 1 })
				}
				// altrimenti la cancello e la ricreo in ROOT
			} else {
				store.remove(view)
				store.add({ view, index })
			}
		},

		/** sostituisco tutti i DOC con quelli ricavati da una stringa (tipicamente URL) */
		updateFromString(docsStr: string, store?: DocStore) {
			const viewsState = stringToViewsState(docsStr)
			const stores = viewsState.map(viewState => buildStore(viewState)).filter(store => !!store)
			const storesAgg = aggregate(stores)
			store.setAll(storesAgg)
		},
	},

	mutators: {
		setAll: (all: ViewStore[], store?: DocStore) => {
			const views: ViewStore[] = disgregate(all)
			navSo.setParams(["docs", viewsToString(views)])

			let updateDel = false
			const deleted = [...store.state.all]
			for (const view of all) {
				const index = deleted.indexOf(view)
				// se prima non c'era allora fai lo SHOW
				if (index == -1) {
					//view.setDocAnim(DOC_ANIM.SHOWING)
					window.requestAnimationFrame(() => view.setDocAnim(DOC_ANIM.SHOWING));
					// se prima c'era allora NON lo cancellare
				} else {
					deleted.splice(index, 1)
				}
			}
			// setto le animazioni a tutti quelli che devono essere eliminati
			for (const view of deleted) {
				updateDel = true
				view.setDocAnim(DOC_ANIM.EXITING)
			}

			if (!debounceExist("setAllInShow") && !updateDel) {
				return { all, allInShow: all }
			}

			debounce("setAllInShow", () => store.setAllInShow(), ANIM_TIME)
			return { all }
		},
		setAllInShow: (_: void, store?: DocStore) => {
			console.log("***setAllInShow***")
			return { allInShow: store.state.all }
		},
		setFocus: (focus: number) => ({ focus }),


	},
}

export type DocState = typeof setup.state
export type DocGetters = typeof setup.getters
export type DocActions = typeof setup.actions
export type DocMutators = typeof setup.mutators
export interface DocStore extends StoreCore<DocState>, DocGetters, DocActions, DocMutators {
	state: DocState
}
const store = createStore(setup) as DocStore
export default store

var decodedQueryString = decodeURIComponent(window.location.search.substring(1));
navSo.setQuery(decodedQueryString)
const docsStr = navSo.getSearchUrl("docs") as string
store.updateFromString(docsStr)



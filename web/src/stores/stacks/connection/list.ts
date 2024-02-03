import srcIcon from "@/assets/ConnectionsIcon.svg"
import cnnSo from "@/stores/connections"
import docsSo from "@/stores/docs"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE } from "@/types"
import { Connection } from "@/types/Connection"
import { StoreCore, mixStores } from "@priolo/jon"
import { buildConnectionMessages, buildStore, buildStreams } from "../../docs/utils/factory"
import { CnnDetailState } from "./detail"



/**
 * Gestione della VIEW che visualizza la lista di CONNECTIONs
 */
const setup = {

	state: {
		selectId: <string>null,

		//#region VIEWBASE
		width: 220,
		iconizzable: false,
		colorVar: COLOR_VAR.GREEN,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "CONNECTIONS",
		getIcon: (_: void, store?: ViewStore) => srcIcon,
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as CnnListState
			return {
				...viewSetup.getters.getSerialization(null, store),
				selectId: state.selectId,
			}
		},
		//#endregion

	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as CnnListState
			state.selectId = data.selectId
		},
		//#endregion

		/** ho selezionato una connection quindi creo e visualizzo lo STACK del dettaglio */
		select(cnn: Connection, store?: CnnListStore) {
			const idSelPrev = store.state.selectId
			// se è uguale a quello precedente allora deseleziona
			let idSel = (cnn && idSelPrev != cnn.id) ? cnn.id : null
			store.setSelectId(idSel)

			// eventualmente creo la nuova VIEW
			let srvStore: ViewStore = null
			if (idSel != null) srvStore = buildStore({
				type: DOC_TYPE.CONNECTION,
				connection: cnnSo.getById(idSel)
			} as CnnDetailState)

			// aggiungo la nuova VIEW (o null)
			docsSo.addLink({
				view: srvStore,
				parent: store,
				anim: !idSelPrev || !idSel,
			})
		},

		/** creo una nuova CONNECTION e apro la CARD del DETAIL */
		create(_: void, store?: CnnListStore) {
			store.setSelectId(null)
			const view = buildStore({
				type: DOC_TYPE.CONNECTION,
				readOnly: false,
				connection: {
					name: "",
					hosts: [],
					subscriptions: [],
					auth: []
				}
			} as CnnDetailState)
			docsSo.addLink({ view, parent: store, anim: true })
		},

		openStreams(connectionId: string, store?: CnnListStore) {
			docsSo.addLink({ 
				view: buildStreams(connectionId), 
				parent: store, 
				anim: true 
			})
		},

		openMessages(connectionId: string, store?: CnnListStore) {
			docsSo.addLink({ 
				view: buildConnectionMessages(connectionId), 
				parent: store, 
				anim: true 
			})
		},
	},

	mutators: {
		setSelectId: (selectId: string, store?: CnnListStore) => ({ selectId }),
	},
}

export type CnnListState = typeof setup.state & ViewState
export type CnnListGetters = typeof setup.getters
export type CnnListActions = typeof setup.actions
export type CnnListMutators = typeof setup.mutators
export interface CnnListStore extends ViewStore, StoreCore<CnnListState>, CnnListGetters, CnnListActions, CnnListMutators {
	state: CnnListState
}
const cnnSetup = mixStores(viewSetup, setup)
export default cnnSetup



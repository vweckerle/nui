import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { StreamConfig, StreamInfo } from "@/types/Stream"
import { StoreCore, mixStores } from "@priolo/jon"
import srcIcon from "@/assets/StreamsIcon.svg"
import { StreamsStore } from "."
import strApi from "@/api/streams"
import docSo from "@/stores/docs"
import { DOC_TYPE } from "@/types"



/** STREAM DETAIL */
const setup = {

	state: {
		/** la CONNECTION che contiene sto STREAM */
		connectionId: <string>null,

		/** sono gli stream presenti nella stessa connection di questo */
		allStreams:<string[]>null,

		/** STREAM caricata nella CARD */
		stream: <StreamInfo>null,
		/** STREAM è editabile? */
		readOnly: true,

		//#region VIEWBASE
		//draggable: false,
		width: 230,
		//#endregion

	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => (<StreamStore>store).state.stream?.config.name ?? "--",
		getSubTitle: (_: void, store?: ViewStore) => "STREAM DETAIL",
		getIcon: (_: void, store?: ViewStore) => srcIcon,
		getColorVar: (_: void, store?: ViewStore) => COLOR_VAR.YELLOW,
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as StreamState
			return {
				...viewSetup.getters.getSerialization(null, store),
				stream: state.stream,
				readOnly: state.readOnly,
			}
		},
		//#endregion

		/** restituische, se èresenta, la lista degli streams che contiene questo stream */
		getStreamsStore: (_: void, store?: StreamStore) => {
			if (store.state.parent) return store.state.parent as StreamsStore
			return docSo.find({
				type: DOC_TYPE.STREAMS,
				connectionId: store.state.connectionId,
			}) as StreamsStore
		},
		/** restituisce se lo stream è nuovo (true) oppure no (false) */
		isNew: (_: void, store?: StreamStore) => {
			return store.state.stream.state == null
		},

	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as StreamState
			state.connectionId = data.connectionId
			state.stream = data.stream
			state.readOnly = data.readOnly
		},
		//#endregion
		
		restore: (_: void, store?: StreamStore) => {
			const stream = store.getStreamsStore()?.getByName(store.state.stream.config.name)
			store.setStream(stream)
		},

		/** crea un nuovo stream-info tramite stream-config */
		async save(_:void, store?: StreamStore) {
			let streamSaved = null
			if ( store.isNew() ) {
				streamSaved = await strApi.create(store.state.connectionId, store.state.stream.config)
			} else {
				streamSaved = await strApi.update(store.state.connectionId, store.state.stream.config)
			}
			store.setStream(streamSaved)
			store.getStreamsStore()?.update(streamSaved)
		},

		updateAllStreams: async (_: void, store?: StreamStore) => {
			if ( store.state.allStreams ) return
			const parent = store.getStreamsStore()
			const streams = parent?.state.all ?? await strApi.index(store.state.connectionId)
			const allStreams = streams?.map(si=>si.config.name) ?? []
			store.setAllStreams(allStreams)
		},


	},

	mutators: {
		setStream: (stream: StreamInfo) => ({ stream }),
		setAllStreams: (allStreams: string[]) => ({ allStreams }),
		setStreamConfig: (config: StreamConfig, store?: StreamStore) => ({ stream: { ...store.state.stream, config } }),
		setReadOnly: (readOnly: boolean) => ({ readOnly }),
	},
}

export type StreamState = typeof setup.state & ViewState
export type StreamGetters = typeof setup.getters
export type StreamActions = typeof setup.actions
export type StreamMutators = typeof setup.mutators
export interface StreamStore extends ViewStore, StoreCore<StreamState>, StreamGetters, StreamActions, StreamMutators {
	state: StreamState
}
const streamSetup = mixStores(viewSetup, setup)
export default streamSetup

import srcIcon from "@/assets/MessagesIcon.svg"
import { socketPool } from "@/plugins/SocketService/pool"
import { PayloadMessage, PayloadStatus } from "@/plugins/SocketService/types"
import cnnSo from "@/stores/connections"
import docsSo from "@/stores/docs"
import { buildStore, createUUID } from "@/stores/docs/utils/factory"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { CNN_STATUS, DOC_TYPE, Subscription } from "@/types"
import { Message } from "@/types/Message"
import { StoreCore, mixStores } from "@priolo/jon"
import { MessageState } from "../message"
import { MessageSendState } from "../send"
import { ViewState } from "../viewBase"
import { MSG_FORMAT } from "./utils"



const setup = {

	state: {
		connectionId: <string>null,
		/** SUBS sui quali rimanere in ascolto */
		subscriptions: <Subscription[]>[],
		lastSubjects: <string[]>null,
		/** tutti i messaggi ricevuti */
		messages: <Message[]>[],//historyTest,//[],
		/** testo per la ricerca */
		textSearch: <string>null,
		/** DIALOG SUBS aperta */
		subscriptionsOpen: false,

		format: MSG_FORMAT.JSON,
		formatsOpen: false,

		//#region VIEWBASE
		colorVar: COLOR_VAR.CYAN,
		//#endregion
	},

	getters: {
		getConnection: (_: void, store?: MessagesStore) => {
			return cnnSo.getById(store.state.connectionId)
		},
		getHistoryFiltered: (_: void, store?: MessagesStore) => {
			const text = store.state.textSearch?.toLocaleLowerCase()
			if (!text || text.trim().length == 0) return store.state.messages
			return store.state.messages.filter(h =>
				h.payload.toLowerCase().includes(text) || h.subject.toLowerCase().includes(text)
			)
		},

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => (<MessagesStore>store).getConnection()?.name,
		getSubTitle: (_: void, store?: ViewStore) => "MESSAGES",
		getIcon: (_: void, store?: ViewStore) => srcIcon,
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as MessagesState
			return {
				...viewSetup.getters.getSerialization(null, store),
				connectionId: state.connectionId,
				subscriptions: state.subscriptions,
				history: state.messages,
				textSearch: state.textSearch,
				format: state.format,
			}
		},
		//#endregion

	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as MessagesState
			state.connectionId = data.connectionId
			state.subscriptions = data.subscriptions
			state.messages = data.history
			state.textSearch = data.textSearch
			state.format = data.format
		},
		//#endregion


		connect(_: void, store?: MessagesStore) {
			const ss = socketPool.create(store.state.uuid, store.state.connectionId)
			ss.onOpen = () => {
				store.sendSubscriptions()
				cnnSo.update({ id: store.state.connectionId, status: CNN_STATUS.CONNECTED })
			}
			ss.onMessage = message => store.addInHistory(message)
			ss.onStatus = (payload: PayloadStatus) => {
				cnnSo.update({ id: store.state.connectionId, status: payload.status })
			}
			ss.onError = error => {

			}
		},
		disconnect(_: void, store?: MessagesStore) {
			socketPool.destroy(store.state.uuid)
		},

		/** aggiungo alla history di questo stack */
		addInHistory(message: PayloadMessage, store?: MessagesStore) {
			const historyMessage: Message = {
				//seqNum: createUUID(),
				subject: message.subject,
				payload: message.payload as string,
				receivedAt: Date.now(),
			}
			store.setMessages([...store.state.messages, historyMessage])
		},
		/** aggiorno i subjects di questo stack messages */
		sendSubscriptions: (_: void, store?: MessagesStore) => {
			const subjects = store.state.subscriptions
				?.filter(s => !!s?.subject && !s.disabled)
				.map(s => s.subject) ?? []
			if (store.state.lastSubjects && store.state.lastSubjects.length == subjects.length && subjects.every(s => store.state.lastSubjects.includes(s))) return
			socketPool.getById(store.state.uuid).sendSubjects(subjects)
			store.state.lastSubjects = subjects
		},
		/** apertura CARD MESSAGE-DETAIL */
		openMessageDetail(message: Message, store?: MessagesStore) {
			const cnn = store.getConnection()
			if (!cnn) return
			const msgStore = buildStore({
				type: DOC_TYPE.MESSAGE,
				message,
				format: store.state.format,
			} as MessageState)
			docsSo.addLink({
				view: msgStore,
				parent: store,
				anim: true,
			})
		},
		/** apertura CARD MESSAGE-SEND */
		openMessageSend(_: void, store?: MessagesStore) {
			const cnn = store.getConnection()
			if (!cnn) return
			const msgSendStore = buildStore({
				type: DOC_TYPE.MESSAGE_SEND,
				connectionId: cnn.id,
			} as MessageSendState)
			docsSo.addLink({
				view: msgSendStore,
				parent: store,
				anim: true,
			})
		},
	},

	mutators: {
		setSubscriptions: (subscriptions: Subscription[]) => ({ subscriptions }),
		setMessages: (messages: Message[]) => ({ messages }),
		setSubscriptionsOpen: (subscriptionsOpen: boolean) => ({ subscriptionsOpen }),
		setTextSearch: (textSearch: string) => ({ textSearch }),
		setFormat: (format: MSG_FORMAT) => ({ format }),
		setFormatsOpen: (formatsOpen: boolean) => ({ formatsOpen }),
	},

	onListenerChange: (store: MessagesStore) => {
		console.log("CREATE", store._listeners.size)
		if ( store._listeners.size == 1 ) {
			store.connect()
		} else if (store._listeners.size == 0 ) {
			store.disconnect()
		}
	}
}

export type MessagesState = typeof setup.state & ViewState
export type MessagesGetters = typeof setup.getters
export type MessagesActions = typeof setup.actions
export type MessagesMutators = typeof setup.mutators
export interface MessagesStore extends ViewStore, StoreCore<MessagesState>, MessagesGetters, MessagesActions, MessagesMutators {
	state: MessagesState
}
const msgSetup = mixStores(viewSetup, setup)
export default msgSetup



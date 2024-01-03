import IconButton from "@/components/buttons/IconButton"
import AddIcon from "@/icons/AddIcon"
import { useState, FunctionComponent } from "react"



export interface RenderRowBaseProps<T> {
	item: T
	focus?: boolean
	readOnly?: boolean
	onChange?: (newItem: T) => void
	onDelete?: () => void
	onFocus?: () => void
}

interface Props<T> {
	items: T[]
	/** renderizza una ROW ITEM in lista */
	RenderRow?: FunctionComponent<RenderRowBaseProps<T>>
	/** restituisce nuovo ITEM (su click btt NEW) */
	fnNewItem?: () => T
	onChangeItems?: (newItems: T[]) => void
	readOnly?: boolean
	style?: React.CSSProperties
}

function EditList<T>({
	items,
	RenderRow,
	readOnly,	
	fnNewItem = () => null,
	onChangeItems,
	style,
}: Props<T>) {

	// STORES

	// HOOKS
	const [focus, setFocus] = useState(-1)

	// HANDLERS
	const handleChangeItem = (newItem: T, index: number) => {
		if ( readOnly ) return
		items[index] = newItem
		onChangeItems?.([...items])
	}
	const handleNewItem = (index?: number) => {
		if ( readOnly ) return
		const newItem = fnNewItem()
		if (index == null) index = items.length
		items.splice(index, 0, newItem)
		onChangeItems?.([...items])
		setFocus(index)
	}
	const handleDeleteItem = (index: number) => {
		if ( readOnly ) return
		const newItems = [...items]
		newItems.splice(index, 1)
		onChangeItems?.(newItems)
		setFocus(index >= items.length ? items.length - 1 : index)
	}
	const handleFocus = (index: number) => {
		setFocus(index)
	}
	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (focus == -1) return
		let newFocus = focus
		switch (event.key) {
			case 'ArrowUp':
				event.preventDefault()
				newFocus--
				break
			case 'ArrowDown':
				event.preventDefault()
				newFocus++
				break
			case "Enter":
				event.preventDefault()
				handleNewItem(focus + 1)
				return
		}
		if (newFocus < 0) newFocus = 0
		if (newFocus >= items.length) newFocus = items.length - 1
		setFocus(newFocus)
	}
	const handleBlur = () => {
		setFocus(-1)
	}

	// RENDER
	return <div
		style={{ ...cssContainer, ...style }}
		onKeyDown={handleKeyDown}
		onBlur={handleBlur}
	>

		{/* LISTA */}
		{items?.map((item, index) => (
			<RenderRow key={index}
				item={item}
				focus={focus == index}
				onChange={(newItem) => handleChangeItem(newItem, index)}
				onDelete={() => handleDeleteItem(index)}
				onFocus={() => handleFocus(index)}
				readOnly={readOnly}
			/>
		))}
		{/* BOTTONE NEW */}
		{!readOnly && fnNewItem && (
			<IconButton
				onClick={() => handleNewItem()}
			><AddIcon /></IconButton>
		)}
	</div>
}

export default EditList

const cssContainer: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
}
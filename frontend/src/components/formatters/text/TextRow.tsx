import { FunctionComponent, useMemo } from "react"
import cls from "./TextRow.module.css"
import { binaryStringToString } from "../../../utils/string"



interface Props {
	text?: string
	maxChar?: number
	error?: boolean
	style?: React.CSSProperties
}

const TextRow: FunctionComponent<Props> = ({
	text,
	maxChar = 200,
	error,
	style,
}) => {

	// STORE

	// HOOKs

	// HANDLER

	// RENDER
	if (!text) return null
	// accorcio la stringa se è troppo lunga
	const render = useMemo(() => text.length > maxChar
		? <>{binaryStringToString(text.substring(0, maxChar))}<span style={cssSelect}>{'\u2026'}{text.length}</span></>
		: binaryStringToString(text)
		, [text]
	)

	return (
		<div className={`${cls.root} ${error ? cls.error : ""}`} style={style}>
			{render}
		</div>
	)
}

export default TextRow

const cssSelect:React.CSSProperties = {
	color: "var(--cmp-select-bg)"
}
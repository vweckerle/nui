import React, { ForwardRefRenderFunction, forwardRef, useEffect, useImperativeHandle, useRef } from "react"



export interface TextInputProps {
	value?: string | number
	placeholder?: string
	autoFocus?: boolean
	readOnly?: boolean
	style?: React.CSSProperties
	focus?: boolean
	multiline?: boolean
	rows?: number
	onChange?: (newValue: string) => void
	onFocus?: (e: React.FocusEvent<HTMLInput>) => void
	onBlur?: (e: React.FocusEvent<HTMLInput>) => void
	onKeyDown?: (event: React.KeyboardEvent<HTMLInput>) => void
}

const TextInput: ForwardRefRenderFunction<HTMLElement, TextInputProps> = (
	{
		value,
		placeholder,
		autoFocus,
		readOnly,
		style,
		focus,
		multiline,
		rows = 1,
		onChange,
		onFocus,
		onBlur,
		onKeyDown,
	},
	ref: any
) => {


	// STORE

	// HOOK
	const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
	const multilineUpdate = () => {
		if (!multiline || !inputRef.current) return
		inputRef.current.style.height = 'auto';
		const current = inputRef.current.scrollHeight
		inputRef.current.style.height = `${current - 7}px`;
	}

	useEffect(() => {
		if (!focus) return
		inputRef.current?.select()
	}, [focus])

	useEffect(() => {
		if (!multiline || !inputRef.current) return
		setTimeout(multilineUpdate, 400)
		inputRef.current?.addEventListener('input', multilineUpdate)
		return () => inputRef.current?.removeEventListener('input', multilineUpdate)
	}, [multiline])

	useEffect(()=>{
		multilineUpdate()
	},[readOnly])

	useImperativeHandle(ref, () => inputRef.current, [inputRef.current])

	// HANDLER
	const handleChange = (e: React.ChangeEvent<HTMLInput>) => onChange?.(e.target.value)
	const handleFocus = (e: React.FocusEvent<HTMLInput>) => {
		e.target.select()
		onFocus?.(e)
	}

	// RENDER
	if (readOnly) return (
		<div className="lbl-input-readonly"
			style={style}
		>
			{value ?? ""}
		</div>
	)

	const TagInput = multiline ? "textarea" : "input"

	return <TagInput ref={inputRef as any}
		style={{ ...cssRoot, ...style }}
		placeholder={placeholder}
		autoFocus={autoFocus}
		spellCheck="false"
		value={value ?? ""}
		onChange={handleChange}
		onFocus={handleFocus}
		onBlur={onBlur}
		onKeyDown={onKeyDown}
		rows={rows}
	/>
}

export default forwardRef(TextInput)

const cssRoot: React.CSSProperties = {
	height: "auto",
}

type HTMLInput = HTMLInputElement | HTMLTextAreaElement
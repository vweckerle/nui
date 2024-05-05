import { BaseElement, BaseText, Node, Text } from "slate"



/**
 * tipi di BLOCK nel documento
 */
export enum BLOCK_TYPE {
	PARAGRAPH = "paragraph",
	CHAPTER = "chapter",
	TEXT = "text",
	CODE = "code",
	IMAGE = "image",
}

/**
 * Tipi di FORMAT del testo
 */
export enum FORMATS {
	BOLD = "bold",
	ITALIC = "italic",
	STRIKETHROUGH = "strikethrough",
	CODE = "code",
	LINK = "link",
}

export type ElementType = {
	type?: BLOCK_TYPE,
} & BaseElement

export type TextType = {
	link?: string,
	bold?: boolean,
} & BaseText

export type NodeType = Node & ElementType & TextType


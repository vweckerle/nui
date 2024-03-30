import docSo, { DocState } from "@/stores/docs"
import { ViewStore } from "@/stores/stacks/viewBase"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo, useRef, useState } from "react"
import cls from "./DrawerCmp.module.css"
import IconButton from "./components/buttons/IconButton"
import CardCmp from "./components/cards/CardCmp"
import CompressHIcon from "./icons/CompressHIcon"
import ExpandHIcon from "./icons/ExpandHIcon"
import { delay } from "./utils/time"



const DrawerCmp: FunctionComponent = () => {

	// STORES
	const docSa: DocState = useStore(docSo)

	// HOOKS
	const storesAnchored = useMemo(() => docSo.getAnchored(), [docSa.all, docSa.anchored])
	const [width, setWidth] = useState(0)
	const [animation, setAnimation] = useState(false)
	const isDown = useRef(false)
	const startX = useRef(0)
	const startWidth = useRef(0)
	const lastWidth = useRef(500)

	// HANDLERS
	const handleDown = (e: React.MouseEvent) => {
		isDown.current = true
		startX.current = e.clientX;
		startWidth.current = width;
		const mouseMove = (ev: MouseEvent) => {
			if (!isDown.current) return
			const currentX = ev.clientX;
			const diffX = startX.current - currentX;
			lastWidth.current = startWidth.current + diffX
			setWidth(lastWidth.current)
		}
		const mouseUp = (ev: MouseEvent) => {
			isDown.current = false
			document.removeEventListener('mousemove', mouseMove);
			document.removeEventListener('mouseup', mouseUp);
		}
		document.addEventListener('mousemove', mouseMove);
		document.addEventListener('mouseup', mouseUp);
	}
	const hanldeOpen = async (e:React.MouseEvent) => {
		setWidth(width > 0 ? 0 : lastWidth.current)
		setAnimation(true)
		await delay(400)
		setAnimation(false)
	}

	// RENDER
	return (
		<div className={cls.root} >

			<div className={cls.handle}
				draggable={false}
				onMouseDown={handleDown}
			>
				<IconButton className={cls.btt}
					onClick={hanldeOpen}
				>
					{width > 0 ? <ExpandHIcon /> : <CompressHIcon />}
				</IconButton>
				<div className="bars-alert-bg-1" style={{ flex: 1 }} />
				<div className={cls.handle_label}>DRAWER</div>
				<div className="bars-alert-bg-1" style={{ flex: 1 }} />
			</div>

			<div
				className={cls.handle_container}
				style={cssFixed(width, animation)}
			>
				{storesAnchored.map((store: ViewStore) =>
					<CardCmp key={store.state.uuid}
						store={store}
					/>
				)}
			</div>

			{/* <DropArea index={-1} /> */}
		</div>

	)
}

export default DrawerCmp

const cssFixed = (width: number, animation:boolean): React.CSSProperties => ({
	width,
	transition: animation ? "width 300ms": null,
})
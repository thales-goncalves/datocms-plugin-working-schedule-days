import { RenderFieldExtensionCtx } from "datocms-plugin-sdk";

import {
	Button,
	Canvas,
	Form,
	FormLabel,
	TextField,
} from "datocms-react-ui";
import { useEffect, useRef, useState } from "react";
import CloseIcon from "../components/CloseIcon";
import MinusIcon from "../components/MinusIcon";
import PlusIcon from "../components/PlusIcon";
import { WEEKDAYS } from "../lib/constants";
import { generateId } from "../lib/helper";
import { getNestedFieldValueWithDebug } from "../lib/formValuesHelper";
import saveFieldValue from "../lib/saveFieldValue";
import s from "./WorkingSchedule.module.css";

type Weekday = (typeof WEEKDAYS)[number];

interface TimeSlotPair {
	id: string;
	open: string;
	close: string;
}

interface ScheduleEntry {
	id: string;
	weekdays: Weekday[];
	timeSlots: TimeSlotPair[];
}

interface TimeSlotComponentProps {
	slot: TimeSlotPair;
	isOnlySlot: boolean;
	onChange: (updatedSlot: TimeSlotPair) => void;
	onRemove: () => void;
}

function TimeSlotComponent({
	slot,
	isOnlySlot,
	onChange,
	onRemove,
}: TimeSlotComponentProps) {
	return (
		<div className={s.timeSlotPair}>
			<TextField
				name="open"
				id={`${slot.id}-open`}
				label="Open"
				value={slot.open}
				onChange={(value) => onChange({ ...slot, open: value })}
				textInputProps={{ type: "time", className: s.timeInput }}
			/>
			<TextField
				name="close"
				id={`${slot.id}-close`}
				label="Close"
				value={slot.close}
				onChange={(value) => onChange({ ...slot, close: value })}
				textInputProps={{ type: "time", className: s.timeInput }}
			/>
			{!isOnlySlot && (
				<button
					type="button"
					className={s.removeSlotButton}
					onClick={onRemove}
					title="Remove time slot"
					aria-label="Remove time slot"
				>
					<CloseIcon />
				</button>
			)}
		</div>
	);
}

interface ScheduleEntryComponentProps {
	ctx: RenderFieldExtensionCtx;
	entry: ScheduleEntry;
	showRemove: boolean;
	onChange: (key: "weekdays" | "timeSlots", v: Weekday[] | TimeSlotPair[]) => void;
	onRemove: (id: string) => void;
}

function ScheduleEntryComponent({
	ctx,
	entry,
	showRemove,
	onChange,
	onRemove,
}: ScheduleEntryComponentProps) {
	return (
		<Form className={s.scheduleEntry}>
			<div className={s.entryHeader}>
				<h3 className={s.sectionTitle}>Schedule Entry</h3>
				{showRemove && (
					<button
						type="button"
						className={s.removeEntryButton}
						onClick={() => onRemove(entry.id)}
						aria-label="Remove schedule entry"
					>
						<MinusIcon />
						Remove Entry
					</button>
				)}
			</div>

			<section className={s.section}>
				<h4 className={s.subTitle}>Weekdays</h4>
				<div className={s.weekdaysGrid}>
					{WEEKDAYS.map((weekday) => {
						const isChecked = entry.weekdays.some(
							(w) => w.position === weekday.position
						);
						const weekdayId = `${ctx.field.id}-${weekday.long}-${entry.id}`;

						return (
							<FormLabel key={weekdayId} htmlFor={weekdayId} className={s.weekdayLabel}>
								<input
									type="checkbox"
									id={weekdayId}
									checked={isChecked}
									onChange={(e) => {
										if (
											e.target.checked &&
											!entry.weekdays.some((w) => w.position === weekday.position)
										) {
											onChange("weekdays", entry.weekdays.concat(weekday));
										} else {
											onChange(
												"weekdays",
												entry.weekdays.filter((w) => w.position !== weekday.position)
											);
										}
									}}
									className={s.checkbox}
								/>
								<span className={s.weekdayName}>{weekday.long}</span>
							</FormLabel>
						);
					})}
				</div>
			</section>

			<section className={s.section}>
				<div className={s.timeSlotsHeader}>
					<h4 className={s.subTitle}>Time Slots</h4>
					<button
						type="button"
						className={s.addSlotButton}
						onClick={() => {
							onChange("timeSlots", [
								...entry.timeSlots,
								{
									id: generateId(ctx, "timeslot"),
									open: "",
									close: "",
								},
							]);
						}}
						aria-label="Add time slot"
					>
						<PlusIcon />
						<span>New Time Slot</span>
					</button>
				</div>
				<div className={s.timeSlotsList}>
					{entry.timeSlots.map((slot) => (
						<TimeSlotComponent
							key={slot.id}
							slot={slot}
							isOnlySlot={entry.timeSlots.length === 1}
							onChange={(updatedSlot) => {
								onChange(
									"timeSlots",
									entry.timeSlots.map((ts) =>
										ts.id === slot.id ? updatedSlot : ts
									)
								);
							}}
							onRemove={() => {
								onChange(
									"timeSlots",
									entry.timeSlots.filter((ts) => ts.id !== slot.id)
								);
							}}
						/>
					))}
				</div>
			</section>
		</Form>
	);
}

interface WorkingScheduleProps {
	ctx: RenderFieldExtensionCtx;
}

export default function WorkingSchedule({ ctx }: WorkingScheduleProps) {
	const defaultEntry: ScheduleEntry = {
		id: generateId(ctx, "entry"),
		weekdays: [],
		timeSlots: [
			{
				id: generateId(ctx, "timeslot"),
				open: "",
				close: "",
			},
		],
	};

	const [schedules, setSchedules] = useState<ScheduleEntry[]>(() => {
		// Use helper function to support nested fields (e.g., block.schedule)
		const initial = getNestedFieldValueWithDebug(ctx.formValues, ctx.fieldPath, true);

		if (!initial) return [defaultEntry];

		// Handle both string (JSON field) and already-parsed object
		if (typeof initial === "string") {
			try {
				const parsed = JSON.parse(initial);
				if (Array.isArray(parsed)) return parsed;
				return [defaultEntry];
			} catch (_) {
				return [defaultEntry];
			}
		}

		// Already a parsed array (DatoCMS may return it pre-parsed)
		if (Array.isArray(initial)) return initial;

		return [defaultEntry];
	});

	const ctxRef = useRef(ctx);
	ctxRef.current = ctx;

	const isFirstRender = useRef(true);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		saveFieldValue(ctxRef.current, schedules);
	}, [ctx, schedules]);

	return (
		<Canvas ctx={ctx}>
			<div className={s.container}>
				<div className={s.schedulesList}>
					{schedules.map(({ id, weekdays, timeSlots }) => (
						<ScheduleEntryComponent
							key={id}
							ctx={ctx}
							entry={{ id, weekdays, timeSlots }}
							showRemove={schedules.length > 1}
							onChange={(k, v) => {
								setSchedules(
									schedules.map((schedule) =>
										schedule.id === id ? { ...schedule, [k]: v } : schedule
									)
								);
							}}
							onRemove={(id) => {
								setSchedules(schedules.filter((schedule) => schedule.id !== id));
							}}
						/>
					))}
				</div>
				<Button
					onClick={() => {
						setSchedules([
							...schedules,
							{
								id: generateId(ctx, "entry"),
								weekdays: [],
								timeSlots: [
									{
										id: generateId(ctx, "timeslot"),
										open: "",
										close: "",
									},
								],
							},
						]);
					}}
					buttonSize="s"
				>
					Add Schedule Entry
				</Button>
			</div>
		</Canvas>
	);
}

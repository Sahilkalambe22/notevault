import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Modal.css";

const ReminderModal = ({ show, initialValue, onSave, onRemove, onClose }) => {
	const [value, setValue] = useState(null);

	useEffect(() => {
		if (initialValue) {
			const d = new Date(initialValue);
			if (!Number.isNaN(d.getTime())) {
				setValue(d);
			}
		} else {
			setValue(null);
		}
	}, [initialValue, show]);

	if (!show) return null;

	return (
		<div className="modal-backdrop-custom">
			<div className="modal-card">
				<h5>⏰ Set Reminder</h5>

				<DatePicker selected={value} onChange={(date) => setValue(date)} showTimeSelect timeIntervals={5} dateFormat="dd/MM/yyyy HH:mm" className="custom-datepicker-input" />

				<div className="modal-actions">
					{initialValue && (
						<button className="settings-danger-btn" onClick={onRemove}>
							Remove
						</button>
					)}

					<button className="settings-secondary-btn" onClick={onClose}>
						Cancel
					</button>

					<button className="settings-primary-btn" disabled={!value} onClick={() => onSave(value.toISOString())}>
						Save
					</button>
				</div>
			</div>
		</div>
	);
};

export default ReminderModal;

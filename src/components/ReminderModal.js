
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Modal.css";

const ReminderModal = ({ show, initialValue, onSave, onRemove, onClose }) => {
	const [value, setValue] = useState("");

	useEffect(() => {
		if (initialValue) {
			const d = new Date(initialValue);
			if (!Number.isNaN(d.getTime())) {
				setValue(d.toISOString().slice(0, 16));
			}
		} else {
			setValue("");
		}
	}, [initialValue, show]);

	if (!show) return null;

	return (
		<div className="modal-backdrop-custom">
			<div className="modal-card">
				<h5>⏰ Set Reminder</h5>

				<DatePicker selected={value ? new Date(value) : null} onChange={(date) => setValue(date)} showTimeSelect dateFormat="dd/MM/yyyy HH:mm" className="custom-datepicker-input" />

				<div className="modal-actions">
					{initialValue && (
						<button className="settings-danger-btn" style={{ width: "auto", padding: "8px 14px" }} onClick={onRemove}>
							Remove
						</button>
					)}

					<button className="settings-secondary-btn" style={{ width: "auto", padding: "8px 14px" }} onClick={onClose}>
						Cancel
					</button>

					<button className="settings-primary-btn" style={{ width: "auto", padding: "8px 16px" }} disabled={!value} onClick={() => onSave(new Date(value).toISOString())}>
						Save
					</button>
				</div>
			</div>
		</div>
	);
};

export default ReminderModal;

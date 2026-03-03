import React from "react";
import { useNavigate } from "react-router-dom";
import "./UserHeader.css";

const UserHeader = () => {
  const navigate = useNavigate();
	const name = localStorage.getItem("name");
	const avatar = localStorage.getItem("avatar");

	if (!name) return null;

	const parsedAvatar = avatar ? avatar.split(":") : [];
	const selectedStyle = parsedAvatar[0];
	const selectedSeed = parsedAvatar[1];
  

	return (
		<div className="profile-header">
			<div className="profile-header-content">
				{/* LEFT SIDE (Avatar + Text) */}
				<div className="profile-left">
					<div className="profile-avatar" onClick={() => navigate("/settings")} style={{ cursor: "pointer" }}>{avatar ? <img src={`https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${selectedSeed}`} alt="avatar" /> : <span className="profile-avatar-letter">{name.charAt(0).toUpperCase()}</span>}</div>

					<div>
						<h1 className="profile-title">Welcome back, {name}</h1>
						<p className="profile-subtitle">Manage your notes, organize your ideas, and stay productive.</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UserHeader;

import { motion } from "framer-motion";
import { LuFileLock2 } from "react-icons/lu";

const AuthLayout = ({ mode, children }) => {
	const isLogin = mode === "login";

	return (
		<motion.div className="nv-auth-container" layout transition={{ duration: 0.6, ease: "easeInOut" }}>
			{isLogin ? (
				<>
					{/* FORM LEFT */}
					<motion.div layout className="nv-auth-right">
						{children}
					</motion.div>

					{/* BRANDING RIGHT */}
					<motion.div layout className="nv-auth-left">
						<Branding type="login" />
					</motion.div>
				</>
			) : (
				<>
					{/* BRANDING LEFT */}
					<motion.div layout className="nv-auth-left">
						<Branding type="signup" />
					</motion.div>

					{/* FORM RIGHT */}
					<motion.div layout className="nv-auth-right">
						{children}
					</motion.div>
				</>
			)}
		</motion.div>
	);
};

const Branding = ({ type }) => (
	<div className="nv-brand-content">
		<h1 className="nv-logo">
			<LuFileLock2 className="nv-logo-icon" />
			NoteVault
		</h1>

		<div className="nv-brand-divider"></div>

		{type === "login" ? <p>Welcome back. Your secure notes await.</p> : <p>Secure. Organize. Access Anywhere.</p>}

        <ul className="nv-feature-list">

<li>✔ End-to-End Security</li>

<li>✔ Cloud Sync</li>

<li>✔ Private & Encrypted</li>

</ul>
	</div>
);

export default AuthLayout;

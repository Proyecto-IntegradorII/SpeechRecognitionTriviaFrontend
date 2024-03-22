import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import myImage from "../../images/profile-default.jpg";

import {
	Navbar,
	MobileNav,
	Typography,
	Button,
	IconButton,
	Card,
	Popover,
	PopoverHandler,
	PopoverContent,
	Avatar,
	List,
	ListItem,
	ListItemPrefix,
} from "@material-tailwind/react";

export default function StickyNavbar() {
	const [openNav, setOpenNav] = React.useState(false);
	const navigate = useNavigate(); // Hook de navegación

	const name = JSON.parse(localStorage.getItem("name"));

	const email = JSON.parse(localStorage.getItem("email"));

	const [cerrarSesion, setCerrarSesion] = useState(false);

	React.useEffect(() => {
		window.addEventListener("resize", () => window.innerWidth >= 960 && setOpenNav(false));
	}, []);

	if (cerrarSesion) {
		//Limpiar toda la informacion del usuario incluido el token
		localStorage.clear();
		window.localStorage.clear(); //try this to clear all local storage
		window.location.reload();
	}

	return (
		<Navbar className="sticky top-0 z-10 h-max max-w-full rounded-none px-2 py-2 lg:px-12 lg:py-3">
			<div className="flex items-center justify-between text-blue-gray-900">
				<div className="flex items-center justify-between" onClick={() => navigate("/")}>
					<img src="/images/studia.png" alt="StudIA Logo" className="w-24 h-auto cursor-pointer" />
				</div>

				<div>
					<Popover placement="bottom-end">
						<PopoverHandler>
							{/* <Button className="bg-red-100">Contact Us</Button> */}
							<div className="flex w-max items-end round">
								<Avatar
									src="https://www.pngmart.com/files/22/User-Avatar-Profile-Download-PNG-Isolated-Image.png"
									alt="avatar"
									size="sm"
									className="rounded-full cursor-pointer"
									onClick={() => !name && navigate("/register")}
								/>
							</div>
						</PopoverHandler>

						{name ? (
							<PopoverContent className="w-72 border">
								<List className="p-0">
									{/* NAME */}
									<a
										href="#"
										className="text-initial font-bold font-medium text-blue-gray-500 py-2"
									>
										<ListItem className="font-bold">{name ? name : ""}</ListItem>
									</a>

									{/* EMAIL */}
									<a href="#" className="text-initial font-medium text-blue-gray-500 py-2">
										<ListItem>
											<ListItemPrefix className="pr-2">
												<svg
													width="20"
													height="20"
													viewBox="0 0 20 20"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														d="M2.00299 5.884L9.99999 9.882L17.997 5.884C17.9674 5.37444 17.7441 4.89549 17.3728 4.54523C17.0015 4.19497 16.5104 3.99991 16 4H3.99999C3.48958 3.99991 2.99844 4.19497 2.62717 4.54523C2.2559 4.89549 2.03259 5.37444 2.00299 5.884Z"
														fill="#90A4AE"
													/>
													<path
														d="M18 8.11798L10 12.118L2 8.11798V14C2 14.5304 2.21071 15.0391 2.58579 15.4142C2.96086 15.7893 3.46957 16 4 16H16C16.5304 16 17.0391 15.7893 17.4142 15.4142C17.7893 15.0391 18 14.5304 18 14V8.11798Z"
														fill="#90A4AE"
													/>
												</svg>
											</ListItemPrefix>
											{email ? email : ""}
										</ListItem>
									</a>

									{/* BUTTON */}
									<a href="#" className="text-initial font-medium text-blue-gray-500 py-2">
										<Button
											variant="outlined"
											size="lg"
											className="w-full rounded-lg border-2 border-black py-1 mt-2 bg-black text-white hover:drop-shadow-lg	"
											onClick={setCerrarSesion}
										>
											Cerrar sesión
										</Button>
									</a>
								</List>
							</PopoverContent>
						) : null}
					</Popover>
				</div>
			</div>
		</Navbar>
	);
}

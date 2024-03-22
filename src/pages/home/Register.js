import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postRegister } from "../../connections/requests";
import Swal from "sweetalert2";

function Register() {
	const navigate = useNavigate(); // Hook de navegación

	// Datos que se enviarán al backend
	const [formData, setFormData] = useState({
		email: "",
		name: "",
		password: "",
	});

	const [confirmedPassword, setConfirmedPassword] = useState(); // Estado para almacenar la confirmación de contraseña

	const handleSubmit = (event) => {
		event.preventDefault(); // Prevenir comportamiento de envío predeterminado
		const lowercaseEmail = formData.email.toLowerCase(); // Convertir el campo de email a minúsculas
		console.log(lowercaseEmail);

		console.log(formData); // Imprimir los datos del formulario en la consola

		if (formData["password"].length < 6) {
			// Validar longitud mínima de contraseña
			Swal.fire({
				icon: "error",
				title: "Oops...",
				text: "Password is too short",
				// customClass: {
				// 	container: "font-text", // Cambiar la fuente del título
				// },
			});
			return;
		}

		if (formData["password"] != confirmedPassword) {
			// Validar que las contraseñas coincidan
			Swal.fire({
				icon: "error",
				title: "Oops...",
				text: "Passwords are not the same",
				customClass: {
					container: "font-text", // Cambiar la fuente del título
				},
			});
			return;
		}

		if (formData["name"].length < 8) {
			// Validar longitud mínima de nombre de usuario
			Swal.fire({
				icon: "error",
				title: "Oops...",
				text: "Full name is too short",
				customClass: {
					container: "font-text", // Cambiar la fuente del título
				},
			});
			return;
		}

		if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData["email"]) == false) {
			// Validar formato de correo electrónico
			Swal.fire({
				icon: "error",
				title: "Oops...",
				text: "Email is not valid",
				customClass: {
					container: "font-text", // Cambiar la fuente del título
				},
			});
			return;
		}

		const myresponse = async () => {
			const req_succesful = await postRegister({
				...formData,
				email: lowercaseEmail,
			});
			// Realizar solicitud de registro utilizando los datos del formulario
			if (req_succesful === "Data submitted successfully") {
				// Si el registro es exitoso, mostrar una alerta de éxito y navegar a la página de inicio de sesión ("/login")
				Swal.fire({
					title: "Congrats!",
					text: "You have succesfully been registered!",
					icon: "success",
					customClass: {
						container: "font-text",
					},
				});

				//alert("Register succesful");
				navigate("/login");
			} else {
				// Si ocurre un error durante el registro, mostrar una alerta de error con el mensaje de error correspondiente
				Swal.fire({
					icon: "error",
					title: "Oops...",
					text: "Really sorry, some services aren't avaliable right now.",
					customClass: {
						container: "font-text", // Cambiar la fuente del título
					},
				});
			}
		};
		myresponse(); // Ejecutar la función asíncrona myresponse
	};

	return (
		<div className="font-text">
			{/* {showAlert && <Alert />} */}

			<div className="md:flex md:flex-row w-full ">
				{/* PARTE DERECHA */}
				<form onSubmit={handleSubmit} className="flex w-full justify-center items-center">
					<div className="flex p-4 flex-col justify-center h-full w-full max-w-md  rounded-3xl mt-8 md:bg-slate-100">
						{/* CAMPO DE EMAIL, PASSWORD, BOTON DE REGISTER */}
						<div className="flex flex-col items-center justify-center">
							<p className="font-bold text-3xl pt-6 pb-10 ">Registrarse</p>

							{/* CAMPO DE EMAIL, PASSWORD, BOTON DE LOGIN */}
							<div className="flex flex-col items-center justify-center w-full pb-2">
								<input
									id="name"
									type="text"
									className="max-w-sm w-full h-9 text-center border-2 rounded-xl focus:outline-none mb-4 focus:border-custom-rojo focus:ring-0"
									placeholder="Nombre"
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								/>
								<input
									id="email"
									type="email"
									className="max-w-sm w-full h-9 text-center border-2 rounded-xl focus:outline-none mb-4 focus:border-custom-rojo focus:ring-0"
									placeholder="E-mail"
									onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								/>
								<input
									id="password"
									type="password"
									className="max-w-sm w-full h-9 text-center border-2 rounded-xl focus:outline-none mb-4 focus:border-custom-rojo focus:ring-0"
									placeholder="Contraseña"
									onChange={(e) => setFormData({ ...formData, password: e.target.value })}
								/>
								<input
									type="password"
									className="max-w-sm w-full h-9 text-center border-2 rounded-xl focus:outline-none mb-4 focus:border-custom-rojo focus:ring-0"
									placeholder="Repetir contraseña"
									onChange={(e) => setConfirmedPassword(e.target.value)}
								/>

								<button
									id="submit"
									type="submit"
									className="max-w-sm bg-[#1b4471] text-white w-full h-9 text-center border-2 rounded-xl md:border-0 focus:outline-none "
									onSubmit={(e) => e.preventDefault()}
								>
									Registrarse
								</button>
								<button className="pt-12" onClick={() => navigate("/login")}>
									Ya tengo una cuenta
								</button>
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}

export default Register;

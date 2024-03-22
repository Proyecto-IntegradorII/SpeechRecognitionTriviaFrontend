import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postLogin } from "../../connections/requests";
import Swal from "sweetalert2";

function Login() {
	const navigate = useNavigate(); // Hook de navegación

	const [formData, setFormData] = useState({
		email: "",
		password: "",
	}); // Estado para almacenar los datos del formulario de inicio de sesión

	//MANEJAR EL LOGIN NORMAL (SIN GOOGLE)
	const handleSubmit = (event) => {
		event.preventDefault(); // Prevenir comportamiento de envío predeterminado
		const lowercaseEmail = formData.email.toLowerCase(); // Convertir el campo de email a minúsculas

		console.log(formData); // Imprimir los datos del formulario en la consola
		const myresponse = async () => {
			// Realizar solicitud de inicio de sesión utilizando los datos del formulario
			const req_succesful = await postLogin({
				...formData,
				email: lowercaseEmail,
			});

			console.log(req_succesful);
			if (req_succesful === "Inicio de sesión exitoso") {
				navigate("/home");
			} else {
				// Si las credenciales son incorrectas, mostrar una alerta de error con el mensaje de error devuelto por la solicitud
				Swal.fire({
					icon: "error",
					title: "Oops...",
					text: req_succesful,
					customClass: {
						container: "font-text",
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
							<p className="font-bold text-3xl pt-6 pb-10 ">Iniciar sesión</p>

							{/* CAMPO DE EMAIL, PASSWORD, BOTON DE LOGIN */}
							<div className="flex flex-col items-center justify-center w-full pb-2">
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

								<button
									id="submit"
									type="submit"
									className="max-w-sm bg-[#1b4471] text-white w-full h-9 text-center border-2 rounded-xl md:border-0 focus:outline-none "
									onSubmit={(e) => e.preventDefault()}
								>
									Iniciar sesión
								</button>
								<button className="pt-12" onClick={() => navigate("/register")}>
									Crear una cuenta
								</button>
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}

export default Login;

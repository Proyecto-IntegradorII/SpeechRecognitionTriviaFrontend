//ARCHIVO PARA HACER LAS SOLICITUDES HTTP
//Usar Authorization: `Bearer ${token}` en el header de los fetch

//Usar API_URL de vercel antes de hacer pull request a main para hacer el despliegue
const API_URL = "https://speech-recognition-trivia-backend.vercel.app";
//Usar la API_URL del puerto 9000 si se va a trabajar local
// const API_URL = "http://127.0.0.1:9000";

export function getAPI_URL() {
	return API_URL;
}

//Solicitud POST para el registro de usuarios
export const postRegister = async (mydata) => {
	try {
		const response = await fetch(`${API_URL}/register/user`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(mydata),
		});

		//Si se recibe una respuesta exitosa del backend
		if (response.ok) {
			console.log("Data submitted successfully");
			return "Data submitted successfully";
		} else {
			// Handle error response
			const error = await response.json();
			console.error(error);
			return "Email or Username already taken";
		}
	} catch (error) {
		console.error("Error:", error);
		return "Conection failed";
		// Handle network error
	}
};

//GET de prueba para el funcionamiento de los tokens
//Retorna los datos del usuario en consola
//Se le pasa un token
export const getPrueba = async (token) => {
	try {
		const response = await fetch(`${API_URL}/currentuser`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		});

		//Si se recibe una respuesta exitosa del backend
		if (response.ok) {
			const jsonData = await response.json();
			const { userId, email, username } = jsonData;

			// Mostrar en consola los datos del usuario obtenidos por medio del token
			console.log(userId, email, username);

			return "OK";
		} else {
			const error = await response.json();
			console.error(error);
			// Maneja la respuesta de error
			return "No se puedo obtener la informacion del usuario";
		}
	} catch (error) {
		console.error("Error:", error);
		return "Error en solicitud";
	}
};

//POST para realizar el login de los usuarios
export const postLogin = async (mydata) => {
	//Limpiar toda la informacion del usuario incluido el token
	localStorage.clear();

	window.localStorage.clear(); //try this to clear all local storage
	try {
		const response = await fetch(`${API_URL}/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				// Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(mydata),
		});

		//Si se obtiene respuesta exitosa del backend
		if (response.ok) {
			const jsonData = await response.json();
			//Obtener datos del usuario
			const { userData, message } = jsonData;

			// Obtener token de la respuesta del servidor
			const token = jsonData.token;
			//Guardar el token en localStorage
			localStorage.setItem("token", token);
			console.log("token recibido del login", token);

			//Guardar datos del usuario en localStorage
			localStorage.setItem("email", JSON.stringify(userData.email));
			localStorage.setItem("id", JSON.stringify(userData.id));
			localStorage.setItem("name", JSON.stringify(userData.name));

			return "Inicio de sesión exitoso";
		} else {
			const error = await response.json();
			console.error(error);
			// Maneja la respuesta de error
			return "Credenciales incorrectas";
		}
	} catch (error) {
		console.error("Error:", error);
		return "Error de conexión";
	}
};

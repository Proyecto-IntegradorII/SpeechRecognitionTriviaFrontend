import { useState, useEffect, useRef } from "react";
import OpenAI from "openai";
import "./index.css";
import MyAudioVisualaizer from "./pages/visualaizers/audio";
import Modal from 'react-modal'
import canvasImage from '../src/images/canvas.png'; // Import your image
import Swal from "sweetalert2";



const openai = new OpenAI({
	apiKey: process.env.REACT_APP_GPT_KEY,
	dangerouslyAllowBrowser: true,
});

function App() {
	const [messages, setMessages] = useState([]); //old

	const [machineQuestionsAndOptions, setMachineQuestionsAndOptions] = useState({})

	const [isTyping, setIsTyping] = useState(false);

	const [score, setScore] = useState(0);

	const optionADivRef = useRef(null)
	const optionBDivRef = useRef(null)
	const optionCDivRef = useRef(null)
	const optionDDivRef = useRef(null)

	const [showingNotificationDialog, setShowingNotificationDialog] = useState(false)
	const [disabledInput, setDisabledInput] = useState(false);

	const [questionsHistory, setQuestionHistory] = useState([])

	const [modalIsOpen, setModalIsOpen] = useState(false);

	const handleRecordingStopped = () => {
        closeModal(); // Cerrar modal cuando se para la grabación
    };

	const customStyles = {
		overlay: {
			backgroundColor: 'rgba(0, 0, 0, 0.5)' // Fondo oscurecido
		},
		content: {
			top: '50%', // Posicionamiento vertical en la mitad de la pantalla
			left: '50%', // Posicionamiento horizontal en la mitad de la pantalla
			right: 'auto',
			bottom: 'auto',
			marginRight: '-50%', // Centrar el contenido horizontalmente
			transform: 'translate(-50%, -50%)', // Centrar vertical y horizontalmente
			width: '25rem', // Tamaño del modal
			height: '25rem'
		}
	};

	const openModal = () => {
		setModalIsOpen(true);
	}

	const closeModal = () => {
		setModalIsOpen(false);
	}

	useEffect(() => {
		beginNewQuestion()
	}, []);


	async function getScoreFromServer(userId) {

		try {
			const response = await fetch('https://speech-recognition-trivia-backend.vercel.app/score', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ user_id: userId }),
			});

			if (!response.ok) {
				throw new Error('Error al obtener el puntaje del usuario');
			}

			const data = await response.json();
			return data.puntaje;
		} catch (error) {
			console.error('Error en la solicitud para obtener el puntaje:', error);
			// Manejar el error de acuerdo a tus necesidades
		}
	}

	// Función para actualizar el puntaje del usuario en el servidor
	async function updateScoreOnServer(newScore) {
		try {
			const response = await fetch('https://speech-recognition-trivia-backend.vercel.app/updatescore', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ score: newScore }),
				// Aquí puedes agregar cualquier otro tipo de configuración de la solicitud, como tokens de autenticación
			});

			if (!response.ok) {
				throw new Error('Error al actualizar el puntaje del usuario');
			}

			const data = await response.json();
			if (data.success) {
				console.log('Puntaje actualizado exitosamente en el servidor');
			} else {
				throw new Error('Error al actualizar el puntaje del usuario');
			}
		} catch (error) {
			console.error('Error en la solicitud para actualizar el puntaje:', error);
			// Manejar el error de acuerdo a tus necesidades
		}
	}

	// Lógica para determinar el nuevo puntaje y actualizarlo en el servidor si es necesario
	async function updateScoreIfNeeded(score) {
		try {
			const currentScore = await getScoreFromServer();
			if (score > currentScore) {
				await updateScoreOnServer(score);
			}
		} catch (error) {
			console.error('Error en la actualización del puntaje:', error);
			// Manejar el error de acuerdo a tus necesidades
		}
	}

	//asks chatgpt for a json question, 4 options, and 1 answer
	async function beginNewQuestion() {

		setIsTyping(true);
		const completion = await openai.chat.completions
			.create({
				model: "gpt-3.5-turbo",
				messages: [{
					content: `
						Quiero hacer un juego de quien quiere ser millonario, 
						y necesito un json que contenga 6 keys: question, optionA, optionB, optionC, optionD, answer.
						En la key: question, el value será una pregunta, la pregunta que se le hará al usuario.
						En las keys: optionA, optionB, optionC, optionD, tendran las opciones, una de ellas y solo una será la correcta.
						En la key: answer, irá uno de los cuatro valores: A, B, C, D. Que indicará cual de las 4 opciones es la correcta.
						Tambien quiero que retornes una pregunta diferente a las que ya has formulado antes, aqui esta el historial
						de lo que ya se ha tenido y lo cual no se quiere que lo vuelvas a retornar: ${questionsHistory}.
						Ejemplo de lo que quiero que retornes:
						{
							"question": "¿Cuando se descubrió america?",
							"optionA": "A. En 1944",
							"optionB": "B. En 1942",
							"optionC": "C. En 1943",
							"optionD": "D. En 1300",
							"answer": "A"
						}
					`
					,
					role: "user",
				}],
			})
			.then((response) => {
				const data = JSON.parse(response.choices[0].message.content.replace(/\n/g, ''))

				setMachineQuestionsAndOptions(data);//current question and info
				setIsTyping(false);

				setQuestionHistory(...questionsHistory, JSON.stringify(data))

			});
	}
	let instructions = {}
	//Once the user submits the answer, show that message in screen, ask chatgpt to check if it 
	//is correct, show it in screen, wait one second, convert chatgpt's answer to boolean, and finally
	//animate the correct and the incorrects answers and do a pop up with the respective message 
	const handleSubmit = async (e) => {
		e.preventDefault();

		const userResponse = e.target[0].value;
		let content;

		instructions = {
			content: `
				Esto es un juego de quien quiere ser millonario.
				Quiero que leas el texto al final de este texto que te voy a dar en donde esta: la pregunta que 
				se le hizo al usario, cuatro opciones, 3 de las cuales están mal, y 1 la cual es correcta. Quiero que 
				retornes un mensaje con la palabra  Felicitaciones si la respuesta del usuario significa la opcion 
				correcta en la informacion que te voy a dar pero de lo contrario, retorna un mensaje con la palabra Incorrecto.
				Por supuesto, el mensaje si la respuesta es correcta no puede tener la palabra Incorrecto
				y el mensaje si la respuesta es negativa no puede tener la palabra Felicitaciones. 
				Finalmente, en la key llamada question esta la pregunta que se le hizo al usuario,
				en las key optionA, optionB, optionC, optionD estan las cuatro opcines dadas al usuario (A;B;C;D respectivamente)
				y por ultimo, la key llamada answer contiene la respuesta de la pregunta. 
				Tu trabajo tambien es determinar si la respuesta del usuario se refiere a la respuesta correcta.
				Es importante que tu respuesta debe de ser similar a la respuesta que daria un presentador de un show, 
				mas especificamente deberias responder como si estuvieras presentando quien quiere ser millonario.
				No uses la palabra ganar o sus derivados como ganado, o ganaste.
				Acontinuacion esta la informacion.
				Aqui esta toda la info que necesitas:
				${JSON.stringify(machineQuestionsAndOptions)}.	
				Esta es la respuesta del usuario: ${userResponse}.		`,
			role: "assistant"
		}

		content = userResponse;
		const newMessage = {
			content: content,
			role: "user",
		};


		const newMessages = [...messages, newMessage];

		setMessages(newMessages);
		setIsTyping(true);
		e.target.reset();
		console.log(newMessages);


		//check user's respond to a question
		const completion = await openai.chat.completions
			.create({
				model: "gpt-3.5-turbo",
				messages: [...newMessages, instructions],
			})
			.then((response) => {
				//userResponse and chatgpt's message, 
				const updatedMessages = [...newMessages, response.choices[0].message];
				setMessages(updatedMessages);
				setIsTyping(false);

				//inhabilitate the input, after one second, show the colors in the questions, after
				//second show a pop up, and after 3 seconds, show the next question
				setDisabledInput(true)//inahbilitate the input temporarily
				if (
					response.choices[0].message.content.includes('Felicidad') ||
					response.choices[0].message.content.includes('felicidad') ||
					response.choices[0].message.content.includes('Felicita') ||
					response.choices[0].message.content.includes('felicita')) {
					// Introduce a delay of 3 seconds

					let newScore = score
					if (score === 0) {
						console.log("jejeje")
						newScore = score + 1500000;
					}
					else if (score === 1500000) {
						newScore = score + 2000000
					}
					else {
						newScore = score + 2500000
						const userId = localStorage.getItem("id");
						if (userId) {
							updateScoreOnServer(newScore);
						}
					}

					setScore(newScore);

					console.log(score);
					setTimeout(() => {



						Swal.fire({
							title: "Respuesta Correcta",
							text: `Pasas a ganar: $${newScore}`,
							icon: "success",
							customClass: {
								container: "font-text",

							},
							confirmButtonText: 'Next question',
							cancelButtonText: 'End game'
						}).then((result) => {
							if (result.isConfirmed) {
								setMachineQuestionsAndOptions({})//POSSIBLE BUG
								beginNewQuestion()
								setDisabledInput(false)//habilitate the input again
								setMessages([])
							} else {
								window.location.href = '/leaderboard';
							}
						});
					}, 3000)
				} else {
					/*	const userId = localStorage.getItem("id");
							if (userId) {
								updateScoreIfNeeded(score);
							}*/
					// Introduce a delay of 3 seconds
					setTimeout(() => {
						Swal.fire({
							title: "Perdiste",
							text: "Terminaste el juego con: ",
							icon: "error",
							customClass: {
								container: "font-text",
							},
							confirmButtonText: 'Go to leaderboard ->'
						}).then((result) => {
							window.location.href = '/leaderboard';
						});
					}, 3000)
				}
			});
	};

	return (
		<section className="container bg-white mx-auto p-5 mt-12 xl:px-64 fixed inset-0">
			<div className="items-center  bg-white w-full h-full flex flex-col">
				<div className="gap-4 bg-white-200 p-0 pb-8 flex-grow overflow-auto xl:w-[800px]">

					<div className="w-full mt-4 h-auto bg-white justify-center  flex">
						<img src={canvasImage} alt="Canvas image" className="w-auto mt-4 h-auto p-8" />
					</div>
					{(machineQuestionsAndOptions) &&
						<div>
							<div className="rounded-lg bg-blue-200 p-4">
								<div dangerouslySetInnerHTML={{ __html: machineQuestionsAndOptions["question"] }}></div>
							</div>
							<div className="grid grid-cols-2 gap-4 mt-4">
								<div className="rounded-lg bg-blue-200 p-4 mt-0 w-5/5 ">
									<div ref={optionADivRef} dangerouslySetInnerHTML={{ __html: machineQuestionsAndOptions["optionA"] }}></div>

								</div>
								<div className="rounded-lg bg-blue-200 p-4 mt-0 w-5/5 ">
									<div ref={optionBDivRef} dangerouslySetInnerHTML={{ __html: machineQuestionsAndOptions["optionB"] }}></div>

								</div>
								<div className="rounded-lg bg-blue-200 p-4 mt-0 w-5/5 ">
									<div ref={optionCDivRef} dangerouslySetInnerHTML={{ __html: machineQuestionsAndOptions["optionC"] }}></div>

								</div>
								<div className="rounded-lg bg-blue-200 p-4 mt-0 w-5/5 ">
									<div ref={optionDDivRef} dangerouslySetInnerHTML={{ __html: machineQuestionsAndOptions["optionD"] }}></div>

								</div>
							</div>
						</div>
					}
					<div className="p-0 pt-4 pb-8 flex-grow overflow-auto">
						{messages &&
							messages.map((msg, i) => {
								return (
									<div
										className={`chat ${msg.role === "assistant" ? "chat-start" : "chat-end"}`}
										key={"chatKey" + i}>
										<div className="chat-image avatar">
											<div className="w-10 rounded-full">
												<img
													src={msg.role === "assistant" ? "/images/logo.png " : "/images/person.png"}
												/>
											</div>
										</div>
										<div className="chat-bubble bg-blue-200">
											<div dangerouslySetInnerHTML={{ __html: msg.content }}></div>
										</div>
									</div>
								);
							})
						}
					</div>
				</div>

				<form className="form-control xl:w-[800px] md:w-full sm:w-full m-5 items-center bg-white" onSubmit={(e) => handleSubmit(e)}>
					<div className="input-group max-w-full xl:w-[800px] md:w-full sm:w-full relative ">
						{isTyping && (
							<small className="absolute -top-5 left-0.5 animate-pulse">
								Nuestro presentator bot está procesando...
							</small>
						)}

						<input
							id="input"
							type="text"
							disabled={disabledInput}
							placeholder="Presiona el mic para hablar"
							className="input input-bordered flex-grow"
							style={{
								border: '1px solid black', // Set border for all sides
								borderRight: 'none', // Remove right border
								borderTopLeftRadius: '8px',
								borderBottomLeftRadius: '8px',
							}} required
						/>
						<button className="btn btn-square" style={{ borderRadius: '0px', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', border: '1px solid black' }} type="submit">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-6 w-6"
								fill="currentColor"
								viewBox="0 0 16 16"
							>
								<path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
							</svg>
						</button>

						<MyAudioVisualaizer/>

					</div>
				</form>
			</div>
		</section>
	);
}

export default App;

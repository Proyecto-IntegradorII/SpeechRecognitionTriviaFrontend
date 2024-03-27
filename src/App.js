import { useState, useEffect } from "react";
import OpenAI from "openai";
import MyAudioVisualaizer from "./pages/visualaizers/audio";
import canvasImage from '../src/images/canvas.jpg'; // Import your image

const openai = new OpenAI({
	apiKey: process.env.REACT_APP_GPT_KEY,
	dangerouslyAllowBrowser: true,
});

function App() {
	const [messages, setMessages] = useState([]); //old

	const [userAnswer, setUserAnswer] = useState("") //users responde to current question
	const [machineQuestionsAndOptions, setMachineQuestionsAndOptions] = useState({})

	const [isTyping, setIsTyping] = useState(false);
	const [step, setStep] = useState(1);

	useEffect(() => {
		setMachineQuestionsAndOptions({
			question: "Delete this, hard coded question Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias desde el año 1500, cuando un impresor (N. del T. persona que se dedica a la imprenta) desconocido usó una galería de textos y los mezcló de tal manera que logró hacer un libro de textos especimen.",
			optionA: "A. ",
			optionB: "B. ",
			optionC: "C. ",
			optionD: "D. "
		})

	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();

		const userResponse = e.target[0].value;
		let content;

		if (step === 1) {
			content = `${userResponse}<div style="display: none;">De ahora en adelante vamos a estudiar lo que te dije de forma que harás una pregunta respecto al tema que te dije con 4 opciones de respuesta ENUMERADAS (no de a,b,c,d SOLAMENTE 1,2,3 y 4) donde cada opción enumerada empiece con un <br/>, por ejemplo: "*pregunta*, escoja la opción correcta: <br/>1. Opción1<br/>2. Opción2<br/>3. Opción3. Cuando te responda, en caso de que haya acertado, me felicitas y complementas la respuesta, si no acerté, justificas porqué la respuesta que escogí es incorrecta y me animas a seguir. Al final me haces una nueva pregunta de opción multiple tal cual como la anterior pero a partir de ahora la pregunta inicia con un <br/> (esto es solo para aplicar un salto de linea entre el feedback de la respuesta de la pregunta anterior con la pregunta nueva)`;
			setStep(2);
		} else {
			// Handle other cases if needed
			content = userResponse;
		}

		const newMessage = {
			content: content,
			role: "user",
		};

		const newMachineQuestionsAndOptions = {
			question: "delete this",
			optionA: "A. ",
			optionB: "B. ",
			optionC: "C. ",
			optionD: "D. "
		}

		const newMessages = [...messages, newMessage];
		setMachineQuestionsAndOptions(newMachineQuestionsAndOptions)
		setMessages(newMessages);
		setIsTyping(true);
		e.target.reset();
		console.log(newMessages);

		const completion = await openai.chat.completions
			.create({
				model: "gpt-3.5-turbo",
				messages: [...newMessages],
			})
			.then((response) => {
				const updatedMessages = [...newMessages, response.choices[0].message];
				setMessages(updatedMessages);
				setIsTyping(false);
				const userId = localStorage.getItem("id");

				if (userId) {
					try {
						// Enviar el nuevo mensaje al backend para actualizar la base de datos
						const response = fetch(`https://studia-backend.vercel.app/savechat`, {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								user_id: userId,
								conversation: updatedMessages, // Envía toda la conversación actualizada
							}),
						});

						if (!response.ok) {
							console.error(
								"Error al guardar el mensaje en la base de datos:",
								response.statusText
							);
						}
					} catch (error) {
						console.error("Error al enviar el mensaje al backend:", error);
					}
				}
			});
	};

	return (
		<section className="container bg-white mx-auto p-5 mt-12 xl:px-64 fixed inset-0">
			<div className="items-center  bg-white w-full h-full flex flex-col">
				<div className="w-full mt-4 h-auto bg-white justify-center  flex">
					<img src={canvasImage} alt="Canvas image" className="w-auto mt-4 h-auto p-8" />
				</div>

				<div className="bg-yellow-200 p-0 pb-8 flex-grow overflow-auto w-[800px]">
					{(true) &&

							<div className="rounded-lg bg-blue-200 p-4">
								<div dangerouslySetInnerHTML={{ __html: machineQuestionsAndOptions["question"] }}></div>
							</div>
						}

				</div>

				<form className="form-control m-5 items-center" onSubmit={(e) => handleSubmit(e)}>
					<div className="input-group max-w-full w-[800px] relative bg-blue-50">
						{isTyping && (
							<small className="absolute -top-5 left-0.5 animate-pulse">
								Nuestro presentator bot está procesando...
							</small>
						)}

						<input
							type="text"
							placeholder="Presiona el mic para hablar"
							className="input input-bordered flex-grow"
							style={{

								border: '1px solid black', // Set border for all sides
								borderRight: 'none', // Remove right border
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
						<button className="btn btn-square" type="submit" style={{ border: 'none' }}>
							<svg width="30px" height="30px" viewBox="-7.2 0 30 30" id="_19_-_Microphone" data-name="19 - Microphone" xmlns="http://www.w3.org/2000/svg">
								<path id="Path_254" data-name="Path 254" d="M21.182,4a3,3,0,0,0-3-3H13.818a3,3,0,0,0-3,3V22.038a3,3,0,0,0,3,3h4.364a3,3,0,0,0,3-3Zm-2,0V22.038a1,1,0,0,1-1,1H13.818a1,1,0,0,1-1-1V4a1,1,0,0,1,1-1h4.364a1,1,0,0,1,1,1Z" transform="translate(-8.2 -1)" fillRule="evenodd" />
								<path id="Path_255" data-name="Path 255" d="M8.2,17.186V21.7a5.779,5.779,0,0,0,5.533,5.992h4.534A5.779,5.779,0,0,0,23.8,21.7V17.186a1,1,0,0,0-2,0V21.7a3.781,3.781,0,0,1-3.533,3.992H13.733A3.781,3.781,0,0,1,10.2,21.7V17.186a1,1,0,0,0-2,0Z" transform="translate(-8.2 -1)" fillRule="evenodd" />
								<path id="Path_256" data-name="Path 256" d="M20.182,29H11.818a1,1,0,1,0,0,2h8.364a1,1,0,0,0,0-2Z" transform="translate(-8.2 -1)" fillRule="evenodd" />
								<path id="Path_257" data-name="Path 257" d="M15,26.691V30a1,1,0,0,0,2,0V26.691a1,1,0,0,0-2,0Z" transform="translate(-8.2 -1)" fillRule="evenodd" />
							</svg>

						</button>
					</div>
				</form>
			</div>
		</section>
	);
}

export default App;

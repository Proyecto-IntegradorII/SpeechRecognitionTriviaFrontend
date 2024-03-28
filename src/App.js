import { useState, useEffect, useRef } from "react";
import OpenAI from "openai";
import "./index.css";
import MyAudioVisualaizer from "./pages/visualaizers/audio";
import canvasImage from '../src/images/canvas.png'; // Import your image
import { NotificationDialog } from "./components/NotificationDialog";
import { DialogWithForm } from "./components/DialogWithForm";
const openai = new OpenAI({
	apiKey: process.env.REACT_APP_GPT_KEY,
	dangerouslyAllowBrowser: true,
});

function App() {
	const [messages, setMessages] = useState([]); //old

	const [machineQuestionsAndOptions, setMachineQuestionsAndOptions] = useState({})

	const [isTyping, setIsTyping] = useState(false);

	const optionADivRef = useRef(null)
	const optionBDivRef = useRef(null)
	const optionCDivRef = useRef(null)
	const optionDDivRef = useRef(null)

	const [showingNotificationDialog, setShowingNotificationDialog] = useState(false)
	const [disabledInput, setDisabledInput] = useState(false);


	useEffect(() => {
		beginNewQuestion()
	}, []);

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
				console.log(response.choices[0].message)
				console.log(response.choices[0].message.content)
				console.log(data)
				setMachineQuestionsAndOptions(data);
				setIsTyping(false);
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
				Es importante que tu respuesta debe de ser similar a la respuesta que daria un presentador de un show, 
				mas especificamente deberias responder como si estuvieras presentando quien quiere ser millonario.
				Acontinuacion esta la informacion.
				Aqui esta toda la info que necesitas:
				${JSON.stringify(machineQuestionsAndOptions)}	
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
				setShowingNotificationDialog(true)
			});


	};

	return (
		<section className="container bg-white mx-auto p-5 mt-12 xl:px-64 fixed inset-0">
			<div className="items-center  bg-white w-full h-full flex flex-col">
				<div className="gap-4 bg-white-200 p-0 pb-8 flex-grow overflow-auto xl:w-[800px]">
					{showingNotificationDialog &&					
						<NotificationDialog/>
					}
					<DialogWithForm> </DialogWithForm>
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
							id = "input"
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
						<button id="microphone" className="btn btn-square" type="submit" style={{ border: 'none' }}>
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

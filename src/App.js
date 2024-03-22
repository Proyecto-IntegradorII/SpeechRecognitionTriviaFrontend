import { useState, useEffect } from "react";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.REACT_APP_GPT_KEY,
	dangerouslyAllowBrowser: true,
});

function App() {
	const [messages, setMessages] = useState([]);

	const [isTyping, setIsTyping] = useState(false);
	const [step, setStep] = useState(1);

	useEffect(() => {
		// Verifica si el usuario está logeado
		const userId = localStorage.getItem("id");
		if (userId) {
			// Si está logeado, obtén el historial de chat
			fetch(`https://studia-backend.vercel.app/getchat/${userId}`)
				.then((response) => response.json())
				.then((data) => {
					if (data.success) {
						setMessages(data.data);
						console.log(data.data);
					}
				})
				.catch((error) => console.error("Error al obtener historial de chat:", error));
		}

		if (messages.length === 0) {
			setMessages([
				{
					content: "Hola! ¿Sobre qué quieres estudiar hoy?",
					role: "assistant",
				},
			]);
		}
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

		const newMessages = [...messages, newMessage];
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
			<div className="  bg-white w-full h-full flex flex-col">
				<div className="p-5 pb-8 flex-grow overflow-auto">
					{messages.length &&
						messages.map((msg, i) => {
							return (
								<div
									className={`chat ${msg.role === "assistant" ? "chat-start" : "chat-end"}`}
									key={"chatKey" + i}
								>
									<div className="chat-image avatar">
										<div className="w-10 rounded-full">
											<img
												src={msg.role === "assistant" ? "/images/ai-bot.jpg" : "/images/person.png"}
											/>
										</div>
									</div>
									<div className="chat-bubble bg-blue-200">
										<div dangerouslySetInnerHTML={{ __html: msg.content }}></div>
									</div>
								</div>
							);
						})}
				</div>

				<form className="form-control m-5 items-center" onSubmit={(e) => handleSubmit(e)}>
					<div className="input-group max-w-full w-[800px] relative">
						{isTyping && (
							<small className="absolute -top-5 left-0.5 animate-pulse">
								Nuestro studIA bot está escribiendo...
							</small>
						)}

						<input
							type="text"
							placeholder="Escribe un tema y te ayudaré a estudiarlo"
							className="input input-bordered flex-grow"
							required
						/>
						<button className="btn btn-square" type="submit">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-6 w-6"
								fill="currentColor"
								viewBox="0 0 16 16"
							>
								<path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
							</svg>
						</button>
					</div>
				</form>
			</div>
		</section>
	);
}

export default App;

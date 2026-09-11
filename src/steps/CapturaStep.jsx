import { useEffect, useRef, useState } from "react";
import { Topo, Titulo, TituloForte, Subtitulo, Botao, BotaoLinha, BotaoTexto } from "../components/Base.jsx";
import Silhueta from "../components/Silhueta.jsx";
import { useQuiz } from "../state/QuizContext.jsx";
import { warmupBodyDetector } from "../lib/poseDetection.js";
import { arquivoParaDataUrl } from "../lib/bodyDrawing.js";

const MARCADORES = [
  { texto: "Queixo", emoji: "💫", estilo: { top: "6%", right: -18 } },
  { texto: "Braço", emoji: "💪", estilo: { top: "28%", left: -26 } },
  { texto: "Cintura", emoji: "📏", estilo: { top: "46%", right: -30 } },
  { texto: "Abdômen", emoji: "🎯", estilo: { top: "62%", left: -34 } },
];

export default function CapturaStep() {
  const { etapa, definir, avancar } = useQuiz();
  const [modo, setModo] = useState("inicio"); // inicio | camera
  const [erroCamera, setErroCamera] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const inputRef = useRef(null);

  // começa a baixar os modelos agora: quando a foto chegar, o scan já encontra
  // tudo em cache e a análise não fica esperando download
  useEffect(() => {
    warmupBodyDetector();
    return () => pararCamera();
  }, []);

  function pararCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function abrirCamera() {
    setErroCamera("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setErroCamera("Este navegador não libera a câmera. Envie uma foto da galeria.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setModo("camera");
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch (err) {
      setErroCamera(
        `Não consegui acessar a câmera (${err.name === "NotAllowedError" ? "permissão negada" : "indisponível"}). Envie uma foto da galeria.`,
      );
      setModo("inicio");
    }
  }

  function capturar() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 960;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    pararCamera();
    definir({ fotoUrl: canvas.toDataURL("image/jpeg", 0.92) });
    avancar();
  }

  async function usarArquivo(file) {
    if (!file) return;
    definir({ fotoUrl: await arquivoParaDataUrl(file) });
    avancar();
  }

  /** Sem foto o funil não trava: segue com o traçado genérico. */
  function pular() {
    definir({ fotoUrl: null });
    avancar();
  }

  if (modo === "camera") {
    return (
      <>
        <Topo voltar={false} />
        <Titulo>Enquadre o corpo inteiro</Titulo>
        <Subtitulo>De frente, em pé, com os braços levemente afastados do tronco.</Subtitulo>
        <div className="camera-caixa">
          <video ref={videoRef} autoPlay playsInline muted />
        </div>
        <div className="espaco" />
        <div className="dupla">
          <BotaoLinha
            onClick={() => {
              pararCamera();
              setModo("inicio");
            }}
          >
            Cancelar
          </BotaoLinha>
          <Botao onClick={capturar}>📸 Capturar</Botao>
        </div>
      </>
    );
  }

  return (
    <>
      <Topo />
      <TituloForte>{etapa.tituloForte}</TituloForte>
      <Subtitulo>{etapa.subtitulo}</Subtitulo>

      <div style={{ position: "relative", width: 200, margin: "10px auto 6px" }}>
        <Silhueta />
        {MARCADORES.map((m, i) => (
          <div key={m.texto} className="marcador" style={{ ...m.estilo, animationDelay: `${0.2 + i * 0.12}s` }}>
            <span>{m.emoji}</span>
            <span>{m.texto}</span>
          </div>
        ))}
      </div>

      <p className="nota-privacidade">
        A análise roda <strong>dentro do seu celular</strong>. A foto não é enviada para nenhum servidor e não fica
        salva em lugar nenhum.
      </p>

      {erroCamera && <p className="erro-texto">{erroCamera}</p>}

      <div className="espaco" />

      <Botao onClick={abrirCamera}>
        Tirar foto agora
      </Botao>
      <div style={{ height: 10 }} />
      <BotaoLinha onClick={() => inputRef.current?.click()}>Enviar foto da galeria</BotaoLinha>
      <BotaoTexto onClick={pular}>Prefiro não enviar foto</BotaoTexto>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="entrada-oculta"
        onChange={(e) => usarArquivo(e.target.files?.[0])}
      />
    </>
  );
}

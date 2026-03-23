import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

function App() {
  const [exames, setExames] = useState([]);
  const [animal, setAnimal] = useState("");
  const [tutor, setTutor] = useState("");
  const [veterinario, setVeterinario] = useState("");

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [user, setUser] = useState(null);

  const auth = getAuth();

  // 🔐 LOGIN
  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
    } catch (err) {
      alert("Erro no login");
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    onAuthStateChanged(auth, (usuario) => {
      setUser(usuario);
    });
  }, [auth]);

  // 🔄 carregar exames
  const carregarExames = async () => {
    const snapshot = await getDocs(collection(db, "exames"));
    const lista = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setExames(lista);
  };

  useEffect(() => {
    if (user) carregarExames();
  }, [user]);

  // ➕ criar exame
  const criarExame = async () => {
    await addDoc(collection(db, "exames"), {
      animal,
      tutor,
      veterinario,
      status: "em_analise",
      resultado: "",
      pdf: "",
    });

    setAnimal("");
    setTutor("");
    setVeterinario("");
    carregarExames();
  };

  // 📎 upload PDF (simulado)
  const uploadPDF = async (id, file) => {
    if (!file) return;

    const url = URL.createObjectURL(file);

    await updateDoc(doc(db, "exames", id), {
      pdf: url,
    });

    carregarExames();
  };

  // ✅ finalizar
  const finalizarExame = async (id, resultado, pdf) => {
    if (!pdf) {
      alert("Envie o PDF antes!");
      return;
    }

    await updateDoc(doc(db, "exames", id), {
      status: "finalizado",
      resultado,
    });

    carregarExames();
  };

  // ❌ excluir
  const excluirExame = async (id) => {
    await deleteDoc(doc(db, "exames", id));
    carregarExames();
  };

  // 🔐 TELA LOGIN
  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Login</h2>

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Senha"
          onChange={(e) => setSenha(e.target.value)}
        />
        <br />
        <button onClick={login}>Entrar</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Sistema de Exames</h1>

      <button onClick={logout}>Sair</button>

      <hr />

      {/* LAB */}
      {user.email.includes("laboratorio") && (
        <>
          <h2>Cadastrar Exame</h2>

          <input
            placeholder="Animal"
            value={animal}
            onChange={(e) => setAnimal(e.target.value)}
          />
          <br />
          <input
            placeholder="Tutor"
            value={tutor}
            onChange={(e) => setTutor(e.target.value)}
          />
          <br />
          <input
            placeholder="Veterinário"
            value={veterinario}
            onChange={(e) => setVeterinario(e.target.value)}
          />
          <br />
          <button onClick={criarExame}>Cadastrar</button>
        </>
      )}

      <hr />

      <h2>Exames</h2>

      {exames.map((exame) => {
        let resultadoTemp = exame.resultado || "";

        return (
          <div key={exame.id} className="card">
            <p><b>Animal:</b> {exame.animal}</p>
            <p><b>Tutor:</b> {exame.tutor}</p>
            <p><b>Veterinário:</b> {exame.veterinario}</p>
            <p><b>Status:</b> {exame.status}</p>

            {/* LAB */}
            {user.email.includes("laboratorio") && (
              <>
                <textarea
                  defaultValue={exame.resultado}
                  onChange={(e) => (resultadoTemp = e.target.value)}
                />

                <br />

                <input
                  type="file"
                  onChange={(e) =>
                    uploadPDF(exame.id, e.target.files[0])
                  }
                />

                <br /><br />

                <button
                  onClick={() =>
                    finalizarExame(exame.id, resultadoTemp, exame.pdf)
                  }
                >
                  Finalizar
                </button>

                <br /><br />

                <button
                  style={{ background: "red", color: "white" }}
                  onClick={() => excluirExame(exame.id)}
                >
                  Excluir
                </button>
              </>
            )}

            {/* RECEPÇÃO */}
            {user.email.includes("recepcao") &&
              exame.status === "finalizado" && (
                <>
                  {exame.pdf ? (
                    <>
                      <a href={exame.pdf} target="_blank" rel="noreferrer">
                        📄 Abrir PDF
                      </a>

                      <br /><br />

                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `Olá ${exame.tutor}, seu exame de ${exame.animal} está pronto: ${exame.pdf}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        📲 WhatsApp
                      </a>
                    </>
                  ) : (
                    <p>⚠️ Sem PDF</p>
                  )}
                </>
              )}

            {/* VET */}
            {user.email.includes("vet") && (
              <>
                <p><b>Resultado:</b> {exame.resultado}</p>

                {exame.pdf && (
                  <a href={exame.pdf} target="_blank" rel="noreferrer">
                    📄 Ver PDF
                  </a>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default App;
import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [exames, setExames] = useState([]);

  const [tutor, setTutor] = useState("");
  const [veterinario, setVeterinario] = useState("");

  // LOGIN
  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
    } catch (err) {
      alert(err.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  // OBSERVA LOGIN
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuario) => {
      setUser(usuario);
      if (usuario) carregarExames();
    });

    return () => unsubscribe();
  }, []);

  // CARREGAR EXAMES
  const carregarExames = async () => {
    const snapshot = await getDocs(collection(db, "exames"));
    const lista = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setExames(lista);
  };

  // CRIAR EXAME
  const criarExame = async () => {
    if (!tutor || !veterinario) {
      alert("Preencha tudo");
      return;
    }

    await addDoc(collection(db, "exames"), {
      tutor,
      veterinario,
      status: "aguardando",
      pdf: ""
    });

    setTutor("");
    setVeterinario("");
    carregarExames();
  };

  // UPLOAD PDF (BASE64)
  const uploadPDF = async (id, file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64 = reader.result;

      await updateDoc(doc(db, "exames", id), {
        pdf: base64,
        status: "finalizado"
      });

      carregarExames();
    };
  };

  // ABRIR PDF
  const abrirPDF = (base64) => {
    if (!base64) {
      alert("Sem PDF");
      return;
    }

    const link = document.createElement("a");
    link.href = base64;
    link.download = "exame.pdf";
    link.click();
  };

  // LOGIN TELA
  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Login</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <br /><br />

        <button onClick={login}>Entrar</button>
      </div>
    );
  }

  // SISTEMA
  return (
    <div style={{ padding: 20 }}>
      <h2>Sistema Laboratório</h2>

      <button onClick={logout}>Sair</button>

      <hr />

      <h3>Novo Exame</h3>

      <input
        placeholder="Tutor"
        value={tutor}
        onChange={(e) => setTutor(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Veterinário"
        value={veterinario}
        onChange={(e) => setVeterinario(e.target.value)}
      />
      <br /><br />

      <button onClick={criarExame}>Cadastrar</button>

      <hr />

      <h3>Exames</h3>

      {exames.map((exame) => (
        <div key={exame.id} style={{ marginBottom: 15 }}>
          <p><b>Tutor:</b> {exame.tutor}</p>
          <p><b>Veterinário:</b> {exame.veterinario}</p>
          <p><b>Status:</b> {exame.status}</p>

          <input
            type="file"
            accept="application/pdf"
            onChange={(e) =>
              uploadPDF(exame.id, e.target.files[0])
            }
          />

          <br /><br />

          <button onClick={() => abrirPDF(exame.pdf)}>
            Ver PDF
          </button>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;
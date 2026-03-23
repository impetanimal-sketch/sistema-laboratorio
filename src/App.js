import { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [tutor, setTutor] = useState("");
  const [veterinario, setVeterinario] = useState("");
  const [animal, setAnimal] = useState("");

  const [exames, setExames] = useState([]);

  // LOGIN
  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
    } catch {
      alert("Erro no login");
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) carregarExames();
    });
  }, []);

  // CARREGAR
  const carregarExames = async () => {
    const snapshot = await getDocs(collection(db, "exames"));
    const lista = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setExames(lista);
  };

  // CRIAR EXAME (RECEPÇÃO)
  const criarExame = async () => {
    await addDoc(collection(db, "exames"), {
      tutor,
      veterinario,
      animal,
      status: "aguardando",
      pdf: ""
    });

    setTutor("");
    setVeterinario("");
    setAnimal("");

    carregarExames();
  };

  // LABORATÓRIO (ANEXAR PDF)
  const uploadPDF = async (id, file) => {
    if (!file) return;

    const url = URL.createObjectURL(file);

    await updateDoc(doc(db, "exames", id), {
      pdf: url
    });

    carregarExames();
  };

  // FINALIZAR
  const finalizar = async (id) => {
    await updateDoc(doc(db, "exames", id), {
      status: "finalizado"
    });

    carregarExames();
  };

  // WHATSAPP
  const enviarWhats = (exame) => {
    const mensagem = `Exame pronto\nTutor: ${exame.tutor}\nLink: ${exame.pdf}`;
    const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
  };

  // LOGIN
  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Login</h2>
        <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <br /><br />
        <input type="password" placeholder="Senha" onChange={e => setSenha(e.target.value)} />
        <br /><br />
        <button onClick={login}>Entrar</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <button onClick={logout}>Sair</button>

      <h2>Recepção</h2>

      <input placeholder="Tutor" value={tutor} onChange={e => setTutor(e.target.value)} />
      <br /><br />
      <input placeholder="Veterinário" value={veterinario} onChange={e => setVeterinario(e.target.value)} />
      <br /><br />
      <input placeholder="Animal" value={animal} onChange={e => setAnimal(e.target.value)} />
      <br /><br />

      <button onClick={criarExame}>Cadastrar</button>

      <hr />

      <h2>Exames</h2>

      {exames.map((exame) => (
        <div key={exame.id}>
          <p><b>Tutor:</b> {exame.tutor}</p>
          <p><b>Veterinário:</b> {exame.veterinario}</p>
          <p><b>Animal:</b> {exame.animal}</p>
          <p><b>Status:</b> {exame.status}</p>

          <input type="file" onChange={(e) => uploadPDF(exame.id, e.target.files[0])} />

          <br /><br />

          <button onClick={() => finalizar(exame.id)}>
            Finalizar
          </button>

          <button onClick={() => enviarWhats(exame)}>
            WhatsApp
          </button>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;
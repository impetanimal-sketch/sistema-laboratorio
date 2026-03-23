import { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  getDocs
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

  const [arquivo, setArquivo] = useState(null);
  const [exames, setExames] = useState([]);

  // LOGIN
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

  // VERIFICAR USUARIO
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) carregarExames();
    });
  }, []);

  // CADASTRAR EXAME
  const cadastrarExame = async () => {
    if (!arquivo) {
      alert("Selecione um PDF");
      return;
    }

    // converter arquivo para base64
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64 = reader.result;

      await addDoc(collection(db, "exames"), {
        tutor,
        veterinario,
        animal,
        pdf: base64,
        status: "finalizado"
      });

      alert("Exame cadastrado!");

      setTutor("");
      setVeterinario("");
      setAnimal("");
      setArquivo(null);

      carregarExames();
    };

    reader.readAsDataURL(arquivo);
  };

  // CARREGAR EXAMES
  const carregarExames = async () => {
    const snapshot = await getDocs(collection(db, "exames"));
    const lista = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setExames(lista);
  };

  // BAIXAR PDF (FUNCIONA NO CELULAR)
  const baixarPDF = (base64) => {
    const link = document.createElement("a");
    link.href = base64;
    link.download = "exame.pdf";
    link.click();
  };

  // TELA LOGIN
  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Login</h2>

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />

        <input
          type="password"
          placeholder="Senha"
          onChange={(e) => setSenha(e.target.value)}
        />
        <br /><br />

        <button onClick={login}>Entrar</button>
      </div>
    );
  }

  // TELA PRINCIPAL
  return (
    <div style={{ padding: 20 }}>
      <button onClick={logout}>Sair</button>

      <h2>Novo Exame</h2>

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

      <input
        placeholder="Animal"
        value={animal}
        onChange={(e) => setAnimal(e.target.value)}
      />
      <br /><br />

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setArquivo(e.target.files[0])}
      />
      <br /><br />

      <button onClick={cadastrarExame}>Cadastrar</button>

      <hr />

      <h2>Exames</h2>

      {exames.map((exame) => (
        <div key={exame.id}>
          <p><b>Tutor:</b> {exame.tutor}</p>
          <p><b>Veterinário:</b> {exame.veterinario}</p>
          <p><b>Animal:</b> {exame.animal}</p>
          <p><b>Status:</b> {exame.status}</p>

          <button onClick={() => baixarPDF(exame.pdf)}>
            Ver PDF
          </button>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;
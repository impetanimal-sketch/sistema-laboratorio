import { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
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

  // VERIFICA USUARIO
  useEffect(() => {
    onAuthStateChanged(auth, (usuario) => {
      setUser(usuario);
    });
  }, []);

  // CARREGAR EXAMES
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

  // CADASTRAR EXAME
  const cadastrar = async () => {
    let base64 = "";

    if (arquivo) {
      const reader = new FileReader();

      reader.onload = async () => {
        base64 = reader.result;

        await addDoc(collection(db, "exames"), {
          tutor,
          veterinario,
          animal,
          arquivo: base64,
          status: "finalizado",
        });

        setTutor("");
        setVeterinario("");
        setAnimal("");
        setArquivo(null);

        carregarExames();
      };

      reader.readAsDataURL(arquivo);
    } else {
      await addDoc(collection(db, "exames"), {
        tutor,
        veterinario,
        animal,
        status: "sem arquivo",
      });

      carregarExames();
    }
  };

  // EXCLUIR
  const excluir = async (id) => {
    await deleteDoc(doc(db, "exames", id));
    carregarExames();
  };

  // VER PDF
  const verPDF = (base64) => {
    const novaAba = window.open();
    novaAba.document.write(
      `<iframe src="${base64}" width="100%" height="100%"></iframe>`
    );
  };

  // TELA LOGIN
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
          placeholder="Senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <br /><br />

        <button onClick={login}>Entrar</button>
      </div>
    );
  }

  // TELA SISTEMA
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

      <button onClick={cadastrar}>Cadastrar</button>

      <hr />

      <h2>Exames</h2>

      {exames.map((exame) => (
        <div key={exame.id} style={{ marginBottom: 20 }}>
          <p><b>Tutor:</b> {exame.tutor}</p>
          <p><b>Veterinário:</b> {exame.veterinario}</p>
          <p><b>Animal:</b> {exame.animal}</p>
          <p><b>Status:</b> {exame.status}</p>

          {exame.arquivo && (
            <button onClick={() => verPDF(exame.arquivo)}>
              Ver PDF
            </button>
          )}

          <br /><br />

          <button onClick={() => excluir(exame.id)}>
            Excluir
          </button>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;
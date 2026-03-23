import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

function App() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [user, setUser] = useState(null);
  const [exames, setExames] = useState([]);

  // CAMPOS (voltando como era)
  const [tutor, setTutor] = useState("");
  const [veterinario, setVeterinario] = useState("");
  const [animal, setAnimal] = useState("");
  const [arquivo, setArquivo] = useState(null);

  // LOGIN
  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
    } catch (err) {
      alert("Erro no login");
    }
  };

  // LOGOUT
  const logout = async () => {
    await signOut(auth);
  };

  // OBSERVAR USUÁRIO
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
    const lista = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setExames(lista);
  };

  // CADASTRAR EXAME (igual antes, só com campos)
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
          pdf: base64,
          status: "finalizado"
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
        status: "sem pdf"
      });

      carregarExames();
    }
  };

  // EXCLUIR (voltando botão)
  const excluir = async (id) => {
    await deleteDoc(doc(db, "exames", id));
    carregarExames();
  };

  // ABRIR PDF (igual antes)
  const abrirPDF = (base64) => {
    const link = document.createElement("a");
    link.href = base64;
    link.download = "exame.pdf";
    link.click();
  };

  // LOGIN
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

  // SISTEMA (igual ao seu, só completado)
  return (
    <div style={{ padding: 20 }}>
      <h2>Sistema de Exames</h2>

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

      <h3>Exames</h3>

      {exames.map((exame) => (
        <div key={exame.id} style={{ marginBottom: 10 }}>
          <p><b>Tutor:</b> {exame.tutor}</p>
          <p><b>Veterinário:</b> {exame.veterinario}</p>
          <p><b>Animal:</b> {exame.animal}</p>
          <p><b>Status:</b> {exame.status}</p>

          {exame.pdf && (
            <button onClick={() => abrirPDF(exame.pdf)}>
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
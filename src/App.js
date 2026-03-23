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
  getDocs
} from "firebase/firestore";

function App() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [user, setUser] = useState(null);
  const [exames, setExames] = useState([]);

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

  // OBSERVAR USUÁRIO LOGADO
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuario) => {
      setUser(usuario);
      if (usuario) {
        carregarExames();
      }
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

  // UPLOAD PDF (base64)
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const base64 = reader.result;
      salvarNoFirestore(base64);
    };
  };

  // SALVAR NO FIRESTORE
  const salvarNoFirestore = async (base64) => {
    try {
      await addDoc(collection(db, "exames"), {
        pdf: base64,
        data: new Date()
      });

      alert("PDF salvo com sucesso!");
      carregarExames();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar PDF");
    }
  };

  // ABRIR PDF
  const abrirPDF = (base64) => {
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

  // TELA PRINCIPAL
  return (
    <div style={{ padding: 20 }}>
      <h2>Sistema de Exames</h2>

      <button onClick={logout}>Sair</button>

      <hr />

      <h3>Enviar PDF</h3>
      <input type="file" accept="application/pdf" onChange={handleFile} />

      <hr />

      <h3>Exames</h3>

      {exames.map((exame) => (
        <div key={exame.id} style={{ marginBottom: 10 }}>
          <button onClick={() => abrirPDF(exame.pdf)}>
            Ver PDF
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;
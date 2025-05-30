// filepath: src/index.ts
// api di prova
import express, { Request, Response } from "express";
import cors from 'cors'
import jwt from "jsonwebtoken";
import { getUserById, getUsersExcept, getUsersWithDebt, loginUser, signUpUser } from "../Services/UserService";
import { authMiddleware } from "../middleware/auth";
import { getEmissionsAndTresholdByUser, getLatestEmissions, submitEmission } from "../Services/DataService";
import { checkBalances } from "../Services/TokenService";


const app = express();
app.use(cors()); // Consenti al frontend di fare richieste
app.use(express.json());

const PORT = process.env.SERVER_PORT;
const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET || !PORT) {
  console.error("❌ SERVER_PORT o JWT_SECRET non definiti in .env");
  process.exit(1);
}

app.get(
  "/api/profilo",
  authMiddleware,                    // <— applica il controllo del JWT
  async (req: Request, res: Response): Promise<void> => {
    console.log(req.userId);
    try {
      // req.userId è stato valorizzato dal middleware
      const user = await getUserById(req.userId!);
      if (!user) {
        res.status(404).json({ message: "Utente non trovato" });
      }
      // ritorna solo i campi “pubblici” del profilo
      const { id, role, name, city, address, wallet_address, wallet_balance } = user;
      res.status(200).json({
        id,
        role,
        name,
        city,
        address,
        wallet_address,
        wallet_balance
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Errore interno" });
    }
  }
);

app.post("/api/login", async (req: Request, res: Response) => {
  const { username, password, walletAddress } = req.body;

  try {
    const user = await loginUser(username, password, walletAddress);

    if (!user) {
      // Login fallito
      res
        .status(401)
        .json({ message: "Credenziali non valide" });
    }
    // Login riuscito
    // Genera un token JWT
    const payload = { userId: user.id, role: user.role };
    // Firmiamo il token, valido per 2 ore
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "2h" });

    res
      .status(200)
      .json({ user, token });

  } catch (error: any) {
    console.error("Errore durante il login:", error);
    res
      .status(500)
      .json({ message: "Errore interno del server" });
  }
});

app.post("/api/signUp", async (req: Request, res: Response) => {
  const { username,
    password,
    role,
    name,
    city,
    address,
    walletAddress,
    serialCode
  } = req.body;

  console.log("Tentativo signUp:", req.body);
  try {
    const okUser = await signUpUser(username, password, role, name, city, address, walletAddress, serialCode);
    if (okUser) {
      res.status(201).json({ success: true });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post(
  "/api/listActors",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { id } = req.body;
    console.log("Tentativo listActors:", req.body);
    try {
      const users = await getUsersExcept(id);
      res.status(200).json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Errore interno" });
    }
  }
);

app.post(
  "/api/submitEmissions",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { profileId, co2Amount } = req.body;
    console.log("Attempt to submit emissions:", req.body);
    try {
      const emission = await submitEmission(profileId, co2Amount);
      if (!emission) {
        res.status(404).json({ message: "Emissione non inserita" });
      }
      res.status(200).json(emission);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Errore interno" });
    }
  }
);

app.post(
  "/api/logEmissions",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { profileId } = req.body;
    console.log("Attempt to log emissions:", req.body);
    try {
      const emissions = await getEmissionsAndTresholdByUser(profileId);
      res.status(200).json(emissions);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Errore interno" });
    }
  }
);

app.post(
  "/api/listActorsDebts",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { id } = req.body;
    console.log("Attempt to list actors debts:", req.body);
    try {
      const listActorsDebts = await getUsersWithDebt(id);
      res.status(200).json(listActorsDebts);
    }
    catch (err) {
      console.error(err);
      res.status(500).json({ message: "Errore interno" });
    }
  }
);


app.post(
  "/api/listActorsLatestEmissions",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const usersLatestEmissions = await getLatestEmissions();
      res.status(200).json(usersLatestEmissions);
    }
    catch (err) {
      console.error(err);
      res.status(500).json({ message: "Errore interno" });
    }
  }
);


app.post(
  "/api/getBalance",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { profileAddress, profileId } = req.body;
    try {
      const userBalance = await checkBalances(profileAddress, profileId);
      res.status(200).json(userBalance);
    }
    catch (err) {
      console.error(err);
      res.status(500).json({ message: "Errore interno" });
    }
  }
);


app.listen(PORT, () => {
  console.log(`✅ Server backend attivo su http://localhost:${PORT}`);
});
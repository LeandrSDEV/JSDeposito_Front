import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

type MeResponse = {
  email?: string;
};

export default function SettingsModal({ open, onClose }: Props) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [showPass, setShowPass] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const emailTrim = useMemo(() => email.trim(), [email]);

  const canSave = useMemo(() => {
    const hasEmail = emailTrim.length > 0;
    const hasPass = password.length > 0;

    const passOk = !hasPass || password.length >= 6;
    const emailOk = !hasEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim);

    return (hasEmail || hasPass) && passOk && emailOk && !loading;
  }, [emailTrim, password, loading]);

  useEffect(() => {
    if (!open) return;

    setError(null);
    setOk(null);
    setPassword("");

    let alive = true;

    (async () => {
      try {
        const res = await api.get<MeResponse>("/users/me");
        if (!alive) return;
        setEmail(res.data?.email ?? "");
      } catch {
        // se não existir GET /users/me, ignore
      }
    })();

    return () => {
      alive = false;
    };
  }, [open]);

  async function salvar() {
    setError(null);
    setOk(null);

    const hasEmail = emailTrim.length > 0;
    const hasPass = password.length > 0;

    if (!hasEmail && !hasPass) {
      setError("Preencha ao menos um campo para salvar.");
      return;
    }

    if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setError("Digite um e-mail válido.");
      return;
    }

    if (hasPass && password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setLoading(true);

      const payload: { email?: string; password?: string } = {};
      if (hasEmail) payload.email = emailTrim;
      if (hasPass) payload.password = password;

      await api.put("/users/me", payload);

      setOk("Dados atualizados com sucesso!");
      setPassword("");

      setTimeout(() => onClose(), 700);
    } catch (e: unknown) {
      const err = e as any;
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Não foi possível salvar. Tente novamente.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 0.5 }}>
        <Typography fontWeight={900}>Configurações da Conta</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Atualize seu e-mail e/ou sua senha.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {ok && <Alert severity="success">{ok}</Alert>}

          <TextField
            label="Novo e-mail"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="seuemail@dominio.com"
            fullWidth
          />

          <TextField
            label="Nova senha"
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="mínimo 6 caracteres"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPass((s) => !s)}
                    edge="end"
                    aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            helperText={password.length > 0 && password.length < 6 ? "Senha muito curta" : " "}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading} variant="outlined">
          Cancelar
        </Button>
        <Button onClick={salvar} disabled={!canSave} variant="contained">
          {loading ? "Salvando..." : "Salvar alterações"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

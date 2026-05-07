import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Cuenta creada', description: 'Revisa tu email para confirmar tu cuenta.' });
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: 'Error de acceso', description: 'Email o contraseña incorrectos.', variant: 'destructive' });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[hsl(212,55%,20%)] mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Olympus Bill</h1>
          <p className="text-sm text-muted-foreground mt-1">Systems — Plataforma ERP</p>
        </div>

        {/* Card */}
        <div className="erp-card p-6 space-y-5">
          <div>
            <h2 className="font-heading text-lg font-semibold">
              {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isSignUp ? 'Completa los datos para registrarte' : 'Ingresa tus credenciales para acceder'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <div>
                <label className="text-xs text-muted-foreground">Nombre Completo</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="erp-input w-full mt-1"
                  placeholder="Carlos Rodríguez"
                  required
                />
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="erp-input w-full mt-1"
                placeholder="usuario@olympus.com.do"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="erp-input w-full mt-1"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="erp-btn erp-btn-primary w-full justify-center py-2"
            >
              {loading ? 'Cargando...' : isSignUp ? 'Crear Cuenta' : 'Ingresar'}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-primary hover:underline"
            >
              {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-6">
          Olympus Bill Systems v1.0.0 — © 2026
        </p>
      </div>
    </div>
  );
};

export default Login;

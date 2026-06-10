# Sign in with Apple — Checklist de configuración

Requisito para la app iOS: si la app ofrece login de terceros (email/password
de Supabase cuenta como tal en combinación con otros proveedores), App Store
exige ofrecer **Sign in with Apple**. Configurarlo ahora también lo deja
disponible para la web.

La integración usa el flujo nativo de Supabase: la app obtiene el `idToken`
de Apple con `AuthenticationServices` y lo intercambia por una sesión de
Supabase con `signInWithIdToken` — no hay redirects ni webviews.

## 1. Apple Developer (developer.apple.com)

- [ ] **App ID** (Identifiers → App IDs): crear/editar el App ID de Forgia
      (p. ej. `fit.forgia.app`) y habilitar la capability **Sign in with Apple**.
- [ ] Solo si se añadirá también login con Apple en la **web**:
  - [ ] **Services ID** (p. ej. `fit.forgia.web`) con Sign in with Apple
        habilitado, dominio `<project-ref>.supabase.co` y return URL
        `https://<project-ref>.supabase.co/auth/v1/callback`.
  - [ ] **Key** (Keys → +) con Sign in with Apple, asociada al App ID.
        Descargar el `.p8` (solo se puede una vez) y anotar el **Key ID**
        y el **Team ID**.

> Para el flujo nativo iOS con `signInWithIdToken` basta el App ID con la
> capability; el Services ID + key solo hacen falta para el flujo OAuth web.

## 2. Supabase (Dashboard → Authentication → Sign In / Providers → Apple)

- [ ] Habilitar el provider **Apple**.
- [ ] En **Client IDs**, añadir el **bundle ID de la app iOS** (`fit.forgia.app`).
      Esto es lo que valida los `idToken` nativos.
- [ ] Solo para web: rellenar Services ID, Team ID, Key ID y el contenido del
      `.p8` (Supabase genera el client secret automáticamente).

## 3. Xcode (cuando exista el proyecto iOS)

- [ ] Target → Signing & Capabilities → **+ Sign in with Apple**.
- [ ] Botón `SignInWithAppleButton` (SwiftUI) y canje del credential:

```swift
// credential: ASAuthorizationAppleIDCredential
guard let tokenData = credential.identityToken,
      let idToken = String(data: tokenData, encoding: .utf8) else { return }

let session = try await supabase.auth.signInWithIdToken(
  credentials: .init(provider: .apple, idToken: idToken)
)
// session.accessToken → usar como Bearer en las rutas /api/* (ver docs/API.md)
```

- [ ] Apple solo entrega `fullName`/`email` la **primera vez**: guardarlos en
      `profiles` inmediatamente después del primer login
      (`supabase.auth.update(user:)` o upsert del perfil).

## 4. Cuentas vinculadas

Si un usuario ya registrado con email/password inicia sesión con Apple usando
el mismo email, Supabase vincula las identidades solo si el email de Apple es
verificado y la opción de account linking automático está activa
(Authentication → Settings). Revisar esa política antes de lanzar para evitar
cuentas duplicadas (ojo con los emails relay `@privaterelay.appleid.com`).

## 5. Verificación

- [ ] Login nativo en un device real (Sign in with Apple no funciona igual en
      todos los simuladores) → debe crear fila en `auth.users` con
      `identity_provider: apple`.
- [ ] `session.accessToken` funciona como Bearer contra `GET /api/training-intelligence`.
- [ ] Segundo login con la misma cuenta → misma fila de usuario (no duplica).

"""Panel de administración Lupol: roles superadmin / admin / empleado.
Se conecta desde main.py con registrar_admin(app, DATOS, DATA_FILE)."""
import os, json, hmac, hashlib, secrets, time, re, base64, threading, unicodedata
from typing import List, Optional
from fastapi import Request, Response, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

PISTERAS = ["Naked", "Racing / Sport", "Chopper / Custom", "Chacarera", "Motocross", "Scooter"]
ELECTRICAS = ["Moto Eléctrica", "Bicimoto Eléctrica", "Carguero Eléctrico", "Trimoto Eléctrica", "Monopatín Eléctrico"]
ROLES = ["superadmin", "admin", "empleado"]
CAMPOS_PISTERA = ["motor", "transmision", "tanque", "frenos", "enfriamiento", "suspension", "neumaticos"]
CAMPOS_ELECTRICA = ["motor", "bateria", "autonomia", "velocidad_maxima", "carga_maxima", "frenos", "dimensiones"]


class Login(BaseModel):
    usuario: str
    clave: str

class UsuarioNuevo(BaseModel):
    usuario: str
    clave: str
    rol: str

class MotoNueva(BaseModel):
    categoria: str
    marca: str
    modelo: str
    precio: float = 0
    stock: int = 1
    destacado: bool = False
    detalle: str = ""
    specs: dict = {}
    fotos: List[str] = []


class MotoEditar(BaseModel):
    categoria: str
    marca: str
    modelo: str
    precio: float = 0
    stock: int = 0
    destacado: bool = False
    detalle: str = ""
    specs: dict = {}
    imagenes_conservar: List[str] = []
    principal: Optional[str] = None
    fotos_nuevas: List[str] = []


CAMPOS_EDITABLES = set(CAMPOS_PISTERA + CAMPOS_ELECTRICA + ["potencia", "torque", "dimensiones"])


def registrar_admin(app, DATOS: dict, DATA_FILE: str):
    base = os.path.dirname(DATA_FILE)
    f_users, f_secret = os.path.join(base, "usuarios.json"), os.path.join(base, ".secreto")
    # Carpeta multimedia: frontend/public/multimedia (misma que usan todas las motos existentes)
    ROOT_DIR = os.path.abspath(os.path.join(base, "..", ".."))
    multimedia_dir = os.path.join(ROOT_DIR, "frontend", "public", "multimedia")
    os.makedirs(multimedia_dir, exist_ok=True)
    lock, fallos = threading.Lock(), {}

    # --- almacenamiento ---
    def escribir(ruta, obj):
        tmp = ruta + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(obj, f, ensure_ascii=False, indent=2)
        os.replace(tmp, ruta)

    usuarios = []
    if os.path.exists(f_users):
        with open(f_users, encoding="utf-8") as f:
            usuarios = json.load(f)
    if os.getenv("LUPOL_SECRET"):
        SECRET = os.environ["LUPOL_SECRET"].encode()
    else:
        if not os.path.exists(f_secret):
            with open(f_secret, "w") as f:
                f.write(secrets.token_hex(32))
        SECRET = open(f_secret).read().strip().encode()

    def hashear(clave, sal):
        return hashlib.scrypt(clave.encode(), salt=bytes.fromhex(sal), n=2**14, r=8, p=1).hex()

    def nuevo_usuario(usuario, clave, rol):
        sal = secrets.token_hex(16)
        return {"id": secrets.token_hex(8), "usuario": usuario, "sal": sal, "hash": hashear(clave, sal),
                "rol": rol, "creado": time.strftime("%Y-%m-%d %H:%M:%S")}

    def hay_super():
        return any(u["rol"] == "superadmin" for u in usuarios)

    # Opcional: crear superadmin al iniciar con variables de entorno
    if not hay_super() and os.getenv("LUPOL_SUPER_USER") and os.getenv("LUPOL_SUPER_PASS"):
        usuarios.append(nuevo_usuario(os.environ["LUPOL_SUPER_USER"], os.environ["LUPOL_SUPER_PASS"], "superadmin"))
        escribir(f_users, usuarios)

    # --- sesión (cookie firmada, funciona con varios workers) ---
    def emitir(uid):
        msg = f"{uid}.{int(time.time()) + 8 * 3600}"
        return f"{msg}.{hmac.new(SECRET, msg.encode(), hashlib.sha256).hexdigest()}"

    def actual(request: Request):
        try:
            uid, exp, sig = request.cookies.get("lupol_sid", "").split(".")
            ok = hmac.compare_digest(sig, hmac.new(SECRET, f"{uid}.{exp}".encode(), hashlib.sha256).hexdigest())
            if ok and int(exp) > time.time():
                u = next((x for x in usuarios if x["id"] == uid), None)
                if u:
                    return u
        except ValueError:
            pass
        raise HTTPException(401, "Sesión no iniciada")

    def requiere(*roles):
        def dep(u=Depends(actual)):
            if u["rol"] not in roles:
                raise HTTPException(403, "No tienes permiso para esta acción")
            return u
        return dep

    limpio = lambda u: {"id": u["id"], "usuario": u["usuario"], "rol": u["rol"], "creado": u["creado"]}
    txt = lambda v, n: str(v or "").strip()[:n]

    # --- archivos subidos: se sirven desde /multimedia igual que las fotos existentes ---
    # (el frontend Vite ya sirve frontend/public/multimedia en dev; en prod lo hace el backend)

    # --- acceso ---
    @app.get("/api/admin/estado")
    def estado():
        return {"necesita_configuracion": not hay_super(),
                "categorias": {"Pisteras": PISTERAS, "Eléctricas": ELECTRICAS}}

    @app.post("/api/admin/configurar", status_code=201)
    def configurar(d: Login):
        with lock:
            if hay_super():
                raise HTTPException(403, "El superadmin ya fue creado")
            if not re.fullmatch(r"[\w.-]{3,40}", d.usuario) or len(d.clave) < 8:
                raise HTTPException(400, "Usuario de 3-40 caracteres y contraseña de mínimo 8")
            usuarios.append(nuevo_usuario(d.usuario, d.clave, "superadmin"))
            escribir(f_users, usuarios)
        return {"ok": True}

    @app.post("/api/admin/login")
    def login(d: Login, request: Request, response: Response):
        ip = request.client.host if request.client else "?"
        n, t = fallos.get(ip, (0, time.time()))
        if time.time() - t > 600:
            n, t = 0, time.time()
        if n >= 5:
            raise HTTPException(429, "Demasiados intentos. Espera 10 minutos.")
        u = next((x for x in usuarios if x["usuario"] == d.usuario.strip()), None)
        if not u or not hmac.compare_digest(hashear(d.clave, u["sal"]), u["hash"]):
            fallos[ip] = (n + 1, t)
            raise HTTPException(401, "Usuario o contraseña incorrectos")
        response.set_cookie("lupol_sid", emitir(u["id"]), httponly=True, samesite="strict",
                            max_age=28800, secure=bool(os.getenv("LUPOL_HTTPS")))
        return limpio(u)

    @app.post("/api/admin/logout")
    def logout(response: Response):
        response.delete_cookie("lupol_sid")
        return {"ok": True}

    @app.get("/api/admin/yo")
    def yo(u=Depends(actual)):
        return limpio(u)

    # --- motos ---
    @app.get("/api/admin/motos")
    def motos_todas(u=Depends(actual)):
        return DATOS["motos"]  # incluye desactivadas

    @app.post("/api/admin/motos", status_code=201)
    def agregar_moto(d: MotoNueva, u=Depends(actual)):
        if d.categoria not in PISTERAS + ELECTRICAS:
            raise HTTPException(400, "Categoría inválida")
        marca, modelo = txt(d.marca, 60), txt(d.modelo, 80)
        if not marca or not modelo:
            raise HTTPException(400, "Marca y modelo son obligatorios")
        if len(d.fotos) > 5:
            raise HTTPException(400, "Máximo 5 fotos")
        electrica = d.categoria in ELECTRICAS
        with lock:
            nid = max([m["id"] for m in DATOS["motos"]] + [0]) + 1
            slug = re.sub(r"[^a-z0-9]+", "-", unicodedata.normalize("NFKD", f"{marca} {modelo}").encode("ascii", "ignore").decode().lower()).strip("-") or "moto"
            carpeta = slug  # ej: "lifan-kps-200" — igual que las motos existentes
            rutas = []
            for i, foto in enumerate(d.fotos, 1):
                m = re.fullmatch(r"data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)", foto)
                if not m:
                    raise HTTPException(400, "Foto no válida (jpg, png o webp)")
                datos = base64.b64decode(m.group(2))
                if len(datos) > 2_500_000:
                    raise HTTPException(400, "Cada foto debe pesar menos de 2.5 MB")
                dest = os.path.join(multimedia_dir, carpeta)
                os.makedirs(dest, exist_ok=True)
                nombre = f"foto-{i}." + ("jpg" if m.group(1) == "jpeg" else m.group(1))
                with open(os.path.join(dest, nombre), "wb") as f:
                    f.write(datos)
                rutas.append(f"/multimedia/{carpeta}/{nombre}")
            moto = {"id": nid, "marca": marca, "modelo": modelo,
                    "tipo": "Eléctricas" if electrica else "Pisteras", "categoria": d.categoria,
                    "precio": max(d.precio, 0), "ficha_pdf": None, "detalle": txt(d.detalle, 800)}
            for c in (CAMPOS_ELECTRICA if electrica else CAMPOS_PISTERA):
                moto[c] = txt(d.specs.get(c), 120) or "Consultar"
            if electrica:
                moto["potencia"] = moto["motor"]
            else:
                moto["potencia"] = moto["torque"] = "Consultar"
            moto.update({"stock_total": max(d.stock, 0), "stock_reservado": 0, "estado": "activado", "visitas": 0,
                         "destacado": d.destacado, "imagenes": rutas,
                         "imagen_principal": rutas[0] if rutas else "/multimedia/categorias/" + ("electricas_static.png" if electrica else "2ruedas_static.png"),
                         "vistas_360": {"principal": rutas[0]} if rutas else {}, "colores": [], "creado_por": u["usuario"]})
            DATOS["motos"].append(moto)
            escribir(DATA_FILE, DATOS)
        return moto

    @app.put("/api/admin/motos/{mid}")
    def editar_moto(mid: int, d: MotoEditar, u=Depends(actual)):
        if d.categoria not in PISTERAS + ELECTRICAS:
            raise HTTPException(400, "Categoría inválida")
        marca, modelo = txt(d.marca, 60), txt(d.modelo, 80)
        if not marca or not modelo:
            raise HTTPException(400, "Marca y modelo son obligatorios")
        with lock:
            m = next((x for x in DATOS["motos"] if x["id"] == mid), None)
            if not m:
                raise HTTPException(404, "Moto no encontrada")
            if u["rol"] == "empleado" and m.get("creado_por") != u["usuario"]:
                raise HTTPException(403, "Solo puedes editar las motos que tú agregaste")
            antes = list(m.get("imagenes", []))
            if not set(d.imagenes_conservar) <= set(antes):
                raise HTTPException(400, "Fotos a conservar no válidas")
            if len(d.imagenes_conservar) + len(d.fotos_nuevas) > 10:
                raise HTTPException(400, "Máximo 10 fotos por moto")
            slug = re.sub(r"[^a-z0-9]+", "-", unicodedata.normalize("NFKD", f"{marca} {modelo}").encode("ascii", "ignore").decode().lower()).strip("-") or "moto"
            carpeta, nuevas = slug, []  # mismo slug que al crear
            for i, foto in enumerate(d.fotos_nuevas, 1):
                g = re.fullmatch(r"data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)", foto)
                if not g:
                    raise HTTPException(400, "Foto no válida (jpg, png o webp)")
                datos = base64.b64decode(g.group(2))
                if len(datos) > 2_500_000:
                    raise HTTPException(400, "Cada foto debe pesar menos de 2.5 MB")
                dest = os.path.join(multimedia_dir, carpeta)
                os.makedirs(dest, exist_ok=True)
                nombre = f"foto-{int(time.time())}-{i}." + ("jpg" if g.group(1) == "jpeg" else g.group(1))
                with open(os.path.join(dest, nombre), "wb") as f:
                    f.write(datos)
                nuevas.append(f"/multimedia/{carpeta}/{nombre}")
            final = d.imagenes_conservar + nuevas
            if d.principal in final:
                principal = d.principal
            elif m.get("imagen_principal") in final:
                principal = m["imagen_principal"]
            else:
                electrica0 = d.categoria in ELECTRICAS
                principal = final[0] if final else "/multimedia/categorias/" + ("electricas_static.png" if electrica0 else "2ruedas_static.png")
            # borrar del disco las fotos subidas desde el panel que se quitaron
            for quitada in set(antes) - set(d.imagenes_conservar):
                if quitada.startswith("/multimedia/"):
                    ruta = os.path.normpath(os.path.join(multimedia_dir, quitada[len("/multimedia/"):]))
                    if ruta.startswith(os.path.normpath(multimedia_dir) + os.sep) and os.path.isfile(ruta):
                        os.remove(ruta)
            m.update({"marca": marca, "modelo": modelo, "categoria": d.categoria,
                      "tipo": "Eléctricas" if d.categoria in ELECTRICAS else "Pisteras",
                      "precio": max(d.precio, 0), "stock_total": max(d.stock, 0), "destacado": d.destacado,
                      "detalle": txt(d.detalle, 800), "imagenes": final, "imagen_principal": principal})
            for k, v in d.specs.items():
                if k in CAMPOS_EDITABLES:
                    m[k] = txt(v, 120) or "Consultar"
            v360 = m.get("vistas_360")
            if isinstance(v360, dict) and (not v360 or "principal" in v360):
                v360["principal"] = principal
                m["vistas_360"] = v360
            m["editado_por"] = u["usuario"]
            escribir(DATA_FILE, DATOS)
        return m

    @app.patch("/api/admin/motos/{mid}/estado")
    def cambiar_estado(mid: int, u=Depends(requiere("superadmin"))):
        with lock:
            m = next((x for x in DATOS["motos"] if x["id"] == mid), None)
            if not m:
                raise HTTPException(404, "Moto no encontrada")
            m["estado"] = "desactivado" if m.get("estado") == "activado" else "activado"
            escribir(DATA_FILE, DATOS)
        return {"estado": m["estado"]}

    @app.delete("/api/admin/motos/{mid}")
    def borrar_moto(mid: int, u=Depends(requiere("superadmin"))):
        with lock:
            i = next((k for k, x in enumerate(DATOS["motos"]) if x["id"] == mid), None)
            if i is None:
                raise HTTPException(404, "Moto no encontrada")
            DATOS["motos"].pop(i)
            escribir(DATA_FILE, DATOS)
        return {"ok": True}

    # --- usuarios (admin y superadmin) ---
    @app.get("/api/admin/usuarios")
    def listar_usuarios(u=Depends(requiere("superadmin", "admin"))):
        return [limpio(x) for x in usuarios]

    @app.post("/api/admin/usuarios", status_code=201)
    def crear_usuario(d: UsuarioNuevo, u=Depends(requiere("superadmin", "admin"))):
        nombre = d.usuario.strip()
        if d.rol not in ROLES:
            raise HTTPException(400, "Rol inválido")
        if u["rol"] == "admin" and d.rol != "empleado":
            raise HTTPException(403, "El administrador solo puede crear empleados")
        if not re.fullmatch(r"[\w.-]{3,40}", nombre) or len(d.clave) < 8:
            raise HTTPException(400, "Usuario de 3-40 caracteres y contraseña de mínimo 8")
        with lock:
            if any(x["usuario"] == nombre for x in usuarios):
                raise HTTPException(409, "Ese usuario ya existe")
            nuevo = nuevo_usuario(nombre, d.clave, d.rol)
            usuarios.append(nuevo)
            escribir(f_users, usuarios)
        return limpio(nuevo)

    @app.delete("/api/admin/usuarios/{uid}")
    def borrar_usuario(uid: str, u=Depends(requiere("superadmin"))):
        if uid == u["id"]:
            raise HTTPException(400, "No puedes eliminarte a ti mismo")
        with lock:
            antes = len(usuarios)
            usuarios[:] = [x for x in usuarios if x["id"] != uid]
            if len(usuarios) == antes:
                raise HTTPException(404, "Usuario no encontrado")
            escribir(f_users, usuarios)
        return {"ok": True}
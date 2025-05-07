local jwt = require "resty.jwt"
local cjson = require "cjson"

-- Routes publiques à laisser passer
local uri = ngx.var.request_uri
if uri:match("^/api/users/auth/login") or uri:match("^/api/users/auth/register") then
  return
end

-- Récupère le token
local auth_header = ngx.var.http_Authorization
if not auth_header then
    ngx.status = 401
    ngx.say("Missing Authorization header")
    return ngx.exit(401)
end

local _, _, token = string.find(auth_header, "Bearer%s+(.+)")
if not token then
    ngx.status = 401
    ngx.say("Invalid Authorization header")
    return ngx.exit(401)
end

-- Lecture de la clé publique
local function read_pubkey()
    local file = io.open("/etc/nginx/keys/public.pem", "r")
    if not file then
        ngx.status = 500
        ngx.say("Cannot read public key")
        return ngx.exit(500)
    end
    local key = file:read("*a")
    file:close()
    return key
end

local jwt_obj = jwt:verify(
    read_pubkey(),
    token,
    {
        alg = "RS256"
    }
)

if not jwt_obj.verified then
    ngx.status = 401
    ngx.say("JWT verification failed: ", jwt_obj.reason)
    return ngx.exit(401)
end

-- Injecter les infos dans les headers si tu veux
ngx.req.set_header("X-Username", jwt_obj.payload.username or "")
ngx.req.set_header("X-Email", jwt_obj.payload.email or "")

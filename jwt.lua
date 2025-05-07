local jwt = require "resty.jwt"

-- Extraire le JWT depuis l'en-tête Authorization
local auth_header = ngx.var.http_Authorization

if auth_header then
    -- Supposer que le token est dans la forme "Bearer <token>"
    local token = string.match(auth_header, "Bearer%s+(.+)")

    if token then
        local jwt_obj = jwt:decode(token)

        if jwt_obj then
            -- Extraire des informations du JWT
            ngx.log(ngx.INFO, "Token décrypté avec succès")
            
            -- Extraire les informations du payload
            local username = jwt_obj.payload.username
            local email = jwt_obj.payload.email
            
            -- Ajouter ces informations comme en-têtes HTTP pour la requête
            ngx.req.set_header("X-Username", username)
            ngx.req.set_header("X-Email", email)

            -- Optionnel : Log ou traiter d'autres informations si nécessaire
            ngx.log(ngx.INFO, "Utilisateur : " .. username .. ", Email : " .. email)
        else
            ngx.status = ngx.HTTP_UNAUTHORIZED
            ngx.say("JWT invalide")
            return ngx.exit(ngx.HTTP_UNAUTHORIZED)
        end
    else
        ngx.status = ngx.HTTP_UNAUTHORIZED
        ngx.say("Token manquant ou incorrect")
        return ngx.exit(ngx.HTTP_UNAUTHORIZED)
    end
else
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.say("En-tête Authorization manquant")
    return ngx.exit(ngx.HTTP_UNAUTHORIZED)
end

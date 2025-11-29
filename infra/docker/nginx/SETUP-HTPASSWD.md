# Configurar Senha para Netdata e Bull Board

## Na VPS, execute:

### 1. Gerar hash da senha
```bash
docker run --rm httpd:alpine htpasswd -nb admin SUA_SENHA_AQUI
```

### 2. Copiar a saída (exemplo):
```
admin:$apr1$K8x7z$9hJ2kL...
```

### 3. Criar arquivo .htpasswd
```bash
echo 'admin:$apr1$K8x7z$9hJ2kL...' > /opt/mvppir/infra/docker/nginx/.htpasswd
```

### 4. Verificar permissões
```bash
chmod 644 /opt/mvppir/infra/docker/nginx/.htpasswd
```

### 5. Reiniciar Nginx
```bash
docker-compose restart nginx
```

## URLs protegidas:
- `https://seu-dominio.com/netdata/` - Monitoramento
- `https://seu-dominio.com/admin/queues` - Filas BullMQ

## Trocar senha:
```bash
docker run --rm httpd:alpine htpasswd -nb admin NOVA_SENHA > /opt/mvppir/infra/docker/nginx/.htpasswd
docker-compose restart nginx
```

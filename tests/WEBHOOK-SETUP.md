# Configuração do Webhook Moralis - Guia Completo

Para testar webhooks do Moralis localmente, você precisa expor sua aplicação para a internet.

## 🌐 Opções para Expor Localhost

### Opção 1: ngrok (Recomendado - Mais Fácil)

**1. Instalar ngrok**
```bash
# macOS
brew install ngrok

# Ou baixe de https://ngrok.com/download
```

**2. Autenticar (se necessário)**
```bash
# Criar conta gratuita em https://dashboard.ngrok.com/
ngrok config add-authtoken SEU_TOKEN_AQUI
```

**3. Expor o servidor local**
```bash
# Servidor rodando na porta 3333
ngrok http 3333
```

**4. Copiar a URL gerada**
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3333
```

Sua webhook URL será:
```
https://abc123.ngrok.io/webhooks/moralis
```

---

### Opção 2: Cloudflare Tunnel (Grátis e Permanente)

**1. Instalar cloudflared**
```bash
# macOS
brew install cloudflare/cloudflare/cloudflared

# Ou baixe de https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
```

**2. Autenticar**
```bash
cloudflared tunnel login
```

**3. Criar túnel**
```bash
cloudflared tunnel create mvppir-webhook
```

**4. Configurar túnel**

Crie `~/.cloudflared/config.yml`:
```yaml
tunnel: mvppir-webhook
credentials-file: /Users/SEU_USUARIO/.cloudflared/TUNNEL_ID.json

ingress:
  - hostname: mvppir.seu-dominio.com
    service: http://localhost:3333
  - service: http_status:404
```

**5. Executar túnel**
```bash
cloudflared tunnel run mvppir-webhook
```

---

### Opção 3: localtunnel (Simples e Rápido)

**1. Instalar**
```bash
npm install -g localtunnel
```

**2. Expor porta**
```bash
lt --port 3333 --subdomain mvppir-webhook
```

Sua URL será:
```
https://mvppir-webhook.loca.lt/webhooks/moralis
```

---

### Opção 4: Nginx + Servidor VPS (Produção)

Se você já tem um servidor VPS com Nginx:

**1. Configurar reverse proxy no servidor**

`/etc/nginx/sites-available/mvppir`:
```nginx
server {
    listen 80;
    server_name webhook.seu-dominio.com;

    location /webhooks/moralis {
        proxy_pass http://SEU_IP_LOCAL:3333/webhooks/moralis;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**2. Habilitar site**
```bash
sudo ln -s /etc/nginx/sites-available/mvppir /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**3. SSL com Let's Encrypt**
```bash
sudo certbot --nginx -d webhook.seu-dominio.com
```

Sua URL será:
```
https://webhook.seu-dominio.com/webhooks/moralis
```

---

## ⚙️ Configurar Moralis Stream

Depois de expor sua aplicação:

### 1. Acessar Dashboard do Moralis

https://admin.moralis.io/streams

### 2. Criar Novo Stream

Clique em **"Create Stream"**

### 3. Configurar Stream

**Webhook URL:**
```
https://SEU_DOMINIO_NGROK_OU_CLOUDFLARE/webhooks/moralis
```

**Description:**
```
MVP PIR - Monitor de Depósitos
```

**Tag:**
```
deposit_monitor
```

**Chains:**
- ✅ Polygon Mainnet (0x89)

**Filters:**
- ✅ Include Native Transactions (para MATIC)
- ✅ Include Contract Logs (para USDC/USDT)

**ABI:**
```json
[
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "from", "type": "address"},
      {"indexed": true, "name": "to", "type": "address"},
      {"indexed": false, "name": "value", "type": "uint256"}
    ],
    "name": "Transfer",
    "type": "event"
  }
]
```

**Addresses to Monitor:**
```
(Deixe vazio por enquanto - será preenchido automaticamente)
```

### 4. Salvar Stream ID

Copie o Stream ID gerado e adicione ao `.env`:
```bash
POLYGON_USDC_STREAM_ID="seu-stream-id-aqui"
```

---

## 🧪 Testar Configuração

### Teste 1: Verificar Conectividade

```bash
# Da sua máquina local
curl https://SEU_DOMINIO_NGROK/webhooks/moralis \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Resposta esperada:**
```json
{
  "error": "INVALID_PAYLOAD: txHash missing"
}
```

✅ Se recebeu este erro, o endpoint está acessível!

### Teste 2: Criar Endereço e Adicionar ao Stream

```bash
# 1. Inicie o servidor local
npm run dev

# 2. Em outro terminal, inicie o túnel
ngrok http 3333

# 3. Execute o teste completo
npx tsx tests/full-flow-test.ts
```

**Verifique nos logs:**
```
✅ Endereço 0x... adicionado ao Moralis Stream
```

### Teste 3: Enviar Transação Real (Testnet)

**Polygon Mumbai (Testnet):**

1. **Obter MATIC de teste:**
   - https://faucet.polygon.technology/

2. **Obter USDC de teste:**
   - Polygon Mumbai USDC: `0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97`

3. **Enviar para seu endereço de depósito:**
   ```bash
   # Use MetaMask ou outro wallet
   # Para: 0xSEU_ENDERECO_DE_DEPOSITO
   # Quantidade: 0.1 USDC
   ```

4. **Verificar logs do servidor:**
   ```
   ℹ️  Transação já processada: 0x...
   ✅ Transação registrada com sucesso
   ```

---

## 🔧 Troubleshooting

### Erro: "Failed to fetch"

**Causa:** Túnel não está rodando ou URL incorreta.

**Solução:**
1. Verifique se ngrok/cloudflared está rodando
2. Verifique se a URL no Moralis Stream está correta
3. Teste a URL manualmente com curl

### Erro: "Invalid signature"

**Causa:** `MORALIS_STREAM_SECRET` incorreto.

**Solução:**
1. Use o mesmo valor de `MORALIS_API_KEY`:
```bash
MORALIS_STREAM_SECRET="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Erro: "Deposit address not found"

**Causa:** Endereço não foi adicionado ao Stream.

**Solução:**
1. Crie o endereço pelo endpoint `/deposit/address`
2. Verifique se foi adicionado ao Stream:
```bash
npx tsx -e "
import { listStreamAddresses } from './src/modules/deposit/services/moralis-stream.service';
listStreamAddresses().then(console.log);
"
```

### Stream não está recebendo eventos

**Verificações:**
1. ✅ Stream está ativo no dashboard Moralis
2. ✅ Webhook URL está acessível publicamente
3. ✅ Chain configurada corretamente (0x89 para Polygon)
4. ✅ Endereço foi adicionado ao Stream
5. ✅ Transação foi confirmada na blockchain

**Testar manualmente:**
```bash
# Ver histórico de webhooks no dashboard Moralis
# https://admin.moralis.io/streams -> Seu Stream -> Logs
```

---

## 📝 Fluxo Completo de Teste

```bash
# Terminal 1: Servidor
npm run dev

# Terminal 2: Túnel
ngrok http 3333

# Terminal 3: Testes
# 1. Copie a URL do ngrok (ex: https://abc123.ngrok.io)

# 2. Configure no Moralis Dashboard:
#    Webhook URL: https://abc123.ngrok.io/webhooks/moralis

# 3. Execute teste completo
npx tsx tests/full-flow-test.ts

# 4. Verifique se endereço foi adicionado ao Stream
# 5. Envie transação de teste (Mumbai testnet)
# 6. Verifique logs do servidor
# 7. Verifique transações no banco de dados
```

---

## 🚀 Em Produção

Para produção, recomendamos:

1. **Deploy em servidor com IP fixo**
   - Heroku, Railway, Render, DigitalOcean, AWS, etc.

2. **Domínio próprio**
   - `https://api.seu-dominio.com/webhooks/moralis`

3. **SSL/TLS obrigatório**
   - Let's Encrypt (grátis)
   - Cloudflare SSL

4. **Monitoring**
   - Logs estruturados (Winston, Pino)
   - Alertas para webhooks falhados
   - Métricas de latência

5. **Rate Limiting**
   - Proteção contra spam
   - Max 100 req/min por IP

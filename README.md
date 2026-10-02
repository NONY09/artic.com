# A-certic.com

Página temporária de construção. HTML, CSS e JavaScript puro, sem dependências de build. Identidade azul, ciano e dourado baseada na referência fornecida. Marca reconstruída em SVG; solicitar o arquivo original para substituir `public/assets/brand.svg` quando disponível. Não utiliza o banner como página.

## Publicar no Netlify

Importe `NONY09/artic.com`, branch `main`. **Build command:** vazio. **Publish directory:** `public`. O `netlify.toml` já configura a pasta. Depois adicione `a-certic.com` como domínio e conecte o DNS no GoDaddy.

## Editar

- `public/index.html`: frases, serviços e rodapé.
- `public/styles.css`: layout, cores e responsividade.
- `public/script.js`: globo geométrico e ícones.
- `public/assets/brand.svg`: marca em vetor.

O endereço da empresa ainda não foi fornecido. Inserir o endereço confirmado no rodapé, no lugar indicado pelo comentário. Os serviços são conteúdo da referência e não estão disponíveis para contratação nesta página. Não há porcentagem fictícia de progresso.

O globo respeita redução de movimento e pausa fora da tela e em abas ocultas. A fonte Manrope usa Google Fonts, com fallback local. Para prévia: `python3 -m http.server 8000 --directory public`.

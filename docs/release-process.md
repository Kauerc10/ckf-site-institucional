# Processo de release da CKF

Este projeto usa **deploy manual na Vercel**. A integração com GitHub permanece conectada para rastreabilidade, mas pushes, commits e merges não devem gerar deployments automaticamente.

## Regra de ouro

GitHub valida. Vercel publica somente quando a release estiver aprovada.

Fluxo padrão:

1. criar branch a partir de `main`;
2. escrever ou atualizar o teste de regressão quando aplicável;
3. confirmar RED;
4. implementar a mudança;
5. confirmar GREEN;
6. aguardar **CI** e **Segurança** verdes no SHA final da PR;
7. revisar a PR e resolver comentários;
8. fazer squash merge em `main`;
9. conferir CI e Segurança do merge em `main`;
10. iniciar um deployment manual da versão aprovada;
11. aguardar o deployment ficar `READY`;
12. executar smoke da produção;
13. somente então considerar a release concluída.

## Configuração que impede deploy automático

O `vercel.json` deve manter:

```json
{
  "git": {
    "deploymentEnabled": false
  }
}
```

Há um teste de regressão em `tests/vercel-config.test.mjs` para impedir reativação acidental.

## Smoke mínimo após cada release

Validar pelo menos:

- `/`
- `/servicos`
- uma landing de serviço, preferencialmente `/servicos/reforma-chassis`
- `/privacidade`
- `/marketing`
- `/sitemap.xml`
- abertura da Solicitação pela home
- persistência da Solicitação antes da continuidade para o WhatsApp
- header e rodapé em desktop e mobile

Quando a mudança afetar uma área específica, acrescentar smoke direcionado para essa área.

## Produção não é sinônimo de merge

Uma PR mergeada significa **código aprovado na `main`**. Só declarar a funcionalidade publicada quando o deployment manual correspondente estiver `READY` e o smoke tiver passado.

## Rollback

Se o smoke de produção encontrar regressão crítica:

1. interromper novas publicações;
2. fazer rollback para o último deployment saudável na Vercel;
3. abrir correção em branch separada;
4. repetir RED → GREEN → CI → Segurança → review → merge → deployment manual.

Nunca corrigir diretamente em produção sem passar pelos gates do repositório.

## Motivo desta política

O deploy manual reduz builds descartáveis em branches, evita consumo desnecessário de quota da Vercel e separa claramente os conceitos de **validação de código** e **publicação de release**.

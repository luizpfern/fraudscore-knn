import { useEffect, useState } from 'react';

/**
 * Escuta mensagens de progresso enviadas pelo processo principal via IPC.
 *
 * @returns {{ mensagem: string, ativo: boolean, iniciar: () => void, encerrar: () => void }}
 */
export function useProgresso() {
  const [mensagem, setMensagem] = useState('');
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    const cancelar = window.api.aoAtualizarProgresso((payload) => {
      setAtivo(true);
      setMensagem(payload?.mensagem ?? '');
    });
    return cancelar;
  }, []);

  return {
    mensagem,
    ativo,
    iniciar: () => {
      setAtivo(true);
      setMensagem('Iniciando...');
    },
    encerrar: () => {
      setAtivo(false);
      setMensagem('');
    },
  };
}

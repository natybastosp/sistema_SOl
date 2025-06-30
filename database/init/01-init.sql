-- Script de inicialização do banco SOL
-- Este arquivo é executado automaticamente na primeira vez que o container é criado

-- Verificar se a extensão UUID está disponível
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar esquema específico para o SOL (opcional, podemos usar public)
-- CREATE SCHEMA IF NOT EXISTS sol;

-- Log de inicialização
DO $$
BEGIN
  RAISE NOTICE 'Banco de dados SOL inicializado com sucesso!';
END $$;

# Utiliza a imagem oficial do Nginx como base. Neste caso, está sendo usada a versão mais recente disponível.
FROM nginx:latest

# Copia todo o conteúdo do diretório local 'src' para o diretório padrão de arquivos estáticos do Nginx dentro do contêiner.
COPY ./src /usr/share/nginx/html

# Informa que o contêiner irá escutar na porta 80.
EXPOSE 80

# Define o comando padrão a ser executado quando o contêiner é iniciado.
CMD ["nginx", "-g", "daemon off;"]
FROM node:24-alpine
WORKDIR /app
COPY --chown=node:node package*.json ./
RUN --mount=type=secret,id=cloud_ca if [ -f /run/secrets/cloud_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/cloud_ca; fi; npm ci --no-audit --no-fund
COPY --chown=node:node . .
RUN npm run build
USER node
EXPOSE 3000
CMD ["npm", "run", "start"]

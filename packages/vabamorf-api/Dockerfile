# Use Debian-based Node.js with Lambda Web Adapter
FROM node:18-slim@sha256:f9ab18e354e6855ae56ef2b290dd225c1e51a564f87584b9bd21dd651838830e

# Install Lambda Web Adapter and libjsoncpp
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.4 /lambda-adapter /opt/extensions/lambda-adapter
RUN apt-get update && \
    apt-get install -y libjsoncpp-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /var/task

# Copy vmetajson binary (renamed to .bin to avoid collision with vmetajson.js)
COPY vmetajson /var/task/vmetajson.bin
COPY et.dct /var/task/
RUN chmod +x /var/task/vmetajson.bin

# Copy package files and install dependencies
# Strip @hak/shared workspace dep (npm can't resolve pnpm workspace:* protocol)
COPY package*.json /var/task/
COPY _shared/ /var/task/node_modules/@hak/shared/
RUN node -e "var p=JSON.parse(require('fs').readFileSync('package.json'));delete p.dependencies['@hak/shared'];require('fs').writeFileSync('package.json',JSON.stringify(p,null,2))" \
    && npm install --omit=dev

# Copy compiled TypeScript (from dist/src/ to root)
COPY dist/src/ /var/task/

# Set environment variables
ENV VMETAJSON_PATH=/var/task/vmetajson.bin
ENV DICT_PATH=/var/task
ENV AWS_LWA_PORT=8080

# Start HTTP server
EXPOSE 8080
CMD ["node", "local-server.js"]

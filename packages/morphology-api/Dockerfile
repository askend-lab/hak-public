# Use Debian-based Node.js with Lambda Web Adapter
FROM node:22-slim

# Install Lambda Web Adapter and libjsoncpp (runtime only)
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.4 /lambda-adapter /opt/extensions/lambda-adapter
RUN apt-get update && \
    apt-get install -y --no-install-recommends libjsoncpp25 && \
    apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

WORKDIR /var/task

# Copy vmetajson binary (renamed to .bin to avoid collision with vmetajson.js)
COPY vmetajson /var/task/vmetajson.bin
COPY et.dct /var/task/
RUN chmod +x /var/task/vmetajson.bin

# Copy compiled TypeScript (from dist/src/ to root)
COPY dist/src/ /var/task/

# Run as non-root user
RUN adduser --disabled-password --gecos '' --home /var/task appuser && \
    chown -R appuser:appuser /var/task
USER appuser

# Set environment variables
ENV VMETAJSON_PATH=/var/task/vmetajson.bin
ENV DICT_PATH=/var/task
ENV AWS_LWA_PORT=8080

# Start HTTP server
EXPOSE 8080
CMD ["node", "local-server.js"]

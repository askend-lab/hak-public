FROM public.ecr.aws/lambda/nodejs:18

# Install libjsoncpp for vmetajson binary
RUN yum install -y jsoncpp && yum clean all

# Copy vmetajson binary and dictionary
COPY vmetajson ${LAMBDA_TASK_ROOT}/
COPY et.dct ${LAMBDA_TASK_ROOT}/
RUN chmod +x ${LAMBDA_TASK_ROOT}/vmetajson

# Copy package files and install dependencies
COPY package*.json ${LAMBDA_TASK_ROOT}/
RUN npm ci --only=production

# Copy compiled TypeScript
COPY dist/ ${LAMBDA_TASK_ROOT}/

# Set environment variables
ENV VMETAJSON_PATH=${LAMBDA_TASK_ROOT}/vmetajson
ENV DICT_PATH=${LAMBDA_TASK_ROOT}

# Default handler (can be overridden in serverless.yml)
CMD ["handler.analyzeHandler"]

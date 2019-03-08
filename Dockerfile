FROM node:8.11.1

ADD package.json yarn.lock /tmp/
RUN cd /tmp && yarn install --frozen-lockfile --no-cache --production
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

WORKDIR /opt/app
ADD . /opt/app

# Expose API port to the outside
EXPOSE 4999

# Launch application
CMD ["npm","start"]

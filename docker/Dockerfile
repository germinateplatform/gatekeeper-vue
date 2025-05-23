FROM node:22.11-alpine3.20 AS builder

LABEL maintainer="sebastian.raubach@hutton.ac.uk"

ARG BRANCH=master

# Force docker to not cache the next line
ADD https://api.github.com/repos/germinateplatform/gatekeeper-vue/git/refs/heads/master version.json
# Clone the Gatekeeper server code and client code
RUN echo "Pulling GitHub branch: $BRANCH"
RUN apk add --no-cache git && \
    git clone -b "$BRANCH" --single-branch --depth 1 https://github.com/germinateplatform/gatekeeper-server.git /opt/gatekeeper-server && \
    git clone -b "$BRANCH" --single-branch --depth 1 https://github.com/germinateplatform/gatekeeper-vue.git /opt/gatekeeper-client

# Build the client code
WORKDIR /opt/gatekeeper-client
RUN rm -f .env && \
    echo "VUE_APP_BASE_URL=./api/" > .env && \
    apk add --no-cache python3 build-base gcc wget && \
    npm i --legacy-peer-deps && \
    npm run build && \
    mkdir /opt/gatekeeper-server/client/ && \
    cp -a /opt/gatekeeper-client/dist/. /opt/gatekeeper-server/client/

# Download Gradle and build the server code
RUN apk add --no-cache openjdk21 && \
    wget https://services.gradle.org/distributions/gradle-8.8-bin.zip -P /tmp/ && \
    unzip /tmp/gradle-8.8-bin.zip -d /opt/ && \
    echo "data.directory.external=/data/gatekeeper" > /opt/gatekeeper-server/config.properties && \
    echo "project.name=gatekeeper" >> /opt/gatekeeper-server/gradle.properties && \
    /opt/gradle-8.8/bin/gradle -p /opt/gatekeeper-server war


FROM tomcat:10.1-jdk21

LABEL maintainer="sebastian.raubach@hutton.ac.uk"

RUN apt-get update && \
    apt-get --yes --force-yes install unzip zip && \
    # Obscuring server info
    cd ${CATALINA_HOME}/lib && \
    mkdir -p org/apache/catalina/util/ && \
    unzip -j catalina.jar org/apache/catalina/util/ServerInfo.properties -d org/apache/catalina/util/ && \
    sed -i 's/server.info=.*/server.info=Apache Tomcat/g' org/apache/catalina/util/ServerInfo.properties && \
    zip -ur catalina.jar org/apache/catalina/util/ServerInfo.properties && \
    rm -rf org && cd ${CATALINA_HOME} && \
    # Add a default error page mapping to hide the exception message
    sed -i 's/<\/web-app>/    <error-page>\n        <exception-type>java.lang.Throwable<\/exception-type>\n        <location>\/dev\/null<\/location>\n    <\/error-page>\n<\/web-app>/g' conf/web.xml && \
    sed -i 's/<\/Host>/  <Valve className="org.apache.catalina.valves.ErrorReportValve" showReport="false" showServerInfo="false" \/>\n      <\/Host>/g' conf/server.xml

RUN mkdir -p /usr/local/tomcat/webapps && \
    rm -rf /usr/local/tomcat/webapps/ROOT

COPY --from=builder /opt/gatekeeper-server/build/libs/gatekeeper-*.war /usr/local/tomcat/webapps/ROOT.war

WORKDIR /usr/local/tomcat/